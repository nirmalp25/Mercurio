import type { ComponentType } from 'react';

/**
 * Plug-and-play component registry: element `type` (from JSON config) → component.
 * Registrations happen at the composition root (app/registerElements.ts), so shared code
 * never imports feature modules and a new design system can re-register every type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

const components = new Map<string, AnyComponent>();

export function registerElement(type: string, component: AnyComponent): void {
  components.set(type, component);
}

export function hasElement(type: string): boolean {
  return components.has(type);
}

export function resolveElement(type: string): AnyComponent {
  return components.get(type) ?? createFallback(type);
}

function createFallback(type: string): AnyComponent {
  function UnknownElement() {
    return (
      <div role="note" className="unknown-element" data-testid="unknown-element">
        Unknown element type “{type}”
      </div>
    );
  }
  return UnknownElement;
}
