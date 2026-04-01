import { Home } from "@/app/home";
import { Login } from "@/app/auth/login";
import { Layout } from "@/app/layout";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { AuthCallback } from "@/app/auth/auth-callback";
import { NotFound } from "@/app/not-found";
import { SpecieDetailPage } from "@/app/details/specie-detail-page";
import { SpecieFavoritersPage } from "@/app/details/specie-favoriters";
import { SettingsPage } from "@/app/settings";
import { ListsPageRoute } from "@/app/lists";
import { ListDetailPageRoute } from "@/app/lists/list-detail";
import { ListLikesPage } from "@/app/lists/list-likes";
import { ProfileRouter } from "@/app/profile-router";
import { SpeciesGalleryPageRouter } from "@/app/user-profile/species-gallery";
import { UserListsPage } from "@/app/user-lists";

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
  path: "/specie-detail/$specieKey/favoriters",
  component: SpecieFavoritersPage,
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
  specieDetailRoute,
  specieFavoritersRoute,
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
  userProfileRoute,
  userSpeciesGalleryRoute,
  userListsRoute,
  listDetailRoute,
  listLikesRoute,
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
