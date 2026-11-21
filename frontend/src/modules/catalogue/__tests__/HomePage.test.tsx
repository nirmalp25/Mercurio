import { fireEvent, screen } from '@testing-library/react';
import { catalogueApi } from '@/shared/api/endpoints';
import { makeProduct } from '../../../../test/fixtures';
import { renderWithProviders } from '../../../../test/utils';
import { HomePage } from '../HomePage';

jest.mock('@/shared/api/endpoints', () => ({
  catalogueApi: { topRated: jest.fn(), categories: jest.fn(), categoryProducts: jest.fn() },
}));

const api = catalogueApi as jest.Mocked<typeof catalogueApi>;

describe('HomePage', () => {
  it('shows the featured top rated products and opens a category modal', async () => {
    api.topRated.mockResolvedValue(Array.from({ length: 5 }, (_, i) => makeProduct({ id: i + 1, isTopRated: true })));
    api.categories.mockResolvedValue([{ slug: 'jewelery', name: 'Jewelery', productCount: 4, image: null }]);
    api.categoryProducts.mockResolvedValue({ category: { slug: 'jewelery', name: 'Jewelery' }, topRated: [], products: [] });

    renderWithProviders(<HomePage />);

    expect(await screen.findAllByTestId('featured-product')).toHaveLength(5);
    expect(screen.getAllByTestId('featured-product')[0]).toHaveAttribute('href', '/products/1');

    fireEvent.click(await screen.findByTestId('category-card'));
    expect(await screen.findByTestId('category-modal')).toBeInTheDocument();
    expect(api.categoryProducts).toHaveBeenCalledWith('jewelery', expect.anything());
  });
});
