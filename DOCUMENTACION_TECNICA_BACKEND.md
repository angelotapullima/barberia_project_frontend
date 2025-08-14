# Documentación Técnica del Backend

## 1. Información General

- **Stack:** Node.js, Express, TypeScript
- **Base de Datos:** SQLite (archivo: `barberia.sqlite`)
- **Estructura:** `Routes -> Controllers -> Services`

---

## 2. Esquema de la Base de Datos

A continuación se detalla la estructura de cada tabla en la base de datos SQLite.

### Tabla: `users`

Almacena la información de los usuarios del sistema.

| Columna      | Tipo    | Restricciones             | Descripción                                  |
| ------------ | ------- | ------------------------- | -------------------------------------------- |
| `id`         | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único del usuario.             |
| `name`       | TEXT    | NOT NULL                  | Nombre del usuario.                          |
| `email`      | TEXT    | NOT NULL UNIQUE           | Correo electrónico del usuario (único).      |
| `password`   | TEXT    | NOT NULL                  | Contraseña hasheada del usuario.             |
| `role`       | TEXT    | NOT NULL DEFAULT 'cajero' | Rol del usuario ('administrador', 'cajero'). |
| `created_at` | TEXT    | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro.              |
| `updated_at` | TEXT    | DEFAULT CURRENT_TIMESTAMP | Fecha de última actualización.               |

### Tabla: `settings`

Almacena configuraciones clave-valor de la aplicación.

| Columna         | Tipo | Restricciones | Descripción                      |
| --------------- | ---- | ------------- | -------------------------------- |
| `setting_key`   | TEXT | PRIMARY KEY   | Clave única de la configuración. |
| `setting_value` | TEXT |               | Valor de la configuración.       |

### Tabla: `barbers`

Almacena la información de los barberos.

| Columna       | Tipo    | Restricciones              | Descripción                            |
| ------------- | ------- | -------------------------- | -------------------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT  | Identificador único del barbero.       |
| `name`        | TEXT    | NOT NULL                   | Nombre completo del barbero.           |
| `email`       | TEXT    | UNIQUE                     | Correo electrónico (opcional, único).  |
| `phone`       | TEXT    |                            | Teléfono de contacto (opcional).       |
| `specialty`   | TEXT    |                            | Especialidad del barbero (opcional).   |
| `photo_url`   | TEXT    |                            | URL a una foto del barbero (opcional). |
| `station_id`  | INTEGER | FOREIGN KEY `stations(id)` | ID de la estación asignada.            |
| `base_salary` | REAL    | DEFAULT 1300               | Salario base para cálculos de pago.    |
| `created_at`  | TEXT    | DEFAULT CURRENT_TIMESTAMP  | Fecha de creación del registro.        |
| `updated_at`  | TEXT    | DEFAULT CURRENT_TIMESTAMP  | Fecha de última actualización.         |

### Tabla: `stations`

Almacena las estaciones o puestos de trabajo.

| Columna       | Tipo    | Restricciones             | Descripción                         |
| ------------- | ------- | ------------------------- | ----------------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único de la estación. |
| `name`        | TEXT    | NOT NULL UNIQUE           | Nombre único de la estación.        |
| `description` | TEXT    |                           | Descripción adicional (opcional).   |
| `created_at`  | TEXT    | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro.     |
| `updated_at`  | TEXT    | DEFAULT CURRENT_TIMESTAMP | Fecha de última actualización.      |

### Tabla: `services`

Almacena tanto servicios como productos.

