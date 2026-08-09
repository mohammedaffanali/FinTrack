import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-charcoal-900/30 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${SIZES[size]} bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sage-200/60 max-h-[92vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]`}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-sage-200/40 shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold text-charcoal-800">{title}</h2>
            {subtitle && <p className="text-sm text-charcoal-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-300 hover:text-charcoal-600 hover:bg-sage-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6 flex-1">{children}</div>
        {footer && (
          <div className="p-5 sm:p-6 border-t border-sage-200/40 flex items-center justify-end gap-3 shrink-0 bg-sage-50/40 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
