import { OfflineIndicatorWithProvider } from "./OfflineIndicator";

/**
 * Global providers wrapper for React components
 * Includes OfflineIndicator with OnlineProvider
 */
export function AppProviders() {
  return <OfflineIndicatorWithProvider />;
}