| Columna            | Tipo    | Restricciones              | Descripción                                          |
| ------------------ | ------- | -------------------------- | ---------------------------------------------------- |
| `id`               | INTEGER | PRIMARY KEY AUTOINCREMENT  | Identificador único.                                 |
| `name`             | TEXT    | NOT NULL                   | Nombre del servicio o producto.                      |
| `description`      | TEXT    |                            | Descripción adicional (opcional).                    |
| `price`            | REAL    | NOT NULL                   | Precio de venta.                                     |
| `duration_minutes` | INTEGER | NOT NULL                   | Duración en minutos (para servicios).                |
| `type`             | TEXT    | NOT NULL DEFAULT 'service' | Tipo de ítem: 'service' o 'product'.                 |
| `stock_quantity`   | INTEGER | DEFAULT 0                  | Cantidad en stock (para productos).                  |
| `min_stock_level`  | INTEGER | DEFAULT 0                  | Nivel mínimo de stock para alertas (para productos). |
| `created_at`       | TEXT    | DEFAULT CURRENT_TIMESTAMP  | Fecha de creación.                                   |
| `updated_at`       | TEXT    | DEFAULT CURRENT_TIMESTAMP  | Fecha de última actualización.                       |

### Tabla: `reservations`

Almacena las citas o reservas.

| Columna        | Tipo             | Restricciones                        | Descripción                              |
| -------------- | ---------------- | ------------------------------------ | ---------------------------------------- |
| `id`           | INTEGER          | PRIMARY KEY AUTOINCREMENT            | Identificador único de la reserva.       |
| `barber_id`    | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY `barbers(id)`  | ID del barbero asignado.                 |
| `station_id`   | INTEGER UNSIGNED | NOT NULL                             | ID de la estación asignada.              |
| `client_name`  | TEXT             | NOT NULL                             | Nombre del cliente.                      |
| `client_phone` | TEXT             |                                      | Teléfono del cliente (opcional).         |
| `client_email` | TEXT             |                                      | Correo del cliente (opcional).           |
| `start_time`   | TEXT             | NOT NULL                             | Fecha y hora de inicio (formato ISO).    |
| `end_time`     | TEXT             | NOT NULL                             | Fecha y hora de fin (formato ISO).       |
| `service_id`   | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY `services(id)` | ID del servicio principal de la reserva. |
| `status`       | TEXT             | DEFAULT 'pending'                    | Estado: 'pending', 'completed', etc.     |
| `notes`        | TEXT             |                                      | Notas adicionales (opcional).            |
| `created_at`   | TEXT             | DEFAULT CURRENT_TIMESTAMP            | Fecha de creación del registro.          |
| `updated_at`   | TEXT             | DEFAULT CURRENT_TIMESTAMP            | Fecha de última actualización.           |

### Tabla: `sales`

Almacena la cabecera de cada transacción de venta.

| Columna          | Tipo             | Restricciones                        | Descripción                               |
| ---------------- | ---------------- | ------------------------------------ | ----------------------------------------- |
| `id`             | INTEGER          | PRIMARY KEY AUTOINCREMENT            | Identificador único de la venta.          |
| `reservation_id` | INTEGER UNSIGNED | FOREIGN KEY `reservations(id)`       | ID de la reserva asociada (opcional).     |
| `barber_id`      | INTEGER          | NOT NULL, FOREIGN KEY `barbers(id)`  | ID del barbero que realizó la venta.      |
| `station_id`     | INTEGER          | NOT NULL, FOREIGN KEY `stations(id)` | ID de la estación donde se hizo la venta. |
| `total_amount`   | REAL             | NOT NULL                             | Monto total de la venta.                  |
| `customer_name`  | TEXT             |                                      | Nombre del cliente (opcional).            |
| `payment_method` | TEXT             | DEFAULT 'cash'                       | Método de pago: 'cash', 'card', etc.      |
| `sale_date`      | TEXT             | DEFAULT CURRENT_TIMESTAMP            | Fecha de la venta.                        |
| `created_at`     | TEXT             | DEFAULT CURRENT_TIMESTAMP            | Fecha de creación del registro.           |
| `updated_at`     | TEXT             | DEFAULT CURRENT_TIMESTAMP            | Fecha de última actualización.            |

### Tabla: `sale_items`

Almacena el detalle de los ítems de cada venta.

