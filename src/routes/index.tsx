import { Home } from "@/app/home";
import { Login } from "@/app/auth/login";
import { Layout } from "@/app/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { PopupCallback } from "@/app/auth/popup-callback";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const popupCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/popup-callback",
  component: PopupCallback,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute,
  popupCallbackRoute,
]);

export const router = createRouter({
  routeTree,
  basepath: "/treevera",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
