import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignIn } from '@clerk/react/legacy';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FormDivider } from '../../components/ui/Form';
import { toast } from '../../components/ui/Toast';
import OAuthButton from '../../components/auth/OAuthButton';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation } from '../../services/authApi';

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

// ── Login Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const { signIn, isLoaded: clerkLoaded } = useSignIn();

  const from     = (location.state as { from?: string })?.from ?? '/';
  const verified = (location.state as { verified?: boolean })?.verified;

  // Show verification success message once
  useEffect(() => {
    if (verified) toast.success('Email verified!', 'Your account is ready. Sign in to continue.');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // ── Email / password submit ──
  const onSubmit = async (data: FormValues) => {
    try {
      const result = await loginMutation(data).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken }));
      toast.success('Welcome back!', result.user.name);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Invalid email or password';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { message: msg });
      } else if (msg.toLowerCase().includes('password')) {
        setError('password', { message: msg });
      } else {
        toast.error('Login failed', msg);
      }
    }
  };

  // ── Clerk OAuth ──
  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!clerkLoaded) return;
    try {
      const origin = window.location.origin;
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${origin}/sso-callback`,
        redirectUrlComplete: `${origin}${from.startsWith('/') ? from : `/${from}`}`,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Clerk OAuth error:', err);
      const msg =
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage ||
        (err as Error)?.message ||
        'Could not connect to provider. Try again.';
      toast.error('OAuth failed', msg);
    }
  };

  const oauthLoading = !clerkLoaded;

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your Klyro account to continue shopping."
    >
      {/* OAuth buttons */}
      <div className="flex gap-3 mb-6">
        <OAuthButton provider="google" loading={oauthLoading} onClick={() => handleOAuth('oauth_google')} />
        <OAuthButton provider="github" loading={oauthLoading} onClick={() => handleOAuth('oauth_github')} />
      </div>

      <FormDivider label="or continue with email" />

      {/* Email / password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          }
          {...register('email')}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-300">
              Password <span className="text-red-400">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            required
            error={errors.password?.message}
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loginLoading}
          className="mt-2"
          rightIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          }
        >
          Sign In
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Create one free →
        </Link>
      </p>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-slate-600 leading-relaxed">
        By signing in you agree to our{' '}
        <Link to="/terms" className="text-slate-500 hover:text-slate-400 underline">Terms</Link>
        {' '}and{' '}
        <Link to="/privacy" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
