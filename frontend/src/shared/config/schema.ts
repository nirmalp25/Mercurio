/**
 * Config-driven UI contract. A config describes WHAT an element needs (its inputs and
 * rules); the component registry decides HOW it looks. Restyling or swapping a component
 * never requires touching configs or pages.
 */

export type DataType = 'string' | 'number' | 'email' | 'phone';

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface ElementConfig {
  /** Registry key, e.g. "text", "textarea", "phone", "productCard". */
  type: string;
  name: string;
  label: string;
  dataType: DataType;
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRules;
  props?: Record<string, unknown>;
}

export interface FormConfig {
  id: string;
  title?: string;
  submitLabel: string;
  fields: ElementConfig[];
}

export interface Country {
  code: string;
  name: string;
  dial: string;
}

export interface SearchConfig {
  placeholder: string;
  minChars: number;
  debounceMs: number;
  suggestLimit: number;
  buttonLabel: string;
}

export interface HomeSectionConfig {
  id: string;
  title: string;
  /** Registry key of the card used to render each item. */
  cardType: string;
}

export interface HomeConfig {
  featured: HomeSectionConfig;
  categories: HomeSectionConfig;
  categoryModal: { topRatedPreviewCount: number };
}
