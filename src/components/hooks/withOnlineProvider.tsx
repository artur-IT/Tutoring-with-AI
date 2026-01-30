import type { ComponentType } from "react";
import { OnlineProvider } from "./OnlineProvider";

export function withOnlineProvider<P extends object>(Component: ComponentType<P>) {
  return function WithOnlineProviderWrapper(props: P) {
    return (
      <OnlineProvider>
        <Component {...props} />
      </OnlineProvider>
    );
  };
}
