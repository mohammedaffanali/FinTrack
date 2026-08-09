interface LogoProps {
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  variant?: 'default' | 'light' | 'dark';
}

export function Logo({
  size = 36,
  showText = true,
  showTagline = false,
  className = '',
  variant = 'default',
}: LogoProps) {
  const textColor =
    variant === 'light'
      ? 'text-ivory-50'
      : variant === 'dark'
      ? 'text-charcoal-900'
      : 'text-charcoal-800';

  const taglineColor = variant === 'light' ? 'text-sage-200' : 'text-charcoal-500';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display text-xl font-bold tracking-tight leading-none ${textColor}`}>
            FinTrack
          </span>
          {showTagline && (
            <span className={`text-[11px] font-medium tracking-wide ${taglineColor} mt-0.5`}>
              Know where your money goes
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <rect width="64" height="64" rx="18" fill="#F4ECD9" />
      <rect x="1" y="1" width="62" height="62" rx="17" stroke="#E8EDE6" strokeWidth="1.5" />
      
      {/* Subtle organic background curve */}
      <path
        d="M12 48 C 22 42, 34 52, 52 28"
        stroke="#D0DACD"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Primary 'F' stem */}
      <path
        d="M20 18 L20 46"
        stroke="#1E3A2B"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* 'F' top bar */}
      <path
        d="M20 18 L42 18"
        stroke="#1E3A2B"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* 'F' mid bar */}
      <path
        d="M20 30 L36 30"
        stroke="#1E3A2B"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Signature Money Path flowing from bottom of F -> up right */}
      <path
        d="M20 46 C 28 46, 34 38, 40 40 C 45 41.5, 48 35, 52 22"
        stroke="#E97A33"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nodes: Income (Forest), Spending (Apricot), Savings (Bright Sage) */}
      <circle cx="20" cy="46" r="3.5" fill="#1E3A2B" />
      <circle cx="40" cy="40" r="3" fill="#8A9F85" />
      <circle cx="52" cy="22" r="3.5" fill="#E97A33" />
    </svg>
  );
}

