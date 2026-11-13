import React, { useState } from 'react';
import { RouteName } from '../types';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

interface LoginPageProps {
  onNavigate: (route: RouteName, param?: string) => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const mapFirebaseError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
        return 'Incorrect email or password. Please try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact administrator support.';
      case 'auth/too-many-requests':
        return 'Too many sign-in attempts. Please try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Check your internet connection and try again.';
      default:
        return 'Authentication failed. Please verify your credentials and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setNotice(null);

    let hasError = false;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Enter your email address.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Enter your password.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      onNavigate('workspace');
    } catch (err: any) {
      const code = err?.code || '';
      setNotice(mapFirebaseError(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col justify-center items-center px-6 py-12 bg-[var(--bg)] transition-colors">
      <div className="w-full max-w-[452px]">
        <section
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-9 shadow-xl"
          aria-labelledby="login-title"
        >
          <div className="mb-6 flex items-center justify-between">
            <BrandLogo size="md" variant="dark" withDot />
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[var(--accent-badge-bg)] text-[var(--brand)] border border-[var(--border)]">
              Secure Auth
            </span>
          </div>

          <h1
            id="login-title"
            className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)] tracking-tight"
          >
            Welcome back
          </h1>
          <p className="text-sm text-[var(--sub)] mt-2 mb-6">
            Sign in to access your subscribed AI tools.
          </p>

          {/* Error Notice */}
          {notice && (
            <div
              className="mb-5 p-3.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)] text-xs leading-relaxed font-medium"
              role="alert"
            >
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[var(--text)] mb-2">
                Email address
              </label>
              <div
                className={`h-12 rounded-xl border bg-[var(--input)] px-4 flex items-center transition-all ${
                  emailError
                    ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                    : 'border-[var(--border-strong)] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20'
                }`}
              >
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="text-xs text-[var(--danger)] mt-1.5 font-medium">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[var(--text)] mb-2">
                Password
              </label>
              <div
                className={`h-12 rounded-xl border bg-[var(--input)] px-4 flex items-center justify-between transition-all ${
                  passwordError
                    ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                    : 'border-[var(--border-strong)] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20'
                }`}
              >
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--muted)] hover:text-[var(--text)] focus:outline-none p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-xs text-[var(--danger)] mt-1.5 font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-text)]" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Assistance Note */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] space-y-2">
            <p>
              Access is provided exclusively through active subscriptions and manual administrator approval.
            </p>
            <p>
              Need account assistance?{' '}
              <a
                href="https://wa.me/923295556272"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[var(--text)] hover:underline inline-flex items-center gap-1"
              >
                Contact Support
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
