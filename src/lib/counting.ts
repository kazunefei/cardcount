import type { Card } from './deck';

export function hiLoValue(card: Card): number {
  const r = card.rank;
  const n = Number(r);
  if (Number.isFinite(n) && n >= 2 && n <= 6) return 1;
  if (Number.isFinite(n) && n >= 7 && n <= 9) return 0;
  if (r === '2' || r === '3' || r === '4' || r === '5' || r === '6') return 1;
  if (r === '7' || r === '8' || r === '9') return 0;
  return -1; // 10, J, Q, K, A
}

export function calcTrueCount(runningCount: number, cardsRemaining: number): number {
  const decksRemaining = Math.max(cardsRemaining / 52, 0.25);
  const raw = runningCount / decksRemaining;
  // Truncate toward zero, which is how true count is usually handled at the table.
  return raw < 0 ? Math.ceil(raw) : Math.floor(raw);
}

