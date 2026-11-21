import type { Product } from '@/shared/api/types';
import { ElementRenderer } from '@/shared/ui/renderer/ElementRenderer';

interface ProductGridProps {
  products: Product[];
  cardType?: string;
  showBadge?: boolean;
  testId?: string;
}

/** Grid of product cards; the card component comes from the registry (cardType). */
export function ProductGrid({ products, cardType = 'productCard', showBadge = false, testId }: ProductGridProps) {
  return (
    <div className="grid grid--products">
      {products.map((product) => (
        <ElementRenderer key={product.id} type={cardType} product={product} showBadge={showBadge} testId={testId} />
      ))}
    </div>
  );
}
