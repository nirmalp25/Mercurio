import { FieldShell, describedBy } from './FieldShell';
import type { FieldProps } from './types';

export function TextareaField({ id, config, value, onChange, onBlur, error, disabled }: FieldProps<string>) {
  const max = config.validation?.maxLength;
  const length = (value ?? '').length;

  return (
    <FieldShell
      id={id}
      config={config}
      error={error}
      hint={
        max ? (
          <span className="field__counter" data-testid={`${config.name}-counter`} aria-live="polite">
            {length}/{max}
          </span>
        ) : undefined
      }
    >
      <textarea
        id={id}
        name={config.name}
        className="input input--textarea"
        value={value ?? ''}
        placeholder={config.placeholder}
        rows={(config.props?.rows as number | undefined) ?? 4}
        maxLength={max}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error)}
        aria-required={config.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldShell>
  );
}
