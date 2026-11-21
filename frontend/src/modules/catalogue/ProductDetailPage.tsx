import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EnquiryModal } from '@/modules/enquiry/EnquiryModal';
import { catalogueApi } from '@/shared/api/endpoints';
import { TopRatedBadge } from '@/shared/ui/cards/TopRatedBadge';
import { ErrorState, Loading } from '@/shared/ui/Status';
import { formatPrice } from '@/shared/utils/format';

export function ProductDetailPage() {
  const id = Number(useParams().id);
  const [enquiring, setEnquiring] = useState(false);

  const query = useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => catalogueApi.product(id, signal),
    enabled: Number.isInteger(id) && id > 0,
  });

  if (!Number.isInteger(id) || id <= 0) return <ErrorState error={null} />;
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const product = query.data;

  return (
    <article className="page product-detail" data-testid="product-detail">
      <Link to="/" className="back-link">
        ← Back to catalogue
      </Link>
      <div className="product-detail__layout">
        <div className="product-detail__media">
          {product.image ? <img src={product.image} alt={product.title} /> : <div className="placeholder" />}
        </div>
        <div className="product-detail__info">
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="product-detail__title">
            {product.title} {product.isTopRated && <TopRatedBadge />}
          </h1>
          <p className="product-detail__price">{formatPrice(product.price)}</p>
          <p className="rating">
            ★ {product.rating.rate.toFixed(1)} <small>({product.rating.count} reviews)</small>
          </p>
          <p className="product-detail__description">{product.description}</p>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            data-testid="enquire-button"
            onClick={() => setEnquiring(true)}
          >
            Enquire
          </button>
        </div>
      </div>

      {enquiring && <EnquiryModal product={product} onClose={() => setEnquiring(false)} />}
    </article>
  );
}
