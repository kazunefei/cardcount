interface BetControlsProps {
  currentBet: number;
  onChangeBet(value: number): void;
  onStartHand(): void;
  disabled?: boolean;
}

export function BetControls({ currentBet, onChangeBet, onStartHand, disabled }: BetControlsProps) {
  function adjust(delta: number) {
    const next = Math.max(1, currentBet + delta);
    onChangeBet(next);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Bet</h2>
      </div>
      <div className="table-row">
        <div className="compact-row">
          <div className="field-label">Units</div>
          <input
            type="number"
            className="number-input"
            value={currentBet}
            min={1}
            onChange={(e) => onChangeBet(Math.max(1, Number(e.target.value) || 1))}
            disabled={disabled}
          />
          <button
            type="button"
            className="btn secondary"
            onClick={() => adjust(1)}
            disabled={disabled}
          >
            +1
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => adjust(5)}
            disabled={disabled}
          >
            +5
          </button>
        </div>
        <button
          type="button"
          className="btn"
          onClick={onStartHand}
          disabled={disabled}
        >
          Deal Hand
        </button>
      </div>
    </div>
  );
}

