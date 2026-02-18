import { User, Prompt, Comment, Category } from './types';

// ── Users ──────────────────────────────────────────────
export const users: User[] = [
  {
    username: 'admin',
    name: 'PromptBase Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=355872&color=ffffff',
    bio: 'Official FreePromptBase team. Curating the best AI prompts for the community.',
    categories: ['Writing', 'Art'],
    stats: { prompts: 120, likes: '15.2k', saved: 890 },
  },
  {
    username: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=9CD5FF&color=355872',
    bio: 'Content strategist and SEO enthusiast. Building better content with AI tools.',
    categories: ['Writing', 'Marketing'],
    stats: { prompts: 28, likes: '1.8k', saved: 145 },
  },
  {
    username: 'david-kim',
    name: 'David Kim',
    avatar: 'https://ui-avatars.com/api/?name=Dav+K&background=7AAACE&color=ffffff',
    bio: 'Senior developer exploring AI-assisted coding. Python, TypeScript, and Rust enthusiast.',
    categories: ['Coding'],
    stats: { prompts: 35, likes: '2.1k', saved: 210 },
  },
  {
    username: 'alex-design',
    name: 'Alex Design',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Design&background=355872&color=fff&size=128',
    bio: 'Digital artist and prompt engineer exploring the boundaries of AI creativity. Sharing daily prompts for Midjourney and GPT-4.',
    categories: ['Writing', 'Coding'],
    stats: { prompts: 42, likes: '1.2k', saved: 350 },
  },
  {
    username: 'ken-masters',
    name: 'Ken Masters',
    avatar: 'https://ui-avatars.com/api/?name=Ken+M&background=355872&color=fff',
    bio: 'Anime and retro art enthusiast. Crafting visual worlds through AI prompts.',
    categories: ['Art'],
    stats: { prompts: 18, likes: '920', saved: 67 },
  },
];

// ── Prompts ────────────────────────────────────────────
export const prompts: Prompt[] = [
  {
    id: 'cinematic-cyberpunk-street',
    title: 'Cinematic Cyberpunk Street Photography',
    description:
      'A highly detailed, photorealistic shot of a neon-drenched street in Tokyo, raining, reflections on wet pavement, shot on 35mm lens, f/1.8, cinematic lighting...',
    promptText:
      '/imagine prompt: A highly detailed, photorealistic shot of a neon-drenched street in Tokyo at night, heavy rain, reflections on wet pavement, shot on 35mm lens, f/1.8, cinematic lighting, volumetric fog, cyberpunk aesthetic --ar 16:9 --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['photography', 'cyberpunk', 'midjourney'],
    author: users[0],
    likes: '2.4k',
    bookmarks: '850',
    createdAt: '2 hours ago',
    isFeatured: true,
  },
  {
    id: 'seo-blog-post-generator',
    title: 'SEO Blog Post Generator Structure',
    description:
      'Act as an expert SEO copywriter. Write a comprehensive blog post outline about [Topic]. Include H2s, H3s, and bullet points for key takeaways. Ensure the tone is professional yet engaging...',
    promptText:
      'Act as an expert SEO copywriter with 10 years of experience. Write a comprehensive blog post outline about [Topic]. Include:\n- H2 and H3 headings\n- Bullet points for key takeaways\n- A compelling introduction hook\n- SEO-friendly meta description (155 chars)\n- 3 internal linking suggestions\nEnsure the tone is professional yet engaging. Target word count: 1500-2000 words.',
    model: 'GPT-4',
    category: 'Writing',
    tags: ['seo', 'writing', 'blogging'],
    author: users[1],
    likes: '124',
    bookmarks: '45',
    createdAt: '45 mins ago',
    isFeatured: false,
  },
  {
    id: 'python-code-refactoring',
    title: 'Python Code Refactoring Assistant',
    description:
      "You are a senior Python developer. Review the following code snippet for efficiency, readability, and PEP8 compliance. Suggest improvements and explain the 'why' behind each change.",
    promptText:
      "You are a senior Python developer with 15 years of experience. Review the following code snippet for:\n1. Efficiency and performance\n2. Readability and clean code principles\n3. PEP8 compliance\n4. Potential bugs or edge cases\n\nFor each suggestion, explain the 'why' behind the change and provide the refactored code.\n\nCode to review:\n```python\n[Paste your code here]\n```",
    model: 'Claude 2',
    category: 'Coding',
    tags: ['coding', 'python', 'refactor'],
    author: users[2],
    likes: '89',
    bookmarks: '12',
    createdAt: '3 hours ago',
    isFeatured: false,
  },
  {
    id: 'retro-anime-cityscape',
    title: 'Retro 90s Anime Cityscape',
    description:
      'A wide shot of a futuristic Tokyo street in 1990s anime style with cel shading, vibrant neon colors, and lo-fi aesthetic.',
    promptText:
      '/imagine prompt: A wide shot of a futuristic Tokyo street, 1990s anime style, cel shaded, vibrant neon colors, purple and cyan palette, highly detailed, lo-fi aesthetic, wet street reflections --ar 16:9 --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['anime', 'midjourney', 'retro'],
    author: users[4],
    likes: '312',
    bookmarks: '98',
    createdAt: '1 day ago',
    isFeatured: false,
  },
  {
    id: 'minimalist-logo-vector',
    title: 'Minimalist Logo Vector',
    description:
      'Flat vector logo on white background with minimalist lines, geometric shape, and golden ratio proportions.',
    promptText:
      '/imagine prompt: Flat vector logo, white background, minimalist lines, geometric shape, golden ratio, modern brand identity, clean edges, scalable design --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['logo', 'design', 'vector'],
    author: users[3],
    likes: '24',
    bookmarks: '5',
    createdAt: '2 days ago',
    isFeatured: false,
  },
  {
    id: 'email-marketing-campaign',
    title: 'Email Marketing Campaign Generator',
    description:
      'Create a 5-email drip campaign sequence for [Product/Service]. Include subject lines, preview text, body copy, and CTAs optimized for conversion.',
    promptText:
      'You are an email marketing expert. Create a 5-email drip campaign sequence for [Product/Service].\n\nFor each email include:\n- Subject line (under 50 chars)\n- Preview text (under 90 chars)\n- Body copy (150-250 words)\n- Primary CTA button text\n- Send timing recommendation\n\nTone: Professional but friendly. Goal: Convert free trial users to paid subscribers.',
    model: 'GPT-4',
    category: 'Marketing',
    tags: ['email', 'marketing', 'copywriting'],
    author: users[1],
    likes: '67',
    bookmarks: '31',
    createdAt: '5 hours ago',
    isFeatured: false,
  },
];

