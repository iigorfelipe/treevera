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
import { NotFound } from "@/app/not-found";
import { SpecieDetailPage } from "@/app/details/specie-detail-page";
import { SettingsPage } from "@/app/settings";

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
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

const specieDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/specie-detail/$specieKey",
  component: SpecieDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  beforeLoad: () => {
    throw redirect({ to: "/settings/$section", params: { section: "account" } });
  },
});

const settingsSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/$section",
  component: SettingsPage,
});

const challengesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges",
  component: Home,
});

const challengesDailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily",
  component: Home,
});

const challengesDaily1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1",
  component: Home,
});

const challengesDaily2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2",
  component: Home,
});

const challengesDaily3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2/$level3",
  component: Home,
});

const challengesDaily4Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2/$level3/$level4",
  component: Home,
});

const challengesDaily5Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2/$level3/$level4/$level5",
  component: Home,
});

const challengesDaily6Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2/$level3/$level4/$level5/$level6",
  component: Home,
});

const challengesDaily7Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/daily/$level1/$level2/$level3/$level4/$level5/$level6/$level7",
  component: Home,
});

const challengesRandomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random",
  component: Home,
});

const challengesRandom1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1",
  component: Home,
});

const challengesRandom2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2",
  component: Home,
});

const challengesRandom3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2/$level3",
  component: Home,
});

const challengesRandom4Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2/$level3/$level4",
  component: Home,
});

const challengesRandom5Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2/$level3/$level4/$level5",
  component: Home,
});

const challengesRandom6Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2/$level3/$level4/$level5/$level6",
  component: Home,
});

const challengesRandom7Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/random/$level1/$level2/$level3/$level4/$level5/$level6/$level7",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute,
  settingsRoute,
  settingsSectionRoute,
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
  specieDetailRoute,
  challengesRoute,
  challengesDailyRoute,
  challengesDaily1Route,
  challengesDaily2Route,
  challengesDaily3Route,
  challengesDaily4Route,
  challengesDaily5Route,
  challengesDaily6Route,
  challengesDaily7Route,
  challengesRandomRoute,
  challengesRandom1Route,
  challengesRandom2Route,
  challengesRandom3Route,
  challengesRandom4Route,
  challengesRandom5Route,
  challengesRandom6Route,
  challengesRandom7Route,
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
