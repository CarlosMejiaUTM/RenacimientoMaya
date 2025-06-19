# API Renacimiento Maya- Documentación Completa (v3.0)

Bienvenido a la documentación oficial de la API para la aplicación de Zonas Turísticas de Yucatán. Esta API RESTful está construida con Node.js, Express, y MongoDB, y está diseñada para ser robusta, segura y escalable.

## Tabla de Contenidos
1. [Características Principales](#características-principales)
2. [Configuración Inicial](#configuración-inicial)
3. [Conceptos Generales de la API](#conceptos-generales-de-la-api)
    - https://base.org/(#url-base)
    - [Autenticación JWT](#autenticación-jwt)
    - [Formato de Respuestas](#formato-de-respuestas)
    - [Paginación](#paginación)
4. [Documentación de Endpoints](#documentación-de-endpoints)
    - [Autenticación](#1-autenticación-auth)
    - [Zonas Turísticas](#2-zonas-turísticas-zones)
    - [Reseñas y Calificaciones](#3-reseñas-y-calificaciones-reviews)
    - [Favoritos de Usuario](#4-favoritos-de-usuario-users)
5. [Consideraciones Adicionales](#consideraciones-adicionales)

## Características Principales

* **Autenticación Segura con Roles (JWT):** Sistema de registro y login para `usuarios` y `administradores`, protegiendo rutas según el rol.
* **Gestión Completa de Zonas (CRUD):** Los administradores pueden crear, leer, actualizar y eliminar zonas turísticas.
* **Subida de Imágenes a la Nube:** Integración con **imgbb** para el manejo de imágenes, subiendo archivos directamente a través de la API.
* **Sistema de Calificaciones y Reseñas:** Los usuarios pueden calificar (1-5 estrellas) y dejar comentarios en las zonas. El rating promedio se calcula automáticamente.
* **Búsqueda, Filtrado y Paginación:** Búsqueda por texto, filtro por municipio y un sistema de paginación para manejar grandes cantidades de datos de manera eficiente.
* **Gestión de Favoritos:** Los usuarios pueden añadir y eliminar zonas de su lista personal de favoritos.
* **Recuperación de Contraseña:** Flujo completo de "Olvidé mi contraseña" mediante el envío de tokens seguros por correo electrónico.

## Configuración Inicial

Para ejecutar este proyecto en un entorno de desarrollo local, sigue estos pasos:

1.  **Prerrequisitos:** Tener instalado Node.js (v16+) y tener acceso a una base de datos de MongoDB (se recomienda una cuenta gratuita en MongoDB Atlas).
2.  **Clonar el repositorio:** `git clone <url-del-repositorio>`
3.  **Instalar dependencias:**
    ```bash
    npm install
    ```
4.  **Crear archivo de entorno:** Crea un archivo `.env` en la raíz del proyecto y usa la siguiente plantilla.
5.  **Configurar variables de entorno:** Rellena el archivo `.env` con tus propias credenciales.
    
    **Plantilla `.env`**
    ```ini
    PORT=3000
    MONGO_URI=TU_CADENA_DE_CONEXION_A_MONGODB_ATLAS
    JWT_SECRET=UNA_FRASE_SECRETA_MUY_LARGA_Y_ALEATORIA
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=TU_CORREO_DE_GMAIL@gmail.com
    EMAIL_PASS=TU_CONTRASEÑA_DE_APLICACION_DE_GOOGLE
    FRONTEND_URL=http://localhost:3000 # O la URL de tu app frontend
    IMGBB_API_KEY=TU_API_KEY_DE_IMGBB
    ```
6.  **Iniciar el servidor:**
    ```bash
    npm run dev # (Asegúrate de tener "dev": "nodemon server.js" en tu package.json)
    ```

## Conceptos Generales de la API

### URL Base
Todas las peticiones a la API deben usar la siguiente URL base:
`http://localhost:3000/api`

### Autenticación JWT
La mayoría de los endpoints requieren autenticación. El proceso es:
1.  Obtén un token JWT al registrarte (`POST /auth/register`) o iniciar sesión (`POST /auth/login`).
2.  Almacena este token de forma segura en tu aplicación cliente.
3.  Para cada petición a una ruta protegida, incluye el token en el encabezado `Authorization`.

**Ejemplo de encabezado:**
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Formato de Respuestas
* **Éxito (`2xx`):** Las respuestas exitosas siguen una estructura consistente.
    ```json
    {
        "status": "success",
        "data": { ... } // El objeto o array de datos solicitado
    }
    ```
* **Error (`4xx`, `5xx`):** Las respuestas de error proporcionan un mensaje claro.
    ```json
    {
        "message": "Descripción específica del error."
    }
    ```

### Paginación
El endpoint `GET /zones` utiliza paginación. La respuesta incluirá metadatos para ayudarte a construir la interfaz de paginación:
```json
{
    "status": "success",
    "results": 10, // Número de resultados en la página actual
    "page": 1,     // Página actual
    "pages": 5,    // Número total de páginas
    "total": 50,   // Número total de resultados
    "data": [ ... ]
}
Documentación de Endpoints
1. Autenticación (/auth)
POST /auth/register
Descripción: Registra un nuevo usuario.
Autenticación: No requerida.
Cuerpo (Body): json
JSON

{
    "username": "usuario_nuevo",
    "email": "nuevo@correo.com",
    "password": "password123"
}
Respuesta Exitosa (201): Devuelve el token y los datos del nuevo usuario.
POST /auth/login
Descripción: Inicia sesión para un usuario o administrador.
Autenticación: No requerida.
Cuerpo (Body): json
JSON

{
    "username": "usuario_existente",
    "password": "password123"
}
Respuesta Exitosa (200): Devuelve el token y los datos del usuario, incluyendo su rol.
POST /auth/forgot-password
Descripción: Inicia el proceso de reseteo de contraseña. Envía un email al usuario con un token.
Autenticación: No requerida.
Cuerpo (Body): json
JSON

{
    "email": "correo_registrado@ejemplo.com"
}
Respuesta Exitosa (200): { "status": "success", "message": "Token enviado al correo electrónico." }
POST /auth/reset-password/:token
Descripción: Establece una nueva contraseña usando el token recibido por email.
Autenticación: No requerida.
Parámetros de URL: :token - El token enviado por correo.
Cuerpo (Body): json
JSON

{
    "password": "mi_nueva_contraseña_segura"
}
Respuesta Exitosa (200): Devuelve un nuevo token JWT para iniciar sesión automáticamente.
2. Zonas Turísticas (/zones)
GET /zones
Descripción: Obtiene una lista paginada de todas las zonas. Soporta búsqueda y filtrado.
Autenticación: No requerida.
Query Params (Opcionales):
search (String): Busca texto en el nombre de la zona.
municipality (String): Filtra por el nombre exacto del municipio.
page (Number): Número de página a solicitar (defecto: 1).
limit (Number): Número de resultados por página (defecto: 10).
Respuesta Exitosa (200): Devuelve un objeto con metadatos de paginación y un array de zonas.
POST /zones
Descripción: Crea una nueva zona turística.
Autenticación: Requerida (Rol: admin).
Cuerpo (Body): multipart/form-data
name (String)
municipality (String)
description (String)
image (File): El archivo de imagen a subir.
Respuesta Exitosa (201): Devuelve el objeto de la zona recién creada.
GET /zones/:id
Descripción: Obtiene los detalles de una única zona turística, incluyendo sus reseñas.
Autenticación: No requerida.
Parámetros de URL: :id - El ID de la zona.
Respuesta Exitosa (200): Devuelve el objeto de la zona solicitada.
PUT /zones/:id
Descripción: Actualiza los datos de una zona existente.
Autenticación: Requerida (Rol: admin).
Parámetros de URL: :id - El ID de la zona a actualizar.
Cuerpo (Body): json con los campos a modificar (ej. name, description).
Respuesta Exitosa (200): Devuelve el objeto de la zona actualizada.
DELETE /zones/:id
Descripción: Elimina una zona turística y todas sus reseñas asociadas.
Autenticación: Requerida (Rol: admin).
Parámetros de URL: :id - El ID de la zona a eliminar.
Respuesta Exitosa (204): No devuelve contenido.
3. Reseñas y Calificaciones (/reviews)
Nota: Las rutas para crear y obtener reseñas están anidadas bajo /zones para un mejor contexto. Las rutas para editar y borrar son directas a /reviews.

POST /zones/:zoneId/reviews
Descripción: Crea una nueva reseña para una zona específica.
Autenticación: Requerida (Rol: user).
Parámetros de URL: :zoneId - El ID de la zona a reseñar.
Cuerpo (Body): json
JSON

{
    "rating": 5,
    "comment": "¡Un lugar increíble!"
}
Respuesta Exitosa (201): Devuelve el objeto de la reseña creada.
Respuesta de Error (409): Si el usuario ya ha reseñado esa zona.
GET /zones/:zoneId/reviews
Descripción: Obtiene todas las reseñas de una zona específica.
Autenticación: No requerida.
Respuesta Exitosa (200): Devuelve un array con las reseñas de la zona.
PUT /reviews/:id
Descripción: Actualiza una reseña existente. Un usuario solo puede editar su propia reseña.
Autenticación: Requerida (Dueño de la reseña).
Parámetros de URL: :id - El ID de la reseña a actualizar.
Cuerpo (Body): json con los campos a modificar (rating, comment).
Respuesta Exitosa (200): Devuelve el objeto de la reseña actualizada.
DELETE /reviews/:id
Descripción: Elimina una reseña. Un usuario puede borrar la suya, un admin puede borrar cualquiera.
Autenticación: Requerida (Dueño de la reseña o Rol: admin).
Parámetros de URL: :id - El ID de la reseña a eliminar.
Respuesta Exitosa (204): No devuelve contenido.
4. Favoritos de Usuario (/users)
GET /users/:userId/favorites
Descripción: Obtiene la lista de zonas favoritas de un usuario.
Autenticación: Requerida. Un usuario solo puede acceder a sus propios favoritos.
Parámetros de URL: :userId - El ID del usuario.
Respuesta Exitosa (200): Devuelve un array con los objetos de las zonas favoritas.
POST /users/:userId/favorites
Descripción: Añade una zona a la lista de favoritos de un usuario.
Autenticación: Requerida.
Cuerpo (Body): json
JSON

{
    "zonaId": "ID_DE_LA_ZONA_A_AÑADIR"
}
Respuesta Exitosa (200): { "message": "Favorito agregado exitosamente." }
DELETE /users/:userId/favorites/:zoneId
Descripción: Elimina una zona de la lista de favoritos de un usuario.
Autenticación: Requerida.
Parámetros de URL: :userId y :zoneId.
Respuesta Exitosa (200): { "message": "Favorito eliminado exitosamente." }