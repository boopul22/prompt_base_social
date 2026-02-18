import { NextRequest, NextResponse } from 'next/server';
import { searchPrompts } from '@/lib/firebase/firestore-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || undefined;

  if (!q && !tag) {
    return NextResponse.json({ prompts: [] });
  }

  const prompts = await searchPrompts(q, tag);
  return NextResponse.json({ prompts });
}
