import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/react';
import { Toaster } from 'sonner';
import { store } from './app/store';
import App from './App.tsx';
import AuthInitializer from './components/auth/AuthInitializer.tsx';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!CLERK_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY — add it to your .env file');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <AuthInitializer>
            <App />
          </AuthInitializer>
          <Toaster
            position="top-right"
            richColors={false}
            toastOptions={{
              style: {
                background:   '#0f172a',
                border:       '1px solid #1e293b',
                color:        '#f1f5f9',
                borderRadius: '14px',
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>,
);
