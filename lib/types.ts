// ── Embedded author (denormalized on prompts, comments, notifications) ──
export interface AuthorEmbed {
  uid: string;
  username: string;
  name: string;
  avatar: string;
}

// ── User ──
export interface User {
  uid: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  categories: string[];
  stats: {
    prompts: number;
    likes: number;
    saved: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ── Prompt ──
export interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  model: string;
  category: string;
  tags: string[];
  author: AuthorEmbed;
  likesCount: number;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
  bookmarksCount: number;
  commentsCount: number;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Comment ──
export interface Comment {
  id: string;
  author: AuthorEmbed;
  content: string;
  createdAt: string;
}

// ── Category ──
export interface Category {
  name: string;
  slug: string;
  icon: string;
  promptCount: number;
}

// ── Notification ──
export interface Notification {
  id: string;
  recipientUid: string;
  type: 'like' | 'comment' | 'bookmark' | 'featured' | 'upvote';
  actorUid: string;
  actor: AuthorEmbed;
  promptId?: string;
  promptTitle?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── User Bookmark (reverse index) ──
export interface UserBookmark {
  id: string;
  uid: string;
  promptId: string;
  prompt: {
    id: string;
    title: string;
    description: string;
    model: string;
    category: string;
    likesCount: number;
    bookmarksCount: number;
    author: Pick<AuthorEmbed, 'username' | 'name' | 'avatar'>;
  };
  createdAt: string;
}

// ── Iconify web component type ──
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
      };
    }
  }
}
