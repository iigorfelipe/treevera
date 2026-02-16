import { Home } from "@/app/home";
import { Login } from "@/app/auth/login";
import { Layout } from "@/app/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Profile } from "@/app/profile";
import { getDefaultStore } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { AuthCallback } from "@/app/auth/auth-callback";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth-callback",
  component: AuthCallback,
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
    const initialized = store.get(authStore.initialized);
    const isAuthenticated = store.get(authStore.isAuthenticated);

    console.log("🔍 beforeLoad check:", { initialized, isAuthenticated });

    if (initialized && !isAuthenticated) {
      console.log("❌ Redirecting to login");
      throw redirect({ to: "/login" });
    }
  },
});

const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute,
  authCallbackRoute,
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
