import { notFound } from 'next/navigation';
import PromptDetail from '@/components/PromptDetail';
import { getPromptById, getCommentsByPromptId } from '@/lib/data';

interface PromptPageProps {
    params: Promise<{ id: string }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
    const { id } = await params;
    const prompt = getPromptById(id);

    if (!prompt) {
        notFound();
    }

    const comments = getCommentsByPromptId(id);

    return <PromptDetail prompt={prompt} comments={comments} />;
}
