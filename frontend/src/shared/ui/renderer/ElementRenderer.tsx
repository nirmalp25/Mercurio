import { resolveElement } from '@/shared/ui/registry/registry';

interface ElementRendererProps {
  type: string;
  [prop: string]: unknown;
}

/** Renders whatever component is registered for `type`, passing the remaining props through. */
export function ElementRenderer({ type, ...props }: ElementRendererProps) {
  const Component = resolveElement(type);
  return <Component {...props} />;
}
