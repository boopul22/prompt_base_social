import Link from 'next/link';
import Iconify from './ui/Iconify';
import CopyButton from './ui/CopyButton';
import { Prompt } from '@/lib/types';

interface FeedCardProps {
    prompt: Prompt;
}

export default function FeedCard({ prompt }: FeedCardProps) {
    const { isFeatured, author, createdAt, model, title, description, likes, bookmarks, tags, id, promptText } = prompt;

    return (
        <article className={`bg-secondary rounded-xl p-6 relative border border-transparent hover:border-primary transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] group ${isFeatured ? 'mb-6' : ''}`}>
            {/* Admin Badge */}
            {isFeatured && (
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                    <Iconify icon="solar:star-linear" /> Featured by Admin
                </div>
            )}

            <div className={`flex justify-between items-start ${isFeatured ? 'mt-2' : ''} mb-3`}>
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${author.username}`}>
                        <img src={author.avatar} className={`w-10 h-10 rounded-full ${isFeatured ? 'border-2 border-foreground/30 shadow-sm' : 'border border-border'}`} alt={author.name} />
                    </Link>
                    <div>
                        <Link href={`/profile/${author.username}`} className="text-sm font-medium text-secondary-foreground leading-tight hover:text-primary transition-colors">
                            {author.name}
                        </Link>
                        <span className="block text-xs text-secondary-foreground/60">{createdAt}</span>
                    </div>
                </div>
                <span className={`${isFeatured ? 'bg-primary text-primary-foreground' : 'bg-surface text-secondary-foreground'} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>{model}</span>
            </div>

            <Link href={`/prompt/${id}`}>
                <h2 className="font-serif text-xl text-secondary-foreground font-medium mb-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">{title}</h2>
            </Link>
            <p className="text-secondary-foreground/70 text-sm mb-4 line-clamp-3 leading-relaxed">
                {description}
            </p>

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <span key={index} className="text-[10px] px-2 py-1 rounded bg-surface border border-border-subtle text-secondary-foreground/80">#{tag}</span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-secondary-foreground hover:text-primary group/btn">
                        <Iconify icon="solar:heart-linear" width="16" className="group-hover/btn:scale-110 transition-transform" /> {likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-secondary-foreground hover:text-primary group/btn">
                        <Iconify icon="solar:bookmark-linear" width="16" className="group-hover/btn:scale-110 transition-transform" /> {bookmarks}
                    </button>
                </div>
                <CopyButton
                    text={promptText}
                    variant={isFeatured ? 'outline' : 'default'}
                />
            </div>
        </article>
    );
}
