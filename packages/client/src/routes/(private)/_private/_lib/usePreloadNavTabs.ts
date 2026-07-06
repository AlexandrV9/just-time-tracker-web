import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { preloadNavRouteChunks } from "./prefetchNavTabs";

export const usePreloadNavTabs = () => {
  const router = useRouter();

  useEffect(() => {
    preloadNavRouteChunks((opts) => router.preloadRoute(opts));
  }, [router]);
};
