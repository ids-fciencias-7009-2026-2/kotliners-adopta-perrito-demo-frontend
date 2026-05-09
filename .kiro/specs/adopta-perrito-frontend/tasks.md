# Plan de Implementación: Colitas Felices Frontend (Iteración 2)

## Visión General

Implementación completa del frontend en Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS) para la plataforma Colitas Felices. Cubre configuración inicial, módulos de sesión y cliente HTTP, protección de rutas, componentes reutilizables, cinco vistas principales y pruebas basadas en propiedades con fast-check.

## Tareas

- [x] 1. Configuración inicial del proyecto
  - Agregar la variable de entorno `NEXT_PUBLIC_API_URL` en `.env.local` con valor `http://localhost:8080`
  - Instalar `fast-check` y `@types/jest` / `jest` como dependencias de desarrollo para las pruebas de propiedades
  - Crear el archivo `jest.config.ts` con soporte para TypeScript y jsdom
  - _Requerimientos: 8.1, 8.2_

- [x] 2. Implementar `lib/session.ts`
  - [x] 2.1 Crear `lib/session.ts` con las funciones `getToken`, `setToken` y `removeToken` usando `sessionStorage` con la clave `auth_token`
    - _Requerimientos: 2.3, 7.2, 8.2, 8.3_

  - [x] 2.2 Escribir prueba de propiedad P1 para `lib/session.ts`
    - **Propiedad 1: El token solo se almacena tras login exitoso**
    - Para cualquier string `t`, `setToken(t)` seguido de `getToken()` debe devolver `t`; `removeToken()` seguido de `getToken()` debe devolver `null`
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 1: token solo se almacena tras login exitoso`
    - **Valida: Requerimientos 2.3, 8.1, 8.2**

- [x] 3. Implementar `lib/apiClient.ts`
  - [x] 3.1 Crear `lib/apiClient.ts` con el tipo `ApiResult<T>` y las cinco funciones: `registrarUsuario`, `loginUsuario`, `logoutUsuario`, `obtenerPerfil`, `actualizarPerfil`
    - Usar `process.env.NEXT_PUBLIC_API_URL` como base URL con fallback a `http://localhost:8080`
    - Incluir header `Authorization: Bearer <token>` en endpoints protegidos (`/logout`, `/me`, `/usuarios`)
    - Manejar errores de red (`TypeError`), HTTP 401/403 devolviendo `{ ok: false, error: "SESSION_EXPIRED" }`, y otros errores HTTP con el texto de la respuesta
    - _Requerimientos: 1.2, 2.2, 4.2, 6.4, 7.1, 8.1, 9.1, 9.2_

  - [x] 3.2 Escribir prueba de propiedad P5 para `lib/apiClient.ts`
    - **Propiedad 5: El API_Client incluye el token en todas las peticiones autenticadas**
    - Para cualquier token string, las funciones `logoutUsuario`, `obtenerPerfil` y `actualizarPerfil` deben incluir ese token exacto en el header `Authorization` de la petición fetch
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 5: API_Client incluye token en peticiones autenticadas`
    - **Valida: Requerimientos 4.2, 6.4, 7.1, 8.1**

  - [x] 3.3 Escribir prueba de propiedad P6 para `lib/apiClient.ts`
    - **Propiedad 6: Sesión expirada elimina token y redirige**
    - Para cualquier respuesta con status 401 o 403, el resultado debe ser `{ ok: false, error: "SESSION_EXPIRED" }`
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 6: sesión expirada elimina token y redirige`
    - **Valida: Requerimientos 4.4, 9.3**

- [x] 4. Implementar `lib/authGuard.ts`
  - [x] 4.1 Crear `lib/authGuard.ts` con el hook `useAuthGuard()` que llama a `getToken()` en `useEffect` y ejecuta `router.replace("/login")` si no hay token
    - Marcar el archivo con `"use client"`
    - _Requerimientos: 3.1, 4.1, 6.1, 8.4_

  - [x] 4.2 Escribir prueba de propiedad P2 para `lib/authGuard.ts`
    - **Propiedad 2: Las rutas protegidas redirigen sin token**
    - Para cualquier ruta protegida (`/home`, `/perfil`, `/perfil/editar`), si `getToken()` devuelve `null`, `useAuthGuard` debe llamar a `router.replace("/login")`
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 2: rutas protegidas redirigen sin token`
    - **Valida: Requerimientos 3.1, 4.1, 6.1, 8.4**

- [x] 5. Checkpoint — Verificar módulos base
  - Asegurarse de que todos los tests pasen y que los módulos `session.ts`, `apiClient.ts` y `authGuard.ts` compilen sin errores. Consultar al usuario si hay dudas.

- [x] 6. Implementar componentes reutilizables
  - [x] 6.1 Crear `components/ErrorMessage.tsx` — recibe `message: string | null` y renderiza un banner de error visible solo cuando `message` no es null
    - _Requerimientos: 9.2, 9.4_

  - [x] 6.2 Crear `components/FormField.tsx` — input controlado con props `label`, `name`, `type`, `value`, `onChange` y `error`; muestra el mensaje de error debajo del campo cuando `error` no es null
    - _Requerimientos: 1.5, 2.6, 6.7, 9.4_

  - [x] 6.3 Crear `components/NavBar.tsx` — barra de navegación con enlace a `/perfil` y botón de logout que llama a `onLogout: () => void`
    - _Requerimientos: 3.3, 3.4, 4.5_

- [x] 7. Implementar `app/registro/page.tsx`
  - Crear `app/registro/page.tsx` como Client Component con formulario controlado para los campos: `username`, `curp`, `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `codigo_postal`, `password`
  - Validar campos obligatorios en cliente antes de llamar al backend; mostrar errores inline con `FormField` y banner con `ErrorMessage`
  - Al enviar, llamar a `registrarUsuario` del `apiClient`; en éxito redirigir a `/login`; en error mostrar mensaje descriptivo
  - _Requerimientos: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.4_

