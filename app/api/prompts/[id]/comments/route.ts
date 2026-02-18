import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getCommentsByPromptId } from '@/lib/firebase/firestore-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await getCommentsByPromptId(id);
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim() || content.length > 2000) {
    return NextResponse.json({ error: 'Comment must be 1-2000 characters' }, { status: 400 });
  }

  // Verify prompt exists
  const promptDoc = await adminDb.collection('prompts').doc(id).get();
  if (!promptDoc.exists) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  }

  // Get user data
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 });
  }
  const userData = userDoc.data()!;

  const commentRef = adminDb.collection('prompts').doc(id).collection('comments').doc();
  const commentData = {
    author: {
      uid,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
    },
    content: content.trim(),
    createdAt: FieldValue.serverTimestamp(),
  };

  // Batch: add comment + increment count
  const batch = adminDb.batch();
  batch.set(commentRef, commentData);
  batch.update(adminDb.collection('prompts').doc(id), {
    commentsCount: FieldValue.increment(1),
  });

  // Create notification for prompt author (if not self-commenting)
  const promptAuthorUid = promptDoc.data()!.author.uid;
  if (promptAuthorUid !== uid) {
    const notifRef = adminDb.collection('notifications').doc();
    batch.set(notifRef, {
      recipientUid: promptAuthorUid,
      type: 'comment',
      actorUid: uid,
      actor: {
        uid,
        username: userData.username,
        name: userData.name,
        avatar: userData.avatar,
      },
      promptId: id,
      promptTitle: promptDoc.data()!.title,
      message: `${userData.name} commented on your prompt`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return NextResponse.json({ id: commentRef.id }, { status: 201 });
}
