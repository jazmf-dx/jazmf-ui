/**
 * React Component Registry
 *
 * This registry automatically maps `data-react="component-name"` to React components.
 * To add a new component:
 * 1. Create your component file in frontend/src/components/
 * 2. Import it in this file
 * 3. Add it to the registry object
 *
 * No changes needed to main.tsx!
 */

import type { ComponentType } from 'react';

// Import your React components here
import { ConfirmDialogIsland } from './components/ConfirmDialogIsland';
import { DxFormDialogIsland } from './components/DxFormDialogIsland';
import { ToastListenerIsland } from './components/ToastListenerIsland';
import { DxDatePickerIsland } from './components/DxDatePickerIsland';

/**
 * Component Registry
 *
 * Key: The value of `data-react` attribute (e.g., "counter-demo")
 * Value: The React component to mount
 *
 * Example usage in Django template:
 * <div data-react="counter-demo" data-props='{"title": "Hello", "initialCount": 10}'>
 *   <p>Loading...</p>
 * </div>
 */
export const componentRegistry: Record<string, ComponentType<any>> = {

  // DX UI Islands (Django Template から使用)
  'confirm-dialog': ConfirmDialogIsland,
  'form-dialog': DxFormDialogIsland,
  'toast-listener': ToastListenerIsland,
  'date-picker': DxDatePickerIsland,

  // Add your components here:
  // 'example-component': ExampleComponent,
};

/**
 * Get a component from the registry
 * @param name - Component name from data-react attribute
 * @returns The React component or null if not found
 */
export function getComponent(name: string): ComponentType<any> | null {
  return componentRegistry[name] || null;
}

/**
 * List all registered component names
 * @returns Array of registered component names
 */
export function getRegisteredComponents(): string[] {
  return Object.keys(componentRegistry);
}
