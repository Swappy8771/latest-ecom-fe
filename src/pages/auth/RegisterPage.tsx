import { useEffect, useRef, useState } from 'react';
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
import OAuthButton from '../../components/auth/OAuthButton';
import { useAppSelector } from '../../app/hooks';
import { useRegisterMutation, useVerifyOtpMutation } from '../../services/authApi';

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
    { label: '8+ characters',     pass: password.length >= 8 },
    { label: 'Uppercase letter',  pass: /[A-Z]/.test(password) },
    { label: 'Number',            pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
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

// ── OTP step ──────────────────────────────────────────────────────────────────

interface OtpStepProps {
  email: string;
  devOtp?: string;
  onVerified: () => void;
  onBack: () => void;
}

function OtpStep({ email, devOtp, onVerified, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = otp.join('');

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const submit = async () => {
    if (code.length < 6) return;
    try {
      await verifyOtp({ email, otp: code }).unwrap();
      toast.success('Email verified!', 'Your account is ready. Please sign in.');
      onVerified();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Invalid or expired OTP';
      toast.error('Verification failed', msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-slate-400 text-sm">
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-slate-600 text-xs">Check your inbox. The code expires in 10 minutes.</p>
        {devOtp && (
          <p className="text-amber-400 text-xs font-mono bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 mt-2">
            Dev OTP: {devOtp}
          </p>
        )}
      </div>

      {/* OTP input boxes */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-11 h-12 text-center text-lg font-bold rounded-xl border bg-slate-800/60 text-white transition-all duration-150 outline-none
              border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ))}
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={code.length < 6}
        onClick={submit}
      >
        Verify & Continue
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-slate-500 hover:text-slate-400 transition-colors"
      >
        ← Back to registration
      </button>
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate        = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();
  const { signUp, isLoaded: clerkLoaded } = useSignUp();

  // OTP step state
  const [otpEmail,  setOtpEmail]  = useState<string | null>(null);
  const [devOtp,    setDevOtp]    = useState<string | undefined>();

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

  // ── Step 1: register ──
  const onSubmit = async (data: FormValues) => {
    const { confirmPassword, agreeTerms: _a, ...payload } = data;
    void confirmPassword;
    try {
      const result = await registerMutation(payload).unwrap();
      setDevOtp(result.devOtp);
      setOtpEmail(data.email);
      toast.info('Check your email', result.message);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Registration failed';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { message: 'This email is already registered' });
      } else {
        toast.error('Registration failed', msg);
      }
    }
  };

  // ── Step 2: after OTP verified ──
  const onVerified = () => {
    navigate('/login', { replace: true, state: { verified: true } });
  };

  // ── Clerk OAuth ──
  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!clerkLoaded) return;
    try {
      const origin = window.location.origin;
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${origin}/sso-callback`,
        redirectUrlComplete: `${origin}/`,
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

  // ── OTP step ──
  if (otpEmail) {
    return (
      <AuthLayout
        heading="Verify your email"
        subheading="Enter the 6-digit code we sent to your inbox."
      >
        <OtpStep
          email={otpEmail}
          devOtp={devOtp}
          onVerified={onVerified}
          onBack={() => setOtpEmail(null)}
        />
      </AuthLayout>
    );
  }

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
