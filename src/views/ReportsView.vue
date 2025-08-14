<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Panel General de Reportes
    </h1>
    <p class="text-lg text-gray-700 mb-6">
      Bienvenido a la sección de reportes. Aquí puedes encontrar análisis
      detallados sobre diferentes aspectos de tu barbería. Selecciona uno de los
      reportes del menú lateral para ver la información específica.
    </p>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Reportes Disponibles:
      </h2>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>
          <router-link
            to="/reports/inventory"
            class="text-blue-600 hover:underline"
            >Reporte de Inventario</router-link
          >
        </li>
        <li>
          <router-link
            to="/reports/station-usage"
            class="text-blue-600 hover:underline"
            >Reporte de Uso de Estaciones</router-link
          >
        </li>
        <li>
          <router-link
            to="/reports/customer-frequency"
            class="text-blue-600 hover:underline"
            >Reporte de Frecuencia de Clientes</router-link
          >
        </li>
        <li>
          <router-link
            to="/reports/peak-hours"
            class="text-blue-600 hover:underline"
            >Reporte de Horas Pico de Reservas</router-link
          >
        </li>
        <li>
          <router-link
            to="/reports/sales/comprehensive"
            class="text-blue-600 hover:underline"
            >Reporte de Ventas Detallado</router-link
          >
        </li>
        <li>
          <router-link
            to="/reports/sales/by-type"
            class="text-blue-600 hover:underline"
            >Reporte de Ventas por Tipo (Servicio/Producto)</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// No se necesita lógica compleja aquí, solo la plantilla.
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
