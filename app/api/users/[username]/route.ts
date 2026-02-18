import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getPromptsByUser } from '@/lib/firebase/firestore-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const prompts = await getPromptsByUser(user.uid);

  return NextResponse.json({ user, prompts });
}
