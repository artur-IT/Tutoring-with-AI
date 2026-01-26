import { OfflineIndicatorWithProvider } from "./OfflineIndicator";
import { PwaInstallBanner } from "./PwaInstallBanner";

/**
 * Global providers wrapper for React components
 * Includes OfflineIndicator with OnlineProvider and PWA install banner
 */
export function AppProviders() {
  return (
    <>
      <OfflineIndicatorWithProvider />
      <PwaInstallBanner />
    </>
  );
}
