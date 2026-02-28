interface CountInputProps {
  value: string;
  onChange(value: string): void;
  onSubmit(): void;
  disabled?: boolean;
  label?: string;
}

export function CountInput({
  value,
  onChange,
  onSubmit,
  disabled,
  label = 'Enter count',
}: CountInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onSubmit();
    }
  }

  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="compact-row">
        <input
          type="number"
          className="number-input count-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button type="button" className="btn secondary" onClick={onSubmit} disabled={disabled}>
          Submit
        </button>
      </div>
    </div>
  );
}

