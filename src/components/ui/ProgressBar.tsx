interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  trackColor?: string;
  height?: string;
}

export function ProgressBar({
  value,
  color = '#2D6442',
  trackColor = '#E8EDE6',
  height = 'h-2.5',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // Map generic default colors to warm brand palette
  let activeColor = color;
  if (color === '#10b981' || color === '#059669' || color === 'bg-emerald-600') activeColor = '#2D6442';
  if (color === '#ef4444' || color === '#f59e0b') activeColor = '#E97A33';

  return (
    <div
      className={`w-full ${height} rounded-full overflow-hidden`}
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out shadow-inner"
        style={{ width: `${clamped}%`, backgroundColor: activeColor }}
      />
    </div>
  );
}

