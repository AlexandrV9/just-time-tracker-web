import {
  RouterProvider as BaseRouterProvider,
  createRouter,
} from "@tanstack/react-router";

import { routeTree } from "~/routeTree.gen";

import type { RouterContext } from "./types";
import { queryClient } from "~/shared/config";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMs: 150,
  context: {
    queryClient,
  } as unknown as RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const routerContext = { queryClient };

export const RouterProvider = () => {
  return <BaseRouterProvider router={router} context={routerContext} />;
};
