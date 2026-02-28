interface ScoreBoardProps {
  score: number;
  totalAttempts: number;
  modeLabel: string;
}

export function ScoreBoard({ score, totalAttempts, modeLabel }: ScoreBoardProps) {
  const correctCount =
    totalAttempts > 0
      ? Math.max(0, Math.min(totalAttempts, Math.round((score + totalAttempts) / 2)))
      : 0;
  const accuracy =
    totalAttempts > 0 ? `${Math.round((correctCount / totalAttempts) * 100)}%` : '—';

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Score</h2>
        <span className="muted">{modeLabel}</span>
      </div>
      <div className="table-row">
        <div className="stat-row">
          <span className="stat-label">Count score</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Attempts</span>
          <span className="stat-value">{totalAttempts}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}</span>
        </div>
      </div>
    </div>
  );
}

