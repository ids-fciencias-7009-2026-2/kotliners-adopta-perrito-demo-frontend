# Colitas Felices - Frontend

Frontend del proyecto Colitas Felices. Next.js 16, Tailwind CSS v3, daisyUI 4.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raiz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Desarrollo

```bash
npm run dev
```

La app estara disponible en `http://localhost:3000`.

## Dependencias principales

| Paquete | Version | Uso |
|---------|---------|-----|
| next | 16.2.1 | Framework |
| react | 19.2.4 | UI |
| tailwindcss | ^3.4.4 | Estilos |
| daisyui | 4.12.24 | Componentes UI |
| lucide-react | ^1.7.0 | Iconos |
| cally | 0.9.2 | Calendario (web component) |
| react-day-picker | 8.10.2 | Calendario alternativo |
| @cloudinary/react | 1.14.4 | Imagenes optimizadas |
| @cloudinary/url-gen | 1.22.0 | Transformaciones Cloudinary |
| axios | ^1.15.0 | HTTP client |
| zxcvbn | 4.4.2 | Validacion de contraseñas |

## Notas importantes

- **Tailwind v3** — usa `postcss.config.js` con `tailwindcss: {}`. NO usar `@tailwindcss/postcss` (eso es v4).
- **daisyUI 4** — compatible con Tailwind v3. NO usar daisyUI 5 (requiere Tailwind v4).
- El tema activo es `cupcake` — configurado en `tailwind.config.js` y `app/layout.tsx`.
- **Leaflet y MarkerCluster** se cargan desde CDN (unpkg) en `app/layout.tsx`. No requieren instalación npm.

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Pública | Inicio de sesión con 2FA |
| `/registro` | Pública | Registro de cuenta |
| `/recuperar` | Pública | Recuperar contraseña |
| `/guia` | Pública | Guía informativa de la plataforma |
| `/home` | Autenticado | Página principal |
| `/explorar` | Adoptante | Mapa + lista de animales con filtros |
| `/favoritos` | Adoptante | Animales en los que manifesté interés |
| `/mis-mascotas` | Cuidador | Gestión de publicaciones + historial adoptados |
| `/publicar` | Cuidador | Formulario de nueva publicación |
| `/profile` | Autenticado | Perfil y eliminación de cuenta |
| `/admin` | Administrador | Panel de reportes pendientes |

## Roles

- **ADOPTANTE**: Explora, filtra, manifiesta interés, reporta publicaciones
- **CUIDADOR**: Publica, edita, elimina animales, ve interesados, marca adoptados
- **ADMINISTRADOR**: Revisa reportes, elimina/desestima publicaciones
