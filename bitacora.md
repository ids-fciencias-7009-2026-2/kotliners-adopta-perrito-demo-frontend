# Bitácora de Desarrollo — Colitas Felices Frontend (Iteración 2)

**Proyecto:** Colitas Felices — Frontend  
**Repositorio:** kotliners-adopta-perrito-demo-frontend  
**Equipo:** Julieta Flores, José Zarco, Luis Casique, Yolanda Sánchez, Fernando Velasco  
**Fecha de inicio:** 7 de Abril de 2026  
**Fecha de entrega:** 10 de Abril de 2026  

---

## Entrada 1 — Configuración inicial del proyecto

**Fecha:** 7 de Abril de 2026  
**Tarea:** Configuración inicial del proyecto  

### Qué se hizo

- Se creó `.env.local` con la variable `NEXT_PUBLIC_API_URL=http://localhost:8080` para apuntar al backend local.
- Se agregaron dependencias de testing al `package.json`:
  - `jest` — framework de pruebas
  - `ts-jest` — soporte de TypeScript para Jest
  - `jest-environment-jsdom` — simula el navegador en Node.js (necesario para `sessionStorage`)
  - `fast-check` — librería de property-based testing
  - `@types/jest` — tipos de TypeScript para Jest
- Se agregó el script `"test": "jest --runInBand"` al `package.json`.
- Se creó `jest.config.ts` configurado con preset `ts-jest` y entorno `jest-environment-jsdom`.
- Se creó `jest.setup.ts` como archivo de inicialización de los tests.

### Por qué

El frontend necesita saber la URL del backend para hacer peticiones HTTP. Sin `.env.local`, el `apiClient.ts` no sabe a dónde conectarse. Las dependencias de testing son necesarias para validar las propiedades de corrección del sistema con `fast-check`.

### Pendiente

- Correr `npm install` para instalar las nuevas dependencias.

---

## Entrada 2 — Módulo de sesión

**Fecha:** 7 de Abril de 2026  
**Tarea:** Implementar `lib/session.ts`

### Qué se hizo

- Se creó `lib/session.ts` con tres funciones:
  - `getToken()` — lee el token de `sessionStorage` (retorna `null` si no existe o si se ejecuta en el servidor)
  - `setToken(token)` — guarda el token en `sessionStorage`
  - `removeToken()` — elimina el token de `sessionStorage`
- Se creó `lib/__tests__/session.test.ts` con pruebas de Propiedad 1 usando `fast-check`:
  - Para cualquier string, `setToken(t)` → `getToken()` devuelve `t`
  - Para cualquier string, `setToken(t)` → `removeToken()` → `getToken()` devuelve `null`

### Por qué

`sessionStorage` es el mecanismo requerido por el enunciado para almacenar el token. El check `typeof window === "undefined"` evita errores cuando Next.js ejecuta código en el servidor (donde `sessionStorage` no existe).

---

## Entrada 3 — Cliente HTTP

**Fecha:** 7 de Abril de 2026  
**Tarea:** Implementar `lib/apiClient.ts`

### Qué se hizo

- Se creó `lib/apiClient.ts` con los tipos `ApiResult<T>`, `Usuario`, `RegistroPayload`, `LoginPayload`, `ActualizarPerfilPayload` y las cinco funciones del API:
  - `registrarUsuario` → `POST /registro`
  - `loginUsuario` → `POST /login`
  - `logoutUsuario` → `POST /logout` (requiere token)
  - `obtenerPerfil` → `GET /me` (requiere token)
  - `actualizarPerfil` → `PUT /usuarios` (requiere token)
- Todas las funciones usan JSDoc estándar.
- Se creó `lib/__tests__/apiClient.test.ts` con pruebas de Propiedad 5 y 6:
  - P5: Para cualquier token, las funciones autenticadas incluyen `Authorization: Bearer <token>`
  - P6: Para cualquier respuesta 401/403, el resultado es `{ ok: false, error: "SESSION_EXPIRED" }`

### Por qué

El `apiClient.ts` centraliza toda la comunicación con el backend. Usar `ApiResult<T>` como tipo de retorno unificado permite que las páginas manejen errores de forma consistente sin try/catch dispersos. El error especial `SESSION_EXPIRED` permite que cualquier página detecte sesión expirada y redirija al login.

---

## Entrada 4 — Hook de protección de rutas

**Fecha:** 7 de Abril de 2026
**Tarea:** Implementar `lib/authGuard.ts`

### Qué se hizo

- Se creó `lib/authGuard.ts` con el hook `useAuthGuard()` que verifica si hay token en `sessionStorage` al montar el componente y redirige a `/login` si no existe.
- Se agregó `@testing-library/react` al `package.json` para poder testear hooks de React.
- Se creó `lib/__tests__/authGuard.test.ts` con pruebas de Propiedad 2:
  - Sin token → `router.replace("/login")` es llamado
  - Con token → no redirige

### Por qué

Todas las páginas protegidas (`/home`, `/perfil`, `/perfil/editar`) llaman a `useAuthGuard()` al inicio. Esto garantiza que un usuario sin sesión nunca vea contenido protegido.

---

## Entrada 5 — Componentes reutilizables

**Fecha:** 7 de Abril de 2026
**Tarea:** Implementar componentes reutilizables

### Qué se hizo

- `components/ErrorMessage.tsx` — banner de error que solo se muestra cuando `message` no es null
- `components/FormField.tsx` — input controlado con label, validación inline y estilos de error
- `components/NavBar.tsx` — barra de navegación con enlace a `/perfil` y botón de logout

### Por qué

Estos tres componentes son usados por todas las páginas. Centralizarlos evita duplicar código y garantiza que los errores siempre se muestren de forma consistente y visible para el usuario.

---
