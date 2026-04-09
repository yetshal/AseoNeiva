# Waste Dashboard

Panel de administración web para el sistema de gestión de residuos AseoNeiva, desarrollado con Angular.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

```bash
cd waste-dashboard
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
ng serve
```

Navegar a `http://localhost:4200/`.

## Producción

```bash
ng build
```

Los archivos compilados se almacenan en `dist/`.

## Estructura del Proyecto

```
waste-dashboard/
├── src/
│   ├── app/
│   │   ├── core/               # Servicios, guards e interceptors
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── features/           # Módulos de funcionalidades
│   │   │   ├── auth/
│   │   │   └── users/
│   │   ├── layout/             # Componentes de estructura
│   │   └── shared/             # Componentes y modelos compartidos
│   ├── assets/
│   ├── environments/
│   └── styles.scss
├── angular.json
└── package.json
```

## Dependencias Principales

- **@angular/core**: Framework principal
- **@angular/material**: Componentes UI
- **rxjs**: Programación reactiva
- **chart.js**: Gráficos y visualizaciones

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `ng generate component name` | Generar componente |
| `ng generate service name` | Generar servicio |
| `ng generate guard name` | Generar guard |
| `ng test` | Ejecutar pruebas unitarias |
| `ng build` | Compilar para producción |

## Licencia

MIT
