import type { Card } from '../lib/deck';

interface PlayingCardProps {
  card: Card;
}

function getSuitSymbol(suit: Card['suit']): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return '?';
  }
}

export function PlayingCard({ card }: PlayingCardProps) {
  const suitSymbol = getSuitSymbol(card.suit);
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`playing-card ${isRed ? 'red' : 'black'}`}>
      <div className="playing-card-corner playing-card-corner-top">
        <span className="playing-card-rank">{card.rank}</span>
        <span className="playing-card-suit">{suitSymbol}</span>
      </div>
      <div className="playing-card-center">
        <span className="playing-card-suit-large">{suitSymbol}</span>
      </div>
      <div className="playing-card-corner playing-card-corner-bottom">
        <span className="playing-card-rank">{card.rank}</span>
        <span className="playing-card-suit">{suitSymbol}</span>
      </div>
    </div>
  );
}

