# Documento de Requerimientos — Colitas Felices (Iteración 2)

## Introducción

Colitas Felices es una plataforma web de adopción de mascotas. La Iteración 1 estableció el backend con autenticación de usuarios (registro, login, logout y consulta del perfil autenticado). La Iteración 2 extiende el sistema con la implementación completa del frontend en Next.js y un nuevo endpoint de actualización de perfil en el backend.

El frontend consume la API REST del backend mediante `fetch` o `axios`, gestiona la sesión del usuario a través de `sessionStorage` y protege las rutas que requieren autenticación.

---

## Glosario

- **Sistema**: El conjunto completo de la plataforma Colitas Felices (frontend + backend).
- **Frontend**: Aplicación web desarrollada en Next.js (React, TypeScript, Tailwind CSS).
- **Backend**: Servicio REST desarrollado en Kotlin + Spring Boot + PostgreSQL + Hibernate.
- **API_Client**: Módulo del frontend responsable de realizar peticiones HTTP al Backend.
- **Auth_Guard**: Mecanismo del frontend que verifica la existencia de un token válido en `sessionStorage` antes de permitir el acceso a rutas protegidas.
- **Session_Storage**: Almacenamiento de sesión del navegador (`sessionStorage`) donde se persiste el token de autenticación.
- **Token**: Cadena de texto generada por el Backend al autenticar un usuario, usada para autorizar peticiones subsecuentes.
- **Usuario**: Persona registrada en la plataforma con los atributos: `IDUsuario`, `curp`, `username`, `rol`, `foto_perfil`, `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `codigo_postal`, `password`, `token`.
- **Vista_Registro**: Página del Frontend con el formulario para crear una cuenta de Usuario.
- **Vista_Login**: Página del Frontend con el formulario para iniciar sesión.
- **Vista_Home**: Página principal del Frontend visible tras autenticarse.
- **Vista_Perfil**: Página del Frontend que muestra la información del Usuario autenticado.
- **Vista_Actualizar_Perfil**: Página del Frontend con el formulario para modificar la información del Usuario.
- **Endpoint_Registro**: `POST /registro` — crea un nuevo Usuario en el Backend.
- **Endpoint_Login**: `POST /login` — autentica al Usuario y devuelve un Token.
- **Endpoint_Logout**: `POST /logout` — invalida el Token activo del Usuario.
- **Endpoint_Me**: `GET /me` — devuelve la información del Usuario autenticado.
- **Endpoint_Actualizar_Usuario**: `PUT /usuarios` — actualiza la información del Usuario autenticado.

---

## Requerimientos

### Requerimiento 1: Registro de usuario

**User Story:** Como visitante, quiero crear una cuenta en Colitas Felices, para poder acceder a la plataforma.

#### Criterios de Aceptación

1. THE Vista_Registro SHALL mostrar un formulario con los campos: `username`, `curp`, `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `codigo_postal` y `password`.
2. WHEN el visitante envía el formulario con todos los campos válidos, THE API_Client SHALL enviar una petición `POST /registro` al Backend con los datos del formulario.
3. WHEN el Backend responde con éxito al registro, THE Frontend SHALL redirigir al visitante a la Vista_Login.
4. IF el Backend responde con un error de validación, THEN THE Vista_Registro SHALL mostrar un mensaje de error descriptivo visible para el usuario.
5. IF el visitante envía el formulario con campos obligatorios vacíos, THEN THE Vista_Registro SHALL mostrar un mensaje de error indicando los campos faltantes sin enviar la petición al Backend.

---

### Requerimiento 2: Inicio de sesión

**User Story:** Como usuario registrado, quiero iniciar sesión con mis credenciales, para acceder a las funcionalidades protegidas de la plataforma.

#### Criterios de Aceptación

