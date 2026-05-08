# Colitas Felices — Frontend

Frontend de la plataforma de adopcion de mascotas. Construido con Next.js 16, Tailwind CSS v3 y daisyUI 4.

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
| zxcvbn | 4.4.2 | Validacion de contrasenas |

## Notas importantes

- **Tailwind v3** — usa `postcss.config.js` con `tailwindcss: {}`. NO usar `@tailwindcss/postcss` (eso es v4).
- **daisyUI 4** — compatible con Tailwind v3. NO usar daisyUI 5 (requiere Tailwind v4).
- El tema activo es `cupcake` — configurado en `tailwind.config.js` y `app/layout.tsx`.
