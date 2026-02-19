import type { ReactNode } from 'react';

export const metadata = {
    robots: 'noindex',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Branding Panel — desktop only */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden flex-col justify-between p-10 auth-brand-panel">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 auth-brand-gradient" />
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h.01" /><path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" />
                            </svg>
                        </div>
                        <span className="font-serif text-xl text-white font-semibold tracking-tight">FreePromptBase</span>
                    </div>

                    {/* Tagline */}
                    <h2 className="font-serif text-4xl xl:text-5xl text-white font-medium leading-tight mb-6">
                        Share, Discover &<br />Create with AI
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed max-w-sm mb-12">
                        Join a growing community of creators sharing powerful AI prompts. Find inspiration, save your favorites, and level up your workflow.
                    </p>

                    {/* Social proof */}
                    <div className="flex gap-8">
                        <div>
                            <div className="text-2xl font-semibold text-white">1K+</div>
                            <div className="text-white/50 text-sm">Prompts Shared</div>
                        </div>
                        <div>
                            <div className="text-2xl font-semibold text-white">500+</div>
                            <div className="text-white/50 text-sm">Community Members</div>
                        </div>
                        <div>
                            <div className="text-2xl font-semibold text-white">Free</div>
                            <div className="text-white/50 text-sm">Forever</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-white/30 text-xs">
                    © 2026 FreePromptBase · All rights reserved
                </div>
            </div>

            {/* Form Panel */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md auth-form-enter">
                    {children}
                </div>
            </div>
        </div>
    );
}
