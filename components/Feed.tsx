import FeedCard from './FeedCard';
import { Prompt } from '@/lib/types';

interface FeedProps {
    prompts: Prompt[];
}

export default function Feed({ prompts }: FeedProps) {
    return (
        <section className="col-span-1 lg:col-span-6 space-y-6">
            {prompts.map((prompt) => (
                <FeedCard key={prompt.id} prompt={prompt} />
            ))}
        </section>
    );
}
