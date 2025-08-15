# Visión General del Proyecto Barbería

Este documento proporciona una visión general del sistema de gestión de barberías, detallando su estructura, componentes clave, tecnologías utilizadas y flujos de trabajo importantes.

## 1. Introducción

El sistema de barbería es una aplicación diseñada para gestionar las operaciones diarias de una barbería, incluyendo la administración de barberos, estaciones, servicios, ventas, reservaciones y la generación de diversos reportes para el análisis del negocio.

## 2. Estructura del Proyecto

El proyecto está dividido en dos componentes principales: el `backend` (servidor) y el `frontend` (interfaz de usuario).

```
barberia_project/
├── backend/             # Lógica del servidor y API
└── frontend/            # Interfaz de usuario
```

### 2.1. `backend/`

Contiene la lógica del servidor, la API RESTful y la interacción con la base de datos.

- **Tecnologías:** Node.js, Express.js, SQLite (base de datos), TypeScript.

### 2.2. `frontend/`

Contiene la interfaz de usuario de la aplicación, construida como una Single Page Application (SPA).

- **Tecnologías:** Vue.js, Vite (bundler), Pinia (gestión de estado), Tailwind CSS (estilos).

## 3. Componentes Clave del Backend

El backend sigue una arquitectura de capas (controladores, servicios, base de datos) para una mejor organización y mantenibilidad.

### 3.1. `database.ts`

Este archivo es el corazón de la persistencia de datos. Se encarga de:

- **Gestión de la Base de Datos:** Utiliza SQLite para almacenar la información del sistema.
- **Creación de Esquema:** Define la estructura de todas las tablas necesarias (estaciones, barberos, servicios, ventas, ítems de venta, reservaciones).
- **Datos de Prueba (`seedDatabase`):** Incluye una función robusta para insertar datos de prueba variados (ventas, reservaciones, etc.) automáticamente cuando la base de datos está vacía. Esto es útil para el desarrollo y las pruebas.
- **Patrón Singleton:** Implementa un patrón Singleton para la conexión a la base de datos, asegurando que solo haya una instancia de conexión activa en toda la aplicación. Esto previene problemas de concurrencia y optimiza el uso de recursos.

### 3.2. Servicios (`src/services/*.ts`)

Los servicios contienen la lógica de negocio principal de la aplicación. Interactúan directamente con la base de datos y realizan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y consultas complejas.

- **`barber.service.ts`:** Gestiona la información de los barberos.
- **`reservation.service.ts`:** Maneja las operaciones relacionadas con las reservaciones.
- **`sale.service.ts`:** Controla el registro y la consulta de ventas.
- **`service.service.ts`:** Administra los servicios y productos ofrecidos por la barbería.
- **`station.service.ts`:** Gestiona las estaciones de trabajo.
- **`report.service.ts`:** Este servicio es crucial para la generación de informes analíticos. Incluye métodos para:
  - **Informe de Utilización de la Estación:** Muestra cuántas veces se ha utilizado cada estación en un período determinado.
  - **Informe de Retención/Frecuencia de Clientes:** Identifica a los clientes más frecuentes basándose en sus visitas.
  - **Informe de Horas/Días Pico:** Determina los momentos de mayor afluencia de reservaciones.
  - Reportes de ventas generales y por tipo (servicios/productos).

### 3.3. Controladores (`src/controllers/*.ts`)

Los controladores son la capa que maneja las peticiones HTTP entrantes. Reciben los datos de la petición, realizan validaciones básicas y luego llaman a los métodos apropiados de los servicios para ejecutar la lógica de negocio. Finalmente, envían la respuesta HTTP al cliente.

### 3.4. Rutas (`src/routes/*.ts`)

Estos archivos definen los endpoints de la API RESTful. Mapean las URLs a los métodos de los controladores correspondientes, organizando la estructura de la API (ej. `/api/barbers`, `/api/sales`, `/api/reports`).

### 3.5. `server.ts`

Es el punto de entrada principal del backend. Configura el servidor Express, aplica middlewares (como CORS), define las rutas base para los controladores y levanta el servidor para escuchar peticiones.

## 4. Componentes Clave del Frontend

El frontend es una aplicación Vue.js que proporciona la interfaz de usuario interactiva.

### 4.1. `main.js`

El archivo de entrada de la aplicación Vue.js. Aquí se inicializa la aplicación, se monta el componente raíz (`App.vue`), se configura Vue Router y Pinia.

### 4.2. `App.vue`

