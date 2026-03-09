import type { Hand } from '../hooks/useBlackjackGame';
import { PlayingCard } from './PlayingCard';

interface BlackjackTableProps {
  playerHands: Hand[];
  dealerHand: Hand | null;
  activeHandIndex: number;
  phase: string;
  isShuffling: boolean;
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
  isShuffling,
  onHit,
  onStand,
  onDouble,
  onSplit,
  canAct,
  lastOutcomeText,
}: BlackjackTableProps) {
  const isBetweenHands = phase === 'betweenHands';
  const DEAL_STAGGER_MS = 1000;

  function dealStyle(index: number, offset = 0) {
    return {
      animationDelay: `${(index + offset) * DEAL_STAGGER_MS}ms`,
    };
  }

  return (
    <div className="card-table">
      {isShuffling && (
        <div className="table-banner">
          <div className="table-banner-inner">
            <span className="table-banner-dot">♠</span>
            <span>Shuffling</span>
            <span className="table-banner-dot">♣</span>
          </div>
        </div>
      )}
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
              <div className="deal-card" style={dealStyle(0)}>
                <PlayingCard card={dealerHand.cards[0]} />
              </div>
              <div className="deal-card" style={dealStyle(1)}>
                <div className="card-back" aria-hidden="true" />
              </div>
            </>
          )}
          {dealerHand && phase !== 'player' &&
            dealerHand.cards.map((c, index) => (
              <div key={c.id} className="deal-card" style={dealStyle(index)}>
                <PlayingCard card={c} />
              </div>
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
                {hand.cards.map((c, cardIndex) => (
                  <div
                    key={c.id}
                    className="deal-card"
                    style={dealStyle(cardIndex, dealerHand?.cards.length ?? 0)}
                  >
                    <PlayingCard card={c} />
                  </div>
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

