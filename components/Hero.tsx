'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Iconify from './ui/Iconify';

const categories = [
    { name: 'Writing', slug: 'writing', icon: 'solar:pen-new-square-linear' },
    { name: 'Coding', slug: 'coding', icon: 'solar:code-circle-linear' },
    { name: 'Art Generation', slug: 'art', icon: 'solar:gallery-wide-linear' },
    { name: 'Marketing', slug: 'marketing', icon: 'solar:chart-square-linear' },
    { name: 'Productivity', slug: 'productivity', icon: 'solar:check-circle-linear' },
];

export default function Hero() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>(['writing']);

    const toggleCategory = (slug: string) => {
        setSelected((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
        );
    };

    const handleSkip = () => {
        router.push('/?sort=trending');
    };

    return (
        <section className="w-full bg-background border-b border-border-subtle py-16 px-6">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-3 text-foreground">
                    Welcome to FreePromptBase
                </h1>
                <p className="text-foreground/70 mb-10 font-normal">Select topics that inspire you to personalize your feed.</p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {categories.map((cat) => {
                        const isSelected = selected.includes(cat.slug);
                        return (
                            <button
                                key={cat.slug}
                                onClick={() => toggleCategory(cat.slug)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${isSelected
                                        ? 'bg-primary text-primary-foreground shadow-md hover:translate-y-[-2px]'
                                        : 'bg-background border border-border text-foreground hover:bg-surface-elevated hover:text-foreground hover:border-border'
                                    }`}
                            >
                                <Iconify icon={cat.icon} width="18" />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleSkip}
                    className="mt-4 text-muted font-medium border-b border-muted pb-0.5 hover:text-primary hover:border-primary text-sm transition-colors"
                >
                    Skip for now
                </button>
            </div>
        </section>
    );
}
