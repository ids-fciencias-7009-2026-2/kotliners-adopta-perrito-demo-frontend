import { removeToken } from "./session";

export function handleApiError(error: string, router: any) {
  if (error === "SESSION_EXPIRED") {
    removeToken();
    sessionStorage.removeItem("usuario");
    router.push("/login");
    return;
  }

  throw new Error(error);
}