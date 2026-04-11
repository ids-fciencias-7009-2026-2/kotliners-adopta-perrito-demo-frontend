import { removeToken } from "./session";
import { ROUTES } from "@/lib/routes";

export function handleApiError(error: string, router: any) {
  if (error === "SESSION_EXPIRED") {
    removeToken();
    sessionStorage.removeItem("usuario");
    router.push(ROUTES.LOGIN);
    return;
  }

  throw new Error(error);
}