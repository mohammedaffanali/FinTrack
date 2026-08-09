import { useEffect, useRef } from 'react';

interface FinancialBackgroundProps {
  variant?: 'landing' | 'dashboard';
  className?: string;
}

export function FinancialBackground({ variant = 'dashboard', className = '' }: FinancialBackgroundProps) {
  const isLanding = variant === 'landing';
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    let animationFrameId: number;

    const updateParallax = () => {
      const { x, y, targetX, targetY } = mouseRef.current;
      mouseRef.current.x += (targetX - x) * 0.05;
      mouseRef.current.y += (targetY - y) * 0.05;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateParallax);
    };

    if (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      window.addEventListener('mousemove', handleMouseMove);
      animationFrameId = requestAnimationFrame(updateParallax);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const opacityClass = isLanding ? 'opacity-35 sm:opacity-45' : 'opacity-10 sm:opacity-15';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* Layer 1 & 2: Soft Ambient Radial Depth */}
      <div
        ref={containerRef}
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          background: isLanding
            ? 'radial-gradient(circle at 50% 25%, rgba(45, 100, 66, 0.07) 0%, rgba(233, 122, 51, 0.03) 45%, transparent 70%)'
            : 'radial-gradient(circle at 65% 15%, rgba(45, 100, 66, 0.04) 0%, rgba(233, 122, 51, 0.02) 50%, transparent 75%)',
        }}
      />

      {/* Layer 3-6: Analytical Grid, Financial Paths, Data Nodes */}
      <svg
        className={`absolute inset-0 w-full h-full ${opacityClass} transition-opacity duration-500`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="financial-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              className="text-charcoal-500/30"
            />
            <circle cx="0" cy="0" r="0.75" className="fill-charcoal-600/50" />
          </pattern>

          <linearGradient id="line-gradient-primary" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2D6442" stopOpacity="0" />
            <stop offset="35%" stopColor="#2D6442" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#2D6442" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#2D6442" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="line-gradient-secondary" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E97A33" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#E97A33" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E97A33" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#financial-grid)" />

        {/* Abstract Financial Graph Paths */}
        <g className="financial-graph-lines">
          {/* Main rising cashflow trend line */}
          <path
            d="M -60 380 Q 180 300, 400 340 T 820 220 T 1280 270 T 1680 170 T 2080 110"
            fill="none"
            stroke="url(#line-gradient-primary)"
            strokeWidth="1.5"
          />

          {/* Secondary analytical trend path */}
          <path
            d="M -60 520 Q 280 440, 600 480 T 1120 390 T 1540 430 T 2080 340"
            fill="none"
            stroke="url(#line-gradient-secondary)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Abstract Candlestick / Chart Bars */}
          <g className="text-charcoal-400/40">
            <rect x="220" y="320" width="7" height="22" rx="1.5" fill="currentColor" opacity="0.3" />
            <line x1="223.5" y1="312" x2="223.5" y2="348" stroke="currentColor" strokeWidth="1" opacity="0.4" />

            <rect x="800" y="200" width="7" height="32" rx="1.5" fill="currentColor" opacity="0.25" />
            <line x1="803.5" y1="192" x2="803.5" y2="238" stroke="currentColor" strokeWidth="1" opacity="0.4" />

            <rect x="1260" y="250" width="7" height="18" rx="1.5" fill="currentColor" opacity="0.3" />
            <line x1="1263.5" y1="242" x2="1263.5" y2="274" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </g>

          {/* Data Nodes •────•──────• */}
          <g className="data-nodes">
            <circle cx="400" cy="340" r="3.5" className="fill-forest-600 animate-pulse" style={{ animationDuration: '4s' }} />
            <circle cx="400" cy="340" r="7" className="fill-forest-600/20 animate-ping" style={{ animationDuration: '7s' }} />

            <circle cx="820" cy="220" r="3" className="fill-forest-600" />
            <circle cx="1280" cy="270" r="3.5" className="fill-apricot-500 animate-pulse" style={{ animationDuration: '5s' }} />
            <circle cx="1680" cy="170" r="4" className="fill-forest-600" />
          </g>
        </g>
      </svg>
    </div>
  );
}
