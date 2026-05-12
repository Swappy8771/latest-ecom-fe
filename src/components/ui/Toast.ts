import { toast as sonner } from 'sonner';

// ── Shared style tokens ───────────────────────────────────────────────────────

const base = {
  style: {
    background:   '#0f172a',
    border:       '1px solid #1e293b',
    color:        '#f1f5f9',
    borderRadius: '14px',
    fontSize:     '14px',
    fontWeight:   '500',
  },
};

const successStyle = {
  style: { ...base.style, borderColor: 'rgba(52,211,153,0.3)', background: '#0a1f14' },
  icon: '✅',
};
const errorStyle = {
  style: { ...base.style, borderColor: 'rgba(248,113,113,0.3)', background: '#1f0a0a' },
  icon: '❌',
};
const warningStyle = {
  style: { ...base.style, borderColor: 'rgba(251,191,36,0.3)', background: '#1a150a' },
  icon: '⚠️',
};
const infoStyle = {
  style: { ...base.style, borderColor: 'rgba(99,102,241,0.3)', background: '#0e0a1f' },
  icon: 'ℹ️',
};
const loadingStyle = {
  style: { ...base.style, borderColor: 'rgba(148,163,184,0.2)' },
};

// ── Toast helpers ─────────────────────────────────────────────────────────────

export const toast = {
  success(message: string, description?: string) {
    return sonner.success(message, { description, ...successStyle });
  },

  error(message: string, description?: string) {
    return sonner.error(message, { description, ...errorStyle });
  },

  warning(message: string, description?: string) {
    return sonner.warning(message, { description, ...warningStyle });
  },

  info(message: string, description?: string) {
    return sonner.info(message, { description, ...infoStyle });
  },

  loading(message: string, description?: string) {
    return sonner.loading(message, { description, ...loadingStyle });
  },

  // Replaces an existing loading toast with a result
  promise<T>(
    promiseFn: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return sonner.promise(promiseFn, {
      loading: messages.loading,
      success: messages.success,
      error:   messages.error,
      ...loadingStyle,
    });
  },

  dismiss(id?: string | number) {
    sonner.dismiss(id);
  },
};
