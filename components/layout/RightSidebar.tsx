'use client';

import Link from 'next/link';
import Iconify from '../ui/Iconify';
import { useAuth } from '@/contexts/AuthContext';
import { formatCount } from '@/lib/utils/format';

export default function RightSidebar() {
    const { user, loading } = useAuth();

    return (
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit">
            <div className="bg-secondary rounded-xl p-5 border border-border-subtle">
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-surface rounded w-24"></div>
                        <div className="h-12 bg-surface rounded-full w-12"></div>
                    </div>
                ) : user ? (
                    <>
                        <h3 className="font-serif text-lg font-medium mb-4 text-secondary-foreground">Your Profile</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-secondary-foreground">{user.name}</div>
                                <div className="text-xs text-secondary-foreground/60">@{user.username}</div>
                            </div>
                        </div>
                        <div className="flex justify-between text-center border-t border-border-subtle pt-4 mb-4">
                            <div>
                                <span className="block text-lg font-medium text-secondary-foreground">{user.stats.prompts}</span>
                                <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Prompts</span>
                            </div>
                            <div>
                                <span className="block text-lg font-medium text-secondary-foreground">{formatCount(user.stats.likes)}</span>
                                <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Likes</span>
                            </div>
                            <div>
                                <span className="block text-lg font-medium text-secondary-foreground">{user.stats.saved}</span>
                                <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Saved</span>
                            </div>
                        </div>
                        <Link
                            href={`/profile/${user.username}`}
                            className="block w-full bg-surface-elevated border border-border text-secondary-foreground py-2 rounded-lg text-sm font-medium hover:border-muted transition-colors text-center"
                        >
                            View Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <h3 className="font-serif text-lg font-medium mb-3 text-secondary-foreground">Join the Community</h3>
                        <p className="text-sm text-secondary-foreground/60 mb-4">Sign up to share and discover AI prompts.</p>
                        <Link
                            href="/auth/signup"
                            className="block w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium text-center hover:bg-primary/90 transition-colors mb-2"
                        >
                            Sign Up
                        </Link>
                        <Link
                            href="/auth/login"
                            className="block w-full bg-surface-elevated border border-border text-secondary-foreground py-2 rounded-lg text-sm font-medium text-center hover:border-muted transition-colors"
                        >
                            Sign In
                        </Link>
                    </>
                )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground/40">
                <a href="#" className="hover:text-foreground transition-colors">About</a>
                <a href="#" className="hover:text-foreground transition-colors">Guidelines</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <span className="flex items-center gap-1">
                    <Iconify icon="solar:copyright-linear" width="12" /> 2024 FreePromptBase
                </span>
            </div>
        </aside>
    );
}
