/** Rutas de la aplicacion. */
export const ROUTES = {
    HOME: "/home",
    LOGIN: "/login",
    REGISTRO: "/registro",
    VERIFICAR_CORREO: "/verificar-correo",
    RECUPERAR_CONTRASENA: "/recuperar-contrasena",
    PROFILE: "/profile",
    FAVORITOS: "/favoritos",
    ANIMALS: "/animals",
    ANIMAL_DETAIL: (id: string) => `/animals/${id}`,
} as const;

/** Rutas publicas accesibles sin autenticacion. */
export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTRO,
    ROUTES.VERIFICAR_CORREO,
    ROUTES.RECUPERAR_CONTRASENA,
];

/** Rutas protegidas que requieren autenticacion. */
export const PROTECTED_ROUTES = [
    ROUTES.HOME,
    ROUTES.PROFILE,
    ROUTES.FAVORITOS,
    ROUTES.ANIMALS,
];
