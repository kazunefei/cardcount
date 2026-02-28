interface BetControlsProps {
  currentBet: number;
  onChangeBet(value: number): void;
  onStartHand(): void;
  onNextHand(): void;
  phase: string;
  pace: string;
}

export function BetControls({
  currentBet,
  onChangeBet,
  onStartHand,
  onNextHand,
  phase,
  pace,
}: BetControlsProps) {
  const isBetting = phase === 'betting';
  const isBetweenHands = phase === 'betweenHands';
  const isManualPace = pace === 'manual';
  const dealButtonEnabled = isBetting || (isBetweenHands && isManualPace);
  const dealButtonAction = isBetting ? onStartHand : onNextHand;

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
            disabled={!isBetting}
          />
          <button
            type="button"
            className="btn secondary"
            onClick={() => adjust(1)}
            disabled={!isBetting}
          >
            +1
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => adjust(5)}
            disabled={!isBetting}
          >
            +5
          </button>
        </div>
        <button
          type="button"
          className="btn"
          onClick={dealButtonAction}
          disabled={!dealButtonEnabled}
          title={
            isBetweenHands && !isManualPace
              ? 'Next hand starts automatically'
              : undefined
          }
        >
          Deal Hand
        </button>
      </div>
    </div>
  );
}

