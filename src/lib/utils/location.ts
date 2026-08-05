/**
 * Helper to safely retrieve window.location.
 * Extracted to allow reliable mocking in unit tests.
 */
export function getWindowLocation() {
  if (typeof window === 'undefined') return null
  return window.location
}
