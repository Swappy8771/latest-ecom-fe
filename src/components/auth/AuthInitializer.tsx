import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { finishInitializing, clearInvalidToken } from '../../features/auth/authSlice';
import { useGetMeQuery } from '../../services/authApi';

/**
 * Runs once on startup: if there's an accessToken in localStorage,
 * validates it via GET /auth/me and rehydrates the user in Redux.
 * If the token is expired/invalid, clears it so the user must re-login.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch       = useAppDispatch();
  const isInitializing = useAppSelector((s) => s.auth.isInitializing);
  const accessToken    = useAppSelector((s) => s.auth.accessToken);

  // Only call /auth/me when there's a stored token to validate
  const { data, isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !accessToken || !isInitializing,
  });

  useEffect(() => {
    if (!isInitializing) return;

    if (isSuccess && data?.user) {
      dispatch(finishInitializing(data.user));
    } else if (isError) {
      dispatch(clearInvalidToken());
    }
  }, [isSuccess, isError, data, isInitializing, dispatch]);

  // Show a minimal loader while the token is being validated
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white animate-pulse">
            K
          </div>
          <div className="flex gap-1.5">
            {[0, 150, 300].map((d) => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
