import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const { username, name, idToken } = await req.json();

  // Validate
  if (!username || !name) {
    return NextResponse.json({ error: 'Username and name are required' }, { status: 400 });
  }
  if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3-30 chars, lowercase alphanumeric and hyphens' },
      { status: 400 }
    );
  }

  // Verify user via session cookie or ID token fallback
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let uid: string;
  if (sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      uid = decoded.uid;
    } catch {
      uid = '';
    }
  } else {
    uid = '';
  }

  if (!uid && idToken) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      uid = '';
    }
  }

  if (!uid) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Atomic username claim + profile creation
  try {
    await adminDb.runTransaction(async (tx) => {
      const usernameRef = adminDb.collection('usernames').doc(username);
      const usernameDoc = await tx.get(usernameRef);

      if (usernameDoc.exists) {
        throw new Error('Username already taken');
      }

      const userRef = adminDb.collection('users').doc(uid);
      const existingUser = await tx.get(userRef);
      if (existingUser.exists) {
        throw new Error('Profile already exists');
      }

      // Get Firebase Auth user for email/avatar
      const fbUser = await adminAuth.getUser(uid);
      const avatar = fbUser.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=355872&color=ffffff`;

      tx.set(usernameRef, { uid });
      tx.set(userRef, {
        uid,
        username,
        name,
        avatar,
        bio: '',
        categories: [],
        stats: { prompts: 0, likes: 0, saved: 0 },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, username });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create profile';
    const status = message.includes('already') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
