# CU: Ver detalle de animal

## Version del documento

| Version | Cambios |
| --- | --- |
| 3.0 | Se agrega el caso de uso "Ver detalle de animal" para la Iteracion 3. |

## Descripcion

Permite que un usuario autenticado consulte la informacion completa de un animal registrado en la plataforma desde la vista de detalle.

## Actores

- Adoptante autenticado
- Cuidador autenticado

## Precondiciones

- El usuario inicio sesion y conserva un token valido.
- El animal existe en la base de datos.
- El backend expone `GET /animals/{id}`.

## Endpoint

- Metodo: `GET`
- Ruta: `/animals/{id}`
- Header obligatorio: `Authorization: Bearer <token>`
- Respuesta esperada: datos del animal, incluyendo identificador, nombre, especie, raza, fecha de nacimiento, sexo, descripcion, estatus, esterilizacion, datos opcionales de ubicacion/imagen y las banderas `esDueno`, `puedeEditar` y `puedeEliminar`.

## Escenario normal

1. El usuario entra a `/animals/{id}` desde el catalogo o favoritos.
2. El frontend obtiene el token de `sessionStorage`.
3. El frontend llama `GET /animals/{id}` con el header `Authorization`.
4. El backend valida el token, consulta el animal en la base de datos y devuelve el detalle.
5. El frontend muestra nombre, imagen si existe, descripcion, estatus, datos generales, ubicacion y cuidador cuando el backend los entrega.
6. Si el usuario es adoptante y el animal esta disponible, puede manifestar interes desde la vista.

## Escenarios alternos

- Si el usuario autenticado es el dueno del animal, la vista usa `esDueno` desde la respuesta para identificar el registro como propio y no muestra acciones de adoptante.
- Si el animal ya esta adoptado, la vista muestra su estatus y el boton de interes queda bloqueado.
- Si el backend devuelve una imagen, el frontend la muestra; si no, se usa un estado visual vacio sin simular datos del animal.

## Escenarios de error

- Token ausente: el frontend redirige a `/login` sin consultar el backend.
- Token invalido o expirado: el backend responde `401` o `403`, el frontend limpia la sesion y redirige a `/login`.
- Animal inexistente: el backend responde error, el frontend muestra el mensaje sin inventar informacion.
- Backend no disponible: el frontend muestra un mensaje de error de servicio.

## Reglas de negocio

- Todas las peticiones protegidas deben enviar `Authorization: Bearer <token>`.
- El frontend no debe usar animales hardcodeados ni simular respuestas.
- Las vistas que incluyan edicion o eliminacion de animales solo deben habilitar esas acciones cuando el backend responda `puedeEditar` o `puedeEliminar`.
- La validacion de dueno en frontend solo controla la interfaz; el backend tambien valida propiedad antes de editar o eliminar.
