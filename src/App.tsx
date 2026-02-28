import { useMemo } from 'react';
import { useCardTrainer } from './hooks/useCardTrainer';
import { useBlackjackGame } from './hooks/useBlackjackGame';
import { useGameMode } from './hooks/useGameMode';
import { ModeToggle } from './components/ModeToggle';
import { PaceSelector } from './components/PaceSelector';
import { CardView } from './components/CardView';
import { CountInput } from './components/CountInput';
import { ScoreBoard } from './components/ScoreBoard';
import { GameControls } from './components/GameControls';
import { BankrollDisplay } from './components/BankrollDisplay';
import { BetControls } from './components/BetControls';
import { BlackjackTable } from './components/BlackjackTable';

function App() {
  const { mode, setMode, settings, updateSettings } = useGameMode();

  const counting = useCardTrainer({
    numDecks: settings.numDecks,
    countType: settings.countType,
  });

  const blackjack = useBlackjackGame({
    numDecks: settings.numDecks,
    countType: settings.countType,
    practiceMode: settings.practiceBankroll,
  });

  const countingAttempts = counting.attempts;
  const blackjackAttempts = blackjack.derived.countAttempts;

  const countTypeLabel = useMemo(
    () => (settings.countType === 'running' ? 'Running count' : 'True count'),
    [settings.countType],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <h1>Card Counting Trainer</h1>
          <span>
            Practice running and true count with real blackjack flow.
          </span>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </header>

      <div className="app-controls-row">
        <div className="panel">
          <div className="panel-header">
            <h2>Settings</h2>
          </div>
          <div className="compact-row">
            <div>
              <div className="field-label">Decks in shoe</div>
              <div className="compact-row decks-control">
                <button
                  type="button"
                  className="btn secondary decks-btn"
                  onClick={() =>
                    updateSettings({
                      numDecks: Math.max(1, settings.numDecks - 1),
                    })
                  }
                  disabled={settings.numDecks <= 1}
                  aria-label="Fewer decks"
                >
                  −
                </button>
                <span className="decks-value">{settings.numDecks}</span>
                <button
                  type="button"
                  className="btn secondary decks-btn"
                  onClick={() =>
                    updateSettings({
                      numDecks: Math.min(8, settings.numDecks + 1),
                    })
                  }
                  disabled={settings.numDecks >= 8}
                  aria-label="More decks"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <div className="field-label">Count mode</div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-option ${
                    settings.countType === 'running' ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ countType: 'running' })}
                >
                  Running
                </button>
                <button
                  type="button"
                  className={`segmented-option ${
                    settings.countType === 'true' ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ countType: 'true' })}
                >
                  True
                </button>
              </div>
            </div>
            <div>
              <div className="field-label">Bankroll mode</div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-option ${
                    settings.practiceBankroll ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ practiceBankroll: true })}
                >
                  Practice
                </button>
                <button
                  type="button"
                  className={`segmented-option ${
                    !settings.practiceBankroll ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ practiceBankroll: false })}
                >
                  Limited
                </button>
              </div>
            </div>
            <div>
              <div className="field-label">Show count info</div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-option ${
                    settings.showInternalCounts ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ showInternalCounts: true })}
                >
                  Show
                </button>
                <button
                  type="button"
                  className={`segmented-option ${
                    !settings.showInternalCounts ? 'active' : ''
                  }`}
                  onClick={() => updateSettings({ showInternalCounts: false })}
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Count Info</h2>
          </div>
          <div className="compact-row">
            <div className="pill">
              <span className="pill-label">Mode</span>
              <span className="pill-value">{mode === 'counting' ? 'Counting' : 'Blackjack'}</span>
            </div>
            <div className="pill">
              <span className="pill-label">Count</span>
              <span className="pill-value">{countTypeLabel}</span>
            </div>
            <div className="pill">
              <span className="pill-label">Decks</span>
              <span className="pill-value">{settings.numDecks}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="app-main">
        {mode === 'counting' ? (
          <CountingView
            runningCount={counting.runningCount}
            trueCount={counting.trueCount}
            status={counting.status}
            currentCard={counting.currentCard}
            score={counting.score}
            attempts={countingAttempts}
            pace={counting.pace}
            setPace={counting.setPace}
            userInput={counting.userInput}
            setUserInput={counting.setUserInput}
            start={counting.start}
            reset={counting.reset}
            dealNext={counting.dealNext}
            submit={counting.submit}
            cardsRemaining={counting.cardsRemaining}
            countTypeLabel={countTypeLabel}
            showInternalCounts={settings.showInternalCounts}
          />
        ) : (
          <BlackjackView
            state={blackjack.state}
            actions={blackjack.actions}
            derived={blackjack.derived}
            countTypeLabel={countTypeLabel}
            showInternalCounts={settings.showInternalCounts}
          />
        )}
      </main>
    </div>
  );
}

