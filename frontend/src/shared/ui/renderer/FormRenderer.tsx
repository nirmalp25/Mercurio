import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useState } from 'react';
import { Controller, useForm, type FieldValues } from 'react-hook-form';
import { isApiError } from '@/shared/api/ApiError';
import type { FormConfig } from '@/shared/config/schema';
import { resolveElement } from '@/shared/ui/registry/registry';
import { buildSchema, defaultValues } from './buildSchema';

interface FormRendererProps<T extends FieldValues> {
  config: FormConfig;
  /** May throw an ApiError; its fieldErrors are mapped back onto the matching fields. */
  onSubmit: (values: T) => Promise<void>;
  testId?: string;
}

/**
 * Renders a form entirely from config: each field's `type` is resolved through the
 * component registry, and validation comes from the same config via zod.
 */
export function FormRenderer<T extends FieldValues>({ config, onSubmit, testId }: FormRendererProps<T>) {
  const formId = useId();
  const schema = useMemo(() => buildSchema(config), [config]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<FieldValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(config),
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values as T);
    } catch (error) {
      if (isApiError(error) && Object.keys(error.fieldErrors).length > 0) {
        applyServerErrors(error.fieldErrors);
      }
      setFormError(isApiError(error) ? error.message : 'Something went wrong. Please try again.');
    }
  });

  /** Server keys map to a field by name, or to the field that owns them (e.g. countryCode → phone). */
  function applyServerErrors(fieldErrors: Record<string, string[]>) {
    for (const [key, messages] of Object.entries(fieldErrors)) {
      const owner = config.fields.find((f) => f.name === key || f.props?.countryField === key);
      if (owner) setError(owner.name, { type: 'server', message: messages[0] });
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate data-testid={testId} aria-label={config.title}>
      {config.fields.map((field) => {
        const Field = resolveElement(field.type);
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: rhf, fieldState }) => (
              <Field
                id={`${formId}-${field.name}`}
                config={field}
                value={rhf.value}
                onChange={rhf.onChange}
                onBlur={rhf.onBlur}
                error={fieldState.error?.message}
                disabled={isSubmitting}
              />
            )}
          />
        );
      })}

      {formError && (
        <p className="form__error" role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : config.submitLabel}
      </button>
    </form>
  );
}
