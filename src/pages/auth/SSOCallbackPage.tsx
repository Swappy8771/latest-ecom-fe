import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk, useUser } from '@clerk/react';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { toast } from '../../components/ui/Toast';
import api from '../../services/axios';

export default function SSOCallbackPage() {
  const dispatch          = useAppDispatch();
  const navigate          = useNavigate();
  const clerk             = useClerk();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Step 1: Let Clerk complete the OAuth handshake
  useEffect(() => {
    clerk.handleRedirectCallback({}).catch(() => {
      // handshake already done (e.g. page refreshed) — continue to step 2
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Once Clerk user is available, sync with our backend
  useEffect(() => {
    if (!isLoaded || !user) return;

    let cancelled = false;

    async function syncToBackend() {
      try {
        /*
         * When your backend /api/auth/clerk is ready, replace this block with:
         *
         *   const token  = await user!.getToken()           // Clerk short-lived JWT
         *   const result = await fetch('/api/auth/clerk', {
         *     method: 'POST',
         *     headers: { 'Content-Type': 'application/json' },
         *     body: JSON.stringify({ clerkToken: token }),
         *   }).then(r => r.json())
         *   dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
         */

        // Exchange Clerk token to backend tokens (requires /api/auth/clerk on backend)
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error('Missing Clerk session token');
        const { data } = await api.post('/auth/clerk', { clerkToken });

        if (!cancelled) {
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }),
          );
          toast.success('Signed in!', `Welcome, ${data.user?.name ?? 'User'}`);
          navigate('/', { replace: true });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('OAuth callback error:', err);
        if (!cancelled) {
          toast.error(
            'Sign-in failed',
            'OAuth completed, but backend token exchange failed. Check CLERK_SECRET_KEY/CLERK_JWT_KEY and /api/auth/clerk.',
          );
          navigate('/login', { replace: true });
        }
      }
    }

    syncToBackend();
    return () => { cancelled = true; };
  }, [isLoaded, user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse">
        <span className="text-white font-extrabold text-lg">K</span>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-semibold">Completing sign-in…</p>
        <p className="text-slate-500 text-sm">Setting up your account, just a moment.</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
