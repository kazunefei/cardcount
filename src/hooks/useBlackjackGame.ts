import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, createDeck, shuffle } from '../lib/deck';
import { calcTrueCount, hiLoValue } from '../lib/counting';
import type { CountType, PaceMode } from './useGameMode';

type Phase = 'betting' | 'dealing' | 'player' | 'dealer' | 'resolution' | 'betweenHands';

export interface Hand {
  cards: Card[];
  bet: number;
  isFinished: boolean;
  isDoubled: boolean;
  isSplitHand: boolean;
  result?: 'win' | 'lose' | 'push' | 'blackjack';
}

export interface BlackjackState {
  phase: Phase;
  playerHands: Hand[];
  dealerHand: Hand | null;
  activeHandIndex: number;
  runningCount: number;
  trueCount: number;
  bankroll: number;
  currentBet: number;
  practiceMode: boolean;
  pace: PaceMode;
  countScore: number;
  lastOutcomeText: string | null;
}

interface UseBlackjackOptions {
  numDecks: number;
  countType: CountType;
  practiceMode: boolean;
}

const INITIAL_BANKROLL = 100;

const BETWEEN_HANDS_INTERVAL: Record<Exclude<PaceMode, 'manual'>, number> = {
  slow: 8000,
  normal: 5000,
  fast: 3000,
};

function handTotals(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return { total, soft: aces > 0 };
}

function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const { total } = handTotals(cards);
  return total === 21;
}

function isBust(cards: Card[]): boolean {
  return handTotals(cards).total > 21;
}

