import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getPromptsFeed } from '@/lib/firebase/firestore-admin';
import { slugify } from '@/lib/utils/format';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20');
  const cursor = searchParams.get('cursor') || undefined;

  const prompts = await getPromptsFeed({ category, sort, limit, cursor });
  return NextResponse.json({ prompts });
}

export async function POST(req: NextRequest) {
  // Verify session
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
  const { title, description, promptText, model, category, tags, isPublic } = body;

  // Validate
  if (!title?.trim() || title.length > 200) {
    return NextResponse.json({ error: 'Title is required (max 200 chars)' }, { status: 400 });
  }
  if (!promptText?.trim() || promptText.length < 20) {
    return NextResponse.json({ error: 'Prompt text must be at least 20 characters' }, { status: 400 });
  }
  if (!model || !category) {
    return NextResponse.json({ error: 'Model and category are required' }, { status: 400 });
  }

  // Get user profile for author embed
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
  }
  const userData = userDoc.data()!;

  // Generate unique slug
  let slug = slugify(title);
  const existing = await adminDb.collection('prompts').doc(slug).get();
  if (existing.exists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const tagArray = Array.isArray(tags) ? tags.slice(0, 10) : [];

  const promptData = {
    id: slug,
    title: title.trim(),
    description: (description || '').trim(),
    promptText: promptText.trim(),
    model,
    category,
    tags: tagArray,
    author: {
      uid,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
    },
    likesCount: 0,
    upvotesCount: 0,
    downvotesCount: 0,
    score: 0,
    bookmarksCount: 0,
    commentsCount: 0,
    isPublic: isPublic !== false,
    isFeatured: false,
    titleLower: title.trim().toLowerCase(),
    tagsLower: tagArray.map((t: string) => t.toLowerCase()),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection('prompts').doc(slug).set(promptData);

  // Increment user prompt count
  await adminDb.collection('users').doc(uid).update({
    'stats.prompts': FieldValue.increment(1),
  });

  return NextResponse.json({ id: slug }, { status: 201 });
}
