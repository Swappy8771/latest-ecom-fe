import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';

// ── Shared label / error wrappers ─────────────────────────────────────────────

function Label({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {message}
    </p>
  );
}

function HintMsg({ message }: { message: string }) {
  return <p className="mt-1.5 text-xs text-slate-500">{message}</p>;
}

// ── Eye icon for password toggle ──────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ── Base input class builder ──────────────────────────────────────────────────

function buildInputClass(hasError: boolean, hasLeft: boolean, hasRight: boolean) {
  return [
    'w-full bg-slate-800/70 border rounded-xl text-white text-sm placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    hasError
      ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20',
    hasLeft  ? 'pl-10' : 'px-4',
    hasRight ? 'pr-10' : 'px-4',
    'py-3',
  ].join(' ');
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, type = 'text', id, required, className = '', ...rest }, ref) => {
    const [showPwd, setShowPwd] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPwd ? 'text' : 'password') : type;
    const hasLeft  = !!leftIcon;
    const hasRight = !!rightIcon || isPassword;
    const inputId  = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={className}>
        {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            className={buildInputClass(!!error, hasLeft, hasRight)}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              <EyeIcon open={showPwd} />
            </button>
          )}

          {!isPassword && rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <ErrorMsg message={error} />}
        {!error && hint && <HintMsg message={hint} />}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
  rows?:   number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, required, rows = 4, className = '', ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={className}>
        {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          required={required}
          className={[
            'w-full bg-slate-800/70 border rounded-xl text-white text-sm placeholder:text-slate-500 px-4 py-3 resize-none',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20',
          ].join(' ')}
          {...rest}
        />
        {error && <ErrorMsg message={error} />}
        {!error && hint && <HintMsg message={hint} />}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectOption { value: string; label: string }

interface SelectProps {
  label?:    string;
  error?:    string;
  hint?:     string;
  options:   SelectOption[];
  id?:       string;
  required?: boolean;
  disabled?: boolean;
  value?:    string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ label, error, hint, options, id, required, disabled, value, onChange, placeholder, className = '' }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <div className="relative">
        <select
          id={inputId}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={[
            'w-full appearance-none bg-slate-800/70 border rounded-xl text-sm px-4 py-3 pr-10',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20 text-white'
              : 'border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 text-white',
          ].join(' ')}
        >
          {placeholder && <option value="" className="bg-slate-900">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {error && <ErrorMsg message={error} />}
      {!error && hint && <HintMsg message={hint} />}
    </div>
  );
}

export default Input;