| Columna         | Tipo             | Restricciones                     | Descripción                             |
| --------------- | ---------------- | --------------------------------- | --------------------------------------- |
| `id`            | INTEGER          | PRIMARY KEY AUTOINCREMENT         | Identificador único del ítem de venta.  |
| `sale_id`       | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY `sales(id)` | ID de la venta a la que pertenece.      |
| `service_id`    | INTEGER UNSIGNED | FOREIGN KEY `services(id)`        | ID del servicio/producto vendido.       |
| `item_type`     | TEXT             | NOT NULL                          | 'service' o 'product'.                  |
| `item_name`     | TEXT             | NOT NULL                          | Nombre del ítem al momento de la venta. |
| `price`         | REAL             | NOT NULL                          | Precio del ítem al momento de la venta. |
| `price_at_sale` | REAL             | NOT NULL                          | Precio del ítem al momento de la venta. |
| `quantity`      | INTEGER          | NOT NULL                          | Cantidad de ítems vendidos.             |
| `created_at`    | TEXT             | DEFAULT CURRENT_TIMESTAMP         | Fecha de creación del registro.         |
| `updated_at`    | TEXT             | DEFAULT CURRENT_TIMESTAMP         | Fecha de última actualización.          |

---

## 3. Referencia de Endpoints de la API

### Recurso: Autenticación y Usuarios (`/api/auth`)

| Método   | Ruta               | Función del Controlador         | Middleware Aplicado                                    | Descripción Técnica                                     |
| -------- | ------------------ | ------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| `POST`   | `/login`           | `authController.login`          | Ninguno                                                | Autentica un usuario y devuelve un JWT.                 |
| `GET`    | `/me`              | `authController.getMe`          | `authenticateToken`                                    | Obtiene el perfil del usuario autenticado.              |
| `PUT`    | `/change-password` | `authController.changePassword` | `authenticateToken`                                    | Permite al usuario autenticado cambiar su contraseña.   |
| `GET`    | `/users`           | `authController.getAllUsers`    | `authenticateToken`, `authorizeRoles('administrador')` | Obtiene una lista de todos los usuarios del sistema.    |
| `POST`   | `/users`           | `authController.createUser`     | `authenticateToken`, `authorizeRoles('administrador')` | Crea un nuevo usuario en el sistema.                    |
| `PUT`    | `/users/:id`       | `authController.updateUser`     | `authenticateToken`, `authorizeRoles('administrador')` | Actualiza los datos de un usuario específico por su ID. |
| `DELETE` | `/users/:id`       | `authController.deleteUser`     | `authenticateToken`, `authorizeRoles('administrador')` | Elimina un usuario del sistema por su ID.               |

- **Cuerpo para `POST /login`:** `{"email": string, "password": string}`
- **Cuerpo para `PUT /change-password`:** `{"oldPassword": string, "newPassword": string}`
- **Cuerpo para `POST /users`:** `{"name": string, "email": string, "password": string, "role": string}`
- **Cuerpo para `PUT /users/:id`:** `{"name"?: string, "email"?: string, "role"?: string}`

### Recurso: Configuraciones (`/api/settings`)

| Método | Ruta    | Función del Controlador            | Middleware Aplicado                                    | Descripción Técnica                                            |
| ------ | ------- | ---------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `GET`  | `/`     | `settingController.getAllSettings` | `authenticateToken`, `authorizeRoles('administrador')` | Obtiene todas las configuraciones clave-valor del sistema.     |
| `GET`  | `/:key` | `settingController.getSetting`     | `authenticateToken`, `authorizeRoles('administrador')` | Obtiene el valor de una configuración específica por su clave. |
| `PUT`  | `/:key` | `settingController.updateSetting`  | `authenticateToken`, `authorizeRoles('administrador')` | Actualiza o inserta el valor de una configuración.             |

- **Cuerpo para `PUT /:key`:** `{"value": string}`

### Recurso: Barberos (`/api/barbers`)

