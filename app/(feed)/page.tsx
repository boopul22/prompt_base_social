import { Suspense } from 'react';
import Hero from '@/components/Hero';
import Feed from '@/components/Feed';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { getPrompts } from '@/lib/data';

interface HomeProps {
    searchParams: Promise<{ sort?: string; category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const params = await searchParams;
    const prompts = getPrompts({ sort: params.sort, category: params.category });

    return (
        <>
            <Hero />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Suspense>
                    <Sidebar />
                </Suspense>
                <Feed prompts={prompts} />
                <RightSidebar />
            </main>
        </>
    );
}
