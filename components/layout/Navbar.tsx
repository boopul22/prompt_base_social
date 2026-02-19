'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Iconify from '../ui/Iconify';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/firebase/auth';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const navLinks = [
        { href: '/', label: 'Feed', icon: 'solar:home-smile-linear' },
        { href: '/?sort=trending', label: 'Explore', icon: 'solar:compass-linear' },
        ...(user ? [{ href: `/profile/${user.username}`, label: 'Saved', icon: 'solar:bookmark-linear' }] : []),
    ];

    async function handleSignOut() {
        await signOutUser();
        setShowMenu(false);
        window.location.href = '/';
    }

    return (
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border-subtle">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Iconify icon="solar:magic-stick-3-linear" width="20" />
                        </div>
                        <span className="font-serif text-xl tracking-tight text-foreground font-semibold">FreePromptBase</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === '/'
                                    ? pathname === '/' && !link.label.includes('Explore')
                                    : pathname.startsWith(link.href.split('?')[0]) && link.href !== '/';
                            const isExplore = link.label === 'Explore';
                            const exploreActive = isExplore && pathname === '/' && typeof window !== 'undefined' && window.location.search.includes('sort=trending');

                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`text-sm font-medium flex items-center gap-2 transition-colors ${(link.label === 'Feed' && pathname === '/')
                                            ? 'text-primary hover:text-primary/80'
                                            : isActive || exploreActive
                                                ? 'text-primary hover:text-primary/80'
                                                : 'text-foreground/60 hover:text-foreground'
                                        }`}
                                >
                                    <Iconify icon={link.icon} /> {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-9 h-9 rounded-full bg-surface animate-pulse"></div>
                        ) : user ? (
                            <>
                                <button className="p-2 text-foreground hover:bg-surface rounded-full">
                                    <Iconify icon="solar:bell-linear" width="20" />
                                </button>
                                <Link
                                    href="/submit"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-transform hover:scale-105"
                                >
                                    <Iconify icon="solar:add-circle-linear" width="18" />
                                    <span>Submit</span>
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden"
                                    >
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-secondary border border-border rounded-lg shadow-lg py-1 z-50">
                                            <Link
                                                href={`/profile/${user.username}`}
                                                onClick={() => setShowMenu(false)}
                                                className="block px-4 py-2 text-sm text-secondary-foreground hover:bg-surface transition-colors"
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium transition-transform hover:scale-105"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
