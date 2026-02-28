export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(numDecks: number): Card[] {
  const deck: Card[] = [];
  const decks = Math.max(1, Math.floor(numDecks) || 1);

  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `${d}-${rank}-${suit}-${deck.length}`,
          rank,
          suit,
        });
      }
    }
  }

  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getCardImagePath(card: Card): string {
  // Images should live in public/cards/<rank>_<suit>.png, e.g. 10_hearts.png
  return `/cards/${card.rank}_${card.suit}.png`;
}

