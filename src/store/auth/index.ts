import { authUser, authStatus, authError } from "./atoms";
import { loginWithGoogle, logout } from "./actions";

export const authStore = {
  states: {
    authUser,
    authStatus,
    authError,
  },
  actions: {
    loginWithGoogle,
    logout,
  },
};
