import { lazy } from "react";
import { Home } from "@/app/home";
import { Layout } from "@/app/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { NotFound } from "@/app/not-found";

const Login = lazy(() =>
  import("@/app/auth/login").then((m) => ({ default: m.Login })),
);
const AuthCallback = lazy(() =>
  import("@/app/auth/auth-callback").then((m) => ({ default: m.AuthCallback })),
);
const SettingsPage = lazy(() =>
  import("@/app/settings").then((m) => ({ default: m.SettingsPage })),
);
const SpecieDetailPage = lazy(() =>
  import("@/app/details/specie-detail-page").then((m) => ({
    default: m.SpecieDetailPage,
  })),
);
const SpecieFavoritersPage = lazy(() =>
  import("@/app/details/specie-favoriters").then((m) => ({
    default: m.SpecieFavoritersPage,
  })),
);
const SpecieListsPage = lazy(() =>
  import("@/app/details/specie-lists-page").then((m) => ({
    default: m.SpecieListsPage,
  })),
);
const ListsPageRoute = lazy(() =>
  import("@/app/lists").then((m) => ({ default: m.ListsPageRoute })),
);
const ListDetailPageRoute = lazy(() =>
  import("@/app/lists/list-detail").then((m) => ({
    default: m.ListDetailPageRoute,
  })),
);
const ListLikesPage = lazy(() =>
  import("@/app/lists/list-likes").then((m) => ({
    default: m.ListLikesPage,
  })),
);
const ProfileRouter = lazy(() =>
  import("@/app/profile-router").then((m) => ({
    default: m.ProfileRouter,
  })),
);
const SpeciesGalleryPageRouter = lazy(() =>
  import("@/app/user-profile/species-gallery").then((m) => ({
    default: m.SpeciesGalleryPageRouter,
  })),
);
const UserListsPage = lazy(() =>
  import("@/app/user-lists").then((m) => ({ default: m.UserListsPage })),
);
const UserLikedListsPage = lazy(() =>
  import("@/app/user-liked-lists").then((m) => ({
    default: m.UserLikedListsPage,
  })),
);
const SearchPage = lazy(() =>
  import("@/app/search").then((m) => ({ default: m.SearchPage })),
);

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
      const username = store.get(authStore.userDb)?.username ?? "";
      throw redirect({ to: "/$username", params: { username } });
    }
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  beforeLoad: () => {
    throw redirect({
      to: "/settings/$section",
      params: { section: "account" },
    });
  },
});

const settingsSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/$section",
  component: SettingsPage,
});

const specieDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/specie-detail/$specieKey",
  component: SpecieDetailPage,
});

const specieFavoritersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/specie-detail/$specieKey/likes",
  component: SpecieFavoritersPage,
});

const specieListsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/specie-detail/$specieKey/lists",
  component: SpecieListsPage,
});

const listsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lists",
  component: ListsPageRoute,
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
const challengesCustomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom",
  component: Home,
});
const challengesCustom1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1",
  component: Home,
});
const challengesCustom2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2",
  component: Home,
});
const challengesCustom3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2/$level3",
  component: Home,
});
const challengesCustom4Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2/$level3/$level4",
  component: Home,
});
const challengesCustom5Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2/$level3/$level4/$level5",
  component: Home,
});
const challengesCustom6Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2/$level3/$level4/$level5/$level6",
  component: Home,
});
const challengesCustom7Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/custom/$level1/$level2/$level3/$level4/$level5/$level6/$level7",
  component: Home,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username",
  component: ProfileRouter,
});

const userSpeciesGalleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username/species-gallery",
  component: SpeciesGalleryPageRouter,
});

const userListsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username/lists",
  component: UserListsPage,
});

const userLikedListsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username/liked-lists",
  component: UserLikedListsPage,
});

const listDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username/lists/$listSlug",
  component: ListDetailPageRoute,
});

const listLikesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$username/lists/$listSlug/likes",
  component: ListLikesPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search/$query",
  component: SearchPage,
});

const routeTree = rootRoute.addChildren([
  searchRoute,
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
  specieDetailRoute,
  specieFavoritersRoute,
  specieListsRoute,
  listsRoute,
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
  challengesCustomRoute,
  challengesCustom1Route,
  challengesCustom2Route,
  challengesCustom3Route,
  challengesCustom4Route,
  challengesCustom5Route,
  challengesCustom6Route,
  challengesCustom7Route,
  userProfileRoute,
  userSpeciesGalleryRoute,
  userListsRoute,
  userLikedListsRoute,
  listDetailRoute,
  listLikesRoute,
]);

const base = import.meta.env.BASE_URL ?? "/";
const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

export const router = createRouter({
  routeTree,
  basepath: normalizedBase || "/",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
