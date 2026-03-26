# Waste Dashboard

Este es el panel de administracion frontend para el sistema de gestion de residuos AseoNeiva, construido con Angular 18.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

1. Instalar dependencias:
   ```bash
   cd waste-dashboard
   npm install
   ```

2. Configurar variables de entorno en `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api'
   };
   ```

## Desarrollo

Ejecutar el servidor de desarrollo:

```bash
ng serve
```

Navegar a `http://localhost:4200/`. La aplicacion se recargara automaticamente si cambias alguno de los archivos fuente.

## Generacion de Codigo

Ejecutar `ng generate component nombre-componente` para generar un nuevo componente. Tambien puedes usar:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Compilacion

Compilar para produccion:

```bash
ng build
```

Los archivos compilados se almacenaran en el directorio `dist/`.

## Pruebas Unitarias

Ejecutar pruebas unitarias con [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Pruebas de Extremo a Extremo

Ejecutar pruebas e2e con una plataforma de tu eleccion:

```bash
ng e2e
```

Para usar este comando, primero debes agregar un paquete que implemente capacidades de pruebas de extremo a extremo.

## Estructura del Proyecto

```
waste-dashboard/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios centrales y guardias
│   │   │   ├── guards/        # Guardias de ruta
│   │   │   ├── interceptors/   # Interceptores HTTP
│   │   │   └── services/       # Servicios de API
│   │   ├── features/          # Modulos de funciones
│   │   │   ├── auth/          # Modulo de autenticacion
│   │   │   └── users/         # Modulo de usuarios
│   │   ├── layout/            # Componentes de estructura
│   │   └── shared/            # Componentes y modelos compartidos
│   ├── environments/          # Archivos de entorno
│   └── styles.scss            # Estilos globales
└── angular.json
```

## Dependencias Principales

- **Angular**: Framework frontend
- **RxJS**: Programacion reactiva
- **Angular Router**: Navegacion
- **Angular Forms**: Formularios reactivos y plantillas

## Mas Ayuda

Para mas ayuda sobre Angular CLI, usa `ng help` o consulta la [pagina de referencia de Angular CLI](https://angular.dev/tools/cli).
