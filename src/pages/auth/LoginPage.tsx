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
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation } from '../../services/authApi';

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

// ── OAuth button ──────────────────────────────────────────────────────────────

interface OAuthButtonProps {
  provider: 'google' | 'github';
  loading:  boolean;
  onClick:  () => void;
}

function OAuthButton({ provider, loading, onClick }: OAuthButtonProps) {
  const isGoogle = provider === 'google';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
    >
      {isGoogle ? (
        <svg width="17" height="17" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      )}
      {isGoogle ? 'Google' : 'GitHub'}
    </button>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const { signIn, isLoaded: clerkLoaded } = useSignIn();

  const from = (location.state as { from?: string })?.from ?? '/';

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
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
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
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: from,
      });
    } catch {
      toast.error('OAuth failed', 'Could not connect to provider. Try again.');
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
