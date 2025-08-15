# Manual Técnico Exhaustivo del Frontend

## 1. Propósito y Arquitectura

Este documento es una guía detallada, archivo por archivo, de la aplicación frontend. El objetivo es que cualquier desarrollador pueda entender la estructura, el flujo de datos y las responsabilidades de cada parte del sistema para poder mantenerlo o extenderlo eficazmente.

La arquitectura se basa en **Vue.js** para la reactividad, **Pinia** para un manejo de estado centralizado y **Vue Router** para la navegación en una SPA (Single Page Application).

---

## 2. Flujo de Datos y Estructura

El frontend es una Aplicación de Página Única (SPA) construida con Vue.js. El flujo de datos es centralizado y unidireccional, siguiendo las mejores prácticas de manejo de estado.

**Renderizado Condicional en `App.vue`:**
Un cambio clave es cómo `App.vue` (el componente raíz) maneja el renderizado del layout:

- Si el usuario **NO está autenticado** (o está en la ruta `/login`), `App.vue` solo renderiza el `<RouterView />`. Esto permite que la página de login ocupe toda la pantalla sin mostrar el sidebar o el header de la aplicación.
- Si el usuario **SÍ está autenticado** y no está en la página de login, `App.vue` renderiza el layout completo: el `Sidebar`, el `Header` y el `<RouterView />` para el contenido de la página actual.

**Flujo de Interacción Típico (Ejemplo: Añadir un Barbero):**

1.  **Vista (Componente de Página):** El usuario interactúa con una vista (ej. `BarbersView.vue`).
2.  **Llamada a la Acción (Action):** La interacción del usuario (ej. un clic en un botón) desencadena una llamada a una `action` en un `store` de Pinia (ej. `barberStore.addBarber(...)`).
3.  **Comunicación con la API:** La `action` del store es la única responsable de comunicarse con el backend (a través de `axios`) para enviar o solicitar datos. Incluye el token de autenticación en los headers si es necesario.
4.  **Mutación del Estado (State):** Una vez que la API responde, la `action` modifica el `state` centralizado del store (ej. actualiza el array `barbers`).
5.  **Reactividad:** Gracias a la reactividad de Vue, cualquier componente o vista que esté utilizando datos de ese `state` se actualiza automáticamente para reflejar los nuevos cambios, sin necesidad de recargar la página.

---

## 3. Componentes Reutilizables (`/components`)

### `Sidebar.vue`

- **Responsabilidad:** Renderizar el menú de navegación lateral, manejar su estado (colapsado/expandido) y los sub-menús.
- **Props:** `isCollapsed (Boolean)` para saber si debe mostrarse en modo compacto.
- **Emits:** `@toggle` para notificar al componente padre (`App.vue`) que el usuario quiere cambiar el estado de colapso.

### `Modal.vue`

- **Responsabilidad:** Proveer una estructura genérica de ventana modal para evitar duplicar código. El contenido específico se inyecta desde la vista que lo utiliza.
- **Props:** `show (Boolean)` para controlar su visibilidad.
- **Emits:** `@close` para notificar al componente padre que debe cerrarse.

---

## 4. Manejo de Estado (`/stores`)

Cada store maneja una pieza del estado global de la aplicación.

### `authStore.js`

- **Propósito:** Gestionar el estado de autenticación del usuario (login, logout, token, datos del usuario).
- **State:** `user`, `token`, `isLoading`, `error`.
- **Getters:**
  - `isAuthenticated`: `true` si hay un token y datos de usuario.
  - `isAdmin`: `true` si el usuario autenticado tiene el rol 'administrador'.
- **Actions:**
  - `login(email, password)`: Llama a `POST /api/auth/login`, guarda el token y los datos del usuario en el store y `localStorage`.
  - `logout()`: Limpia el store y `localStorage`, cerrando la sesión.
  - `initializeStore()`: Intenta cargar el token y los datos del usuario desde `localStorage` al iniciar la aplicación.

