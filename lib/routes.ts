/**
 * Rutas del sistema
 */
export const ROUTES = {
    HOME: "/home",
    LOGIN: "/login",
    REGISTRO: "/registro",
    PROFILE: "/profile",
    FAVORITOS: "/favoritos",
} as const;

/**
 * Rutas públicas.
 */
export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTRO,
];

/**
 * Rutas protegidas que requieren autenticación para acceder. 
 */
export const PROTECTED_ROUTES = [
    ROUTES.HOME,
    ROUTES.PROFILE,
    ROUTES.FAVORITOS,
];