// ── Comments ───────────────────────────────────────────
export const comments: Record<string, Comment[]> = {
  'retro-anime-cityscape': [
    {
      id: 'c1',
      author: 'User123',
      content: 'Great prompt! The lighting effects are amazing with this.',
      createdAt: '1h ago',
    },
    {
      id: 'c2',
      author: 'ArtFan42',
      content: 'Tried this with --v 6 and it looks even better. Thanks for sharing!',
      createdAt: '3h ago',
    },
  ],
  'cinematic-cyberpunk-street': [
    {
      id: 'c3',
      author: 'PhotoNerd',
      content: 'The f/1.8 aperture tip really sells the cinematic feel.',
      createdAt: '30m ago',
    },
  ],
};

// ── Categories ─────────────────────────────────────────
export const categories: Category[] = [
  { name: 'Writing', slug: 'writing', icon: 'solar:pen-new-square-linear' },
  { name: 'Coding', slug: 'coding', icon: 'solar:code-circle-linear' },
  { name: 'Art Generation', slug: 'art', icon: 'solar:gallery-wide-linear' },
  { name: 'Marketing', slug: 'marketing', icon: 'solar:chart-square-linear' },
  { name: 'Productivity', slug: 'productivity', icon: 'solar:check-circle-linear' },
];

// ── Helper Functions ───────────────────────────────────
export function getPrompts(options?: { category?: string; sort?: string }): Prompt[] {
  let result = [...prompts];

  if (options?.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === options.category!.toLowerCase()
    );
  }

  if (options?.sort === 'newest') {
    result.reverse();
  } else if (options?.sort === 'liked') {
    result.sort((a, b) => {
      const parse = (v: string) => (v.includes('k') ? parseFloat(v) * 1000 : parseInt(v));
      return parse(b.likes) - parse(a.likes);
    });
  }

  return result;
}

export function getPromptById(id: string): Prompt | undefined {
  return prompts.find((p) => p.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

export function getPromptsByUser(username: string): Prompt[] {
  return prompts.filter((p) => p.author.username === username);
}

export function getCommentsByPromptId(promptId: string): Comment[] {
  return comments[promptId] || [];
}

export function getCategories(): Category[] {
  return categories;
}
