import { isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';
import { z } from 'zod';
import type { ElementConfig, FormConfig } from '@/shared/config/schema';
import type { PhoneValue } from '@/shared/ui/fields/types';

/** Builds a zod schema from a form config, so validation rules live in one place: the JSON. */
export function buildSchema(form: FormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of form.fields) {
    shape[field.name] = fieldSchema(field);
  }
  return z.object(shape);
}

function fieldSchema(field: ElementConfig): z.ZodTypeAny {
  if (field.type === 'honeypot') return z.string().optional();

  switch (field.dataType) {
    case 'phone':
      return phoneSchema(field);
    case 'number':
      return field.required
        ? z.coerce.number({ invalid_type_error: `${field.label} must be a number` })
        : z.union([z.literal(''), z.coerce.number()]).optional();
    default:
      return stringSchema(field);
  }
}

function stringSchema(field: ElementConfig): z.ZodTypeAny {
  const { label, validation: rules = {} } = field;
  let schema = z.string().trim();

  if (field.required) schema = schema.min(1, `${label} is required`);
  if (rules.minLength) schema = schema.min(rules.minLength, `${label} must be at least ${rules.minLength} characters`);
  if (rules.maxLength) schema = schema.max(rules.maxLength, `${label} must be at most ${rules.maxLength} characters`);
  if (rules.pattern) schema = schema.regex(new RegExp(rules.pattern), rules.patternMessage ?? `${label} is invalid`);
  if (field.dataType === 'email') schema = schema.email('Enter a valid email address');

  // Optional fields may be left blank without tripping min/email rules.
  return field.required ? schema : z.union([z.literal(''), schema]).optional();
}

function phoneSchema(field: ElementConfig): z.ZodTypeAny {
  return z
    .object({ countryCode: z.string(), number: z.string().trim() })
    .superRefine((value: PhoneValue, ctx) => {
      if (!value.number) {
        if (field.required) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${field.label} is required` });
        return;
      }
      if (!value.countryCode) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select a country code' });
        return;
      }
      if (!isValidPhoneNumber(value.number, value.countryCode as CountryCode)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid phone number for the selected country' });
      }
    });
}

/** Initial form values derived from the config. */
export function defaultValues(form: FormConfig): Record<string, unknown> {
  return Object.fromEntries(
    form.fields.map((field) => [
      field.name,
      field.dataType === 'phone'
        ? { countryCode: (field.props?.defaultCountry as string | undefined) ?? '', number: '' }
        : '',
    ]),
  );
}
