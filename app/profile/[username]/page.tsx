import { notFound } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import { getUserByUsername, getPromptsByUser } from '@/lib/firebase/firestore-admin';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
        notFound();
    }

    const prompts = await getPromptsByUser(user.uid);

    return <UserProfile user={user} prompts={prompts} />;
}
