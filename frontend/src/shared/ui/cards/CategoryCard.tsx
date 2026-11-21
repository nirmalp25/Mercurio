import type { Category } from '@/shared/api/types';

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

/** Category tile in the home grid; selecting it opens the category modal. */
export function CategoryCard({ category, onSelect }: CategoryCardProps) {
  return (
    <button type="button" className="card category-card" data-testid="category-card" onClick={() => onSelect(category)}>
      {category.image ? <img src={category.image} alt="" loading="lazy" /> : <div className="placeholder" />}
      <span className="category-card__name">{category.name}</span>
      <span className="category-card__count">{category.productCount} products</span>
    </button>
  );
}
