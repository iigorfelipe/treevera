import {
  sessionAtom,
  userDbAtom,
  loginStatusAtom,
  logoutStatusAtom,
  authErrorAtom,
  authInitializedAtom,
  isAuthenticatedAtom,
} from "./atoms";

export const authStore = {
  session: sessionAtom,
  userDb: userDbAtom,
  loginStatus: loginStatusAtom,
  logoutStatus: logoutStatusAtom,
  error: authErrorAtom,
  initialized: authInitializedAtom,
  isAuthenticated: isAuthenticatedAtom,
};