1. THE Vista_Login SHALL mostrar un formulario con los campos `username` y `password`.
2. WHEN el usuario envía el formulario con credenciales válidas, THE API_Client SHALL enviar una petición `POST /login` al Backend.
3. WHEN el Backend responde con éxito y devuelve un Token, THE Session_Storage SHALL almacenar el Token recibido.
4. WHEN el Token es almacenado en Session_Storage, THE Frontend SHALL redirigir al usuario a la Vista_Home.
5. IF el Backend responde con error de credenciales incorrectas, THEN THE Vista_Login SHALL mostrar un mensaje de error visible indicando que las credenciales son inválidas.
6. IF el usuario envía el formulario con campos vacíos, THEN THE Vista_Login SHALL mostrar un mensaje de error sin enviar la petición al Backend.

---

### Requerimiento 3: Vista principal (Home)

**User Story:** Como usuario autenticado, quiero ver una página principal después de iniciar sesión, para navegar hacia las funcionalidades de la plataforma.

#### Criterios de Aceptación

1. WHILE el usuario no tiene un Token válido en Session_Storage, THE Auth_Guard SHALL redirigir al usuario a la Vista_Login al intentar acceder a la Vista_Home.
2. WHEN el usuario accede a la Vista_Home con un Token válido en Session_Storage, THE Vista_Home SHALL mostrarse correctamente.
3. THE Vista_Home SHALL incluir un enlace o botón de navegación hacia la Vista_Perfil.
4. THE Vista_Home SHALL incluir un control para ejecutar la acción de Logout.

---

### Requerimiento 4: Visualización del perfil

**User Story:** Como usuario autenticado, quiero ver mi información de perfil, para verificar mis datos registrados en la plataforma.

#### Criterios de Aceptación

