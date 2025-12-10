'use client';

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = 'var(--accent)',
  fillColor,
  strokeWidth = 1.5,
  showDots = false,
  className,
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '', points: [] };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * innerWidth,
      y: padding + innerHeight - ((value - min) / range) * innerHeight,
    }));

    // Create smooth bezier curve
    let line = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;

      line += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }

    // Create area fill path
    const area = `${line} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { line, area, points };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className={className}>
        <line
          x1={4}
          y1={height / 2}
          x2={width - 4}
          y2={height / 2}
          stroke="var(--border-secondary)"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      </svg>
    );
  }

  const trend = data[data.length - 1] - data[0];
  const trendColor = trend >= 0 ? 'var(--success)' : 'var(--danger)';
  const finalColor = color === 'auto' ? trendColor : color;
  const finalFillColor = fillColor || `${finalColor}15`;

  return (
    <svg width={width} height={height} className={className}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${width}-${height}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={finalColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={finalColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={pathData.area}
        fill={`url(#sparkline-gradient-${width}-${height})`}
      />

      {/* Line */}
      <path
        d={pathData.line}
        fill="none"
        stroke={finalColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {showDots && pathData.points.length > 0 && (
        <circle
          cx={pathData.points[pathData.points.length - 1].x}
          cy={pathData.points[pathData.points.length - 1].y}
          r={3}
          fill={finalColor}
        />
      )}
    </svg>
  );
}

// Mini trend indicator
interface TrendBadgeProps {
  value: number;
  previousValue: number;
  format?: (n: number) => string;
  size?: 'sm' | 'md';
}

export function TrendBadge({
  value,
  previousValue,
  format = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`,
  size = 'sm',
}: TrendBadgeProps) {
  const change = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;
  const isNeutral = Math.abs(change) < 0.1;

  const sizeStyles = {
    sm: { fontSize: '11px', padding: '2px 6px', gap: '4px' },
    md: { fontSize: '13px', padding: '4px 10px', gap: '6px' },
  };

  const style = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: style.gap,
        padding: style.padding,
        fontSize: style.fontSize,
        fontWeight: 500,
        borderRadius: '4px',
        backgroundColor: isNeutral
          ? 'var(--bg-tertiary)'
          : isPositive
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
        color: isNeutral
          ? 'var(--text-tertiary)'
          : isPositive
            ? '#10B981'
            : '#EF4444',
      }}
    >
      {!isNeutral && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d={isPositive ? 'M5 2L8 6H2L5 2Z' : 'M5 8L2 4H8L5 8Z'}
            fill="currentColor"
          />
        </svg>
      )}
      {format(change)}
    </span>
  );
}
