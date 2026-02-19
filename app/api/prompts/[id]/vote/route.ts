import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

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

  const body = await req.json().catch(() => ({}));
  const value = body.value;
  if (value !== 1 && value !== -1 && value !== 0) {
    return NextResponse.json({ error: 'Invalid vote value. Must be 1, -1, or 0.' }, { status: 400 });
  }

  const promptRef = adminDb.collection('prompts').doc(id);
  const voteRef = promptRef.collection('votes').doc(uid);

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const [promptSnap, voteSnap] = await Promise.all([
        tx.get(promptRef),
        tx.get(voteRef),
      ]);

      if (!promptSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const promptData = promptSnap.data()!;
      let upvotesCount = promptData.upvotesCount ?? promptData.likesCount ?? 0;
      let downvotesCount = promptData.downvotesCount ?? 0;

      const previousValue: number = voteSnap.exists ? (voteSnap.data()!.value as number) : 0;

      // Determine the effective new value (toggle off if same vote)
      const newValue = (value !== 0 && previousValue === value) ? 0 : value;

      if (previousValue === newValue) {
        // No change needed
        return {
          vote: newValue as 1 | -1 | 0,
          score: upvotesCount - downvotesCount,
          upvotesCount,
          downvotesCount,
        };
      }

      // Remove previous vote effect
      if (previousValue === 1) upvotesCount--;
      if (previousValue === -1) downvotesCount--;

      // Apply new vote effect
      if (newValue === 1) upvotesCount++;
      if (newValue === -1) downvotesCount++;

      const score = upvotesCount - downvotesCount;

      // Write vote doc
      if (newValue === 0) {
        tx.delete(voteRef);
      } else if (voteSnap.exists) {
        tx.update(voteRef, { value: newValue, updatedAt: FieldValue.serverTimestamp() });
      } else {
        tx.set(voteRef, { uid, value: newValue, createdAt: FieldValue.serverTimestamp() });
      }

      // Update prompt counts
      tx.update(promptRef, {
        upvotesCount,
        downvotesCount,
        score,
        likesCount: upvotesCount, // backward compat
      });

      return { vote: newValue as 1 | -1 | 0, score, upvotesCount, downvotesCount, promptData };
    });

    // Create notification on upvote (outside transaction)
    if (result.vote === 1 && 'promptData' in result) {
      const promptData = result.promptData as FirebaseFirestore.DocumentData;
      if (promptData.author.uid !== uid) {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          await adminDb.collection('notifications').add({
            recipientUid: promptData.author.uid,
            type: 'upvote',
            actorUid: uid,
            actor: {
              uid,
              username: userData.username,
              name: userData.name,
              avatar: userData.avatar,
            },
            promptId: id,
            promptTitle: promptData.title,
            message: `${userData.name} upvoted your prompt`,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    return NextResponse.json({
      vote: result.vote,
      score: result.score,
      upvotesCount: result.upvotesCount,
      downvotesCount: result.downvotesCount,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
