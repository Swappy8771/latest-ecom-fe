import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignUp } from '@clerk/react/legacy';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FormDivider } from '../../components/ui/Form';
import { toast } from '../../components/ui/Toast';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { useRegisterMutation } from '../../services/authApi';

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name too long'),

  email: z.string().email('Enter a valid email address'),

  role: z.enum(['USER', 'SELLER']),

  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),

  confirmPassword: z.string(),

  agreeTerms: z
    .boolean()
    .refine((v) => v, 'You must accept the terms to continue'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

// ── Password strength indicator ───────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',    pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number',           pass: /[0-9]/.test(password) },
    { label: 'Special character',pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;

  const barColor =
    score <= 1 ? 'bg-red-500' :
    score <= 2 ? 'bg-amber-500' :
    score <= 3 ? 'bg-blue-500' : 'bg-emerald-500';

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : 'bg-slate-700'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(({ label, pass }) => (
          <span key={label} className={`flex items-center gap-1 text-[11px] transition-colors ${pass ? 'text-emerald-400' : 'text-slate-600'}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {pass
                ? <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                : <><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/></>
              }
            </svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── OAuth button ──────────────────────────────────────────────────────────────

interface OAuthButtonProps { provider: 'google' | 'github'; loading: boolean; onClick: () => void }

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

// ── Register Page ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();
  const { signUp, isLoaded: clerkLoaded } = useSignUp();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER', agreeTerms: false },
  });

  const passwordValue = watch('password', '');

  // ── Email / password submit ──
  const onSubmit = async (data: FormValues) => {
    const { confirmPassword, agreeTerms: _a, ...payload } = data;
    void confirmPassword;
    try {
      const result = await registerMutation(payload).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success('Account created!', `Welcome to Klyro, ${result.user.name}!`);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Registration failed';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { message: 'This email is already registered' });
      } else {
        toast.error('Registration failed', msg);
      }
    }
  };

  // ── Clerk OAuth ──
  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!clerkLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch {
      toast.error('OAuth failed', 'Could not connect to provider. Try again.');
    }
  };

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Join Klyro and start shopping smarter today."
      panelTitle="Everything you need, in one place"
      panelSub="Create a free account in seconds and unlock access to thousands of products, exclusive deals, and a seamless checkout experience."
    >
      {/* OAuth buttons */}
      <div className="flex gap-3 mb-6">
        <OAuthButton provider="google" loading={!clerkLoaded} onClick={() => handleOAuth('oauth_google')} />
        <OAuthButton provider="github" loading={!clerkLoaded} onClick={() => handleOAuth('oauth_github')} />
      </div>

      <FormDivider label="or sign up with email" />

      {/* Register form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">

        {/* Full name */}
        <Input
          label="Full name"
          type="text"
          placeholder="Priya Sharma"
          required
          error={errors.name?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          }
          {...register('name')}
        />

        {/* Email */}
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

        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Account type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'USER',   label: 'Shopper',  icon: '🛍️', desc: 'Browse & buy' },
              { value: 'SELLER', label: 'Seller',   icon: '🏪', desc: 'List & sell' },
            ] as const).map(({ value, label, icon, desc }) => (
              <label
                key={value}
                className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                  watch('role') === value
                    ? 'bg-violet-600/15 border-violet-500/50 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-[11px] text-slate-500">{desc}</span>
                {watch('role') === value && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
          {errors.role && <p className="mt-1.5 text-xs text-red-400">{errors.role.message}</p>}
        </div>

        {/* Password */}
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            required
            error={errors.password?.message}
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
            {...register('password')}
          />
          <PasswordStrength password={passwordValue} />
        </div>

        {/* Confirm password */}
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          required
          error={errors.confirmPassword?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          }
          {...register('confirmPassword')}
        />

        {/* Terms checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register('agreeTerms')}
              />
              <div className="w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border border-slate-600 bg-slate-800 peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <span className="text-sm text-slate-400 leading-snug">
              I agree to Klyro's{' '}
              <Link to="/terms" className="text-violet-400 hover:text-violet-300">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={registerLoading}
          className="mt-2"
          rightIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          }
        >
          Create Account
        </Button>
      </form>

      {/* Login link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Sign in →
        </Link>
      </p>
    </AuthLayout>
  );
}
