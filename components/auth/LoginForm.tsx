'use client';

import { useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import Iconify from '@/components/ui/Iconify';
import { signInWithEmail, signInWithGoogle, createSessionCookie } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';

export default function LoginForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function completeLogin(user: { uid: string; getIdToken: () => Promise<string> }) {
    const [profileDoc] = await Promise.all([
      getDoc(doc(db, 'users', user.uid)),
      user.getIdToken().then((t) => createSessionCookie(t)).catch(() => {}),
    ]);
    window.location.href = profileDoc.exists() ? '/' : '/auth/signup';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      await completeLogin(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('auth/invalid-credential') || message.includes('auth/user-not-found')) {
        setError('No account found with this email address.');
      } else if (message.includes('auth/wrong-password')) {
        setError('Incorrect password. Please try again.');
      } else if (message.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please wait a moment and try again.');
      } else {
        setError('Sign in failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await completeLogin(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('auth/popup-closed-by-user')) {
        setError('Google sign-in was cancelled. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        {/* Mobile-only logo */}
        <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Iconify icon="solar:magic-stick-3-linear" width="20" />
          </div>
          <span className="font-serif text-lg text-foreground font-semibold">FreePromptBase</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-medium mb-2">
          Welcome back
        </h1>
        <p className="text-foreground/50 text-sm">
          Sign in to continue to your account
        </p>
      </div>

      {/* Google Button — top placement for quicker access */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full bg-surface hover:bg-surface-elevated border border-border hover:border-border-subtle text-secondary-foreground font-medium py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm disabled:opacity-50 transition-all duration-200 mb-6"
      >
        <Iconify icon="logos:google-icon" width="20" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-foreground/30 uppercase tracking-widest">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="auth-error flex items-start gap-3 bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl mb-5">
          <Iconify icon="solar:danger-circle-linear" width="18" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="auth-input w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="#"
              className="text-xs text-primary/80 hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="auth-input w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3.5 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
              placeholder="Enter your password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Iconify
                icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
                width="18"
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm shadow-[0_2px_12px_-2px_rgba(245,166,35,0.3)] hover:shadow-[0_4px_20px_-2px_rgba(245,166,35,0.4)]"
        >
          {loading ? (
            <>
              <span className="auth-spinner" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-foreground/40 mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
          Create one for free
        </Link>
      </p>
    </>
  );
}
