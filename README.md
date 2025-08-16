# 💇‍♂️ Barbería Project Frontend 🚀

¡Bienvenido al frontend del sistema de gestión de Barbería! Esta aplicación web, construida con Vue 3, ofrece una experiencia de usuario intuitiva y moderna para la administración integral de tu negocio.

## 🌟 Visión General

Este proyecto es la interfaz de usuario que interactúa con el backend de la barbería, permitiendo a los administradores y empleados gestionar citas, servicios, productos, ventas, informes y mucho más. Diseñado con un enfoque en la usabilidad y la eficiencia, facilita las operaciones diarias de cualquier barbería.

## 🛠️ Tecnologías Utilizadas

El frontend ha sido desarrollado utilizando un conjunto de tecnologías de vanguardia:

- **Vue.js 3**: Un framework progresivo de JavaScript, conocido por su facilidad de uso, rendimiento y reactividad, ideal para construir interfaces de usuario dinámicas.
- **Vite**: Una herramienta de construcción de frontend de próxima generación que ofrece una experiencia de desarrollo increíblemente rápida con recarga en caliente instantánea.
- **Vue Router**: El enrutador oficial para Vue.js, que permite la navegación fluida entre las diferentes vistas de la aplicación.
- **Pinia**: Una tienda de estado intuitiva, segura y flexible para Vue, que simplifica la gestión del estado global de la aplicación.
- **Axios**: Un cliente HTTP basado en promesas, utilizado para realizar solicitudes a la API del backend de manera eficiente.
- **Tailwind CSS**: Un framework CSS utilitario que permite construir diseños personalizados rápidamente, sin salir de tu HTML.
- **FullCalendar**: Una potente librería JavaScript para mostrar y gestionar eventos de calendario, esencial para la visualización de reservas.
- **ApexCharts / Chart.js**: Librerías de gráficos versátiles para la visualización de datos en informes y paneles de control, ofreciendo insights claros sobre el rendimiento del negocio.
- **dayjs**: Una alternativa ligera a Moment.js para el análisis, manipulación y formateo de fechas y horas.
- **jsPDF / jspdf-autotable**: Herramientas para la generación de informes en formato PDF directamente desde el navegador.

## ✨ Características Principales

La aplicación frontend ofrece una amplia gama de funcionalidades para la gestión de la barbería:

- **Autenticación de Usuarios**: Sistema seguro de inicio de sesión y gestión de sesiones para diferentes roles de usuario.
- **Panel de Control (Dashboard)**: Una vista consolidada de métricas clave y actividades recientes para una toma de decisiones rápida.
- **Gestión de Barberos**: Interfaz para visualizar y administrar la información de los barberos.
- **Gestión de Estaciones**: Control visual sobre la disponibilidad y el estado de las estaciones de trabajo.
- **Gestión de Servicios**: Administración intuitiva de los servicios ofrecidos, incluyendo precios y duración.
- **Gestión de Productos**: Inventario y control de los productos disponibles para la venta.
- **Sistema de Reservas Avanzado**: Permite crear, visualizar, actualizar y completar reservas con una vista de calendario interactiva.
- **Seguimiento de Ventas**: Registro detallado y visualización de todas las transacciones de venta.
- **Generación de Informes**: Acceso a diversos informes (ventas, inventario, frecuencia de clientes, horas pico, etc.) para un análisis profundo del negocio.
- **Gestión de Inventario**: Herramientas para el seguimiento y control de las existencias de productos.
- **Configuración de la Aplicación**: Interfaz para ajustar la configuración global del sistema.
- **Diseño Responsivo**: Adaptabilidad total a diferentes tamaños de pantalla y dispositivos, desde móviles hasta escritorios.

## 🚀 Configuración e Instalación

Para poner en marcha la aplicación frontend en tu entorno de desarrollo local, sigue estos pasos:

1.  **Clona el repositorio:**

    ```bash
    git clone https://github.com/angelotapullima/barberia_project_frontend.git
    cd barberia_project_frontend
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade la siguiente variable de entorno. **Asegúrate de reemplazar el valor de marcador de posición** con la URL de tu API de backend.

    ```env
    VITE_API_URL="http://localhost:3000/api"
    # Si tu backend está desplegado, usa su URL real aquí. Por ejemplo:
    # VITE_API_URL="https://tu-backend-desplegado.onrender.com/api"
    ```

    - `VITE_API_URL`: La URL base de tu API de backend. **¡Es fundamental que apunte a tu backend desplegado en producción para el correcto funcionamiento!**

## ▶️ Ejecución de la Aplicación

- **Modo Desarrollo (con recarga en caliente):**

  ```bash
  npm run dev
  ```

  La aplicación estará disponible típicamente en `http://localhost:5173` (o en otro puerto si el 5173 está en uso).

- **Construir para Producción:**

  ```bash
  npm run build
  ```

  Este comando construye la aplicación para producción en el directorio `dist/`.

- **Previsualizar la Construcción de Producción:**
  ```bash
  npm run preview
  ```
  Este comando sirve el directorio `dist/` localmente para probar la versión de producción.

## 🧹 Linting y Formateo

- **Análisis de Código (Linting):**
  ```bash
  npm run lint
  ```
- **Corregir Problemas de Linting:**
  ```bash
  npm run lint:fix
  ```
- **Formatear Código (Prettier):**
  ```bash
  npm run format
  ```

## ☁️ Despliegue

Este frontend está diseñado para ser desplegado fácilmente en plataformas como [Vercel](https://vercel.com/). Asegúrate de que tu variable de entorno `VITE_API_URL` esté configurada correctamente en tu plataforma de despliegue para que apunte a tu backend desplegado.

---
