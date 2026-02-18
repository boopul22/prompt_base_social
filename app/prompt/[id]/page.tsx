import { notFound } from 'next/navigation';
import PromptDetail from '@/components/PromptDetail';
import { getPromptById, getCommentsByPromptId } from '@/lib/firebase/firestore-admin';

interface PromptPageProps {
    params: Promise<{ id: string }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
    const { id } = await params;
    const prompt = await getPromptById(id);

    if (!prompt) {
        notFound();
    }

    const comments = await getCommentsByPromptId(id);

    return <PromptDetail prompt={prompt} comments={comments} />;
}
