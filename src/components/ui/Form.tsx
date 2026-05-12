import { type ReactNode, type FormHTMLAttributes } from 'react';

// ── FormField (label + field + error message) ─────────────────────────────────

interface FormFieldProps {
  label?:    string;
  error?:    string;
  hint?:     string;
  required?: boolean;
  children:  ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ── Form (styled wrapper around <form>) ───────────────────────────────────────

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children:   ReactNode;
  title?:     string;
  subtitle?:  string;
  className?: string;
}

export function Form({ children, title, subtitle, className = '', ...rest }: FormProps) {
  return (
    <form className={className} {...rest}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </form>
  );
}

// ── FormSection (visually groups fields inside a form) ────────────────────────

export function FormSection({
  title,
  description,
  children,
  className = '',
}: {
  title?:       string;
  description?: string;
  children:     ReactNode;
  className?:   string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="pb-3 border-b border-slate-800">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── FormRow (puts 2 fields side by side) ──────────────────────────────────────

export function FormRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}

// ── FormDivider ───────────────────────────────────────────────────────────────

export function FormDivider({ label }: { label?: string }) {
  return (
    <div className="relative flex items-center gap-4 py-1">
      <div className="flex-1 h-px bg-slate-800" />
      {label && <span className="text-xs text-slate-600 font-medium shrink-0">{label}</span>}
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

// ── FormCard (wraps a full form in a card panel) ──────────────────────────────

export function FormCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?:    string;
  subtitle?: string;
  children:  ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 pb-5 border-b border-slate-800">
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
