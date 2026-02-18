export interface User {
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  categories?: string[];
  stats: {
    prompts: number;
    likes: string;
    saved: number;
  };
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  model: string;
  category: string;
  tags: string[];
  author: User;
  likes: string;
  bookmarks: string;
  createdAt: string;
  isFeatured: boolean;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
}

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
