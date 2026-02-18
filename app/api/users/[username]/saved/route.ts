import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getUserByUsername, getUserBookmarks } from '@/lib/firebase/firestore-admin';
import { cookies } from 'next/headers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
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

  const user = await getUserByUsername(username);
  if (!user || user.uid !== uid) {
    return NextResponse.json({ error: 'Can only view your own saved prompts' }, { status: 403 });
  }

  const prompts = await getUserBookmarks(uid);
  return NextResponse.json({ prompts });
}
