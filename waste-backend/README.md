# AseoNeiva Backend API 🚀

Servidor API REST y en tiempo real para el sistema de gestión de residuos de Neiva. Desarrollado con **Node.js**, **Express**, **TypeScript** y **PostgreSQL**, este motor centraliza la lógica ciudadana, operativa y administrativa del proyecto.

## ✨ Características Principales

- **🔐 Sistema de Autenticación Dual:** Gestión separada para ciudadanos (App Móvil) y personal administrativo (Dashboard) mediante JWT.
- **🛰️ Monitoreo en Tiempo Real:** Comunicación bidireccional mediante **Socket.io** para el seguimiento de la flota y notificaciones.
- **📊 Módulos de Análisis:** Generación de métricas de reportes, eficiencia de flota y estadísticas de usuarios.
- **🚛 Gestión de Flota y Rutas:** Control de vehículos, asignación de conductores y planificador de rutas de recolección/barrido.
- **🏆 Motor de Gamificación:** Sistema de niveles, recompensas, tablas de clasificación y validación de recolección para ciudadanos.
- **📸 Procesamiento de Imágenes:** Gestión de evidencias fotográficas para reportes mediante **Multer** y optimización con **Sharp**.
- **📍 Soporte Espacial:** Integración con **PostGIS** para consultas de geolocalización y proximidad.

## 🛠️ Tecnologías

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL con PostGIS
- **Tiempo Real:** Socket.io
- **Validación:** Joi y Zod
- **Seguridad:** Bcrypt (Hasheo) y JSON Web Token (Autenticación)
- **Multimedia:** Multer (Upload) y Sharp (Optimización)

## 🚀 Requisitos Previos

- **Node.js:** v18 o superior
- **PostgreSQL:** v14 o superior con extensión **PostGIS** activa.
- **npm** o **yarn**

## 📦 Instalación

```bash
cd waste-backend
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz de `waste-backend` basado en el siguiente ejemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=waste_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_clave_secreta_maestra
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200,http://localhost:8100
```

## 💻 Desarrollo

Para iniciar el servidor en modo desarrollo con recarga automática:

```bash
npm run dev
```

El API estará disponible en `http://localhost:3000`. Puedes verificar el estado en `http://localhost:3000/api/health`.

## 🏗️ Producción

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```
2. **Iniciar servidor:**
   ```bash
   npm start
   ```

## 📂 Estructura del Proyecto

```
waste-backend/
├── src/
│   ├── config/               # Configuración de DB y variables
│   ├── middleware/           # Auth, Multer, Error handling, Ownership
│   ├── modules/              # Lógica de negocio por dominio
│   │   ├── analysis/         # Reportes estadísticos y tendencias
│   │   ├── citizen-auth/     # Registro y login móvil
│   │   ├── fleet/            # Gestión de vehículos y ubicación GPS
│   │   ├── gamification/     # Niveles, puntos y logros
│   │   ├── reports/          # Gestión de reportes ciudadanos
│   │   ├── routes/           # Planificador y asignaciones
│   │   └── staff/            # Administración del personal
│   └── index.ts              # Punto de entrada y definición de rutas
├── uploads/                  # Almacenamiento de imágenes de reportes
├── package.json
└── tsconfig.json
```

## 📝 Licencia

MIT - AseoNeiva
