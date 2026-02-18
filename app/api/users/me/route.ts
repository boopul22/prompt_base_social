import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserByUid } from '@/lib/firebase/firestore-admin';
import { cookies } from 'next/headers';

export async function PATCH(req: NextRequest) {
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

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.avatar) updates.avatar = body.avatar;
  if (body.categories) updates.categories = body.categories;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await adminDb.collection('users').doc(uid).update(updates);
  const updated = await getUserByUid(uid);
  return NextResponse.json({ user: updated });
}
