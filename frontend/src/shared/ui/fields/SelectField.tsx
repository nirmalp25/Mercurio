import { FieldShell, describedBy } from './FieldShell';
import type { FieldProps } from './types';

interface Option {
  value: string;
  label: string;
}

export function SelectField({ id, config, value, onChange, onBlur, error, disabled }: FieldProps<string>) {
  const options = (config.props?.options as Option[] | undefined) ?? [];

  return (
    <FieldShell id={id} config={config} error={error}>
      <select
        id={id}
        name={config.name}
        className="input"
        value={value ?? ''}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        <option value="">{config.placeholder ?? 'Select…'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
