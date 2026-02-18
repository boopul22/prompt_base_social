import Link from 'next/link';
import Iconify from '../ui/Iconify';

export default function RightSidebar() {
    return (
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit">
            <div className="bg-secondary rounded-xl p-5 border border-border-subtle">
                <h3 className="font-serif text-lg font-medium mb-4 text-secondary-foreground">Your Profile</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-serif">
                        A
                    </div>
                    <div>
                        <div className="text-sm font-medium text-secondary-foreground">Alex Design</div>
                        <div className="text-xs text-secondary-foreground/60">Free Plan</div>
                    </div>
                </div>
                <div className="flex justify-between text-center border-t border-border-subtle pt-4 mb-4">
                    <div>
                        <span className="block text-lg font-medium text-secondary-foreground">12</span>
                        <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Prompts</span>
                    </div>
                    <div>
                        <span className="block text-lg font-medium text-secondary-foreground">48</span>
                        <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Likes</span>
                    </div>
                    <div>
                        <span className="block text-lg font-medium text-secondary-foreground">5</span>
                        <span className="text-[10px] text-secondary-foreground/50 uppercase tracking-wider">Saved</span>
                    </div>
                </div>
                <Link
                    href="/profile/alex-design"
                    className="block w-full bg-surface-elevated border border-border text-secondary-foreground py-2 rounded-lg text-sm font-medium hover:border-muted transition-colors text-center"
                >
                    View Profile
                </Link>
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
