'use client';

import { useMemo } from 'react';

interface Props {
  values: number[];
  height?: number;
  className?: string;
  /** Tick labels paired 1:1 with values; rendered as <title> for hover tooltips. */
  labels?: string[];
}

const VIEWBOX_WIDTH = 600;

export function Sparkline({ values, height = 80, className = '', labels }: Props) {
  const { line, area, points } = useMemo(() => {
    if (values.length < 2) {
      return { line: '', area: '', points: [] as { x: number; y: number; v: number }[] };
    }
    const max = Math.max(...values, 1);
    const dx = VIEWBOX_WIDTH / (values.length - 1);
    const points = values.map((v, i) => ({
      x: i * dx,
      y: height - (v / max) * (height - 4) - 2,
      v,
    }));
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const area = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
    return { line, area, points };
  }, [values, height]);

  if (values.length < 2) {
    return (
      <p className="text-xs text-ink-400">Not enough data points to draw a chart yet.</p>
    );
  }

  return (
    <svg
      role="img"
      aria-label="Inquiries over the last period"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
    >
      <path d={area} fill="var(--color-brand-100)" stroke="none" />
      <path d={line} fill="none" stroke="var(--color-brand-600)" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={2.5} fill="var(--color-brand-600)" />
          {labels?.[i] && <title>{`${labels[i]}: ${p.v}`}</title>}
        </g>
      ))}
    </svg>
  );
}
