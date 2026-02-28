import type { Card } from '../lib/deck';
import { PlayingCard } from './PlayingCard';

interface CardViewProps {
  card: Card | null;
  statusText?: string | null;
}

export function CardView({ card, statusText }: CardViewProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Current Card</h2>
      </div>
      <div className="table-row">
        <div className="card-row">
          {card ? (
            <PlayingCard card={card} />
          ) : (
            <div className="card-slot">
              <span>No card dealt</span>
            </div>
          )}
        </div>
        {statusText ? <div className="status-text">{statusText}</div> : null}
      </div>
    </div>
  );
}


