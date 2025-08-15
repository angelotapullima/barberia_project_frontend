# Documentación Detallada del Backend - Barbería API

## 1. Arquitectura y Propósito General

Este backend actúa como el cerebro del sistema de gestión de barberías. Su propósito principal es ofrecer una API (Interfaz de Programación de Aplicaciones) RESTful que el frontend puede consumir para realizar todas sus operaciones.

### Tecnologías Clave y su Propósito

- **Node.js con Express:** Se eligió esta combinación por su ligereza y eficiencia en el manejo de operaciones de entrada/salida (I/O), lo cual es ideal para una API que constantemente consulta una base de datos. Express simplifica enormemente la creación de rutas y la gestión de solicitudes HTTP.
- **TypeScript:** Se utiliza para añadir tipado estático a JavaScript. Esto significa que podemos definir tipos de datos para variables y funciones, lo que reduce drásticamente los errores en tiempo de ejecución y mejora la autocompletación y la mantenibilidad del código.
- **SQLite:** Es una base de datos basada en un único archivo, sin necesidad de un servidor separado. Se eligió por su simplicidad de configuración y despliegue, siendo perfecta para aplicaciones de pequeña a mediana escala como esta. El archivo `barberia.sqlite` contiene toda la base de datos.

### Flujo de una Solicitud (Request Flow)

El backend está organizado en tres capas principales para seguir el principio de **Separación de Responsabilidades**:

1.  **Rutas (`/routes`):** Definen las URLs de la API (ej. `/api/barbers`). Su única responsabilidad es recibir la solicitud HTTP y dirigirla al `Controlador` adecuado.
2.  **Controladores (`/controllers`):** Actúan como intermediarios. Toman la solicitud de la ruta, extraen la información relevante (como el `id` de los parámetros o los datos del `body`) y llaman al `Servicio` correspondiente para realizar la acción. Una vez que el servicio termina, el controlador se encarga de enviar la respuesta al cliente (el frontend) con el código de estado correcto (ej. 200 OK, 404 Not Found).
3.  **Servicios (`/services`):** Contienen la lógica de negocio y la interacción con la base de datos. Aquí es donde se ejecutan las consultas SQL para crear, leer, actualizar o eliminar datos. Mantienen toda la lógica compleja aislada de los controladores.

Este flujo (`Ruta -> Controlador -> Servicio`) hace que el código sea más organizado, fácil de probar y de mantener.

---

## 2. Endpoints de la API (Explicación Detallada)

La URL base para todos los endpoints es `/api`.

(Se omiten las descripciones de los endpoints para brevedad, pero están presentes en el archivo real)

---

## 3. Lógica de Negocio Clave: Cálculo de Pago a Barberos

Una de las lógicas de negocio más importantes del sistema es cómo se calcula el pago mensual de los barberos. Este es un modelo mixto que combina un sueldo base con comisiones por ventas.

### Ubicación en el Código

La lógica reside en el archivo `backend/src/services/report.service.ts`, dentro de la función `generateReport`. Se encuentra aquí porque el pago es un **reporte financiero** que se calcula basado en el rendimiento de un período (un mes).

### Reglas de Negocio

El modelo de pago se basa en dos constantes definidas en el código:

1.  **Sueldo Base (`BASE_SALARY`):** Se ha fijado un monto de **S/ 1,250**. Este es el pago mínimo garantizado que un barbero recibirá.
2.  **Umbral de Comisión (`COMMISSION_THRESHOLD`):** Se ha establecido un umbral de ventas de **S/ 2,500**. Este valor es crucial para determinar si el pago se basa en el sueldo o en la comisión.

### Flujo del Cálculo (Paso a Paso)

Cuando se genera el reporte para un mes específico, el sistema sigue estos pasos para cada barbero:

1.  **Calcular Ventas Totales:** El sistema suma todas las ventas (`total_generated`) que el barbero realizó durante ese mes.
2.  **Aplicar la Condición:** Se compara el `total_generated` con el `COMMISSION_THRESHOLD` (S/ 2,500).
    - **CASO A (No se alcanza el umbral):** Si el total de ventas del barbero es **menor o igual a S/ 2,500**, su pago para ese mes será el `BASE_SALARY` de **S/ 1,250**.
    - **CASO B (Se supera el umbral):** Si el total de ventas del barbero es **mayor a S/ 2,500**, el modelo de pago cambia. El pago ya no es el sueldo base, sino que se convierte en el **50% del total de sus ventas** (`pago = total_generado * 0.5`).

