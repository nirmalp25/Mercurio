import { Link } from 'react-router-dom';
import type { Product } from '@/shared/api/types';
import { formatPrice } from '@/shared/utils/format';
import { TopRatedBadge } from './TopRatedBadge';

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
  testId?: string;
}

/** Product tile. Clicking it opens the product details page. */
export function ProductCard({ product, showBadge = false, testId = 'product-tile' }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="card product-card" data-testid={testId}>
      <div className="product-card__media">
        {product.image ? <img src={product.image} alt="" loading="lazy" /> : <div className="placeholder" />}
        {showBadge && product.isTopRated && <TopRatedBadge />}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__meta">
          <span className="price">{formatPrice(product.price)}</span>
          <span className="rating" aria-label={`Rated ${product.rating.rate} out of 5`}>
            ★ {product.rating.rate.toFixed(1)}
          </span>
        </p>
      </div>
    </Link>
  );
}
