# Manual Técnico Exhaustivo del Frontend

## 1. Propósito y Arquitectura

Este documento es una guía detallada, archivo por archivo, de la aplicación frontend. El objetivo es que cualquier desarrollador pueda entender la estructura, el flujo de datos y las responsabilidades de cada parte del sistema para poder mantenerlo o extenderlo eficazmente.

La arquitectura se basa en **Vue.js** para la reactividad, **Pinia** para un manejo de estado centralizado y **Vue Router** para la navegación en una SPA (Single Page Application).

---

## 2. Archivos de Configuración Principales

-   **`main.js`**: Es el punto de arranque de la aplicación. Su función es crear la instancia de Vue, e instalar y configurar los plugins esenciales: Pinia (para el estado), Vue Router (para las rutas) y VueApexCharts (para los gráficos).

-   **`vite.config.js`**: Configura el entorno de desarrollo de Vite. La parte más importante es la sección `server.proxy`:
    ```javascript
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    ```
    **Propósito:** Redirige todas las peticiones que el frontend haga a `/api` hacia el servidor backend que corre en `http://localhost:3000`. Esto evita problemas de CORS (Cross-Origin Resource Sharing) durante el desarrollo.

-   **`tailwind.config.js`**: Configura TailwindCSS. Aquí se definen colores personalizados (ej. `barber-red`) para mantener una paleta de colores consistente en toda la aplicación.

-   **`router/index.js`**: Define el mapa de navegación del sitio. Conecta cada URL a un componente de Vista específico. 
    - **Ejemplo de ruta:** `{ path: '/barbers', component: BarbersView, name: 'Barbers' }`
    - **Significado:** Cuando el usuario navega a la URL `/barbers`, Vue Router cargará y mostrará el componente `BarbersView.vue`.

---

## 3. Componentes Reutilizables (`/components`)

### `Sidebar.vue`
-   **Responsabilidad:** Renderizar el menú de navegación lateral, manejar su estado (colapsado/expandido) y los sub-menús.
-   **Props:** `isCollapsed (Boolean)` para saber si debe mostrarse en modo compacto.
-   **Emits:** `@toggle` para notificar al componente padre (`App.vue`) que el usuario quiere cambiar el estado de colapso.

### `Modal.vue`
-   **Responsabilidad:** Proveer una estructura genérica de ventana modal para evitar duplicar código. El contenido específico se inyecta desde la vista que lo utiliza.
-   **Props:** `show (Boolean)` para controlar su visibilidad.
-   **Emits:** `@close` para notificar al componente padre que debe cerrarse.

---

## 4. Manejo de Estado (`/stores`)

Cada store es una unidad que encapsula el estado y la lógica de una entidad de negocio.

### `barberStore.js`
-   **Propósito:** Manejar todo lo relacionado con los barberos.
-   **State:** `barbers`, `isLoading`, `error`.
-   **Actions:**
    -   `fetchBarbers()`: Llama a `GET /api/barbers` y guarda la lista en `state.barbers`.
    -   `addBarber(barber)`: Llama a `POST /api/barbers` y refresca la lista.
    -   `updateBarber(barber)`: Llama a `PUT /api/barbers/:id` y refresca la lista.
    -   `deleteBarber(id)`: Llama a `DELETE /api/barbers/:id` y refresca la lista.

### `stationStore.js`
-   **Propósito:** Manejar todo lo relacionado con las estaciones de trabajo. Sigue el mismo patrón que `barberStore` para las acciones CRUD.

### `serviceStore.js`
-   **Propósito:** Manejar los servicios. Sigue el mismo patrón que `barberStore` para las acciones CRUD.

### `productStore.js`
-   **Propósito:** Manejar el inventario de productos.
-   **State:** `products`, `lowStockProducts`, `loading`, `error`.
-   **Actions:** Además de las acciones CRUD (que llaman a `/api/services` con `type: 'product'`), tiene acciones específicas de inventario:
    -   `fetchLowStockProducts()`: Llama a `GET /api/services/products/low-stock`.
    -   `updateProductStock(id, quantity)`: Llama a `PUT /api/services/products/:id/stock`.
    -   `fetchInventorySummary()`: Llama a `GET /api/services/products/report/summary`.

