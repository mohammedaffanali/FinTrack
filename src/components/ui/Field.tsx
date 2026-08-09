import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function Field({ label, error, children, required }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-charcoal-600 mb-1.5">
        {label}
        {required && <span className="text-apricot-600 ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

const inputBase =
  'w-full h-11 px-3.5 rounded-xl border border-sage-200/70 bg-cream-50 text-sm text-charcoal-800 placeholder:text-charcoal-300 transition-all focus:outline-none focus:ring-2 focus:ring-forest-500/25 focus:border-forest-500';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} appearance-none bg-no-repeat pr-9 ${props.className ?? ''}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237c766b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.75rem center',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} h-auto py-2.5 min-h-[80px] resize-y ${props.className ?? ''}`} />;
}