- [x] 8. Implementar `app/login/page.tsx`
  - Crear `app/login/page.tsx` como Client Component con formulario para `username` y `password`
  - Validar campos vacíos en cliente; al enviar llamar a `loginUsuario`; en éxito llamar a `setToken` y redirigir a `/home`; en error mostrar mensaje con `ErrorMessage`
  - Incluir enlace a `/registro`
  - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.4_

- [x] 9. Checkpoint — Verificar flujo de autenticación
  - Asegurarse de que los tests pasen y que las vistas `/registro` y `/login` compilen sin errores TypeScript. Consultar al usuario si hay dudas.

- [ ] 10. Implementar `app/home/page.tsx`
  - Crear `app/home/page.tsx` como Client Component que llama a `useAuthGuard()` al inicio
  - Mostrar mensaje de bienvenida, `NavBar` con handler de logout (llama a `logoutUsuario`, luego `removeToken`, redirige a `/login`)
  - _Requerimientos: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Implementar `app/perfil/page.tsx`
  - Crear `app/perfil/page.tsx` como Client Component que llama a `useAuthGuard()` al inicio
  - En `useEffect`, llamar a `obtenerPerfil` con el token; mostrar los campos: `username`, `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `curp`, `codigo_postal`, `rol`
  - Si la respuesta es `SESSION_EXPIRED`, llamar a `removeToken` y redirigir a `/login` con mensaje de sesión expirada
  - Incluir enlace a `/perfil/editar` y `NavBar` con logout
  - _Requerimientos: 4.1, 4.2, 4.3, 4.4, 4.5, 9.3_

- [ ] 12. Implementar `app/perfil/editar/page.tsx`
  - Crear `app/perfil/editar/page.tsx` como Client Component que llama a `useAuthGuard()` al inicio
  - Pre-cargar formulario con datos actuales obtenidos de `obtenerPerfil`; campos editables: `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `codigo_postal`, `foto_perfil`
  - Validar campos obligatorios en cliente; al enviar llamar a `actualizarPerfil`; en éxito mostrar mensaje de confirmación; en error mostrar `ErrorMessage`
  - _Requerimientos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.2, 9.4_

- [ ] 13. Actualizar `app/page.tsx`
  - Reemplazar el contenido por defecto de `app/page.tsx` con un Client Component que en `useEffect` llame a `getToken()` y redirija a `/home` si hay token o a `/login` si no hay token
  - _Requerimientos: 8.4_

- [ ] 14. Checkpoint — Verificar vistas protegidas
  - Asegurarse de que todos los tests pasen y que las vistas `/home`, `/perfil` y `/perfil/editar` compilen sin errores TypeScript. Consultar al usuario si hay dudas.

- [ ] 15. Escribir pruebas de propiedades P3 y P4
  - [ ]* 15.1 Escribir prueba de propiedad P3 — logout siempre elimina el token
    - **Propiedad 3: El logout siempre elimina el token**
    - Para cualquier respuesta del backend (éxito, error de red, timeout), el handler de logout debe llamar a `removeToken()` y redirigir a `/login`
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 3: logout siempre elimina el token`
    - **Valida: Requerimientos 7.2, 7.3, 7.4**

  - [ ]* 15.2 Escribir prueba de propiedad P4 — formularios no envían con campos vacíos
    - **Propiedad 4: Los formularios no envían peticiones con campos obligatorios vacíos**
    - Para cualquier combinación de campos donde al menos uno esté vacío o sea solo espacios en blanco, no debe realizarse ninguna llamada a `fetch`
    - Etiquetar: `// Feature: adopta-perrito-frontend, Property 4: formularios no envían con campos obligatorios vacíos`
    - **Valida: Requerimientos 1.5, 2.6, 6.7**

- [ ] 16. Checkpoint final — Verificar implementación completa
  - Asegurarse de que todos los tests pasen y que el proyecto compile sin errores con `next build`. Consultar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requerimientos específicos para trazabilidad
- Los checkpoints garantizan validación incremental
- Las pruebas de propiedades validan invariantes universales con fast-check (mínimo 100 iteraciones por propiedad)
- El diseño técnico completo está en `.kiro/specs/adopta-perrito-frontend/design.md`
