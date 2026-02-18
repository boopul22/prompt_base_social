'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Iconify from '@/components/ui/Iconify';
import { signInWithEmail, signInWithGoogle, createSessionCookie } from '@/lib/firebase/auth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      const idToken = await user.getIdToken();
      await createSessionCookie(idToken);
      router.push('/');
      router.refresh();
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      await createSessionCookie(idToken);
      router.push('/');
      router.refresh();
    } catch {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-foreground font-medium mb-2">Welcome Back</h1>
        <p className="text-foreground/60 text-sm">Sign in to your FreePromptBase account</p>
      </div>

      <div className="bg-secondary rounded-xl p-6 border border-border-subtle">
        {error && (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-surface border border-border focus:border-primary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
          <div className="relative flex justify-center"><span className="bg-secondary px-3 text-xs text-foreground/40">or</span></div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-surface border border-border text-secondary-foreground font-medium py-3 rounded-lg hover:border-muted transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Iconify icon="logos:google-icon" width="18" /> Continue with Google
        </button>

        <p className="text-center text-sm text-foreground/50 mt-6">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-primary hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
