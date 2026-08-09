interface MoneyPathProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  animate?: boolean;
  variant?: 'full' | 'hero' | 'compact' | 'minimal';
  incomeValue?: string;
  spendingValue?: string;
  savingsValue?: string;
}

/**
 * The signature "Money Path" — a flowing organic line representing:
 * Income → Spending → Savings
 * Used across the landing page, dashboard hero banner, and empty states.
 */
export function MoneyPath({
  className = '',
  width = '100%',
  height = 120,
  animate = true,
  variant = 'full',
  incomeValue,
  spendingValue,
  savingsValue,
}: MoneyPathProps) {
  const animClass = animate ? 'money-path-stroke' : '';

  if (variant === 'minimal') {
    return (
      <svg
        width={width}
        height={36}
        viewBox="0 0 300 36"
        fill="none"
        className={className}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mp-min-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E3A2B" />
            <stop offset="50%" stopColor="#E97A33" />
            <stop offset="100%" stopColor="#2D6442" />
          </linearGradient>
        </defs>
        <path
          d="M10 26 C 60 8, 110 30, 160 16 C 210 6, 250 24, 290 10"
          stroke="url(#mp-min-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className={animClass}
        />
        <circle cx="10" cy="26" r="3.5" fill="#1E3A2B" />
        <circle cx="160" cy="16" r="3.5" fill="#E97A33" />
        <circle cx="290" cy="10" r="3.5" fill="#2D6442" />
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 600 100"
        fill="none"
        className={className}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mp-compact-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E3A2B" />
            <stop offset="45%" stopColor="#E97A33" />
            <stop offset="100%" stopColor="#2D6442" />
          </linearGradient>
        </defs>
        <path
          d="M20 75 C 90 25, 160 85, 230 45 C 300 15, 380 70, 450 35 C 500 15, 540 55, 580 25"
          stroke="#E8EDE6"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 75 C 90 25, 160 85, 230 45 C 300 15, 380 70, 450 35 C 500 15, 540 55, 580 25"
          stroke="url(#mp-compact-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          className={animClass}
        />
        <circle cx="20" cy="75" r="5" fill="#1E3A2B" />
        <circle cx="230" cy="45" r="5" fill="#E97A33" />
        <circle cx="450" cy="35" r="5" fill="#8A9F85" />
        <circle cx="580" cy="25" r="5.5" fill="#2D6442" />
      </svg>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl bg-cream-100/90 border border-charcoal-100 p-6 sm:p-8">
        <svg
          width="100%"
          height={160}
          viewBox="0 0 800 160"
          fill="none"
          className={className}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="mp-hero-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E3A2B" />
              <stop offset="45%" stopColor="#E97A33" />
              <stop offset="100%" stopColor="#2D6442" />
            </linearGradient>
            <linearGradient id="mp-hero-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8A9F85" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F4ECD9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill under path */}
          <path
            d="M40 120 C 120 40, 220 130, 320 60 C 420 10, 520 110, 620 50 C 690 15, 730 80, 760 35 L 760 150 L 40 150 Z"
            fill="url(#mp-hero-area)"
          />

          {/* Soft background track */}
          <path
            d="M40 120 C 120 40, 220 130, 320 60 C 420 10, 520 110, 620 50 C 690 15, 730 80, 760 35"
            stroke="#E8EDE6"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Animated main flow line */}
          <path
            d="M40 120 C 120 40, 220 130, 320 60 C 420 10, 520 110, 620 50 C 690 15, 730 80, 760 35"
            stroke="url(#mp-hero-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className={animClass}
          />

          {/* Node 1: Income */}
          <circle cx="40" cy="120" r="9" fill="#1E3A2B" />
          <circle cx="40" cy="120" r="4" fill="#FAF5EC" />

          {/* Node 2: Spending */}
          <circle cx="320" cy="60" r="8" fill="#E97A33" />
          <circle cx="320" cy="60" r="3.5" fill="#FAF5EC" />

          {/* Node 3: Savings */}
          <circle cx="760" cy="35" r="9" fill="#2D6442" />
          <circle cx="760" cy="35" r="4" fill="#FAF5EC" />
        </svg>

        {/* Floating node metadata cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-charcoal-100/80">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase truncate">
              Income Path
            </span>
            <span className="font-display text-xs sm:text-base lg:text-lg font-bold text-forest-800 tabular-nums truncate min-w-0" title={incomeValue}>
              {incomeValue || '$5,400.00'}
            </span>
          </div>
          <div className="flex flex-col items-center text-center min-w-0">
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase truncate">
              Spending Flow
            </span>
            <span className="font-display text-xs sm:text-base lg:text-lg font-bold text-apricot-600 tabular-nums truncate min-w-0" title={spendingValue}>
              {spendingValue || '$2,840.50'}
            </span>
          </div>
          <div className="flex flex-col items-end text-right min-w-0">
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase truncate">
              Saved & Invested
            </span>
            <span className="font-display text-xs sm:text-base lg:text-lg font-bold text-forest-700 tabular-nums truncate min-w-0" title={savingsValue}>
              {savingsValue || '$2,559.50'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full default variant
  return (
    <div className={`w-full ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 800 120"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="mp-grad-full" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E3A2B" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#E97A33" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2D6442" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Background path shadow */}
        <path
          d="M30 95 C 110 35, 200 105, 280 55 C 360 15, 450 90, 530 45 C 610 10, 680 75, 770 30"
          stroke="#E8EDE6"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main flowing path */}
        <path
          d="M30 95 C 110 35, 200 105, 280 55 C 360 15, 450 90, 530 45 C 610 10, 680 75, 770 30"
          stroke="url(#mp-grad-full)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          className={animClass}
        />

        {/* Nodes */}
        <circle cx="30" cy="95" r="7" fill="#1E3A2B" />
        <circle cx="30" cy="95" r="3" fill="#FAF5EC" />
        
        <circle cx="280" cy="55" r="6" fill="#E97A33" />
        <circle cx="530" cy="45" r="6" fill="#8A9F85" />

        <circle cx="770" cy="30" r="7" fill="#2D6442" />
        <circle cx="770" cy="30" r="3" fill="#FAF5EC" />

        {/* Node Labels */}
        <text
          x="30"
          y="116"
          textAnchor="middle"
          fill="#5A554B"
          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          INCOME
        </text>
        <text
          x="405"
          y="116"
          textAnchor="middle"
          fill="#5A554B"
          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          SPENDING FLOW
        </text>
        <text
          x="770"
          y="116"
          textAnchor="middle"
          fill="#5A554B"
          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          SAVINGS
        </text>
      </svg>
    </div>
  );
}

