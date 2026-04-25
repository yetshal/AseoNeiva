# AseoNeiva - Sistema de Gestión de Residuos ♻️

Ecosistema integral para la gestión, monitoreo y participación ciudadana en el servicio de aseo de Neiva, Colombia. Este proyecto combina una aplicación móvil para ciudadanos, un panel administrativo para la operación y un backend robusto con capacidades en tiempo real.

## 🏗️ Arquitectura del Sistema

El proyecto está organizado en tres componentes principales:

| Componente | Descripción | Tecnologías Clave |
|------------|-------------|-------------------|
| [**App Móvil**](./waste-app) | Aplicación para ciudadanos: reportes, horarios y gamificación. | Ionic 8, Angular 20, Capacitor |
| [**Dashboard**](./waste-dashboard) | Panel administrativo: monitoreo de flota, rutas y analítica. | Angular 18, Leaflet, ng-icons |
| [**Backend**](./waste-backend) | API central, sockets en tiempo real y persistencia de datos. | Node.js, Express, PostgreSQL, Socket.io |

## 🛠️ Stack Tecnológico Global

- **Lenguaje:** TypeScript (en todo el ecosistema)
- **Base de Datos:** PostgreSQL con extensión PostGIS para geolocalización.
- **Comunicación:** REST API y WebSockets para actualizaciones en tiempo real.
- **Mapas:** Integración avanzada con Leaflet y Google Maps API.

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos
- Node.js (v18+)
- PostgreSQL (v14+) + PostGIS
- Angular CLI & Ionic CLI (`npm install -g @angular/cli @ionic/cli`)

### 2. Configuración de Base de Datos
1. Crea una base de datos llamada `waste_db`.
2. Ejecuta los scripts de la carpeta [`/migrations`](./migrations) en orden secuencial para preparar el esquema:
   - `001_new_tables.sql` (Tablas base)
   - `002_gamification.sql` (Sistema de puntos y niveles)
   - `003_add_user_schedule.sql` (Horarios ciudadanos)
   - `004_postgis_integration.sql` (Funciones geográficas)

### 3. Instalación y Ejecución

#### Backend
```bash
cd waste-backend
npm install
# Configura tu .env basado en la guía del README interno
npm run dev
```

#### Dashboard (Admin)
```bash
cd waste-dashboard
npm install
npm start
```

#### App Móvil (Ciudadano)
```bash
cd waste-app
npm install
npm start
```

## 📂 Estructura del Repositorio

```
AseoNeiva/
├── waste-backend/      # Motor de la aplicación (API & Sockets)
├── waste-dashboard/    # Interfaz administrativa web
├── waste-app/          # Aplicación híbrida iOS/Android
├── migrations/         # Scripts de inicialización de base de datos
└── README.md           # Guía general del proyecto
```

## 📝 Documentación Detallada
Para más detalles sobre cada componente, consulta sus respectivos archivos README:
- [Documentación del Backend](./waste-backend/README.md)
- [Documentación del Dashboard](./waste-dashboard/README.md)
- [Documentación de la App Móvil](./waste-app/README.md)

## 📄 Licencia
MIT - Proyecto desarrollado para la gestión eficiente de residuos en Neiva.
