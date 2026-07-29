/**
 * React Islands - Automatic Component Mounting
 *
 * This script automatically finds all elements with `data-react="component-name"`
 * and mounts the corresponding React component from the registry.
 *
 * Usage in Django templates:
 * 1. Add this script: {% vite_asset 'main' %}
 * 2. Add mount point: <div data-react="component-name" data-props='{"key": "value"}'></div>
 *
 * Props can be passed via:
 * - data-props='{"key": "value"}' (JSON string)
 * - Individual data-* attributes (e.g., data-title="Hello")
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getComponent, getRegisteredComponents } from './registry';

/**
 * Parse props from DOM element
 * Priority: data-props (JSON) > individual data-* attributes
 */
function parseProps(element: HTMLElement): Record<string, any> {
  const props: Record<string, any> = {};

  // First, parse individual data-* attributes (except data-react and data-props)
  Object.keys(element.dataset).forEach((key) => {
    if (key !== 'react' && key !== 'props') {
      const value = element.dataset[key];
      // Try to parse as JSON, otherwise use as string
      try {
        props[key] = JSON.parse(value!);
      } catch {
        props[key] = value;
      }
    }
  });

  // Then, merge with data-props (JSON object takes priority)
  const propsJson = element.dataset.props;
  if (propsJson) {
    try {
      const parsedProps = JSON.parse(propsJson);
      Object.assign(props, parsedProps);
    } catch (error) {
      console.error(
        `[React Islands] Failed to parse data-props for ${element.dataset.react}:`,
        error
      );
    }
  }

  return props;
}

/**
 * Mount a single React component
 */
function mountComponent(element: HTMLElement, componentName: string): void {
  const Component = getComponent(componentName);

  if (!Component) {
    console.error(
      `[React Islands] Component "${componentName}" not found in registry.`,
      `Available components: ${getRegisteredComponents().join(', ') || 'none'}`
    );
    return;
  }

  try {
    const props = parseProps(element);
    const root = createRoot(element);
    element.dataset.reactMounted = 'true';

    root.render(
      <StrictMode>
        <Component {...props} />
      </StrictMode>
    );

    console.log(`[React Islands] Mounted "${componentName}" successfully`);
  } catch (error) {
    console.error(
      `[React Islands] Failed to mount "${componentName}":`,
      error
    );
  }
}

/**
 * Initialize all React islands on the page
 * Automatically called when DOM is ready
 */
function initializeIslands(): void {
  const islands = document.querySelectorAll<HTMLElement>('[data-react]');

  if (islands.length === 0) {
    console.log('[React Islands] No islands found on this page');
    return;
  }

  console.log(`[React Islands] Found ${islands.length} island(s) to mount`);

  islands.forEach((element) => {
    const componentName = element.dataset.react;

    if (!componentName) {
      console.warn('[React Islands] Found element with empty data-react');
      return;
    }

    if (element.dataset.reactMounted === 'true') {
      // htmx:afterSwap は document.body 全体を再スキャンするため、スワップ範囲外の
      // 既存アイランド（例: body直下の toast-listener）を毎回再マウントしてしまう。
      // createRoot() は同じコンテナに対して1回しか呼べないため、二重マウントを防ぐ。
      return;
    }

    mountComponent(element, componentName);
  });
}

/**
 * Initialize when DOM is ready
 * Works with:
 * - Standard page load
 * - htmx content swaps (htmx:afterSwap event)
 * - Alpine.js initialization
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeIslands);
} else {
  // DOM is already ready
  initializeIslands();
}

/**
 * Reinitialize islands after htmx swaps new content
 * This ensures React components work in dynamically loaded content
 */
if (typeof window.htmx !== 'undefined') {
  document.body.addEventListener('htmx:afterSwap', () => {
    console.log('[React Islands] Reinitializing after htmx swap');
    initializeIslands();
  });
}

/**
 * Export for manual mounting (if needed)
 * Usage: window.ReactIslands.mount(element, 'component-name')
 */
declare global {
  interface Window {
    ReactIslands: {
      mount: (element: HTMLElement, componentName: string) => void;
      initialize: () => void;
    };
  }
}

window.ReactIslands = {
  mount: mountComponent,
  initialize: initializeIslands,
};
