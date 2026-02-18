'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Iconify from '@/components/ui/Iconify';
import { signUpWithEmail, signInWithGoogle, createSessionCookie, setupProfile } from '@/lib/firebase/auth';

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await signUpWithEmail(email, password);
      const idToken = await user.getIdToken();
      await createSessionCookie(idToken);
      setStep('profile');
    } catch {
      setError('Could not create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      await createSessionCookie(idToken);
      if (user.displayName) setName(user.displayName);
      setStep('profile');
    } catch {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username || !name) {
      setError('Username and display name are required');
      return;
    }
    setLoading(true);
    try {
      await setupProfile(username, name);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'profile') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-foreground font-medium mb-2">Set Up Your Profile</h1>
          <p className="text-foreground/60 text-sm">Choose a username for the community</p>
        </div>
        <div className="bg-secondary rounded-xl p-6 border border-border-subtle">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                className="w-full bg-surface border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                placeholder="e.g. alex-design"
              />
              <p className="text-xs text-foreground/40">Lowercase letters, numbers, and hyphens only</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                placeholder="Your display name"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-foreground font-medium mb-2">Join FreePromptBase</h1>
        <p className="text-foreground/60 text-sm">Create an account to share and discover AI prompts</p>
      </div>

      <div className="bg-secondary rounded-xl p-6 border border-border-subtle">
        {error && (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleCredentials} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-foreground uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
          <div className="relative flex justify-center"><span className="bg-secondary px-3 text-xs text-foreground/40">or</span></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-surface border border-border text-secondary-foreground font-medium py-3 rounded-lg hover:border-muted transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Iconify icon="logos:google-icon" width="18" /> Continue with Google
        </button>

        <p className="text-center text-sm text-foreground/50 mt-6">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
