'use client';

import { useState } from 'react';
import Iconify from './ui/Iconify';
import { User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
    onSaved: (updated: User) => void;
}

const CATEGORY_OPTIONS = ['Writing', 'Coding', 'Art', 'Marketing', 'Productivity', 'Education', 'Business'];

export default function EditProfileModal({ user, onClose, onSaved }: EditProfileModalProps) {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [categories, setCategories] = useState<string[]>(user.categories);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    function toggleCategory(cat: string) {
        setCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), bio: bio.trim(), categories }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update profile');
            }
            const data = await res.json();
            await refreshUser();
            onSaved(data.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-secondary rounded-2xl w-full max-w-lg shadow-2xl border border-border-subtle overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h2 className="font-serif text-xl font-medium text-secondary-foreground">Edit Profile</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-secondary-foreground/60 hover:text-secondary-foreground">
                        <Iconify icon="solar:close-circle-linear" width="20" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                            <Iconify icon="solar:danger-circle-linear" width="16" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="edit-name" className="block text-xs font-medium text-secondary-foreground/70 uppercase tracking-wider">
                            Display Name
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            required
                            className="w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                            placeholder="Your display name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="edit-bio" className="block text-xs font-medium text-secondary-foreground/70 uppercase tracking-wider">
                            Bio
                        </label>
                        <textarea
                            id="edit-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            rows={3}
                            className="w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <span className="text-xs text-secondary-foreground/40">{bio.length}/200</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-secondary-foreground/70 uppercase tracking-wider">
                            Interests
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map((cat) => {
                                const isSelected = categories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-surface border border-border text-secondary-foreground/70 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-surface border border-border text-secondary-foreground py-3 rounded-xl text-sm font-medium hover:bg-surface-elevated transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Iconify icon="solar:refresh-circle-linear" width="16" className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
