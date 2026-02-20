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
import { SpeciesGalleryPage } from "@/app/profile/species-gallery";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const treeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree",
  component: Home,
});

const tree1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1",
  component: Home,
});

const tree2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2",
  component: Home,
});

const tree3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2/$level3",
  component: Home,
});

const tree4Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2/$level3/$level4",
  component: Home,
});

const tree5Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2/$level3/$level4/$level5",
  component: Home,
});

const tree6Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2/$level3/$level4/$level5/$level6",
  component: Home,
});

const tree7Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$level1/$level2/$level3/$level4/$level5/$level6/$level7",
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

    if (initialized && !isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

const speciesGalleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/species-gallery",
  component: SpeciesGalleryPage,
  beforeLoad: () => {
    const store = getDefaultStore();
    const initialized = store.get(authStore.initialized);
    const isAuthenticated = store.get(authStore.isAuthenticated);

    if (initialized && !isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

const challengesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges",
  component: Home,
});

const dailyInProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/in-progress",
  component: Home,
});

const randomInProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/in-progress",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute,
  treeRoute,
  tree1Route,
  tree2Route,
  tree3Route,
  tree4Route,
  tree5Route,
  tree6Route,
  tree7Route,
  authCallbackRoute,
  profileRoute,
  speciesGalleryRoute,
  challengesRoute,
  dailyInProgressRoute,
  randomInProgressRoute,
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
