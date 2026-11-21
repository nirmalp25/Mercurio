import { countries } from '@/shared/config';
import { FieldShell, describedBy } from './FieldShell';
import type { FieldProps, PhoneValue } from './types';

/** Country-code dropdown + number input. Value is { countryCode (ISO2), number }. */
export function PhoneField({ id, config, value, onChange, onBlur, error, disabled }: FieldProps<PhoneValue>) {
  const current: PhoneValue = value ?? { countryCode: '', number: '' };

  return (
    <FieldShell id={id} config={config} error={error}>
      <div className="phone">
        <select
          aria-label="Country code"
          className="input phone__country"
          name={(config.props?.countryField as string | undefined) ?? 'countryCode'}
          value={current.countryCode}
          disabled={disabled}
          onChange={(e) => onChange({ ...current, countryCode: e.target.value })}
          onBlur={onBlur}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.dial}
            </option>
          ))}
        </select>
        <input
          id={id}
          name={config.name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className="input phone__number"
          value={current.number}
          placeholder={config.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error)}
          aria-required={config.required}
          disabled={disabled}
          onChange={(e) => onChange({ ...current, number: e.target.value })}
          onBlur={onBlur}
        />
      </div>
    </FieldShell>
  );
}
