# AseoNeiva Admin Dashboard 🖥️

Panel de administración web para el sistema de gestión de residuos de Neiva. Desarrollado con **Angular 18**, este dashboard permite la gestión centralizada de flotas, personal, ciudadanos y el monitoreo en tiempo real de la operación de aseo.

## ✨ Características Principales

- **📈 Dashboard de Resumen:** Visualización de métricas clave, estadísticas de recolección y estado del servicio.
- **🗺️ Monitoreo de Flota:** Seguimiento en tiempo real de los vehículos de recolección mediante integración con Leaflet y Socket.io.
- **📑 Gestión de Reportes:** Administración de incidentes reportados por los ciudadanos, incluyendo evidencia fotográfica y ubicación.
- **🛣️ Planificador de Rutas:** Herramienta para la visualización y optimización de las rutas de recolección y barrido.
- **👥 Administración de Usuarios:** Gestión completa de ciudadanos (usuarios de la app móvil) y personal administrativo.
- **🚛 Control de Campo:** Gestión del personal operativo, incluyendo conductores, recolectores y barredores, así como el inventario de vehículos.
- **🔬 Análisis de Datos:** Módulo especializado para el análisis de tendencias y eficiencia operativa.

## 🛠️ Tecnologías

- **Framework:** Angular 18 (Standalone Components)
- **Mapas:** Leaflet / Google Maps JS API
- **Iconos:** Heroicons (vía @ng-icons)
- **Comunicación:** Socket.io-client / HttpClient con Interceptores
- **Estilos:** SASS (SCSS) con diseño modular y limpio

## 🚀 Requisitos Previos

- **Node.js:** v18 o superior
- **Angular CLI:** `npm install -g @angular/cli`

## 📦 Instalación

```bash
cd waste-dashboard
npm install
```

## ⚙️ Configuración

Asegúrate de configurar la URL del backend en `src/environments/environment.ts` (o `environment.development.ts` para desarrollo):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // URL de waste-backend
};
```

## 💻 Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

El dashboard estará disponible en `http://localhost:4200/`.

## 🧪 Pruebas

Para ejecutar las pruebas unitarias con Karma:
```bash
npm test
```

## 🏗️ Construcción (Producción)

Para generar los archivos de producción:
```bash
npm run build
```
Los archivos resultantes se encontrarán en la carpeta `dist/waste-dashboard`.

## 📂 Estructura del Proyecto

```
waste-dashboard/
├── src/
│   ├── app/
│   │   ├── core/               # Singleton services, guards e interceptors
│   │   ├── features/           # Módulos funcionales (Rutas, Flota, Usuarios, etc.)
│   │   ├── layout/             # Estructura principal del dashboard (Sidebar, Header)
│   │   ├── shared/             # Componentes, modelos y pipes reutilizables
│   │   ├── app.routes.ts       # Definición de rutas y lazy loading
│   │   └── app.config.ts       # Configuración global de la aplicación
│   ├── assets/                 # Imágenes y recursos estáticos
│   ├── environments/           # Archivos de configuración por entorno
│   └── styles.scss             # Estilos globales y reset
├── angular.json                # Configuración de Angular Workspace
└── package.json                # Dependencias y scripts
```

## 📝 Licencia

MIT - AseoNeiva
