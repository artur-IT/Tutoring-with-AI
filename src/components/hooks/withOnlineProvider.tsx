import type { ComponentType } from "react";
import { OnlineProvider } from "./OnlineProvider";

/**
 * HOC that wraps a component with OnlineProvider
 * Use this for components that use useOnline hook
 */
export function withOnlineProvider<P extends object>(Component: ComponentType<P>) {
  return function WithOnlineProviderWrapper(props: P) {
    return (
      <OnlineProvider>
        <Component {...props} />
      </OnlineProvider>
    );
  };
}
