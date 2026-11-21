import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { catalogueApi } from '@/shared/api/endpoints';
import { renderWithProviders } from '../../../../test/utils';
import { SearchBar } from '../SearchBar';

jest.mock('@/shared/api/endpoints', () => ({
  catalogueApi: { suggest: jest.fn(), search: jest.fn() },
}));

const suggest = catalogueApi.suggest as jest.Mock;

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    suggest.mockResolvedValue([
      { id: 1, title: 'Slim Fit Jacket', category: "men's clothing" },
      { id: 2, title: 'Rain Jacket', category: "women's clothing" },
    ]);
  });
  afterEach(() => jest.useRealTimers());

  function type(value: string) {
    fireEvent.change(screen.getByTestId('search-input'), { target: { value } });
  }

  it('debounces suggestion requests: one call after fast typing', async () => {
    renderWithProviders(<SearchBar />);

    type('j');
    type('ja');
    type('jac');
    type('jack');
    expect(suggest).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(suggest).toHaveBeenCalledTimes(1));
    expect(suggest).toHaveBeenCalledWith('jack', 8, expect.anything());
    expect(await screen.findByRole('option', { name: /Slim Fit Jacket/ })).toBeInTheDocument();
  });

  it('does not request suggestions below the minimum length', async () => {
    renderWithProviders(<SearchBar />);
    type('j');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(suggest).not.toHaveBeenCalled();
  });

  it('navigates to the results page when the Search button is clicked', () => {
    renderWithProviders(<SearchBar />);
    type('  jacket ');
    fireEvent.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('location')).toHaveTextContent('/search?q=jacket');
  });

  it('does nothing for an empty search', () => {
    renderWithProviders(<SearchBar />);
    fireEvent.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
  });

  it('supports keyboard selection of a suggestion', async () => {
    renderWithProviders(<SearchBar />);
    type('jacket');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    await screen.findByRole('option', { name: /Rain Jacket/ });

    const input = screen.getByTestId('search-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Rain Jacket/ })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByTestId('location')).toHaveTextContent('/products/2');
  });
});
