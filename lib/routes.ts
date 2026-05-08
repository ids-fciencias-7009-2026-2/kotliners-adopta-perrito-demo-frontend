/** Rutas de la aplicacion. */
export const ROUTES = {
    HOME: "/home",
    LOGIN: "/login",
    REGISTRO: "/registro",
    PROFILE: "/profile",
    FAVORITOS: "/favoritos",
} as const;

/** Rutas publicas accesibles sin autenticacion. */
export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTRO,
];

/** Rutas protegidas que requieren autenticacion. */
export const PROTECTED_ROUTES = [
    ROUTES.HOME,
    ROUTES.PROFILE,
    ROUTES.FAVORITOS,
    ROUTES.PUBLICAR,
];
