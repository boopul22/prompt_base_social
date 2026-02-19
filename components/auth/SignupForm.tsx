'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Iconify from '@/components/ui/Iconify';
import { signUpWithEmail, signInWithGoogle, createSessionCookie, setupProfile } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

function getPasswordStrength(pw: string): 'none' | 'weak' | 'fair' | 'strong' {
  if (!pw) return 'none';
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

const strengthLabels = { none: '', weak: 'Weak', fair: 'Fair', strong: 'Strong' };
const strengthColors = { none: '', weak: 'text-error', fair: 'text-warning', strong: 'text-success' };

export default function SignupForm() {
  const { firebaseUser, needsProfile } = useAuth();
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [animDir, setAnimDir] = useState<'forward' | 'backward'>('forward');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [profileIdToken, setProfileIdToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (firebaseUser && needsProfile) {
      setStep('profile');
      if (firebaseUser.displayName && !name) {
        setName(firebaseUser.displayName);
      }
    }
  }, [firebaseUser, needsProfile, name]);

  function goToProfile() {
    setAnimDir('forward');
    setStep('profile');
  }

  function goBack() {
    setAnimDir('backward');
    setStep('credentials');
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await signUpWithEmail(email, password);
      const idToken = await user.getIdToken();
      setProfileIdToken(idToken);
      try {
        await createSessionCookie(idToken);
      } catch (err) {
        console.error('Session cookie creation failed after email sign-up:', err);
      }
      goToProfile();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('auth/email-already-in-use')) {
        setError('This email is already registered.');
      } else {
        setError('Could not create account. Please try again.');
      }
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
      setProfileIdToken(idToken);
      try {
        await createSessionCookie(idToken);
      } catch (err) {
        console.error('Session cookie creation failed after Google sign-up:', err);
      }
      if (user.displayName) setName(user.displayName);
      goToProfile();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('auth/popup-closed-by-user')) {
        setError('Google sign-in was cancelled.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username || !name) {
      setError('Username and display name are required.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    try {
      await setupProfile(username, name, profileIdToken);
      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Step indicator ── */
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 'credentials'
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(245,166,35,0.3)]'
            : 'bg-primary/20 text-primary'
            }`}
        >
          {step === 'profile' ? (
            <Iconify icon="solar:check-circle-bold" width="16" />
          ) : (
            '1'
          )}
        </div>
        <span className={`text-xs font-medium hidden sm:inline ${step === 'credentials' ? 'text-foreground' : 'text-foreground/50'
          }`}>
          Account
        </span>
      </div>

      {/* Connector */}
      <div className="w-12 h-0.5 rounded-full overflow-hidden bg-border">
        <div
          className={`h-full bg-primary transition-all duration-500 ease-out ${step === 'profile' ? 'w-full' : 'w-0'
            }`}
        />
      </div>

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 'profile'
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(245,166,35,0.3)]'
            : 'bg-surface border border-border text-muted-foreground'
            }`}
        >
          2
        </div>
        <span className={`text-xs font-medium hidden sm:inline ${step === 'profile' ? 'text-foreground' : 'text-foreground/30'
          }`}>
          Profile
        </span>
      </div>
    </div>
  );

  /* ── Profile step ── */
  if (step === 'profile') {
    return (
      <>
        <StepIndicator />

        <div key="profile" className={animDir === 'forward' ? 'auth-step-forward' : 'auth-step-backward'}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <Iconify icon="solar:user-id-linear" width="28" className="text-accent" />
            </div>
            <h1 className="font-serif text-3xl text-foreground font-medium mb-2">
              Set up your profile
            </h1>
            <p className="text-foreground/50 text-sm">
              Choose a username for the community
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error flex items-start gap-3 bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl mb-5">
              <Iconify icon="solar:danger-circle-linear" width="18" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleProfile} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="signup-username" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  maxLength={30}
                  className="auth-input w-full bg-surface border border-border text-secondary-foreground rounded-xl pl-9 pr-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                  placeholder="your-username"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-foreground/30">Lowercase letters, numbers, and hyphens</p>
                <p className={`text-xs ${username.length >= 25 ? 'text-warning' : 'text-foreground/30'}`}>
                  {username.length}/30
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="signup-name" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                Display Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                placeholder="How you want to appear"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border text-foreground/60 hover:text-foreground hover:bg-surface text-sm font-medium transition-all duration-200"
              >
                <Iconify icon="solar:arrow-left-linear" width="16" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm shadow-[0_2px_12px_-2px_rgba(245,166,35,0.3)] hover:shadow-[0_4px_20px_-2px_rgba(245,166,35,0.4)]"
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create Profile
                    <Iconify icon="solar:arrow-right-linear" width="16" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  /* ── Credentials step ── */
  return (
    <>
      <StepIndicator />

      <div key="credentials" className={animDir === 'backward' ? 'auth-step-backward' : ''}>
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
            Create your account
          </h1>
          <p className="text-foreground/50 text-sm">
            Join the community and start sharing prompts
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
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
              or sign up with email
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error flex items-start gap-3 bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl mb-5">
            <Iconify icon="solar:danger-circle-linear" width="18" className="mt-0.5 shrink-0" />
            <div>
              <span>{error}</span>
              {error.includes('already registered') && (
                <Link href="/auth/login" className="block text-primary text-xs mt-1 hover:underline">
                  Sign in instead →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCredentials} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="signup-email" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-input w-full bg-surface border border-border text-secondary-foreground rounded-xl px-4 py-3.5 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
                placeholder="Create a strong password"
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

            {/* Strength meter */}
            {password && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div className={`strength-meter strength-${strength}`} />
                </div>
                <span className={`text-xs font-medium ${strengthColors[strength]}`}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
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
                Creating account…
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-foreground/25 mt-5 leading-relaxed">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/40 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
