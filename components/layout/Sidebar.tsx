'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Iconify from '../ui/Iconify';

export default function Sidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'trending';
    const currentCategory = searchParams.get('category') || '';
    const [searchQuery, setSearchQuery] = useState('');

    const sortOptions = [
        { value: 'trending', label: 'Top', icon: 'solar:graph-up-linear' },
        { value: 'newest', label: 'Newest', icon: 'solar:clock-circle-linear' },
    ];

    const categoryOptions = [
        { value: 'writing', label: 'Writing' },
        { value: 'coding', label: 'Coding' },
        { value: 'art', label: 'Art' },
        { value: 'marketing', label: 'Marketing' },
    ];

    return (
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-8">
            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`); }} className="relative">
                <Iconify icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground/50" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full bg-secondary border border-border focus:border-primary text-secondary-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none placeholder-secondary-foreground/50 transition-colors"
                />
            </form>

            {/* Sort Filters */}
            <div>
                <h3 className="font-serif text-lg font-medium mb-4 text-foreground">Discover</h3>
                <ul className="space-y-1">
                    {sortOptions.map((option) => (
                        <li key={option.value}>
                            <Link
                                href={`/?sort=${option.value}${currentCategory ? `&category=${currentCategory}` : ''}`}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors ${currentSort === option.value
                                        ? 'bg-primary/20 text-primary'
                                        : 'hover:bg-surface hover:text-foreground text-foreground/70'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Iconify icon={option.icon} /> {option.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-serif text-lg font-medium mb-4 text-foreground">Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                        <Link
                            key={cat.value}
                            href={`/?sort=${currentSort}&category=${currentCategory === cat.value ? '' : cat.value}`}
                            className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${currentCategory === cat.value
                                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                                    : 'bg-transparent text-foreground border border-border hover:bg-surface hover:text-foreground'
                                }`}
                        >
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
