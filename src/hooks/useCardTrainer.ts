import { useEffect, useMemo, useState } from 'react';
import { Card, createDeck, shuffle } from '../lib/deck';
import { calcTrueCount, hiLoValue } from '../lib/counting';
import type { CountType, PaceMode } from './useGameMode';

type Status = 'idle' | 'running' | 'finished';

interface UseCardTrainerOptions {
  numDecks: number;
  countType: CountType;
}

const PACE_INTERVALS: Record<Exclude<PaceMode, 'manual'>, number> = {
  slow: 3000,
  normal: 1500,
  fast: 800,
};

export function useCardTrainer({ numDecks, countType }: UseCardTrainerOptions) {
  const [shoe, setShoe] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [pace, setPace] = useState<PaceMode>('manual');
  const [status, setStatus] = useState<Status>('idle');

  const currentCard = shoe[index] ?? null;
  const cardsRemaining = useMemo(() => Math.max(shoe.length - index, 0), [shoe.length, index]);
  const trueCount = useMemo(
    () => calcTrueCount(runningCount, cardsRemaining),
    [runningCount, cardsRemaining],
  );

  useEffect(() => {
    // New shoe whenever number of decks changes
    const newShoe = shuffle(createDeck(numDecks));
    setShoe(newShoe);
    setIndex(0);
    setRunningCount(0);
    setScore(0);
    setAttempts(0);
    setUserInput('');
    setStatus('idle');
  }, [numDecks]);

  useEffect(() => {
    if (status !== 'running' || pace === 'manual') return;
    const key = pace as Exclude<PaceMode, 'manual'>;
    const ms = PACE_INTERVALS[key];

    const timer = setTimeout(() => {
      evaluateAndAdvance(false);
    }, ms);

    return () => clearTimeout(timer);
  });

  function start() {
    if (!shoe.length) {
      const newShoe = shuffle(createDeck(numDecks));
      setShoe(newShoe);
    }
    setStatus('running');
  }

  function reset() {
    const newShoe = shuffle(createDeck(numDecks));
    setShoe(newShoe);
    setIndex(0);
    setRunningCount(0);
    setScore(0);
    setUserInput('');
    setStatus('idle');
  }

  function evaluateAndAdvance(hasSubmitted: boolean) {
    if (!currentCard) {
      setStatus('finished');
      return;
    }

    const value = hiLoValue(currentCard);
    const nextRunning = runningCount + value;
    const cardsLeftAfter = Math.max(shoe.length - (index + 1), 0);

    let effectiveInput: number | null = null;
    if (hasSubmitted && userInput.trim() !== '') {
      const parsed = Number(userInput);
      effectiveInput = Number.isFinite(parsed) ? parsed : null;
    }

    const target =
      countType === 'running'
        ? nextRunning
        : calcTrueCount(nextRunning, cardsLeftAfter);

    if (effectiveInput !== null) {
      setScore((prev) => prev + (effectiveInput === target ? 1 : -1));
    } else {
      // No input / invalid input counts as incorrect
      setScore((prev) => prev - 1);
    }
    setAttempts((prev) => prev + 1);

    setRunningCount(nextRunning);
    setUserInput('');

    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= shoe.length) {
      setStatus('finished');
    }
  }

  function submit() {
    if (status !== 'running') return;
    evaluateAndAdvance(true);
  }

  function dealNext() {
    if (pace !== 'manual' || status !== 'running') return;
    evaluateAndAdvance(false);
  }

  return {
    status,
    currentCard,
    runningCount,
    trueCount,
    score,
    attempts,
    userInput,
    setUserInput,
    pace,
    setPace,
    start,
    reset,
    dealNext,
    submit,
    cardsRemaining,
  };
}

