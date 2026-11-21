import type { ElementConfig } from '@/shared/config/schema';

/** Uniform props every form-field component receives from FormRenderer. */
export interface FieldProps<V = unknown> {
  id: string;
  config: ElementConfig;
  value: V;
  onChange: (value: V) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

export interface PhoneValue {
  countryCode: string;
  number: string;
}
