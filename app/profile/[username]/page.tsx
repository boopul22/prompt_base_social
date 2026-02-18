import { notFound } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import { getUserByUsername, getPromptsByUser } from '@/lib/data';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params;
    const user = getUserByUsername(username);

    if (!user) {
        notFound();
    }

    const prompts = getPromptsByUser(username);

    return <UserProfile user={user} prompts={prompts} />;
}
