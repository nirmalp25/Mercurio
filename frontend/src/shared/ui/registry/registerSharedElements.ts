import { CategoryCard } from '@/shared/ui/cards/CategoryCard';
import { ProductCard } from '@/shared/ui/cards/ProductCard';
import { HoneypotField } from '@/shared/ui/fields/HoneypotField';
import { PhoneField } from '@/shared/ui/fields/PhoneField';
import { SelectField } from '@/shared/ui/fields/SelectField';
import { TextareaField } from '@/shared/ui/fields/TextareaField';
import { TextField } from '@/shared/ui/fields/TextField';
import { registerElement } from './registry';

/** Default implementations for the element types used in configs. Re-register to reskin. */
export function registerSharedElements(): void {
  registerElement('text', TextField);
  registerElement('email', TextField);
  registerElement('textarea', TextareaField);
  registerElement('select', SelectField);
  registerElement('phone', PhoneField);
  registerElement('honeypot', HoneypotField);
  registerElement('productCard', ProductCard);
  registerElement('categoryCard', CategoryCard);
}
