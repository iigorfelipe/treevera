import { Home } from "@/app/home";
import { Login } from "@/app/auth/login";
import { Layout } from "@/app/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { PopupCallback } from "@/app/auth/popup-callback";
import { Profile } from "@/app/profile";
import { getDefaultStore } from "jotai";
import { authStore } from "@/store/auth";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const popupCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/popup-callback",
  component: PopupCallback,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: () => {
    const store = getDefaultStore();
    const initialized = store.get(authStore.initialized);
    const isAuthenticated = store.get(authStore.isAuthenticated);

    if (initialized && isAuthenticated) {
      throw redirect({ to: "/profile" });
    }
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
  beforeLoad: () => {
    const store = getDefaultStore();
    const userDb = store.get(authStore.userDb);
    const initialized = store.get(authStore.initialized);
    const isAuthenticated = store.get(authStore.isAuthenticated);

    if (!initialized) {
      return;
    }
    if (!isAuthenticated && !userDb) {
      throw redirect({ to: "/login" });
    }
  },
});

const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute,
  popupCallbackRoute,
  profileRoute,
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