1. WHILE el usuario no tiene un Token válido en Session_Storage, THE Auth_Guard SHALL redirigir al usuario a la Vista_Login al intentar acceder a la Vista_Perfil.
2. WHEN el usuario accede a la Vista_Perfil, THE API_Client SHALL enviar una petición `GET /me` al Backend incluyendo el Token en el header `Authorization`.
3. WHEN el Backend responde con éxito, THE Vista_Perfil SHALL mostrar los atributos del Usuario: `username`, `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `curp`, `codigo_postal` y `rol`.
4. IF el Backend responde con error de sesión expirada o Token inválido, THEN THE Auth_Guard SHALL eliminar el Token de Session_Storage y redirigir al usuario a la Vista_Login con un mensaje de error visible.
5. THE Vista_Perfil SHALL incluir un enlace o botón de navegación hacia la Vista_Actualizar_Perfil.

---

### Requerimiento 5: Actualización de información del usuario (nuevo endpoint)

**User Story:** Como usuario autenticado, quiero actualizar mi información de perfil, para mantener mis datos al día en la plataforma.

#### Criterios de Aceptación

1. THE Endpoint_Actualizar_Usuario SHALL recibir una petición `PUT /usuarios` con el Token en el header `Authorization` y los campos a actualizar en el cuerpo de la petición.
2. WHEN el Backend recibe una petición `PUT /usuarios` con Token válido, THE Backend SHALL actualizar los atributos del Usuario autenticado en la base de datos y devolver la información actualizada.
3. IF el Token enviado en la petición `PUT /usuarios` es inválido o está ausente, THEN THE Backend SHALL responder con un código de error de autenticación.
4. IF los datos enviados en la petición `PUT /usuarios` no cumplen las validaciones del Backend, THEN THE Backend SHALL responder con un mensaje de error descriptivo.

---

### Requerimiento 6: Formulario de actualización de perfil

**User Story:** Como usuario autenticado, quiero modificar mi información desde un formulario, para actualizar mis datos sin necesidad de contactar soporte.

#### Criterios de Aceptación

1. WHILE el usuario no tiene un Token válido en Session_Storage, THE Auth_Guard SHALL redirigir al usuario a la Vista_Login al intentar acceder a la Vista_Actualizar_Perfil.
2. WHEN el usuario accede a la Vista_Actualizar_Perfil, THE Frontend SHALL pre-cargar el formulario con los datos actuales del Usuario obtenidos del Endpoint_Me.
3. THE Vista_Actualizar_Perfil SHALL mostrar un formulario con los campos modificables: `nombres`, `apellido_paterno`, `apellido_materno`, `email`, `codigo_postal` y `foto_perfil`.
4. WHEN el usuario envía el formulario con datos válidos, THE API_Client SHALL enviar una petición `PUT /usuarios` al Backend incluyendo el Token en el header `Authorization`.
5. WHEN el Backend responde con éxito a la actualización, THE Frontend SHALL mostrar un mensaje de confirmación visible al usuario.
6. IF el Backend responde con error, THEN THE Vista_Actualizar_Perfil SHALL mostrar un mensaje de error descriptivo visible al usuario.
7. IF el usuario envía el formulario con campos obligatorios vacíos, THEN THE Vista_Actualizar_Perfil SHALL mostrar un mensaje de error sin enviar la petición al Backend.

---

### Requerimiento 7: Cierre de sesión (Logout)

**User Story:** Como usuario autenticado, quiero cerrar mi sesión activa, para proteger mi cuenta al terminar de usar la plataforma.

#### Criterios de Aceptación

1. WHEN el usuario ejecuta la acción de Logout, THE API_Client SHALL enviar una petición `POST /logout` al Backend incluyendo el Token en el header `Authorization`.
2. WHEN el Backend responde con éxito al Logout, THE Session_Storage SHALL eliminar el Token almacenado.
3. WHEN el Token es eliminado de Session_Storage, THE Frontend SHALL redirigir al usuario a la Vista_Login.
4. IF el Backend responde con error durante el Logout, THEN THE Session_Storage SHALL eliminar el Token de todas formas y THE Frontend SHALL redirigir al usuario a la Vista_Login.

---

### Requerimiento 8: Gestión del token de autenticación

**User Story:** Como usuario autenticado, quiero que mis peticiones al backend incluyan mi token de sesión automáticamente, para no tener que autenticarme en cada acción.

#### Criterios de Aceptación

1. THE API_Client SHALL incluir el Token almacenado en Session_Storage en el header `Authorization` de todas las peticiones a endpoints protegidos del Backend.
2. THE Session_Storage SHALL ser el único mecanismo de persistencia del Token en el Frontend (no `localStorage` ni cookies).
3. WHEN el usuario cierra la pestaña o ventana del navegador, THE Session_Storage SHALL eliminar automáticamente el Token al finalizar la sesión del navegador.
4. IF Session_Storage no contiene un Token al intentar acceder a una ruta protegida, THEN THE Auth_Guard SHALL redirigir al usuario a la Vista_Login.

---

### Requerimiento 9: Manejo de errores visible para el usuario

**User Story:** Como usuario, quiero ver mensajes de error claros cuando algo falla, para entender qué ocurrió y cómo proceder.

#### Criterios de Aceptación

1. IF el API_Client no puede establecer conexión con el Backend, THEN THE Frontend SHALL mostrar un mensaje de error indicando que el servicio no está disponible.
2. IF el Backend responde con un error de validación en cualquier formulario, THEN THE Frontend SHALL mostrar el mensaje de error recibido en la vista correspondiente.
3. IF el Backend responde con error de sesión expirada en cualquier petición autenticada, THEN THE Frontend SHALL mostrar un mensaje indicando que la sesión expiró y redirigir al usuario a la Vista_Login.
4. THE Frontend SHALL mostrar todos los mensajes de error en un elemento visible dentro de la vista activa, sin requerir que el usuario abra consola del navegador o herramientas de desarrollo.

---

## Tecnologías

### Backend
- Kotlin
- Spring Boot
- PostgreSQL
- Hibernate (ORM)
- Arquitectura MVC en capas: Controller, Service, Repository

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- `fetch` nativo o `axios` para consumo de la API

---

## Limitaciones actuales (Iteración 2)

- El frontend no implementa internacionalización (i18n); todos los textos están en español.
- No se implementa recuperación de contraseña en esta iteración.
- No se implementa gestión de mascotas ni flujo de adopción en esta iteración; el alcance se limita a la gestión de usuarios.
- La foto de perfil (`foto_perfil`) se maneja como URL de texto; no se implementa carga de archivos en esta iteración.
- No se implementan pruebas automatizadas de integración end-to-end en esta iteración.
