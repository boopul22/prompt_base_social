import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function GET(_req: NextRequest) {
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

  const snapshot = await adminDb.collection('notifications')
    .where('recipientUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const notifications = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      type: d.type,
      actor: d.actor,
      promptId: d.promptId,
      promptTitle: d.promptTitle,
      message: d.message,
      read: d.read,
      createdAt: d.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    };
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}
