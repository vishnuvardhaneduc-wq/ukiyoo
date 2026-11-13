import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/useAuth.js';
import { Icons } from '../../components/Icon.jsx';

export function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('pramod@example.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/chat';

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch {
      setErrors({ form: 'Authentication failed. Please check your credentials.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-parchment relative overflow-hidden">
      {/* Radial atmospheric warmth matching 01-signin */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute w-[680px] h-[680px] -top-32 rounded-full bg-peach-glow/30 blur-3xl"></div>
        <div className="absolute w-[440px] h-[440px] top-1/4 rounded-full bg-peach-glow/20 blur-2xl"></div>
        <svg
          className="absolute w-[780px] h-[780px] opacity-35 text-pebble"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 800 800"
        >
          <circle cx="400" cy="400" r="240" strokeDasharray="3 4" strokeWidth="1" />
          <circle cx="400" cy="400" r="330" strokeWidth="1" />
          <circle cx="400" cy="400" r="390" strokeDasharray="2 6" strokeWidth="0.75" />
        </svg>
      </div>

      {/* Sign In Card */}
      <div className="relative w-full max-w-[430px] z-10">
        <div className="bg-pure-card rounded-2xl p-8 sm:p-10 shadow-xl shadow-peach-glow/30 border border-pebble backdrop-blur-sm transition-all duration-300">
          {/* Brand Mark */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center border border-pebble/60 mb-3 text-sepia">
              <Icons.SparkleIcon className="w-5 h-5 text-sepia" />
            </div>
            <span className="font-headline text-2xl text-sepia tracking-tight font-normal">
              MindMate AI
            </span>
          </div>

          {/* Welcome Header */}
          <div className="text-center mt-6 mb-7">
            <h1 className="font-headline text-3xl text-sepia font-normal tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-bronze mt-1">
              {isSignUp
                ? 'Start your private personal AI assistant'
                : 'Sign in to continue to MindMate'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* General form error */}
            {errors.form && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl bg-danger-bg/70 text-danger border border-danger/30 text-xs font-medium"
                role="alert"
              >
                <Icons.AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="signin-email"
                className="block text-xs font-medium uppercase tracking-wider text-driftwood"
              >
                Email Address
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full bg-parchment text-sepia text-sm rounded-xl px-3.5 py-2.5 border transition-colors focus:outline-none focus:ring-2 placeholder:text-stone ${
                  errors.email
                    ? 'border-danger/80 focus:border-danger focus:ring-danger-bg'
                    : 'border-pebble focus:border-ember-orange focus:ring-peach-glow/50'
                }`}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-danger flex items-center gap-1 pt-0.5" role="alert">
                  <Icons.AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-medium uppercase tracking-wider text-driftwood"
                >
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset placeholder in mock auth.')}
                    className="text-xs text-ember-orange hover:text-primary font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full bg-parchment text-sepia text-sm rounded-xl pl-3.5 pr-11 py-2.5 border transition-colors focus:outline-none focus:ring-2 placeholder:text-stone ${
                    errors.password
                      ? 'border-danger/80 focus:border-danger focus:ring-danger-bg'
                      : 'border-pebble focus:border-ember-orange focus:ring-peach-glow/50'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-stone hover:text-charcoal-bark p-1 transition-colors flex items-center justify-center focus-visible:outline-none rounded"
                >
                  {showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-danger flex items-center gap-1 pt-0.5" role="alert">
                  <Icons.AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="group w-full bg-primary hover:bg-sepia text-parchment font-medium py-3 px-5 rounded-xl shadow-md shadow-peach-glow/50 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-orange focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}</span>
                {!submitting && (
                  <Icons.ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-pebble/80"></div>
            <span className="absolute bg-pure-card px-3 text-xs text-bronze uppercase tracking-wider">or</span>
          </div>

          {/* Google OAuth Mock Button */}
          <button
            type="button"
            onClick={async () => {
              setSubmitting(true);
              await login('pramod@example.com', 'demo-google-oauth');
              navigate(from, { replace: true });
            }}
            className="w-full bg-pure-card hover:bg-surface-container-low text-sepia text-sm font-medium py-2.5 px-4 rounded-xl border border-pebble flex items-center justify-center gap-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-orange"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center mt-6 pt-1">
            <p className="text-xs text-charcoal-bark">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="font-medium text-ember-orange hover:text-primary transition-colors ml-1.5 underline underline-offset-2"
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignInPage;
