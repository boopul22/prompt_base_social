import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  _req: NextRequest,
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

  const promptDoc = await adminDb.collection('prompts').doc(id).get();
  if (!promptDoc.exists) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  }
  const promptData = promptDoc.data()!;

  const bookmarkRef = adminDb.collection('prompts').doc(id).collection('bookmarks').doc(uid);
  const bookmarkSnap = await bookmarkRef.get();

  const batch = adminDb.batch();

  if (bookmarkSnap.exists) {
    // Remove bookmark
    batch.delete(bookmarkRef);
    batch.update(adminDb.collection('prompts').doc(id), {
      bookmarksCount: FieldValue.increment(-1),
    });
    // Delete from reverse index
    const reverseQuery = await adminDb.collection('userBookmarks')
      .where('uid', '==', uid)
      .where('promptId', '==', id)
      .limit(1)
      .get();
    reverseQuery.docs.forEach((doc) => batch.delete(doc.ref));

    // Decrement user's saved count
    batch.update(adminDb.collection('users').doc(uid), {
      'stats.saved': FieldValue.increment(-1),
    });

    await batch.commit();
    return NextResponse.json({ bookmarked: false, bookmarksCount: (promptData.bookmarksCount || 1) - 1 });
  } else {
    // Add bookmark
    batch.set(bookmarkRef, { uid, createdAt: FieldValue.serverTimestamp() });
    batch.update(adminDb.collection('prompts').doc(id), {
      bookmarksCount: FieldValue.increment(1),
    });
    // Add to reverse index
    const reverseRef = adminDb.collection('userBookmarks').doc();
    batch.set(reverseRef, {
      uid,
      promptId: id,
      prompt: {
        id,
        title: promptData.title,
        description: promptData.description || '',
        model: promptData.model,
        category: promptData.category,
        likesCount: promptData.likesCount || 0,
        bookmarksCount: (promptData.bookmarksCount || 0) + 1,
        author: {
          username: promptData.author.username,
          name: promptData.author.name,
          avatar: promptData.author.avatar,
        },
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    // Increment user's saved count
    batch.update(adminDb.collection('users').doc(uid), {
      'stats.saved': FieldValue.increment(1),
    });

    // Notification
    if (promptData.author.uid !== uid) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      const userData = userDoc.data()!;
      const notifRef = adminDb.collection('notifications').doc();
      batch.set(notifRef, {
        recipientUid: promptData.author.uid,
        type: 'bookmark',
        actorUid: uid,
        actor: {
          uid,
          username: userData.username,
          name: userData.name,
          avatar: userData.avatar,
        },
        promptId: id,
        promptTitle: promptData.title,
        message: `${userData.name} saved your prompt`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return NextResponse.json({ bookmarked: true, bookmarksCount: (promptData.bookmarksCount || 0) + 1 });
  }
}
