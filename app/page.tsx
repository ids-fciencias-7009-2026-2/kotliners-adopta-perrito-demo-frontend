import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/**
 * Página principal que redirige a /login.
 */
export default function Page() {
    redirect(ROUTES.LOGIN);
}