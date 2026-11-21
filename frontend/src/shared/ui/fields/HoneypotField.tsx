import type { FieldProps } from './types';

/** Invisible to people, tempting to bots. The backend rejects submissions where it is filled. */
export function HoneypotField({ id, config, value, onChange }: FieldProps<string>) {
  return (
    <div className="visually-hidden" aria-hidden="true">
      <label htmlFor={id}>{config.label}</label>
      <input
        id={id}
        name={config.name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
