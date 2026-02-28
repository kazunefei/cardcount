import type { Hand } from '../hooks/useBlackjackGame';
import { PlayingCard } from './PlayingCard';

interface BlackjackTableProps {
  playerHands: Hand[];
  dealerHand: Hand | null;
  activeHandIndex: number;
  phase: string;
  onHit(): void;
  onStand(): void;
  onDouble(): void;
  onSplit(): void;
  canAct: boolean;
  lastOutcomeText: string | null;
}

export function BlackjackTable({
  playerHands,
  dealerHand,
  activeHandIndex,
  phase,
  onHit,
  onStand,
  onDouble,
  onSplit,
  canAct,
  lastOutcomeText,
}: BlackjackTableProps) {
  const isBetweenHands = phase === 'betweenHands';

  return (
    <div className="card-table">
      <div className="table-row-header">
        <h2>Blackjack Table</h2>
        <span className="muted">
          {phase === 'betting'
            ? 'Place your bet'
            : phase === 'player'
            ? 'Your turn'
            : phase === 'dealer'
            ? 'Dealer drawing'
            : phase === 'resolution' || phase === 'betweenHands'
            ? 'Hand result'
            : ''}
        </span>
      </div>

      <div className="table-row">
        <div className="stat-label">Dealer</div>
        <div className="card-row">
          {!dealerHand && <div className="card-slot">Waiting for deal</div>}
          {dealerHand && phase === 'player' && (
            <>
              <PlayingCard card={dealerHand.cards[0]} />
              <div className="card-back" aria-hidden="true" />
            </>
          )}
          {dealerHand && phase !== 'player' &&
            dealerHand.cards.map((c) => (
              <PlayingCard key={c.id} card={c} />
            ))}
        </div>
      </div>

      <div className="table-row">
        <div className="stat-label">Player</div>
        <div className="card-row">
          {playerHands.length === 0 && <div className="card-slot">No hand yet</div>}
          {playerHands.map((hand, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="status-text">
                Hand {index + 1} {index === activeHandIndex ? '(active)' : ''}
              </div>
              <div className="card-row">
                {hand.cards.map((c) => (
                  <PlayingCard key={c.id} card={c} />
                ))}
              </div>
              <div className="muted">Bet: {hand.bet}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-row">
        <div className="table-actions">
          {!isBetweenHands && phase === 'player' && (
            <>
              <button
                type="button"
                className="btn"
                onClick={onHit}
                disabled={!canAct}
              >
                Hit
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={onStand}
                disabled={!canAct}
              >
                Stand
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={onDouble}
                disabled={!canAct}
              >
                Double
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={onSplit}
                disabled={!canAct}
              >
                Split
              </button>
            </>
          )}
        </div>
        {lastOutcomeText && (
          <div className="status-text">
            {lastOutcomeText}
          </div>
        )}
      </div>
    </div>
  );
}

