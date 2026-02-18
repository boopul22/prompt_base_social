import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

function parseLikeString(val: string): number {
  if (val.includes('k')) return Math.round(parseFloat(val) * 1000);
  return parseInt(val, 10) || 0;
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

const DEMO_PASSWORD = 'demoPass123!';

// ── Mock data (from lib/data.ts) ──

const mockUsers = [
  {
    username: 'admin',
    name: 'PromptBase Admin',
    bio: 'Official FreePromptBase team. Curating the best AI prompts for the community.',
    categories: ['Writing', 'Art'],
    stats: { prompts: 120, likes: 15200, saved: 890 },
  },
  {
    username: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    bio: 'Content strategist and SEO enthusiast. Building better content with AI tools.',
    categories: ['Writing', 'Marketing'],
    stats: { prompts: 28, likes: 1800, saved: 145 },
  },
  {
    username: 'david-kim',
    name: 'David Kim',
    bio: 'Senior developer exploring AI-assisted coding. Python, TypeScript, and Rust enthusiast.',
    categories: ['Coding'],
    stats: { prompts: 35, likes: 2100, saved: 210 },
  },
  {
    username: 'alex-design',
    name: 'Alex Design',
    bio: 'Digital artist and prompt engineer exploring the boundaries of AI creativity.',
    categories: ['Writing', 'Coding'],
    stats: { prompts: 42, likes: 1200, saved: 350 },
  },
  {
    username: 'ken-masters',
    name: 'Ken Masters',
    bio: 'Anime and retro art enthusiast. Crafting visual worlds through AI prompts.',
    categories: ['Art'],
    stats: { prompts: 18, likes: 920, saved: 67 },
  },
];

const mockCategories = [
  { name: 'Writing', slug: 'writing', icon: 'solar:pen-new-square-linear' },
  { name: 'Coding', slug: 'coding', icon: 'solar:code-circle-linear' },
  { name: 'Art Generation', slug: 'art', icon: 'solar:gallery-wide-linear' },
  { name: 'Marketing', slug: 'marketing', icon: 'solar:chart-square-linear' },
  { name: 'Productivity', slug: 'productivity', icon: 'solar:check-circle-linear' },
];

const mockPrompts = [
  {
    id: 'cinematic-cyberpunk-street',
    title: 'Cinematic Cyberpunk Street Photography',
    description: 'A highly detailed, photorealistic shot of a neon-drenched street in Tokyo, raining, reflections on wet pavement, shot on 35mm lens, f/1.8, cinematic lighting...',
    promptText: '/imagine prompt: A highly detailed, photorealistic shot of a neon-drenched street in Tokyo at night, heavy rain, reflections on wet pavement, shot on 35mm lens, f/1.8, cinematic lighting, volumetric fog, cyberpunk aesthetic --ar 16:9 --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['photography', 'cyberpunk', 'midjourney'],
    authorIndex: 0,
    likes: '2.4k',
    bookmarks: '850',
    hoursAgo: 2,
    isFeatured: true,
  },
  {
    id: 'seo-blog-post-generator',
    title: 'SEO Blog Post Generator Structure',
    description: 'Act as an expert SEO copywriter. Write a comprehensive blog post outline about [Topic].',
    promptText: 'Act as an expert SEO copywriter with 10 years of experience. Write a comprehensive blog post outline about [Topic]. Include:\n- H2 and H3 headings\n- Bullet points for key takeaways\n- A compelling introduction hook\n- SEO-friendly meta description (155 chars)\n- 3 internal linking suggestions\nEnsure the tone is professional yet engaging. Target word count: 1500-2000 words.',
    model: 'GPT-4',
    category: 'Writing',
    tags: ['seo', 'writing', 'blogging'],
    authorIndex: 1,
    likes: '124',
    bookmarks: '45',
    hoursAgo: 0.75,
    isFeatured: false,
  },
  {
    id: 'python-code-refactoring',
    title: 'Python Code Refactoring Assistant',
    description: "You are a senior Python developer. Review the following code snippet for efficiency, readability, and PEP8 compliance.",
    promptText: "You are a senior Python developer with 15 years of experience. Review the following code snippet for:\n1. Efficiency and performance\n2. Readability and clean code principles\n3. PEP8 compliance\n4. Potential bugs or edge cases\n\nFor each suggestion, explain the 'why' behind the change and provide the refactored code.\n\nCode to review:\n```python\n[Paste your code here]\n```",
    model: 'Claude 2',
    category: 'Coding',
    tags: ['coding', 'python', 'refactor'],
    authorIndex: 2,
    likes: '89',
    bookmarks: '12',
    hoursAgo: 3,
    isFeatured: false,
  },
  {
    id: 'retro-anime-cityscape',
    title: 'Retro 90s Anime Cityscape',
    description: 'A wide shot of a futuristic Tokyo street in 1990s anime style with cel shading, vibrant neon colors, and lo-fi aesthetic.',
    promptText: '/imagine prompt: A wide shot of a futuristic Tokyo street, 1990s anime style, cel shaded, vibrant neon colors, purple and cyan palette, highly detailed, lo-fi aesthetic, wet street reflections --ar 16:9 --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['anime', 'midjourney', 'retro'],
    authorIndex: 4,
    likes: '312',
    bookmarks: '98',
    hoursAgo: 24,
    isFeatured: false,
  },
  {
    id: 'minimalist-logo-vector',
    title: 'Minimalist Logo Vector',
    description: 'Flat vector logo on white background with minimalist lines, geometric shape, and golden ratio proportions.',
    promptText: '/imagine prompt: Flat vector logo, white background, minimalist lines, geometric shape, golden ratio, modern brand identity, clean edges, scalable design --v 5.2',
    model: 'Midjourney',
    category: 'Art',
    tags: ['logo', 'design', 'vector'],
    authorIndex: 3,
    likes: '24',
    bookmarks: '5',
    hoursAgo: 48,
    isFeatured: false,
  },
  {
    id: 'email-marketing-campaign',
    title: 'Email Marketing Campaign Generator',
    description: 'Create a 5-email drip campaign sequence for [Product/Service]. Include subject lines, preview text, body copy, and CTAs optimized for conversion.',
    promptText: 'You are an email marketing expert. Create a 5-email drip campaign sequence for [Product/Service].\n\nFor each email include:\n- Subject line (under 50 chars)\n- Preview text (under 90 chars)\n- Body copy (150-250 words)\n- Primary CTA button text\n- Send timing recommendation\n\nTone: Professional but friendly. Goal: Convert free trial users to paid subscribers.',
    model: 'GPT-4',
    category: 'Marketing',
    tags: ['email', 'marketing', 'copywriting'],
    authorIndex: 1,
    likes: '67',
    bookmarks: '31',
    hoursAgo: 5,
    isFeatured: false,
  },
];

const mockComments: Record<string, Array<{ author: string; content: string; hoursAgo: number }>> = {
  'retro-anime-cityscape': [
    { author: 'User123', content: 'Great prompt! The lighting effects are amazing with this.', hoursAgo: 1 },
    { author: 'ArtFan42', content: 'Tried this with --v 6 and it looks even better. Thanks for sharing!', hoursAgo: 3 },
  ],
  'cinematic-cyberpunk-street': [
    { author: 'PhotoNerd', content: 'The f/1.8 aperture tip really sells the cinematic feel.', hoursAgo: 0.5 },
  ],
};

async function seed() {
  console.log('🔧 Starting seed...\n');

  // 1. Create categories
  console.log('📁 Creating categories...');
  const batch1 = db.batch();
  for (const cat of mockCategories) {
    batch1.set(db.collection('categories').doc(cat.slug), {
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      promptCount: 0,
    });
  }
  await batch1.commit();
  console.log(`   ✓ ${mockCategories.length} categories created`);

  // 2. Create Firebase Auth users + Firestore profiles
  console.log('\n👤 Creating users...');
  const userUids: string[] = [];
  for (const mockUser of mockUsers) {
    const email = `${mockUser.username}@freepromptbase.demo`;
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
      console.log(`   ⏭ ${mockUser.username} already exists (${uid})`);
    } catch {
      const created = await auth.createUser({
        email,
        password: DEMO_PASSWORD,
        displayName: mockUser.name,
      });
      uid = created.uid;
      console.log(`   ✓ ${mockUser.username} created (${uid})`);
    }
    userUids.push(uid);

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(mockUser.name)}&background=355872&color=ffffff`;
    await db.collection('users').doc(uid).set({
      uid,
      username: mockUser.username,
      name: mockUser.name,
      avatar,
      bio: mockUser.bio,
      categories: mockUser.categories,
      stats: mockUser.stats,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection('usernames').doc(mockUser.username).set({ uid });
  }

  // 3. Create stub users for commenters
  console.log('\n💬 Creating commenter stub users...');
  const commentAuthors = ['User123', 'ArtFan42', 'PhotoNerd'];
  const commenterUids: Record<string, string> = {};
  for (const name of commentAuthors) {
    const email = `${name.toLowerCase()}@freepromptbase.demo`;
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const created = await auth.createUser({ email, password: DEMO_PASSWORD, displayName: name });
      uid = created.uid;
    }
    commenterUids[name] = uid;

    const username = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7AAACE&color=ffffff`;
    await db.collection('users').doc(uid).set({
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
    await db.collection('usernames').doc(username).set({ uid });
    console.log(`   ✓ ${name} (${uid})`);
  }

  // 4. Create prompts
  console.log('\n📝 Creating prompts...');
  for (const p of mockPrompts) {
    const authorUid = userUids[p.authorIndex];
    const authorData = mockUsers[p.authorIndex];
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorData.name)}&background=355872&color=ffffff`;

    await db.collection('prompts').doc(p.id).set({
      id: p.id,
      title: p.title,
      description: p.description,
      promptText: p.promptText,
      model: p.model,
      category: p.category,
      tags: p.tags,
      author: {
        uid: authorUid,
        username: authorData.username,
        name: authorData.name,
        avatar,
      },
      likesCount: parseLikeString(p.likes),
      bookmarksCount: parseLikeString(p.bookmarks),
      commentsCount: (mockComments[p.id] || []).length,
      isPublic: true,
      isFeatured: p.isFeatured,
      titleLower: p.title.toLowerCase(),
      tagsLower: p.tags.map((t) => t.toLowerCase()),
      createdAt: hoursAgo(p.hoursAgo),
      updatedAt: hoursAgo(p.hoursAgo),
    });
    console.log(`   ✓ ${p.id}`);
  }

  // 5. Create comments
  console.log('\n💬 Creating comments...');
  for (const [promptId, comments] of Object.entries(mockComments)) {
    for (const c of comments) {
      const uid = commenterUids[c.author];
      const username = c.author.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&background=7AAACE&color=ffffff`;
      await db.collection('prompts').doc(promptId).collection('comments').add({
        author: { uid, username, name: c.author, avatar },
        content: c.content,
        createdAt: hoursAgo(c.hoursAgo),
      });
      console.log(`   ✓ Comment on ${promptId} by ${c.author}`);
    }
  }

  // 6. Update category prompt counts
  console.log('\n📊 Updating category counts...');
  const categoryCounts: Record<string, number> = {};
  for (const p of mockPrompts) {
    const slug = p.category.toLowerCase().replace('art generation', 'art');
    categoryCounts[slug] = (categoryCounts[slug] || 0) + 1;
  }
  for (const [slug, count] of Object.entries(categoryCounts)) {
    await db.collection('categories').doc(slug).update({ promptCount: count });
  }

  console.log('\n✅ Seed complete!');
  console.log(`   ${mockCategories.length} categories`);
  console.log(`   ${mockUsers.length + commentAuthors.length} users`);
  console.log(`   ${mockPrompts.length} prompts`);
  console.log(`   ${Object.values(mockComments).flat().length} comments`);
  console.log(`\n   Demo login: any-username@freepromptbase.demo / ${DEMO_PASSWORD}`);
}

seed().catch(console.error).then(() => process.exit(0));