El componente raíz de la aplicación. Contiene la estructura principal de la interfaz de usuario, incluyendo la barra lateral de navegación y el área donde se renderizan las diferentes vistas.

### 4.3. `router/index.js`

Define las rutas de navegación de la aplicación utilizando Vue Router. Mapea las URLs a los componentes de las vistas, permitiendo la navegación entre las diferentes secciones del sistema.

### 4.4. `stores/*.js` (Pinia)

Utiliza Pinia para la gestión del estado global de la aplicación. Cada archivo de store (`barberStore.js`, `reportStore.js`, etc.) maneja el estado y las acciones relacionadas con una entidad específica, facilitando el acceso y la modificación de datos desde cualquier componente.

### 4.5. `views/*.vue`

Estos componentes representan las pantallas principales de la aplicación:

- **`DashboardView.vue`:** La pantalla principal que ofrece un resumen del negocio. Ahora incluye el reporte de pagos a barberos.
- **`ReportsView.vue`:** La vista dedicada a los reportes. Ha sido reestructurada para mostrar los nuevos informes (Utilización de Estación, Frecuencia de Clientes, Horas Pico) junto con los reportes de ventas completos y por tipo.
- **`ScheduleView.vue`:** Una nueva vista dedicada exclusivamente al calendario de distribución. Permite a la cajera visualizar la agenda y, al hacer clic en un horario, iniciar el proceso de registro de una nueva venta.
- Otras vistas como `BarbersView.vue`, `SalesView.vue`, `ServicesView.vue`, `StationsView.vue`, `ReservationsView.vue` para la gestión de entidades.

### 4.6. `components/*.vue`

Contiene componentes Vue reutilizables que se utilizan en varias vistas, como `Sidebar.vue` (la barra lateral de navegación) y `Modal.vue` (para ventanas modales).

## 5. Flujos de Trabajo Importantes

- **Registro de Ventas:** La cajera puede registrar nuevas ventas, asociándolas a barberos, estaciones y servicios específicos. La nueva vista `ScheduleView.vue` facilita este proceso al permitir iniciar una venta directamente desde el calendario.
- **Gestión de Reservas:** Creación, visualización, actualización y eliminación de reservaciones para clientes.
- **Gestión de Entidades:** CRUD completo para barberos, estaciones y servicios.
- **Generación de Reportes:** Acceso a diversos informes para analizar el rendimiento del negocio, incluyendo los nuevos reportes de utilización de estaciones, frecuencia de clientes y horas pico, así como reportes detallados de ventas.

## 6. Configuración de Tests Unitarios (Backend)

El backend cuenta con tests unitarios para asegurar la calidad y estabilidad del código.

- **Framework:** Jest.
- **Configuración:** El archivo `jest.config.js` y los scripts en `package.json` están configurados para ejecutar los tests de TypeScript.
- **Estrategia de Testing:**
  - **Base de Datos en Memoria:** Las pruebas utilizan una base de datos SQLite en memoria (`:memory:`) que se inicializa y se llena con datos de prueba (`seedDatabase`) antes de cada suite de tests. Esto garantiza que los tests sean rápidos, aislados y reproducibles.
  - **Inyección de Dependencias:** Los servicios han sido refactorizados para aceptar una instancia de base de datos en su constructor, lo que permite inyectar la base de datos de prueba y facilita el mocking.
  - **Mocking de Servicios en Controladores:** Los tests de controladores mockean los servicios que utilizan, asegurando que solo se pruebe la lógica del controlador y no la interacción con la base de datos real.

## 7. Instrucciones para Ejecutar el Proyecto

Para levantar y probar el proyecto:

### Backend

1.  Navega al directorio `backend/`.
2.  Instala las dependencias: `npm install`
3.  Inicia el servidor en modo desarrollo (con recarga automática y datos de prueba si la BD está vacía): `npm run dev`

### Frontend

1.  Navega al directorio `frontend/`.
2.  Instala las dependencias: `npm install`
3.  Inicia la aplicación en modo desarrollo: `npm run dev`

### Tests Unitarios (Backend)

1.  Asegúrate de estar en el directorio `backend/`.
2.  Ejecuta todos los tests: `npm test`

## 8. Notas Adicionales

- El archivo `barberia.sqlite` se crea automáticamente en el directorio `backend/` al iniciar el servidor si no existe. Para resetear los datos de desarrollo, simplemente elimina este archivo y reinicia el servidor.
- Actualmente, el test `sale.controller.test.ts` está fallando. Este es un problema conocido y se subió a `main` para permitir la revisión y colaboración en su resolución.
