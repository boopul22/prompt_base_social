'use client';

import { useState } from 'react';
import Iconify from './ui/Iconify';

export default function SubmitPrompt() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Writing');
    const [model, setModel] = useState('GPT-4');
    const [promptText, setPromptText] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!promptText.trim()) newErrors.promptText = 'Prompt text is required';
        else if (promptText.trim().length < 20) newErrors.promptText = 'Prompt must be at least 20 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSubmitted(true);
        setTimeout(() => {
            setTitle('');
            setPromptText('');
            setCategory('Writing');
            setModel('GPT-4');
            setIsPublic(true);
            setSubmitted(false);
        }, 3000);
    };

    if (submitted) {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Iconify icon="solar:check-circle-bold" width="32" className="text-success" />
                    </div>
                    <h2 className="font-serif text-2xl text-foreground font-medium mb-2">Prompt Published!</h2>
                    <p className="text-foreground/60 text-sm">Your prompt has been shared with the community.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h2 className="font-serif text-2xl text-foreground font-medium">Submit a Prompt</h2>
                <p className="text-foreground/60 text-sm mt-1">Share your creativity with the community.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Title Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Prompt Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., Midjourney Landscape V5"
                        className={`w-full bg-secondary border ${errors.title ? 'border-error' : 'border-border'} focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors shadow-sm placeholder-secondary-foreground/50`}
                    />
                    {errors.title && <p className="text-error text-xs">{errors.title}</p>}
                </div>

                {/* Category & Model Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Category</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-secondary border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                            >
                                <option>Writing</option>
                                <option>Coding</option>
                                <option>Art Generation</option>
                                <option>Productivity</option>
                            </select>
                            <Iconify icon="solar:alt-arrow-down-linear" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-foreground uppercase tracking-wide">AI Model</label>
                        <div className="relative">
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-secondary border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                            >
                                <option>GPT-4</option>
                                <option>Claude 2</option>
                                <option>Midjourney</option>
                                <option>Stable Diffusion</option>
                            </select>
                            <Iconify icon="solar:alt-arrow-down-linear" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Large Text Area */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Prompt Text</label>
                    <textarea
                        rows={6}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Paste your prompt here..."
                        className={`w-full bg-secondary border ${errors.promptText ? 'border-error' : 'border-border'} focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors shadow-sm resize-none font-mono leading-relaxed placeholder-secondary-foreground/50`}
                    />
                    {errors.promptText && <p className="text-error text-xs">{errors.promptText}</p>}
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between bg-secondary p-4 rounded-lg border border-border-subtle">
                    <div>
                        <span className="block text-sm font-medium text-secondary-foreground">Visibility</span>
                        <span className="text-xs text-secondary-foreground/50">Make this prompt public to the community</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-border'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-foreground transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex justify-center items-center gap-2"
                    >
                        <Iconify icon="solar:check-circle-linear" width="20" /> Publish Prompt
                    </button>
                </div>
            </form>
        </section>
    );
}
