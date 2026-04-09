# AseoNeiva

Sistema de gestión de residuos para la ciudad de Neiva, Colombia. Permite la administración de usuarios, rutas de recolección, y seguimiento en tiempo real de vehículos.

## Proyectos

| Proyecto | Descripción | Puerto |
|----------|-------------|--------|
| [waste-backend](./waste-backend) | API REST desarrollada con Express.js y TypeScript | 3000 |
| [waste-dashboard](./waste-dashboard) | Panel de administración web desarrollado con Angular | 4200 |
| [waste-app](./waste-app) | Aplicación móvil desarrollada con Ionic y Angular | 8100 |

## Tecnologías

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Socket.IO
- **Dashboard**: Angular 20, RxJS, Angular Material
- **App Móvil**: Ionic 8, Angular 20, Capacitor

## Estructura del Monorepo

```
AseoNeiva/
├── README.md                    # Este archivo
├── AseoNeiva.sql               # Esquema de base de datos
├── waste-backend/              # API REST
├── waste-dashboard/            # Panel administrativo web
└── waste-app/                  # Aplicación móvil
```

## Primeros Pasos

### Requisitos Comunes

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### Configuración de la Base de Datos

1. Crear una base de datos PostgreSQL llamada `waste_db`
2. Importar el archivo `AseoNeiva.sql`:

```bash
psql -U tu_usuario -d waste_db -f AseoNeiva.sql
```

### Backend

```bash
cd waste-backend
npm install
# Configurar .env con tus credenciales
npm run dev
```

### Dashboard

```bash
cd waste-dashboard
npm install
ng serve
```

### App Móvil

```bash
cd waste-app
npm install
npm start
```

## Licencia

MIT
