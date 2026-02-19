'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Iconify from './ui/Iconify';
import CopyButton from './ui/CopyButton';
import { Prompt, Comment } from '@/lib/types';
import { formatTimeAgo, formatCount } from '@/lib/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { submitVote, toggleBookmark } from '@/lib/firebase/firestore';

interface PromptDetailProps {
    prompt: Prompt;
    comments: Comment[];
}

export default function PromptDetail({ prompt, comments: initialComments }: PromptDetailProps) {
    const { user } = useAuth();
    const [currentVote, setCurrentVote] = useState<1 | -1 | 0>(0);
    const [bookmarked, setBookmarked] = useState(false);
    const [score, setScore] = useState(prompt.score);
    const [bookmarksCount, setBookmarksCount] = useState(prompt.bookmarksCount);
    const [comments, setComments] = useState(initialComments);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            setCurrentVote(0);
            setBookmarked(false);
            return;
        }

        const controller = new AbortController();

        async function loadInteractionState() {
            try {
                const res = await fetch('/api/users/me/interactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ promptIds: [prompt.id] }),
                    signal: controller.signal,
                });
                if (!res.ok) return;

                const data = await res.json();
                const votes: Record<string, number> = data.votes || {};
                const bookmarkedIds = new Set<string>(data.bookmarkedIds || []);
                setCurrentVote((votes[prompt.id] as 1 | -1) || 0);
                setBookmarked(bookmarkedIds.has(prompt.id));
            } catch {
                // Ignore cancelled/failed reads and keep default interaction state.
            }
        }

        void loadInteractionState();

        return () => controller.abort();
    }, [prompt.id, user]);

    async function handleVote(value: 1 | -1) {
        if (!user) return;
        const prevVote = currentVote;
        const prevScore = score;
        const newValue: 1 | -1 | 0 = currentVote === value ? 0 : value;

        setCurrentVote(newValue);
        setScore((s) => s - prevVote + newValue);

        try {
            const result = await submitVote(prompt.id, newValue);
            setCurrentVote(result.vote);
            setScore(result.score);
        } catch {
            setCurrentVote(prevVote);
            setScore(prevScore);
        }
    }

    async function handleBookmark() {
        if (!user) return;
        const wasBookmarked = bookmarked;
        setBookmarked(!wasBookmarked);
        setBookmarksCount((c) => c + (wasBookmarked ? -1 : 1));
        try {
            const result = await toggleBookmark(prompt.id);
            setBookmarked(result.bookmarked);
            setBookmarksCount(result.bookmarksCount);
        } catch {
            setBookmarked(wasBookmarked);
            setBookmarksCount((c) => c + (wasBookmarked ? 1 : -1));
        }
    }

    async function handleComment(e: React.FormEvent) {
        e.preventDefault();
        if (!commentText.trim() || !user || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/prompts/${prompt.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentText }),
            });
            if (res.ok) {
                setComments((prev) => [...prev, {
                    id: Date.now().toString(),
                    author: { uid: user.uid, username: user.username, name: user.name, avatar: user.avatar },
                    content: commentText,
                    createdAt: new Date().toISOString(),
                }]);
                setCommentText('');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center gap-2 text-xs text-foreground/50 mb-6">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span>/</span>
                <Link href={`/?category=${prompt.category.toLowerCase()}`} className="hover:text-foreground">{prompt.category}</Link>
                <span>/</span>
                <span className="text-foreground">{prompt.title}</span>
            </div>

            <div className="bg-secondary rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="p-8 border-b border-border-subtle">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="font-serif text-3xl text-secondary-foreground font-medium mb-3">{prompt.title}</h1>
                            <div className="flex items-center gap-4">
                                <Link href={`/profile/${prompt.author.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <img src={prompt.author.avatar} className="w-6 h-6 rounded-full" alt={prompt.author.name} loading="lazy" decoding="async" />
                                    <span className="text-sm font-medium text-secondary-foreground">{prompt.author.name}</span>
                                </Link>
                                <span className="w-1 h-1 rounded-full bg-muted"></span>
                                <span className="text-xs text-secondary-foreground/60">{formatTimeAgo(prompt.createdAt)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => handleVote(1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${currentVote === 1 ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-primary text-secondary-foreground hover:text-primary-foreground'}`}>
                                <Iconify icon={currentVote === 1 ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-up-linear'} width="20" />
                            </button>
                            <span className={`text-sm font-medium min-w-[2rem] text-center ${score > 0 ? 'text-primary' : score < 0 ? 'text-red-500' : 'text-secondary-foreground/60'}`}>
                                {formatCount(score)}
                            </span>
                            <button onClick={() => handleVote(-1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${currentVote === -1 ? 'bg-red-500 text-white' : 'bg-surface hover:bg-red-500 text-secondary-foreground hover:text-white'}`}>
                                <Iconify icon={currentVote === -1 ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-down-linear'} width="20" />
                            </button>
                            <button onClick={handleBookmark} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${bookmarked ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-primary text-secondary-foreground hover:text-primary-foreground'}`}>
                                <Iconify icon={bookmarked ? 'solar:bookmark-bold' : 'solar:bookmark-linear'} width="20" />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-secondary-foreground/60">
                        <span className="flex items-center gap-1"><Iconify icon="solar:graph-up-linear" width="14" /> {formatCount(score)} score</span>
                        <span className="flex items-center gap-1"><Iconify icon="solar:bookmark-linear" width="14" /> {formatCount(bookmarksCount)} saves</span>
                    </div>
                </div>

                <div className="p-8 bg-surface">
                    <div className="relative group">
                        <div className="bg-surface-elevated border-l-4 border-primary p-6 rounded-r-lg font-mono text-sm text-secondary-foreground leading-loose pr-28">
                            {prompt.promptText}
                        </div>
                        <div className="absolute top-4 right-4">
                            <CopyButton text={prompt.promptText} variant="outline" className="bg-surface-elevated hover:bg-primary hover:text-primary-foreground" />
                        </div>
                    </div>
                    {prompt.tags.length > 0 && (
                        <div className="flex gap-2 mt-6">
                            {prompt.tags.map((tag) => (
                                <span key={tag} className="bg-accent/15 text-accent text-xs px-3 py-1 rounded-full font-medium">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-border-subtle">
                    <h3 className="font-serif text-lg text-secondary-foreground mb-4">Comments ({comments.length})</h3>
                    {user && (
                        <form onSubmit={handleComment} className="flex gap-3 mb-6">
                            <img src={user.avatar} className="w-8 h-8 rounded-full flex-shrink-0" alt={user.name} loading="lazy" decoding="async" />
                            <div className="flex-1 flex gap-2">
                                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-secondary-foreground outline-none focus:border-primary transition-colors" />
                                <button type="submit" disabled={!commentText.trim() || submitting} className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors">Post</button>
                            </div>
                        </form>
                    )}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-sm text-secondary-foreground/50">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Link href={`/profile/${comment.author.username}`}>
                                        <img src={comment.author.avatar} className="w-8 h-8 rounded-full flex-shrink-0" alt={comment.author.name} loading="lazy" decoding="async" />
                                    </Link>
                                    <div className="bg-surface p-3 rounded-lg rounded-tl-none w-full">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <Link href={`/profile/${comment.author.username}`} className="text-xs font-bold text-secondary-foreground hover:text-primary">{comment.author.name}</Link>
                                            <span className="text-[10px] text-secondary-foreground/40">{formatTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-secondary-foreground/80">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
