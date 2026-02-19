import { notFound } from 'next/navigation';
import PromptDetail from '@/components/PromptDetail';
import { getPromptById, getCommentsByPromptId } from '@/lib/firebase/firestore-admin';

export const dynamic = 'force-dynamic';

interface PromptPageProps {
    params: Promise<{ id: string }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
    const { id } = await params;
    const [prompt, comments] = await Promise.all([
        getPromptById(id),
        getCommentsByPromptId(id),
    ]);

    if (!prompt) {
        notFound();
    }

    return <PromptDetail prompt={prompt} comments={comments} />;
}
