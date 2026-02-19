import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
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
  const promptIds = Array.isArray(body.promptIds) ? body.promptIds : [];

  const uniquePromptIds = [...new Set(promptIds)]
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .slice(0, 100);

  if (uniquePromptIds.length === 0) {
    return NextResponse.json({ likedIds: [], bookmarkedIds: [] });
  }

  const bookmarkedRefs = uniquePromptIds.map((promptId) =>
    adminDb.collection('prompts').doc(promptId).collection('bookmarks').doc(uid)
  );
  const voteRefs = uniquePromptIds.map((promptId) =>
    adminDb.collection('prompts').doc(promptId).collection('votes').doc(uid)
  );

  const [bookmarkedDocs, voteDocs] = await Promise.all([
    adminDb.getAll(...bookmarkedRefs),
    adminDb.getAll(...voteRefs),
  ]);

  const bookmarkedIds = bookmarkedDocs
    .map((doc, index) => (doc.exists ? uniquePromptIds[index] : null))
    .filter((id): id is string => Boolean(id));

  const votes: Record<string, number> = {};
  voteDocs.forEach((doc, index) => {
    if (doc.exists) {
      votes[uniquePromptIds[index]] = doc.data()!.value as number;
    }
  });

  return NextResponse.json({ bookmarkedIds, votes });
}
