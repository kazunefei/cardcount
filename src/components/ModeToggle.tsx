import type { GameMode } from '../hooks/useGameMode';

interface ModeToggleProps {
  mode: GameMode;
  onChange(mode: GameMode): void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="segmented-control" aria-label="Mode">
      <button
        type="button"
        className={`segmented-option ${mode === 'counting' ? 'active' : ''}`}
        onClick={() => onChange('counting')}
      >
        Counting Practice
      </button>
      <button
        type="button"
        className={`segmented-option ${mode === 'blackjack' ? 'active' : ''}`}
        onClick={() => onChange('blackjack')}
      >
        Blackjack Play
      </button>
    </div>
  );
}

