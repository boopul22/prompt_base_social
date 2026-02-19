import {
  doc, getDoc, setDoc, deleteDoc, writeBatch,
  collection, query, where, orderBy, onSnapshot, updateDoc,
  increment, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { AuthorEmbed } from '@/lib/types';

// ── Like toggle ──

export async function toggleLike(promptId: string, uid: string): Promise<boolean> {
  const likeRef = doc(db, 'prompts', promptId, 'likes', uid);
  const likeSnap = await getDoc(likeRef);
  const batch = writeBatch(db);
  const promptRef = doc(db, 'prompts', promptId);

  if (likeSnap.exists()) {
    // Unlike
    batch.delete(likeRef);
    batch.update(promptRef, { likesCount: increment(-1) });
    await batch.commit();
    return false;
  } else {
    // Like
    batch.set(likeRef, { uid, createdAt: serverTimestamp() });
    batch.update(promptRef, { likesCount: increment(1) });
    await batch.commit();
    return true;
  }
}

export async function checkIfLiked(promptId: string, uid: string): Promise<boolean> {
  const likeRef = doc(db, 'prompts', promptId, 'likes', uid);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

// ── Vote ──

export async function submitVote(
  promptId: string,
  value: 1 | -1 | 0
): Promise<{ vote: 1 | -1 | 0; score: number; upvotesCount: number; downvotesCount: number }> {
  const res = await fetch(`/api/prompts/${promptId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error('Failed to submit vote');
  return res.json();
}

// ── Bookmark toggle ──
// Uses API route because it also needs to update the userBookmarks reverse index

export async function toggleBookmark(promptId: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> {
  const res = await fetch(`/api/prompts/${promptId}/bookmark`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle bookmark');
  return res.json();
}

export async function checkIfBookmarked(promptId: string, uid: string): Promise<boolean> {
  const bmRef = doc(db, 'prompts', promptId, 'bookmarks', uid);
  const snap = await getDoc(bmRef);
  return snap.exists();
}

// ── Notifications ──

export function subscribeToNotifications(
  uid: string,
  callback: (notifications: Array<{
    id: string;
    type: string;
    actor: AuthorEmbed;
    promptId?: string;
    promptTitle?: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        actor: data.actor,
        promptId: data.promptId,
        promptTitle: data.promptTitle,
        message: data.message,
        read: data.read,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    });
    callback(notifications);
  });
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}
