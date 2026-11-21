import type { ReactNode } from 'react';
import type { ElementConfig } from '@/shared/config/schema';

interface FieldShellProps {
  id: string;
  config: ElementConfig;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/** Label + control + hint/error wrapper shared by all field components. */
export function FieldShell({ id, config, error, hint, children }: FieldShellProps) {
  const width = config.props?.width === 'half' ? 'field--half' : '';
  return (
    <div className={`field ${width}`}>
      <label htmlFor={id} className="field__label">
        {config.label}
        {config.required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      <div className="field__meta">
        {error ? (
          <p id={`${id}-error`} className="field__error" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        {hint}
      </div>
    </div>
  );
}

export function describedBy(id: string, error?: string): string | undefined {
  return error ? `${id}-error` : undefined;
}
