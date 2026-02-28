import type { PaceMode } from '../hooks/useGameMode';

interface PaceSelectorProps {
  value: PaceMode;
  onChange(pace: PaceMode): void;
  label?: string;
}

export function PaceSelector({ value, onChange, label = 'Pace' }: PaceSelectorProps) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="segmented-control" aria-label="Pace">
        {(['manual', 'slow', 'normal', 'fast'] as PaceMode[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`segmented-option ${value === p ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p === 'manual' ? 'Manual' : p[0].toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

