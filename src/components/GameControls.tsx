interface GameControlsProps {
  status: 'idle' | 'running' | 'finished';
  onStart(): void;
  onReset(): void;
  onDealNext(): void;
  manualMode: boolean;
  cardsRemaining: number;
  showCardsRemaining?: boolean;
}

export function GameControls({
  status,
  onStart,
  onReset,
  onDealNext,
  manualMode,
  cardsRemaining,
  showCardsRemaining = true,
}: GameControlsProps) {
  const canStart = status === 'idle' || status === 'finished';

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Controls</h2>
        <span className="muted">Counting practice</span>
      </div>
      <div className="table-row">
        <div className="compact-row">
          <button
            type="button"
            className="btn"
            onClick={onStart}
            disabled={!canStart}
          >
            {status === 'finished' ? 'Restart' : 'Start'}
          </button>
          {manualMode && (
            <button
              type="button"
              className="btn secondary"
              onClick={onDealNext}
              disabled={status !== 'running'}
            >
              Deal Next
            </button>
          )}
          <button
            type="button"
            className="btn secondary"
            onClick={onReset}
          >
            Reset Shoe
          </button>
        </div>
        {showCardsRemaining && (
          <div className="muted">Cards remaining: {cardsRemaining}</div>
        )}
      </div>
    </div>
  );
}

