import { Suspense } from 'react';
import Feed from '@/components/Feed';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { getPromptsFeed, searchPrompts } from '@/lib/firebase/firestore-admin';

export const dynamic = 'force-dynamic';

interface HomeProps {
    searchParams: Promise<{ sort?: string; category?: string; q?: string; tag?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const params = await searchParams;
    const prompts = params.q || params.tag
        ? await searchPrompts(params.q || '', params.tag)
        : await getPromptsFeed({ sort: params.sort, category: params.category });

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Suspense>
                <Sidebar />
            </Suspense>
            <Feed prompts={prompts} />
            <RightSidebar />
        </main>
    );
}

