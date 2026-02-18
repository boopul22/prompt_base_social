import { adminDb } from './admin';
import type { Prompt, User, Comment, Category } from '@/lib/types';

function tsToISO(ts: FirebaseFirestore.Timestamp | undefined): string {
  return ts?.toDate?.()?.toISOString?.() || new Date().toISOString();
}

// ── Prompts ──

export async function getPromptsFeed(options?: {
  category?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
}): Promise<Prompt[]> {
  const lim = options?.limit || 20;

  try {
    let query = adminDb.collection('prompts')
      .where('isPublic', '==', true) as FirebaseFirestore.Query;

    if (options?.category) {
      query = query.where('category', '==', options.category);
    }

    if (options?.sort === 'liked') {
      query = query.orderBy('likesCount', 'desc');
    } else if (options?.sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('likesCount', 'desc');
    }

    query = query.limit(lim);

    if (options?.cursor) {
      const cursorDoc = await adminDb.collection('prompts').doc(options.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => docToPrompt(doc));
  } catch (err: unknown) {
    // Fallback when composite indexes are still building
    if (err instanceof Error && err.message.includes('FAILED_PRECONDITION')) {
      const snapshot = await adminDb.collection('prompts').limit(lim).get();
      const prompts = snapshot.docs.map((doc) => docToPrompt(doc));
      if (options?.sort === 'newest') {
        prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        prompts.sort((a, b) => b.likesCount - a.likesCount);
      }
      if (options?.category) {
        return prompts.filter((p) => p.category === options.category);
      }
      return prompts;
    }
    throw err;
  }
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const doc = await adminDb.collection('prompts').doc(id).get();
  if (!doc.exists) return null;
  return docToPrompt(doc);
}

export async function getPromptsByUser(uid: string): Promise<Prompt[]> {
  try {
    const snapshot = await adminDb.collection('prompts')
      .where('author.uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => docToPrompt(doc));
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('FAILED_PRECONDITION')) {
      const snapshot = await adminDb.collection('prompts')
        .where('author.uid', '==', uid)
        .get();
      const prompts = snapshot.docs.map((doc) => docToPrompt(doc));
      prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return prompts;
    }
    throw err;
  }
}

function docToPrompt(doc: FirebaseFirestore.DocumentSnapshot): Prompt {
  const d = doc.data()!;
  return {
    id: doc.id,
    title: d.title,
    description: d.description || '',
    promptText: d.promptText,
    model: d.model,
    category: d.category,
    tags: d.tags || [],
    author: d.author,
    likesCount: d.likesCount || 0,
    bookmarksCount: d.bookmarksCount || 0,
    commentsCount: d.commentsCount || 0,
    isPublic: d.isPublic ?? true,
    isFeatured: d.isFeatured || false,
    createdAt: tsToISO(d.createdAt),
    updatedAt: tsToISO(d.updatedAt),
  };
}

// ── Users ──

export async function getUserByUsername(username: string): Promise<User | null> {
  // Lookup UID from username map
  const usernameDoc = await adminDb.collection('usernames').doc(username).get();
  if (!usernameDoc.exists) return null;

  const uid = usernameDoc.data()!.uid;
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) return null;

  return docToUser(userDoc);
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) return null;
  return docToUser(userDoc);
}

function docToUser(doc: FirebaseFirestore.DocumentSnapshot): User {
  const d = doc.data()!;
  return {
    uid: doc.id,
    username: d.username,
    name: d.name,
    avatar: d.avatar,
    bio: d.bio || '',
    categories: d.categories || [],
    stats: d.stats || { prompts: 0, likes: 0, saved: 0 },
    createdAt: tsToISO(d.createdAt),
    updatedAt: tsToISO(d.updatedAt),
  };
}

// ── Comments ──

export async function getCommentsByPromptId(promptId: string): Promise<Comment[]> {
  const snapshot = await adminDb
    .collection('prompts').doc(promptId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      author: d.author,
      content: d.content,
      createdAt: tsToISO(d.createdAt),
    };
  });
}

// ── Categories ──

export async function getCategories(): Promise<Category[]> {
  const snapshot = await adminDb.collection('categories').get();
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      name: d.name,
      slug: doc.id,
      icon: d.icon,
      promptCount: d.promptCount || 0,
    };
  });
}

// ── Search ──

export async function searchPrompts(query: string, tag?: string): Promise<Prompt[]> {
  try {
    if (tag) {
      const snapshot = await adminDb.collection('prompts')
        .where('isPublic', '==', true)
        .where('tagsLower', 'array-contains', tag.toLowerCase())
        .limit(20)
        .get();
      return snapshot.docs.map((doc) => docToPrompt(doc));
    }

    if (query) {
      const lower = query.toLowerCase();
      const snapshot = await adminDb.collection('prompts')
        .where('isPublic', '==', true)
        .where('titleLower', '>=', lower)
        .where('titleLower', '<=', lower + '\uf8ff')
        .limit(20)
        .get();
      return snapshot.docs.map((doc) => docToPrompt(doc));
    }
  } catch (err: unknown) {
    // Fallback: query without isPublic filter while indexes build
    if (err instanceof Error && err.message.includes('FAILED_PRECONDITION')) {
      if (tag) {
        const snapshot = await adminDb.collection('prompts')
          .where('tagsLower', 'array-contains', tag.toLowerCase())
          .limit(20)
          .get();
        return snapshot.docs.map((doc) => docToPrompt(doc)).filter((p) => p.isPublic);
      }
      if (query) {
        const lower = query.toLowerCase();
        const snapshot = await adminDb.collection('prompts')
          .where('titleLower', '>=', lower)
          .where('titleLower', '<=', lower + '\uf8ff')
          .limit(20)
          .get();
        return snapshot.docs.map((doc) => docToPrompt(doc)).filter((p) => p.isPublic);
      }
    }
    throw err;
  }

  return [];
}

// ── Bookmarks (user's saved prompts) ──

export async function getUserBookmarks(uid: string): Promise<Prompt[]> {
  let snapshot;
  try {
    snapshot = await adminDb.collection('userBookmarks')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('FAILED_PRECONDITION')) {
      snapshot = await adminDb.collection('userBookmarks')
        .where('uid', '==', uid)
        .limit(50)
        .get();
    } else {
      throw err;
    }
  }

  const prompts: Prompt[] = [];
  for (const bookmarkDoc of snapshot.docs) {
    const promptId = bookmarkDoc.data().promptId;
    const prompt = await getPromptById(promptId);
    if (prompt) prompts.push(prompt);
  }
  return prompts;
}
