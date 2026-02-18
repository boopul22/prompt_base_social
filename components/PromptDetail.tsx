import Link from 'next/link';
import Iconify from './ui/Iconify';
import CopyButton from './ui/CopyButton';
import { Prompt, Comment } from '@/lib/types';

interface PromptDetailProps {
    prompt: Prompt;
    comments: Comment[];
}

export default function PromptDetail({ prompt, comments }: PromptDetailProps) {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-foreground/50 mb-6">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span>/</span>
                <Link href={`/?category=${prompt.category.toLowerCase()}`} className="hover:text-foreground">{prompt.category}</Link>
                <span>/</span>
                <span className="text-foreground">{prompt.title}</span>
            </div>

            <div className="bg-secondary rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-border-subtle">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="font-serif text-3xl text-secondary-foreground font-medium mb-3">{prompt.title}</h1>
                            <div className="flex items-center gap-4">
                                <Link href={`/profile/${prompt.author.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <img src={prompt.author.avatar} className="w-6 h-6 rounded-full" alt={prompt.author.name} />
                                    <span className="text-sm font-medium text-secondary-foreground">{prompt.author.name}</span>
                                </Link>
                                <span className="w-1 h-1 rounded-full bg-muted"></span>
                                <span className="text-xs text-secondary-foreground/60">Updated {prompt.createdAt}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-primary text-secondary-foreground hover:text-primary-foreground transition-colors">
                                <Iconify icon="solar:share-linear" width="20" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-primary text-secondary-foreground hover:text-primary-foreground transition-colors">
                                <Iconify icon="solar:bookmark-linear" width="20" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Prompt Code Block */}
                <div className="p-8 bg-surface">
                    <div className="relative group">
                        <div className="bg-surface-elevated border-l-4 border-primary p-6 rounded-r-lg font-mono text-sm text-secondary-foreground leading-loose pr-28">
                            {prompt.promptText}
                        </div>
                        <div className="absolute top-4 right-4">
                            <CopyButton text={prompt.promptText} variant="outline" className="bg-surface-elevated hover:bg-primary hover:text-primary-foreground" />
                        </div>
                    </div>

                    {/* Tags */}
                    {prompt.tags.length > 0 && (
                        <div className="flex gap-2 mt-6">
                            {prompt.tags.map((tag) => (
                                <span key={tag} className="bg-accent/15 text-accent text-xs px-3 py-1 rounded-full font-medium">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="p-8 border-t border-border-subtle">
                    <h3 className="font-serif text-lg text-secondary-foreground mb-4">Comments ({comments.length})</h3>
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-sm text-secondary-foreground/50">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface flex-shrink-0"></div>
                                    <div className="bg-surface p-3 rounded-lg rounded-tl-none w-full">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs font-bold text-secondary-foreground">{comment.author}</span>
                                            <span className="text-[10px] text-secondary-foreground/40">{comment.createdAt}</span>
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
