import { fireEvent, screen, within } from '@testing-library/react';
import { catalogueApi } from '@/shared/api/endpoints';
import { makeProduct } from '../../../../test/fixtures';
import { renderWithProviders } from '../../../../test/utils';
import { CategoryModal } from '../CategoryModal';

jest.mock('@/shared/api/endpoints', () => ({
  catalogueApi: { categoryProducts: jest.fn() },
}));

const categoryProducts = catalogueApi.categoryProducts as jest.Mock;

const topRated = Array.from({ length: 6 }, (_, i) => makeProduct({ id: i + 1, title: `Star ${i + 1}`, isTopRated: true }));
const others = [makeProduct({ id: 100, title: 'Plain A' }), makeProduct({ id: 101, title: 'Plain B' })];

describe('CategoryModal', () => {
  beforeEach(() => {
    categoryProducts.mockResolvedValue({
      category: { slug: 'electronics', name: 'Electronics' },
      topRated,
      products: [...topRated, ...others],
    });
  });

  it('shows a top rated section with Show more, and all products with star badges', async () => {
    renderWithProviders(<CategoryModal category={{ slug: 'electronics', name: 'Electronics' }} onClose={jest.fn()} />);

    const dialog = await screen.findByRole('dialog', { name: 'Electronics' });
    const topSection = await within(dialog).findByTestId('category-top-rated');
    expect(within(topSection).getAllByTestId('category-top-rated-product')).toHaveLength(4);

    fireEvent.click(within(topSection).getByRole('button', { name: /Show more \(2\)/ }));
    expect(within(topSection).getAllByTestId('category-top-rated-product')).toHaveLength(6);

    const allSection = within(dialog).getByTestId('category-all');
    expect(within(allSection).getAllByTestId('category-product')).toHaveLength(8);
    expect(within(allSection).getAllByRole('img', { name: 'Top rated' })).toHaveLength(6);
  });

  it('closes on Escape', async () => {
    const onClose = jest.fn();
    renderWithProviders(<CategoryModal category={{ slug: 'electronics', name: 'Electronics' }} onClose={onClose} />);
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows an error state when loading fails', async () => {
    categoryProducts.mockRejectedValue(new Error('boom'));
    renderWithProviders(<CategoryModal category={{ slug: 'electronics', name: 'Electronics' }} onClose={jest.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong.');
  });
});
