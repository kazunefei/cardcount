import { useEffect, useState } from 'react';
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
  const PLAYER_EXTRA_CARD_DELAY_MS = 120;
  const [dealSeq, setDealSeq] = useState(0);

  useEffect(() => {
    // Bump whenever a new hand is dealt (betting -> player).
    if (phase === 'player') setDealSeq((prev) => prev + 1);
  }, [phase]);

  function dealStyle(index: number, offset = 0) {
    return {
      animationDelay: `${(index + offset) * DEAL_STAGGER_MS}ms`,
    };
  }

  function playerDealStyle(isSplitHand: boolean, cardIndex: number, offset = 0) {
    // Initial hand (first 2 cards) can be staggered; hits/doubles should feel immediate.
    // For split hands, the "new" second card should also feel immediate.
    if (isSplitHand && cardIndex === 1) {
      return { animationDelay: `${PLAYER_EXTRA_CARD_DELAY_MS}ms` };
    }
    if (cardIndex >= 2) {
      return { animationDelay: `${PLAYER_EXTRA_CARD_DELAY_MS}ms` };
    }
    return dealStyle(cardIndex, offset);
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
          {dealerHand && (
            <>
              {/* Keep the upcard mounted so it doesn't re-animate on player actions/phase changes */}
              <div key={`dealer-up-${dealSeq}`} className="deal-card" style={dealStyle(0)}>
                <PlayingCard card={dealerHand.cards[0]} />
              </div>

              {/* Hole card: show back during player phase, then reveal with a fresh mount to animate */}
              <div
                key={`dealer-hole-${dealSeq}-${phase === 'player' ? 'back' : 'face'}`}
                className="deal-card"
                style={dealStyle(1)}
              >
                {phase === 'player' ? (
                  <div className="card-back" aria-hidden="true" />
                ) : (
                  <PlayingCard card={dealerHand.cards[1]} />
                )}
              </div>

              {phase !== 'player' &&
                dealerHand.cards.slice(2).map((c, index) => (
                  <div key={c.id} className="deal-card" style={dealStyle(index + 2)}>
                    <PlayingCard card={c} />
                  </div>
                ))}
            </>
          )}
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
                    className={`deal-card ${
                      hand.isSplitHand && cardIndex === 0
                        ? 'no-anim'
                        : phase !== 'player'
                          ? hand.isDoubled && cardIndex === hand.cards.length - 1
                            ? ''
                            : 'no-anim'
                        : hand.cards.length > 2 && cardIndex < 2
                          ? 'no-anim'
                          : ''
                    }`}
                    style={playerDealStyle(hand.isSplitHand, cardIndex, dealerHand?.cards.length ?? 0)}
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

