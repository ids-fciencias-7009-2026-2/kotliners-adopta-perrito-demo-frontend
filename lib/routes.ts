/** Rutas de la aplicacion. */
export const ROUTES = {
    HOME: "/home",
    LOGIN: "/login",
    REGISTRO: "/registro",
    PROFILE: "/profile",
    FAVORITOS: "/favoritos",
    EXPLORAR: "/explorar",
    MIS_MASCOTAS: "/mis-mascotas",
    PUBLICAR: "/publicar",
    ANIMAL: "/animal",
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
    ROUTES.EXPLORAR,
    ROUTES.MIS_MASCOTAS,
    ROUTES.PUBLICAR,
    ROUTES.ANIMAL,
];