export function useBlackjackGame({
  numDecks,
  countType,
  practiceMode,
}: UseBlackjackOptions) {
  const [shoe, setShoe] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Hand[]>([]);
  const [dealerHand, setDealerHand] = useState<Hand | null>(null);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('betting');
  const [runningCount, setRunningCount] = useState(0);
  const [cardsRemaining, setCardsRemaining] = useState(0);
  const [bankroll, setBankroll] = useState(INITIAL_BANKROLL);
  const [currentBet, setCurrentBet] = useState(1);
  const [pace, setPace] = useState<PaceMode>('manual');
  const [countInput, setCountInput] = useState('');
  const [countScore, setCountScore] = useState(0);
  const [countAttempts, setCountAttempts] = useState(0);
  const [lastOutcomeText, setLastOutcomeText] = useState<string | null>(null);
  const [hasSubmittedCount, setHasSubmittedCount] = useState(false);

  const shoeRef = useRef<Card[]>([]);
  const dealerTriggeredRef = useRef(false);
  const runDealerInProgressRef = useRef(false);
  const handCountDeltaRef = useRef(0);

  const trueCount = useMemo(
    () => calcTrueCount(runningCount, cardsRemaining),
    [runningCount, cardsRemaining],
  );

  useEffect(() => {
    const newShoe = shuffle(createDeck(numDecks));
    shoeRef.current = newShoe;
    setShoe(newShoe);
    setCardsRemaining(newShoe.length);
    setPlayerHands([]);
    setDealerHand(null);
    setActiveHandIndex(0);
    setPhase('betting');
    setRunningCount(0);
    handCountDeltaRef.current = 0;
    runDealerInProgressRef.current = false;
    setCountScore(0);
    setCountAttempts(0);
    setLastOutcomeText(null);
    setHasSubmittedCount(false);
    if (!practiceMode) {
      setBankroll(INITIAL_BANKROLL);
    }
  }, [numDecks, practiceMode]);

  // When player busts (or all hands are finished), auto-advance to dealer
  useEffect(() => {
    if (phase !== 'player') {
      if (phase === 'betting') dealerTriggeredRef.current = false;
      return;
    }
    if (!playerHands.length) return;
    const allFinished = playerHands.every((h) => h.isFinished);
    if (!allFinished || dealerTriggeredRef.current) return;
    dealerTriggeredRef.current = true;
    runDealer();
  }, [phase, playerHands]);

  function drawCard(): Card | null {
    // Use an internal ref for the shoe so we can safely draw multiple cards
    // within a single event without relying on React's async state updates.
    if (!shoeRef.current.length) {
      const newShoe = shuffle(createDeck(numDecks));
      shoeRef.current = newShoe;
      setShoe(newShoe);
      setCardsRemaining(newShoe.length);
    }

    const card = shoeRef.current.shift() ?? null;
    if (!card) return null;

    setCardsRemaining(shoeRef.current.length);
    handCountDeltaRef.current += hiLoValue(card);
    setShoe([...shoeRef.current]);

    return card;
  }

  function placeBet(amount: number) {
    if (phase !== 'betting') return;
    const bet = Math.max(1, Math.round(amount || 1));
    setCurrentBet(bet);
  }

  function startHand() {
    if (phase !== 'betting') return;
    if (!practiceMode && bankroll < currentBet) return;

    runDealerInProgressRef.current = false;
    handCountDeltaRef.current = 0;

    const p1: Card[] = [];
    const d1: Card[] = [];

    const draws = [drawCard(), drawCard(), drawCard(), drawCard()];
    if (draws.some((c) => c == null)) return;

    p1.push(draws[0] as Card, draws[2] as Card);
    d1.push(draws[1] as Card, draws[3] as Card);

    const playerHand: Hand = {
      cards: p1,
      bet: currentBet,
      isFinished: false,
      isDoubled: false,
      isSplitHand: false,
      result: undefined,
    };

    const dealer: Hand = {
      cards: d1,
      bet: 0,
      isFinished: false,
      isDoubled: false,
      isSplitHand: false,
      result: undefined,
    };

    setPlayerHands([playerHand]);
    setDealerHand(dealer);
    setActiveHandIndex(0);
    setLastOutcomeText(null);
    setPhase('player');

    if (!practiceMode) {
      setBankroll((prev) => prev - currentBet);
    }
  }

  function hit() {
    if (phase !== 'player') return;
    setPlayerHands((hands) => {
      const idx = activeHandIndex;
      const hand = hands[idx];
      if (!hand || hand.isFinished) return hands;
      const card = drawCard();
      if (!card) return hands;
      const nextHands = [...hands];
      const nextHand: Hand = {
        ...hand,
        cards: [...hand.cards, card],
      };
      if (isBust(nextHand.cards)) {
        nextHand.isFinished = true;
        nextHand.result = 'lose';
      }
      nextHands[idx] = nextHand;
      return nextHands;
    });
  }

  function stand() {
    if (phase !== 'player') return;
    advanceToNextPlayerHandOrDealer();
  }

  function doubleDown() {
    if (phase !== 'player') return;
    setPlayerHands((hands) => {
      const idx = activeHandIndex;
      const hand = hands[idx];
      if (!hand || hand.cards.length !== 2 || hand.isFinished) return hands;
      if (!practiceMode && bankroll < hand.bet) return hands;

      const card = drawCard();
      if (!card) return hands;

      const updated: Hand = {
        ...hand,
        cards: [...hand.cards, card],
        bet: hand.bet * 2,
        isDoubled: true,
        isFinished: true,
      };

      if (!practiceMode) {
        setBankroll((prev) => prev - hand.bet);
      }

      const nextHands = [...hands];
      nextHands[idx] = updated;
      return nextHands;
    });
    advanceToNextPlayerHandOrDealer(true);
  }

  function split() {
    if (phase !== 'player') return;
    setPlayerHands((hands) => {
      const idx = activeHandIndex;
      const hand = hands[idx];
      if (!hand || hand.cards.length !== 2) return hands;
      if (hand.cards[0].rank !== hand.cards[1].rank) return hands;
      if (!practiceMode && bankroll < hand.bet) return hands;

      const firstCard = hand.cards[0];
      const secondCard = hand.cards[1];
      const card1 = drawCard();
      const card2 = drawCard();
      if (!card1 || !card2) return hands;

      if (!practiceMode) {
        setBankroll((prev) => prev - hand.bet);
      }

      const firstHand: Hand = {
        cards: [firstCard, card1],
        bet: hand.bet,
        isFinished: false,
        isDoubled: false,
        isSplitHand: true,
      };
      const secondHand: Hand = {
        cards: [secondCard, card2],
        bet: hand.bet,
        isFinished: false,
        isDoubled: false,
        isSplitHand: true,
      };

      const nextHands = [...hands.slice(0, idx), firstHand, secondHand, ...hands.slice(idx + 1)];
      return nextHands;
    });
  }

  function advanceToNextPlayerHandOrDealer(fromDouble = false) {
    setPlayerHands((hands) => {
      const idx = activeHandIndex;
      if (!hands[idx]) return hands;
      const nextHands = [...hands];
      nextHands[idx] = { ...hands[idx], isFinished: true };
      return nextHands;
    });

    setTimeout(() => {
      setPlayerHands((hands) => {
        const nextIndex = hands.findIndex((h, i) => !h.isFinished && i > activeHandIndex);
        if (nextIndex !== -1) {
          setActiveHandIndex(nextIndex);
          return hands;
        }
        runDealer();
        return hands;
      });
    }, fromDouble ? 0 : 0);
  }

  function runDealer() {
    if (phase !== 'player' && phase !== 'dealer') return;
    if (!dealerHand) return;
    if (runDealerInProgressRef.current) return;
    runDealerInProgressRef.current = true;
    setPhase('dealer');
    let working: Hand = { ...dealerHand, cards: [...dealerHand.cards] };
    while (true) {
      const { total, soft } = handTotals(working.cards);
      if (total > 21) break;
      if (total > 17 || (total === 17 && !soft)) break;
      const c = drawCard();
      if (!c) break;
      working = { ...working, cards: [...working.cards, c] };
    }
    working.isFinished = true;
    setDealerHand(working);
    resolveHands(working);
  }

  function resolveHands(finalDealerHand?: Hand | null) {
    setPhase('resolution');
    const dealerForResolution = finalDealerHand ?? dealerHand;
    setPlayerHands((hands) => {
      if (!dealerForResolution) return hands;
      const dealerTotal = handTotals(dealerForResolution.cards).total;
      const dealerBJ = isBlackjack(dealerForResolution.cards);
      const dealerBust = dealerTotal > 21;
      let outcomeText: string[] = [];

      const resolved = hands.map((hand) => {
        const { total } = handTotals(hand.cards);
        const bust = total > 21;
        const bj = isBlackjack(hand.cards);
        let result: Hand['result'];
        let delta = 0;

        if (bj && !hand.isSplitHand && !dealerBJ) {
          result = 'blackjack';
          delta = Math.round(hand.bet * 2.5);
          outcomeText.push('Blackjack! +2.5x');
        } else if (bust) {
          result = 'lose';
          delta = 0;
          outcomeText.push('Player busts');
        } else if (dealerBust) {
          result = 'win';
          delta = hand.bet * 2;
          outcomeText.push('Dealer busts');
        } else if (dealerBJ && !bj) {
          result = 'lose';
          delta = 0;
          outcomeText.push('Dealer blackjack');
        } else if (total > dealerTotal) {
          result = 'win';
          delta = hand.bet * 2;
          outcomeText.push('Player wins');
        } else if (total < dealerTotal) {
          result = 'lose';
          delta = 0;
          outcomeText.push('Player loses');
        } else {
          result = 'push';
          delta = hand.bet;
          outcomeText.push('Push');
        }

        if (!practiceMode && delta > 0) {
          setBankroll((prev) => prev + delta);
        }

        return { ...hand, result, isFinished: true };
      });

      setLastOutcomeText(outcomeText.join(' • '));
      setHasSubmittedCount(false);
      setPhase('betweenHands');
      return resolved;
    });
  }

  useEffect(() => {
    if (phase !== 'betweenHands') return;
    if (pace === 'manual') return;
    if (hasSubmittedCount) return;

    const key = pace as Exclude<PaceMode, 'manual'>;
    const ms = BETWEEN_HANDS_INTERVAL[key];
    const timer = setTimeout(() => {
      evaluateCountSubmission(false);
      startNextHand();
    }, ms);

    return () => clearTimeout(timer);
  }, [phase, pace, hasSubmittedCount]);

  function setCountInputValue(value: string) {
    setCountInput(value);
  }

  function submitCount() {
    evaluateCountSubmission(true);
  }

  function evaluateCountSubmission(hasInput: boolean) {
    const effectiveRunningCount =
      phase === 'betweenHands'
        ? runningCount + handCountDeltaRef.current
        : runningCount;
    const effectiveTarget =
      countType === 'running'
        ? effectiveRunningCount
        : calcTrueCount(effectiveRunningCount, cardsRemaining);

    let parsed: number | null = null;
    if (hasInput && countInput.trim() !== '') {
      const n = Number(countInput);
      parsed = Number.isFinite(n) ? n : null;
    }

    if (parsed !== null) {
      setCountScore((prev) => prev + (parsed === effectiveTarget ? 1 : -1));
    } else {
      setCountScore((prev) => prev - 1);
    }
    setCountAttempts((prev) => prev + 1);
    setHasSubmittedCount(true);
    setCountInput('');
    if (phase === 'betweenHands') {
      const delta = handCountDeltaRef.current;
      setRunningCount((prev) => prev + delta);
      handCountDeltaRef.current = 0;
    }
  }

  function startNextHand() {
    if (phase === 'betweenHands' && !hasSubmittedCount) {
      evaluateCountSubmission(!!countInput.trim());
    }
    setPlayerHands([]);
    setDealerHand(null);
    setActiveHandIndex(0);
    setPhase('betting');
  }

  function resetShoe() {
    const newShoe = shuffle(createDeck(numDecks));
    shoeRef.current = newShoe;
    setShoe(newShoe);
    setCardsRemaining(newShoe.length);
    setPlayerHands([]);
    setDealerHand(null);
    setActiveHandIndex(0);
    setPhase('betting');
    setRunningCount(0);
    handCountDeltaRef.current = 0;
    runDealerInProgressRef.current = false;
    setCountScore(0);
    setCountAttempts(0);
    setLastOutcomeText(null);
    setHasSubmittedCount(false);
    if (!practiceMode) {
      setBankroll(INITIAL_BANKROLL);
    }
  }

  return {
    state: {
      phase,
      playerHands,
      dealerHand,
      activeHandIndex,
      runningCount,
      trueCount,
      bankroll,
      currentBet,
      practiceMode,
      pace,
      countScore,
      lastOutcomeText,
    },
    actions: {
      setPace,
      placeBet,
      setCurrentBet,
      startHand,
      hit,
      stand,
      doubleDown,
      split,
      startNextHand,
      resetShoe,
      setCountInputValue,
      submitCount,
    },
    derived: {
      countInput,
      cardsRemaining,
      countAttempts,
    },
  };
}

