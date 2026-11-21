import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { ApiError } from '@/shared/api/ApiError';
import { enquiryApi } from '@/shared/api/endpoints';
import { renderWithProviders } from '../../../../test/utils';
import { EnquiryModal } from '../EnquiryModal';

jest.mock('@/shared/api/endpoints', () => ({ enquiryApi: { submit: jest.fn() } }));
jest.mock('sweetalert2', () => ({ __esModule: true, default: { fire: jest.fn().mockResolvedValue({}) } }));

const submit = enquiryApi.submit as jest.Mock;
const product = { id: 42, title: 'Slim Fit Jacket' };

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/^First name/), 'Jane');
  await userEvent.type(screen.getByLabelText(/^Last name/), 'Doe');
  await userEvent.type(screen.getByLabelText(/^Email/), 'jane@example.com');
  await userEvent.selectOptions(screen.getByLabelText('Country code'), 'GB');
  await userEvent.type(screen.getByLabelText(/^Contact number/), '07400 123456');
  await userEvent.type(screen.getByLabelText(/^Your query/), 'Is this available in blue?');
}

describe('EnquiryModal', () => {
  it('submits the enquiry, closes, and shows a thank-you message', async () => {
    submit.mockResolvedValue({ data: { id: 1, enquiredAt: '2026-11-21T10:00:00Z' }, message: 'Thanks!' });
    const onClose = jest.fn();
    renderWithProviders(<EnquiryModal product={product} onClose={onClose} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        productId: 42,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        countryCode: 'GB',
        phone: '07400 123456',
        query: 'Is this available in blue?',
        website: '',
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', title: 'Thank you!' }));
  });

  it('keeps the form open and maps 422 errors onto fields', async () => {
    submit.mockRejectedValue(
      new ApiError('Please fix the highlighted fields.', 422, { phone: ['The phone field must be a valid number.'] }),
    );
    const onClose = jest.fn();
    renderWithProviders(<EnquiryModal product={product} onClose={onClose} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByText('The phone field must be a valid number.')).toBeInTheDocument();
    expect(screen.getByText('Please fix the highlighted fields.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('does not call the API when required fields are missing', async () => {
    renderWithProviders(<EnquiryModal product={product} onClose={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
});
