import { useState } from 'react';

export type GameMode = 'counting' | 'blackjack';
export type CountType = 'running' | 'true';
export type DealerSoft17Rule = 'hit' | 'stand';

export type PaceMode = 'manual' | 'slow' | 'normal' | 'fast';

export interface SettingsState {
  numDecks: number;
  countType: CountType;
  practiceBankroll: boolean;
  showInternalCounts: boolean;
  dealerSoft17Rule: DealerSoft17Rule;
}

export function useGameMode() {
  const [mode, setMode] = useState<GameMode>('blackjack');
  const [settings, setSettings] = useState<SettingsState>({
    numDecks: 2,
    countType: 'running',
    practiceBankroll: true,
    showInternalCounts: true,
    dealerSoft17Rule: 'hit',
  });

  function updateSettings(partial: Partial<SettingsState>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  return {
    mode,
    setMode,
    settings,
    updateSettings,
  };
}

