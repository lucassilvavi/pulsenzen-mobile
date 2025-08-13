// Unified Jest manual mock for @expo/vector-icons
// Renders a Text element with icon name for easier querying in tests.
// Re-export to avoid duplicate manual mock warning (single source of truth in .ts file)
export * from './vector-icons';
import impl from './vector-icons';
export default impl;
