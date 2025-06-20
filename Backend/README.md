
# Guía de Funcionamiento de la API – Renacimiento Maya (Frontend)


---

## 🔗 URL Base

- **Desarrollo Local:** `http://localhost:3000/api`
- **Nota:** Esta URL cambiará cuando se despliegue en producción.

---

## 🔐 Autenticación con JWT

- Al iniciar sesión o registrarse, el backend responde con un **token JWT**.
- Guarda este token en el **localStorage**.
- Para acceder a rutas protegidas, añade este encabezado:

```
Authorization: Bearer <el_token_aquí>
```

- Si el token es inválido o no se envía, recibirás un **401 Unauthorized**.

---

## 🧑‍🤝‍🧑 Roles de Usuario

- El objeto `user` contiene una propiedad `role` (`user` o `admin`).
- Úsalo para mostrar u ocultar elementos en la UI (por ejemplo: panel de administración).

---

## 🔁 Flujo 1: Autenticación

### 📝 Registro

**Ruta:** `POST /auth/register`  
**Body:**
```json
{
  "username": "nombre",
  "email": "correo@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta:**
- `201 Created`
- Incluye token y datos del usuario.

### 🔑 Inicio de Sesión

**Ruta:** `POST /auth/login`  
**Body:**
```json
{
  "username": "nombre",
  "password": "contraseña"
}
```

**Respuesta:**
- `200 OK`
- Incluye token y datos del usuario (incluye `role`).

---

## 🗺️ Flujo 2: Gestión de Zonas (Admin)

### 🆕 Crear Zona (con imagen)

**Ruta:** `POST /zones`  
**Encabezado:** `Authorization: Bearer <token_admin>`  
**Body:** `FormData` (no JSON)

```js
const formData = new FormData();
formData.append('name', 'Nombre de la Zona');
formData.append('municipality', 'Municipio');
formData.append('description', 'Descripción...');
formData.append('image', archivoDeImagen); // input.files[0]
```

**Importante:** No establecer `Content-Type`. El navegador lo gestiona automáticamente.

### ✏️ Editar Zona

**Ruta para obtener datos:** `GET /zones/:id`  
**Ruta para actualizar:** `PUT /zones/:id`  
**Body:**
```json
{
  "description": "Nueva descripción actualizada"
}
```

**Respuesta:** `200 OK` con los datos actualizados.

### 🗑️ Eliminar Zona

**Ruta:** `DELETE /zones/:id`  
**Encabezado:** `Authorization: Bearer <token_admin>`

**Respuesta:** `204 No Content`

---

## 🌟 Flujo 3: Favoritos y Reseñas

### ❤️ Favoritos

- **Añadir favorito:**  
  `POST /users/:userId/favorites`
  ```json
  { "zonaId": "ID_DE_LA_ZONA" }
  ```

- **Eliminar favorito:**  
  `DELETE /users/:userId/favorites/:zoneId`

- **Ver favoritos:**  
  `GET /users/:userId/favorites`

**Todos requieren el token.**

### 📝 Reseñas

- **Ruta:** `POST /zones/:zoneId/reviews`  
**Body:**
```json
{
  "rating": 4,
  "comment": "Muy bonito, pero había mucha gente."
}
```

**Respuesta:** Lista de reseñas actualizada y nueva calificación promedio.

---

## 🔍 Flujo 4: Búsqueda y Navegación

**Ruta base:** `GET /zones`

### Parámetros:
- **Buscar:** `?search=chichen`
- **Filtrar:** `?municipality=Tinum`
- **Paginación:** `?page=2&limit=12`
- **Combinado:** `?search=playa&municipality=Progreso&page=1&limit=5`

**Respuesta:**
```json
{
  "data": [...],
  "page": 1,
  "pages": 5,
  "total": 50
}
```

---

## 🔄 Flujo 5: Recuperación de Contraseña

### Paso 1: Solicitar reseteo

**Ruta:** `POST /auth/forgot-password`  
**Body:**
```json
{ "email": "correo@ejemplo.com" }
```

**Respuesta:**  
Mensaje genérico: `"Si el correo está registrado, recibirás un enlace."`

### Paso 2: Resetear contraseña

**Ruta:** `POST /auth/reset-password/:token`  
**Body:**
```json
{ "password": "nueva_contraseña" }
```

**Respuesta:**  
Nuevo token JWT y datos de usuario.

---

## ✅ Notas Finales

- Todos los endpoints protegidos requieren token en el encabezado.
- Usa `user.role` para ajustar la interfaz dinámicamente.
- Asegúrate de manejar correctamente errores HTTP (401, 403, 404, etc.).
- La API maneja subida de imágenes a imgbb automáticamente.
- La paginación es opcional, pero recomendada para optimizar rendimiento.

---

**¡Mucho éxito construyendo el frontend de Renacimiento Maya!**  
Para cualquier duda, comunícate con el desarrollador backend.
