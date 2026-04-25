# AseoNeiva Mobile App 📱

Aplicación móvil ciudadana para el sistema de gestión de residuos de Neiva. Desarrollada con **Ionic 8**, **Angular 20** y **Capacitor 8**, esta app permite a los ciudadanos interactuar de manera eficiente con los servicios de aseo de la ciudad.

## ✨ Características Principales

- **📊 Gestión de Reportes:** Reporta incidentes o acumulación de residuos con fotos y geolocalización precisa.
- **🗺️ Mapa Interactivo:** Visualiza rutas de recolección en tiempo real y puntos de interés cercanos (integración con Leaflet y Google Maps).
- **⏰ Horarios Personalizados:** Configura tus propios días y horas de recolección para recibir alertas inteligentes.
- **🏆 Gamificación:** Sistema de puntos y recompensas para fomentar la cultura ciudadana y el reciclaje.
- **⚡ Tiempo Real:** Notificaciones y actualizaciones instantáneas mediante Socket.io.
- **🌙 Diseño Moderno:** Interfaz pulida con un sistema visual basado en gradientes suaves, efectos de desenfoque (Glassmorphism) y animaciones fluidas.

## 🛠️ Tecnologías

- **Framework:** Ionic 8 / Angular 20
- **Runtime Nativo:** Capacitor 8
- **Mapas:** Leaflet / Google Maps JS API
- **Comunicación:** Socket.io-client / HttpClient
- **Base de Datos Local:** SQLite (vía Capacitor Community Plugin)
- **Estilos:** SASS con sistema visual personalizado

## 🚀 Requisitos Previos

- **Node.js:** v18 o superior
- **Ionic CLI:** `npm install -g @ionic/cli`
- **Android Studio:** Para compilación en Android
- **Xcode:** Para compilación en iOS (solo macOS)

## 📦 Instalación

```bash
cd waste-app
npm install
```

## ⚙️ Configuración

Asegúrate de configurar la URL del backend en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // URL de waste-backend
};
```

## 💻 Desarrollo

Para iniciar el servidor de desarrollo con recarga en vivo:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:8100/`.

## 🧪 Pruebas y Calidad de Código

Para ejecutar las pruebas unitarias:
```bash
npm test
```

Para ejecutar el linter y verificar el estilo de código:
```bash
npm run lint
```

## 📱 Despliegue en Dispositivos

### Android
```bash
ionic capacitor build android
ionic capacitor run android
```

### iOS
```bash
ionic capacitor build ios
ionic capacitor run ios
```

### Sincronización
Cada vez que realices cambios en el código web y quieras verlos en el dispositivo nativo:
```bash
npx cap sync
```

## 📂 Estructura del Proyecto

```
waste-app/
├── src/
│   ├── app/
│   │   ├── home/              # Página principal y configuración de horarios
│   │   ├── pages/             # Módulos de la aplicación
│   │   │   ├── auth/          # Login y Registro (Ciudadano/Empresa)
│   │   │   ├── map/           # Vista de mapas y rutas
│   │   │   ├── profile/       # Perfil del usuario y gamificación
│   │   │   └── report/        # Formulario de reportes ciudadanos
│   │   ├── services/          # Lógica de negocio y comunicación con API
│   │   ├── models/            # Definición de interfaces y tipos
│   │   └── tabs/              # Navegación principal
│   ├── assets/                # Recursos estáticos (iconos, shapes)
│   ├── theme/                 # Variables de tema Ionic
│   └── global.scss            # Sistema visual y estilos globales
├── android/                   # Proyecto nativo Android
├── capacitor.config.ts        # Configuración de Capacitor
└── package.json               # Dependencias y scripts
```

## 📝 Licencia

MIT - AseoNeiva
