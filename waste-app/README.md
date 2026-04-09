# Waste App

Aplicación móvil para el sistema de gestión de residuos AseoNeiva, desarrollada con Ionic y Angular.

## Requisitos Previos

- Node.js (v18 o superior)
- Ionic CLI (`npm install -g @ionic/cli`)
- Angular CLI (`npm install -g @angular/cli`)
- Capacitor CLI (`npm install -g @capacitor/cli`)

## Instalación

```bash
cd waste-app
npm install
```

## Configuración

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Desarrollo

```bash
npm start
```

Navegar a `http://localhost:8100/`.

## Plataformas

### Android

```bash
ionic capacitor add android
ionic capacitor run android
```

### iOS

```bash
ionic capacitor add ios
ionic capacitor run ios
```

## Sincronización

Después de modificar código TypeScript/Angular:

```bash
npx cap sync
```

## Estructura del Proyecto

```
waste-app/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios y configuraciones
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── features/          # Módulos de funciones
│   │   ├── pages/             # Páginas de la app
│   │   └── shared/            # Componentes compartidos
│   ├── assets/
│   ├── environments/
│   └── theme/
├── android/                   # Proyecto Android
├── ios/                       # Proyecto iOS
├── capacitor.config.ts
├── ionic.config.json
└── package.json
```

## Dependencias Principales

- **@ionic/angular**: Framework UI móvil
- **@capacitor/core**: Runtime para apps nativas
- **@capacitor/camera**: Acceso a cámara
- **@capacitor/geolocation**: Ubicación GPS
- **@googlemaps/js-api-loader**: Google Maps
- **socket.io-client**: Comunicación en tiempo real
- **leaflet**: Mapas interactivos

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npx cap sync` | Sincronizar con Capacitor |

## Licencia

MIT