interface CountingViewProps {
  runningCount: number;
  trueCount: number;
  status: 'idle' | 'running' | 'finished';
  currentCard: ReturnType<typeof useCardTrainer>['currentCard'];
  score: number;
  attempts: number;
  pace: ReturnType<typeof useCardTrainer>['pace'];
  setPace: ReturnType<typeof useCardTrainer>['setPace'];
  userInput: string;
  setUserInput: (val: string) => void;
  start: () => void;
  reset: () => void;
  dealNext: () => void;
  submit: () => void;
  cardsRemaining: number;
  countTypeLabel: string;
  showInternalCounts: boolean;
}

function CountingView({
  runningCount,
  trueCount,
  status,
  currentCard,
  score,
  attempts,
  pace,
  setPace,
  userInput,
  setUserInput,
  start,
  reset,
  dealNext,
  submit,
  cardsRemaining,
  countTypeLabel,
  showInternalCounts,
}: CountingViewProps) {
  return (
    <>
      <div className="card-table">
        <CardView
          card={currentCard}
          statusText={
            status === 'idle'
              ? 'Press Start to begin dealing.'
              : status === 'finished'
              ? 'Shoe finished. Reset to start again.'
              : undefined
          }
        />
      </div>
      <div className="side-panel">
        <ScoreBoard
          score={score}
          totalAttempts={attempts}
          modeLabel="Counting practice"
        />
        <div className="panel">
          <div className="panel-header">
            <h2>Counting</h2>
          </div>
          <div className="table-row">
            <PaceSelector value={pace} onChange={setPace} />
            <CountInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={submit}
              disabled={status !== 'running'}
              label={countTypeLabel}
            />
            {showInternalCounts && (
              <>
                <div className="stat-row">
                  <span className="stat-label">Internal running count</span>
                  <span className="stat-value">{runningCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Internal true count</span>
                  <span className="stat-value">{trueCount}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <GameControls
          status={status}
          onStart={start}
          onReset={reset}
          onDealNext={dealNext}
          manualMode={pace === 'manual'}
          cardsRemaining={cardsRemaining}
          showCardsRemaining={showInternalCounts}
        />
      </div>
    </>
  );
}

interface BlackjackViewProps {
  state: ReturnType<typeof useBlackjackGame>['state'];
  actions: ReturnType<typeof useBlackjackGame>['actions'];
  derived: ReturnType<typeof useBlackjackGame>['derived'];
  countTypeLabel: string;
  showInternalCounts: boolean;
}

function BlackjackView({ state, actions, derived, countTypeLabel, showInternalCounts }: BlackjackViewProps) {
  const {
    phase,
    playerHands,
    dealerHand,
    activeHandIndex,
    bankroll,
    currentBet,
    practiceMode,
    pace,
    countScore,
    lastOutcomeText,
    runningCount,
    trueCount,
  } = state;

  const { cardsRemaining, countInput } = derived;

  const canAct = phase === 'player';

  return (
    <>
      <BlackjackTable
        playerHands={playerHands}
        dealerHand={dealerHand}
        activeHandIndex={activeHandIndex}
        phase={phase}
        onHit={actions.hit}
        onStand={actions.stand}
        onDouble={actions.doubleDown}
        onSplit={actions.split}
        canAct={canAct}
        lastOutcomeText={lastOutcomeText}
      />
      <div className="side-panel">
        <BankrollDisplay bankroll={bankroll} practiceMode={practiceMode} />
        <BetControls
          currentBet={currentBet}
          onChangeBet={actions.setCurrentBet}
          onStartHand={actions.startHand}
          onNextHand={actions.startNextHand}
          phase={phase}
          pace={pace}
        />
        <div className="panel">
          <div className="panel-header">
            <h2>Between Hands Counting</h2>
          </div>
          <div className="table-row">
            <PaceSelector value={pace} onChange={actions.setPace} label="Between hands pace" />
            <CountInput
              value={countInput}
              onChange={actions.setCountInputValue}
              onSubmit={actions.submitCount}
              disabled={phase !== 'betweenHands'}
              label={countTypeLabel}
            />
            {showInternalCounts && (
              <>
                <div className="stat-row">
                  <span className="stat-label">Cards remaining in shoe</span>
                  <span className="stat-value">{cardsRemaining}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Internal running count</span>
                  <span className="stat-value">{runningCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Internal true count</span>
                  <span className="stat-value">{trueCount}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <ScoreBoard
          score={countScore}
          totalAttempts={derived.countAttempts}
          modeLabel="Blackjack counting"
        />
        <div className="panel">
          <div className="table-row">
            <button
              type="button"
              className="btn secondary"
              onClick={actions.resetShoe}
            >
              Reset Shoe
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