| Método   | Ruta   | Función del Controlador | Descripción Técnica                                       |
| -------- | ------ | ----------------------- | --------------------------------------------------------- |
| `GET`    | `/`    | `getAllBarbers`         | Obtiene todos los registros de la tabla `barbers`.        |
| `POST`   | `/`    | `createBarber`          | Crea un nuevo registro en la tabla `barbers`.             |
| `PUT`    | `/:id` | `updateBarber`          | Actualiza un registro existente en `barbers` por su `id`. |
| `DELETE` | `/:id` | `deleteBarber`          | Elimina un registro de `barbers` por su `id`.             |

- **Cuerpo para `POST` / `PUT`:** `{"name": string, "station_id": number, "base_salary": number}`

### Recurso: Estaciones (`/api/stations`)

| Método   | Ruta   | Función del Controlador | Descripción Técnica                                        |
| -------- | ------ | ----------------------- | ---------------------------------------------------------- |
| `GET`    | `/`    | `getAllStations`        | Obtiene todos los registros de la tabla `stations`.        |
| `POST`   | `/`    | `createStation`         | Crea un nuevo registro en la tabla `stations`.             |
| `PUT`    | `/:id` | `updateStation`         | Actualiza un registro existente en `stations` por su `id`. |
| `DELETE` | `/:id` | `deleteStation`         | Elimina un registro de `stations` por su `id`.             |

- **Cuerpo para `POST` / `PUT`:** `{"name": string}`

### Recurso: Servicios y Productos (`/api/services`)

| Método   | Ruta                       | Función del Controlador     | Descripción Técnica                                          |
| -------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| `GET`    | `/`                        | `getAllServices`            | Obtiene todos los ítems de tipo `service`.                   |
| `POST`   | `/`                        | `createService`             | Crea un nuevo servicio o producto.                           |
| `PUT`    | `/:id`                     | `updateService`             | Actualiza un servicio/producto por su `id`.                  |
| `DELETE` | `/:id`                     | `deleteService`             | Elimina un servicio/producto por su `id`.                    |
| `GET`    | `/products`                | `getProducts`               | Obtiene todos los ítems de tipo `product`.                   |
| `PUT`    | `/products/:id/stock`      | `updateProductStock`        | Actualiza el `stock_quantity` de un producto.                |
| `GET`    | `/products/low-stock`      | `getLowStockProducts`       | Obtiene productos donde `stock_quantity <= min_stock_level`. |
| `GET`    | `/products/report/summary` | `getInventoryReportSummary` | Obtiene un resumen del inventario.                           |

- **Cuerpo para `POST` / `PUT` en `/`:** `{"name": string, "price": number, "duration_minutes": number, "type": string, ...}`
- **Cuerpo para `PUT` en `/products/:id/stock`:** `{"quantity": number}`

### Recurso: Ventas (`/api/sales`)

| Método | Ruta                         | Función del Controlador          | Descripción Técnica                                          |
| ------ | ---------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `GET`  | `/`                          | `getAllSales`                    | Obtiene todas las ventas con sus detalles.                   |
| `POST` | `/`                          | `createSale`                     | Crea un nuevo registro de venta y sus `sale_items`.          |
| `GET`  | `/filtered`                  | `getSalesFiltered`               | Obtiene ventas filtradas por `filterType` y `filterValue`.   |
| `GET`  | `/summary`                   | `getDailySalesSummary`           | Obtiene la suma de `total_amount` por día en un rango.       |
| `GET`  | `/ranking`                   | `getBarberRanking`               | Obtiene la suma de `total_amount` por barbero en un rango.   |
| `GET`  | `/total-payments`            | `getTotalBarberPayments`         | Calcula el pago total a barberos en un rango.                |
| `GET`  | `/summary-by-service`        | `getSalesSummaryByService`       | Obtiene la suma de `price_at_sale` por servicio en un rango. |
| `GET`  | `/summary-by-payment-method` | `getSalesSummaryByPaymentMethod` | Obtiene la suma de `total_amount` por método de pago.        |

