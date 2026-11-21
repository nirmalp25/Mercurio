import { FieldShell, describedBy } from './FieldShell';
import type { FieldProps } from './types';

/** Single-line input. Handles text/email/password via dataType or props.inputType. */
export function TextField({ id, config, value, onChange, onBlur, error, disabled }: FieldProps<string>) {
  const inputType =
    (config.props?.inputType as string | undefined) ?? (config.dataType === 'email' ? 'email' : 'text');

  return (
    <FieldShell id={id} config={config} error={error}>
      <input
        id={id}
        name={config.name}
        type={inputType}
        className="input"
        value={value ?? ''}
        placeholder={config.placeholder}
        maxLength={config.validation?.maxLength}
        autoComplete={config.props?.autoComplete as string | undefined}
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
