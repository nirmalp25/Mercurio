import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api/ApiError';
import type { FormConfig } from '@/shared/config/schema';
import { FormRenderer } from '@/shared/ui/renderer/FormRenderer';
import { ElementRenderer } from '@/shared/ui/renderer/ElementRenderer';

const config: FormConfig = {
  id: 'test',
  title: 'Test form',
  submitLabel: 'Submit',
  fields: [
    { type: 'text', name: 'name', label: 'Name', dataType: 'string', required: true, validation: { maxLength: 5 } },
    { type: 'email', name: 'email', label: 'Email', dataType: 'email', required: true },
    {
      type: 'textarea',
      name: 'note',
      label: 'Note',
      dataType: 'string',
      required: true,
      validation: { minLength: 3, maxLength: 10 },
    },
    { type: 'phone', name: 'phone', label: 'Phone', dataType: 'phone', required: true, props: { defaultCountry: 'GB', countryField: 'countryCode' } },
  ],
};

describe('FormRenderer', () => {
  it('renders every field from config through the registry', () => {
    render(<FormRenderer config={config} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/^Note/).tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Country code')).toHaveValue('GB');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('enforces required fields and does not submit', async () => {
    const onSubmit = jest.fn();
    render(<FormRenderer config={config} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Phone is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('enforces maxLength from config and shows a character counter', async () => {
    render(<FormRenderer config={config} onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/^Name/), 'Abcdefgh');
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Abcde');

    await userEvent.type(screen.getByLabelText(/^Note/), 'hello world!!');
    expect(screen.getByLabelText(/^Note/)).toHaveValue('hello worl');
    expect(screen.getByTestId('note-counter')).toHaveTextContent('10/10');
  });

  it('validates email format, minLength and phone per country', async () => {
    render(<FormRenderer config={config} onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/^Name/), 'Ann');
    await userEvent.type(screen.getByLabelText(/^Email/), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^Note/), 'hi');
    await userEvent.type(screen.getByLabelText(/^Phone/), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Note must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid phone number for the selected country')).toBeInTheDocument();
  });

  it('submits typed values when valid', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<FormRenderer config={config} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^Name/), 'Ann');
    await userEvent.type(screen.getByLabelText(/^Email/), 'ann@example.com');
    await userEvent.type(screen.getByLabelText(/^Note/), 'Hello');
    await userEvent.type(screen.getByLabelText(/^Phone/), '07400 123456');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ann',
          email: 'ann@example.com',
          note: 'Hello',
          phone: { countryCode: 'GB', number: '07400 123456' },
        }),
      ),
    );
  });

  it('maps server validation errors onto fields, including aliased keys', async () => {
    const onSubmit = jest.fn().mockRejectedValue(
      new ApiError('The given data was invalid.', 422, {
        email: ['That email is blocked.'],
        countryCode: ['Unsupported country.'],
      }),
    );
    render(<FormRenderer config={config} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^Name/), 'Ann');
    await userEvent.type(screen.getByLabelText(/^Email/), 'ann@example.com');
    await userEvent.type(screen.getByLabelText(/^Note/), 'Hello');
    await userEvent.type(screen.getByLabelText(/^Phone/), '07400 123456');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('That email is blocked.')).toBeInTheDocument();
    expect(screen.getByText('Unsupported country.')).toBeInTheDocument();
    expect(screen.getByText('The given data was invalid.')).toBeInTheDocument();
  });
});

describe('component registry', () => {
  it('renders a visible fallback for an unknown element type instead of crashing', () => {
    render(<ElementRenderer type="hologram" />);
    expect(screen.getByTestId('unknown-element')).toHaveTextContent('Unknown element type “hologram”');
  });

  it('renders a form field with an unknown type as a fallback', () => {
    render(
      <FormRenderer
        config={{ id: 'x', submitLabel: 'Go', fields: [{ type: 'slider', name: 's', label: 'S', dataType: 'number' }] }}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByTestId('unknown-element')).toBeInTheDocument();
  });
});