### `reservationStore.js`
-   **Propósito:** Manejar las citas.
-   **Actions:** Contiene acciones CRUD y otras para obtener conteos y reservas completadas, llamando a los endpoints correspondientes en `/api/reservations`.

### `salesStore.js`
-   **Propósito:** Manejar las ventas y sus reportes asociados.
-   **Actions:** Contiene acciones para el CRUD de ventas y para todos los endpoints de resumen de `/api/sales` (summary, ranking, etc.).

### `reportStore.js`
-   **Propósito:** Manejar los datos de los reportes complejos y multi-entidad.
-   **State:** `events`, `stats`, `comprehensiveSales`, `stationUsage`, etc. Cada uno almacena los datos para una vista de reporte específica.
-   **Actions:** Cada acción (ej. `fetchStationUsage`) llama a su endpoint específico en `/api/reports` y puebla la variable de estado correspondiente.

---

## 5. Vistas (`/views`)

### `App.vue`
-   **Responsabilidad:** Es el componente principal que envuelve toda la aplicación. Contiene el `Sidebar` y un `<RouterView />`. Este último es el marcador de posición donde se renderizará la vista activa según la ruta del navegador.

### `DashboardView.vue`
-   **Responsabilidad:** Mostrar una vista general del negocio con indicadores clave (KPIs) y gráficos.
-   **Lógica:** Usa `onMounted` para disparar en paralelo (`Promise.all`) las acciones de varios stores (`salesStore`, `reservationStore`, `reportStore`) para recopilar todos los datos necesarios para las tarjetas y los gráficos de ApexCharts.

### `BarbersView.vue` (y otras vistas de gestión como `StationsView`, `ServicesView`)
-   **Responsabilidad:** Mostrar una tabla con la lista de un recurso (ej. barberos) y permitir su gestión (CRUD).
-   **Lógica:** Usa el store correspondiente (ej. `useBarberStore`) para obtener la lista (`fetchBarbers`). Los botones de la tabla activan funciones que controlan la visibilidad del `Modal.vue` y preparan los datos para un formulario. El envío del formulario llama a la acción correspondiente del store (`addBarber`, `updateBarber`).

### `ProductsView.vue`
-   **Responsabilidad:** Gestionar el inventario de productos.
-   **Lógica:** Similar a las vistas de gestión, pero utiliza `productStore`. Muestra una alerta destacada si el array `lowStockProducts` del store no está vacío.

### `SalesView.vue`
-   **Responsabilidad:** Proveer el formulario para registrar una nueva venta manual.
-   **Lógica:** Carga los datos necesarios para los selectores (barberos, estaciones, servicios) desde sus respectivos stores. Calcula el `totalAmount` en tiempo real (propiedad `computed`) a medida que se seleccionan servicios. Al enviar, llama a `salesStore.addSale()`.

### `SalesListView.vue`
-   **Responsabilidad:** Mostrar un historial de todas las ventas y permitir filtrarlas.
-   **Lógica:** Permite al usuario seleccionar un tipo de filtro (`filterType`) y un valor (`filterValue`). Al hacer clic en "Aplicar Filtro", llama a la acción `salesStore.getFilteredSales()` si hay un filtro, o a `salesStore.getAllSales()` si no lo hay.

### `ReservationsView.vue`
-   **Responsabilidad:** CRUD para las reservas.
-   **Lógica:** Similar a `BarbersView`, con un formulario para crear y editar reservas.

### `ScheduleView.vue`
-   **Responsabilidad:** Mostrar una vista de calendario semanal/diario de las citas.
-   **Lógica:** Utiliza el componente `FullCalendar`. Llama a `reportStore.fetchReport()` para obtener los eventos. Implementa la función `dateClick` que redirige al usuario a la vista de registro de ventas, pasando la fecha y hora seleccionadas como parámetros en la URL.

### Vistas de Reportes (ej. `ComprehensiveSalesReportView.vue`, `PeakHoursReportView.vue`, etc.)
-   **Responsabilidad:** Mostrar un reporte específico con filtros y una visualización gráfica.
-   **Lógica:** Cada vista se enfoca en un reporte. Contiene inputs para los filtros (usualmente fechas). Un botón "Generar" llama a la acción correspondiente en el `reportStore`. Los datos devueltos se conectan a un componente `ApexCharts` para su visualización. También incluyen una función para exportar los datos de la tabla a un archivo CSV.