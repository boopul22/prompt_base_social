'use client';

import { useState } from 'react';
import Link from 'next/link';
import Iconify from './ui/Iconify';
import { User, Prompt } from '@/lib/types';

interface UserProfileProps {
    user: User;
    prompts: Prompt[];
}

export default function UserProfile({ user, prompts }: UserProfileProps) {
    const [activeTab, setActiveTab] = useState<'my' | 'saved'>('my');

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-secondary rounded-2xl p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-foreground/25 shadow-lg overflow-hidden flex-shrink-0">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="font-serif text-3xl font-medium text-secondary-foreground mb-2">{user.name}</h1>
                        {user.bio && (
                            <p className="text-secondary-foreground/70 max-w-lg mb-6">{user.bio}</p>
                        )}

                        {user.categories && user.categories.length > 0 && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                {user.categories.map((cat) => (
                                    <span key={cat} className="px-3 py-1 rounded-md border border-border text-secondary-foreground text-xs">{cat}</span>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center md:justify-start gap-8 border-t border-border-subtle pt-6">
                            <div>
                                <span className="block text-2xl font-serif font-medium text-secondary-foreground">{user.stats.prompts}</span>
                                <span className="text-xs text-secondary-foreground/50 uppercase tracking-wider">Prompts</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-serif font-medium text-secondary-foreground">{user.stats.likes}</span>
                                <span className="text-xs text-secondary-foreground/50 uppercase tracking-wider">Likes</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-serif font-medium text-secondary-foreground">{user.stats.saved}</span>
                                <span className="text-xs text-secondary-foreground/50 uppercase tracking-wider">Saved</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">Edit Profile</button>
                        <button className="bg-surface-elevated border border-border text-secondary-foreground px-4 py-2 rounded-lg hover:border-muted transition-colors">
                            <Iconify icon="solar:settings-linear" width="20" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-12 border-b border-border">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-secondary-foreground/50 hover:text-secondary-foreground'}`}
                    >
                        My Prompts
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-secondary-foreground/50 hover:text-secondary-foreground'}`}
                    >
                        Saved Prompts
                    </button>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {activeTab === 'my' && prompts.length === 0 && (
                        <p className="text-muted text-sm col-span-full">No prompts yet.</p>
                    )}
                    {activeTab === 'saved' && (
                        <p className="text-muted text-sm col-span-full">No saved prompts yet.</p>
                    )}
                    {activeTab === 'my' && prompts.map((prompt) => (
                        <Link key={prompt.id} href={`/prompt/${prompt.id}`}>
                            <article className="bg-surface rounded-xl p-6 border border-transparent hover:border-border transition-all shadow-sm hover:shadow-lg group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-secondary-foreground/50">{prompt.createdAt}</span>
                                    <Iconify icon="solar:menu-dots-linear" className="text-secondary-foreground" />
                                </div>
                                <h3 className="font-serif text-lg text-secondary-foreground font-medium mb-2 group-hover:text-primary transition-colors">{prompt.title}</h3>
                                <p className="text-secondary-foreground/70 text-sm mb-4 line-clamp-2">{prompt.description}</p>
                                <div className="flex items-center gap-4 text-secondary-foreground/60 text-xs">
                                    <span className="flex items-center gap-1"><Iconify icon="solar:heart-linear" /> {prompt.likes}</span>
                                    <span className="flex items-center gap-1"><Iconify icon="solar:bookmark-linear" /> {prompt.bookmarks}</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