### `userStore.js`

- **Propósito:** Gestionar la lista de usuarios del sistema (para la gestión de usuarios en Configuración).
- **State:** `users`, `isLoading`, `error`.
- **Actions:**
  - `fetchUsers()`: Llama a `GET /api/auth/users` (protegida por rol de administrador).
  - `createUser(userData)`: Llama a `POST /api/auth/users`.
  - `updateUser(id, userData)`: Llama a `PUT /api/auth/users/:id`.
  - `deleteUser(id)`: Llama a `DELETE /api/auth/users/:id`.

### `settingStore.js`

- **Propósito:** Gestionar las configuraciones clave-valor de la aplicación.
- **State:** `settings`, `isLoading`, `error`.
- **Getters:**
  - `getSettingByKey(key)`: Devuelve el valor de una configuración específica por su clave.
- **Actions:**
  - `fetchAllSettings()`: Llama a `GET /api/settings` (protegida por rol de administrador).
  - `updateSetting(key, value)`: Llama a `PUT /api/settings/:key`.

### Otros Stores (barberStore, stationStore, serviceStore, productStore, salesStore, reservationStore, reportStore)

- Siguen un patrón similar, gestionando el estado y las interacciones con la API para sus respectivas entidades (barberos, estaciones, servicios, productos, ventas, reservas, reportes).

---

## 5. Vistas (`/views`)

### `LoginView.vue`

- **Propósito:** Proveer la interfaz para que los usuarios inicien sesión en la aplicación.
- **Diseño:** Ahora es una vista de página completa, con un diseño moderno centrado, un fondo sutil y un formulario en estilo de tarjeta con campos mejorados.
- **Lógica:** Captura el email y la contraseña, y llama a `authStore.login()`. Si la autenticación es exitosa, redirige al dashboard.

### `ProfileView.vue`

- **Propósito:** Mostrar la información del perfil del usuario autenticado y permitirle cambiar su contraseña.
- **Lógica:** Al cargar, intenta inicializar `authStore` para asegurar que los datos del usuario estén disponibles. Muestra el nombre, email y rol del usuario. Contiene un formulario para cambiar la contraseña, que llama al endpoint `PUT /api/auth/change-password`.

### `SettingsView.vue`

- **Propósito:** Permitir a los usuarios con rol de administrador configurar aspectos clave del negocio y gestionar otros usuarios.
- **Secciones:**
  - **Reglas de Pago a Barberos:** Permite configurar el umbral de salario base, el porcentaje de comisión y el sueldo base por defecto. Estos valores se guardan en la tabla `settings` del backend.
  - **Gestión de Usuarios:** Muestra una tabla de todos los usuarios del sistema. Permite añadir nuevos usuarios (con nombre, email, contraseña y rol), editar usuarios existentes (nombre, email, rol) y eliminar usuarios. Todas estas operaciones están protegidas por el rol de administrador.

### Otras Vistas (DashboardView, BarbersView, StationsView, ServicesView, ProductsView, SalesView, SalesListView, ReservationsView, CalendarView, ReportsView, InventoryReportView, StationUsageReportView, CustomerFrequencyReportView, PeakHoursReportView, ComprehensiveSalesReportView, ServicesProductsSalesReportView)

- Mantienen sus propósitos y lógicas previamente documentadas, interactuando con sus respectivos stores para gestionar los datos y la UI.

---

## 6. Archivos de Configuración Clave

- **`main.js`**: Punto de entrada de la aplicación. Aquí se inicializa Vue, Pinia, el Router y VueApexCharts. También se inicializa `authStore` para cargar el estado de autenticación al inicio.
- **`vite.config.js`**: Configura el entorno de desarrollo de Vite. La sección `server.proxy` redirige las peticiones `/api` al backend. También define alias como `@` para `src`.
- **`tailwind.config.js`**: Configura TailwindCSS, incluyendo la definición de colores personalizados.
