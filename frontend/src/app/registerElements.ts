import { SearchBar } from '@/modules/search/SearchBar';
import { registerElement } from '@/shared/ui/registry/registry';
import { registerSharedElements } from '@/shared/ui/registry/registerSharedElements';

/** Composition root for the component registry. Swap implementations here when the new design lands. */
export function registerElements(): void {
  registerSharedElements();
  registerElement('search', SearchBar);
}
