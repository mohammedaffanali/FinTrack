import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-cream-100/90 rounded-2xl border border-charcoal-100 shadow-[0_2px_8px_rgba(28,26,21,0.03)] ${
        hover
          ? 'transition-all duration-300 hover:shadow-[0_8px_24px_rgba(28,26,21,0.06)] hover:-translate-y-0.5 hover:border-sage-300/80 cursor-pointer'
          : ''
      } ${onClick && !hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

