import { Home } from "@/pages";
import { Layout } from "@/pages/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Rota raiz com layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Subrotas
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({ routeTree });

// Requerido pelo tanstack/router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