- **Parámetros de Consulta para `/filtered`:** `?filterType=[day|week|month|barber]&filterValue=...`
- **Parámetros de Consulta para reportes:** `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Recurso: Reservas (`/api/reservations`)

| Método   | Ruta               | Función del Controlador        | Descripción Técnica                                            |
| -------- | ------------------ | ------------------------------ | -------------------------------------------------------------- |
| `GET`    | `/`                | `getAllReservations`           | Obtiene todas las reservas, opcionalmente filtradas por fecha. |
| `POST`   | `/`                | `createReservation`            | Crea una nueva reserva.                                        |
| `GET`    | `/:id`             | `getReservationById`           | Obtiene una reserva por su `id`.                               |
| `PUT`    | `/:id`             | `updateReservation`            | Actualiza una reserva por su `id`.                             |
| `DELETE` | `/:id`             | `deleteReservation`            | Elimina una reserva por su `id`.                               |
| `POST`   | `/:id/complete`    | `completeReservation`          | Cambia el estado de la reserva a `completed` y crea una venta. |
| `GET`    | `/completed`       | `getCompletedReservations`     | Obtiene las reservas completadas en un rango de fechas.        |
| `GET`    | `/count`           | `getReservationCount`          | Cuenta las reservas en un rango de fechas.                     |
| `GET`    | `/count-completed` | `getCompletedReservationCount` | Cuenta las reservas completadas en un rango de fechas.         |

### Recurso: Reportes (`/api/reports`)

| Método | Ruta                       | Función del Controlador          | Descripción Técnica                                     |
| ------ | -------------------------- | -------------------------------- | ------------------------------------------------------- |
| `GET`  | `/`                        | `getReport`                      | Reporte mensual principal que calcula pagos a barberos. |
| `GET`  | `/comprehensive-sales`     | `getComprehensiveSalesReport`    | Reporte de ventas detallado con múltiples filtros.      |
| `GET`  | `/services-products-sales` | `getServicesProductsSalesReport` | Compara ventas de servicios vs. productos.              |
| `GET`  | `/station-usage`           | `getStationUsageReport`          | Reporte de uso de estaciones.                           |
| `GET`  | `/customer-frequency`      | `getCustomerFrequencyReport`     | Reporte de frecuencia de clientes.                      |
| `GET`  | `/peak-hours`              | `getPeakHoursReport`             | Reporte de horas con más demanda.                       |

- **Parámetros de Consulta para reportes:** Mayormente `startDate` y `endDate`. `/comprehensive-sales` acepta también `barberId`, `serviceId`, `paymentMethod`.

---

## 4. Middlewares

### `authenticateToken` (`backend/src/middleware/auth.middleware.ts`)

- **Propósito:** Verifica la validez de un JSON Web Token (JWT) presente en el encabezado `Authorization` de la solicitud.
- **Funcionamiento:**
  1.  Extrae el token del formato `Bearer <token>`.
  2.  Utiliza `jsonwebtoken.verify()` para validar el token con el secreto de la aplicación.
  3.  Si el token es válido, decodifica la información del usuario (ID, email, rol) y la adjunta al objeto `req.user`, permitiendo que los controladores accedan a ella.
  4.  Si el token es inválido, no está presente o ha expirado, devuelve una respuesta `401 Unauthorized` o `403 Forbidden`.
- **Uso:** Se aplica a rutas que requieren que el usuario esté logueado.

### `authorizeRoles` (`backend/src/middleware/authorization.middleware.ts`)

- **Propósito:** Proporciona control de acceso basado en roles, asegurando que solo los usuarios con roles específicos puedan acceder a ciertas rutas.
- **Funcionamiento:**
  1.  Recibe una lista de roles permitidos (ej. `"administrador"`, `"cajero"`).
  2.  Verifica que `req.user` (adjuntado por `authenticateToken`) exista y tenga un rol.
  3.  Comprueba si el rol del usuario está incluido en la lista de roles permitidos.
  4.  Si el rol no está permitido, devuelve una respuesta `403 Forbidden`.
  5.  Si el rol es válido, permite que la solicitud continúe al siguiente middleware o al controlador.
- **Uso:** Se aplica después de `authenticateToken` en rutas que requieren permisos específicos (ej. `router.get('/users', authenticateToken, authorizeRoles('administrador'), ...)`).