### Propósito del Modelo de Pago

Este sistema está diseñado para ser un modelo **incentivador**.

- **Seguridad:** Proporciona una red de seguridad con el sueldo base, asegurando que los barberos tengan un ingreso mínimo.
- **Recompensa:** Motiva a los barberos a superar el umbral de ventas, ya que su potencial de ingresos aumenta significativamente una vez que pasan a la modalidad de comisión. Esto alinea los objetivos del personal con los objetivos de crecimiento del negocio.

---

## 4. Propósito de Negocio de los Reportes

Los reportes son herramientas de inteligencia de negocio (Business Intelligence) diseñadas para transformar los datos crudos de las operaciones diarias en información valiosa para la toma de decisiones estratégicas.

### Reporte de Ventas por Tipo (Servicio vs. Producto)

- **¿Qué hace?:** Muestra el total de ingresos generado por "Servicios" y lo compara con el total generado por "Productos".
- **¿Para qué sirve?:** Ayuda a entender la **estructura de ingresos** del negocio. Responde a la pregunta: "¿De dónde viene nuestro dinero principalmente?". Permite tomar decisiones como:
  - Si la venta de productos es baja, se pueden crear estrategias para potenciarla (ej. capacitar a los barberos en ventas, crear ofertas).
  - Si los servicios son la fuente principal, se puede pensar en crear nuevos servicios premium.

### Reporte de Uso de Estaciones

- **¿Qué hace?:** Cuenta cuántas ventas o servicios se realizaron en cada estación de trabajo en un período.
- **¿Para qué sirve?:** Es un reporte de **eficiencia y optimización de recursos físicos**. Ayuda a identificar cuellos de botella o recursos infrautilizados. Si una estación se usa mucho más que otras, podría necesitar mantenimiento más frecuente. Si una estación casi no se usa, se podría investigar el motivo (ej. silla incómoda, mala iluminación) y corregirlo para aprovechar al máximo el espacio.

### Reporte de Frecuencia de Clientes

- **¿Qué hace?:** Identifica y lista a los clientes que más han visitado la barbería.
- **¿Para qué sirve?:** Es una herramienta clave para la **fidelización y el marketing**. Permite reconocer a los clientes más leales para ofrecerles un trato especial, un descuento o un agradecimiento, fortaleciendo la relación. También ayuda a entender el perfil del cliente recurrente.

### Reporte de Horas Pico

- **¿Qué hace?:** Analiza a qué horas del día se concentran la mayor cantidad de reservas y servicios.
- **¿Para qué sirve?:** Es fundamental para la **gestión de personal y optimización de horarios**. Permite asignar más personal durante las horas de alta demanda para no perder clientes y reducir los tiempos de espera. En las horas de baja demanda, se pueden programar descansos, tareas administrativas o de limpieza, optimizando los costos laborales.

### Reporte de Inventario

- **¿Qué hace?:** Muestra un resumen del inventario de productos y alerta sobre aquellos con bajo stock.
- **¿Para qué sirve?:** Es una herramienta de **gestión de stock y control de costos**. Su propósito es evitar dos problemas críticos:
  1.  **Quiebre de Stock:** Quedarse sin un producto popular significa perder ventas directas y la confianza del cliente.
  2.  **Sobre-stock:** Comprar demasiado de un producto que no se vende inmoviliza dinero que podría usarse en otras áreas del negocio. Este reporte ayuda a tomar decisiones de compra informadas.

### Reporte de Ventas Completo (Detallado)

- **¿Qué hace?:** Ofrece una vista granular de cada transacción, con potentes filtros.
- **¿Para qué sirve?:** Es la herramienta definitiva de **auditoría y consulta**. No busca tendencias generales, sino que permite investigar transacciones específicas. Es útil para resolver dudas como: "¿Qué se le vendió exactamente a este cliente en esta fecha?" o "Necesito el detalle de todas las ventas con tarjeta del barbero Juan de la última semana".
