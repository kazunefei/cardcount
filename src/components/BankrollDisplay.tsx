interface BankrollDisplayProps {
  bankroll: number;
  practiceMode: boolean;
}

export function BankrollDisplay({ bankroll, practiceMode }: BankrollDisplayProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Bankroll</h2>
        <span className="muted">{practiceMode ? 'Practice (unlimited)' : 'Live sim'}</span>
      </div>
      <div className="chip-stack">
        <div className="chip">Chips: {practiceMode ? '∞' : bankroll}</div>
      </div>
    </div>
  );
}

