# Waste Backend

Este es el API backend para el sistema de gestión de residuos AseoNeiva, construido con Express.js y TypeScript.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Base de datos PostgreSQL

## Instalación

1. Instalar dependencias:
   ```bash
   cd waste-backend
   npm install
   ```

2. Configurar variables de entorno en `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=waste_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=tu_clave_secreta
   ```

## Desarrollo

Ejecutar el servidor de desarrollo con recarga automática:

```bash
npm run dev
```

El servidor iniciara en `http://localhost:3000`.

## Compilacion

Compilar TypeScript a JavaScript:

```bash
npm run build
```

## Produccion

Ejecutar la version compilada para produccion:

```bash
npm start
```

## Estructura del Proyecto

```
waste-backend/
├── src/
│   ├── index.ts          # Punto de entrada
│   ├── config/
│   │   └── db.ts         # Configuracion de base de datos
│   ├── middleware/
│   │   └── auth.ts       # Middleware de autenticacion
│   └── modules/
│       ├── auth/         # Rutas y controladores de autenticacion
│       └── users/        # Rutas y controladores de usuarios
├── .env                  # Variables de entorno (rastreado)
└── package.json
```

## Dependencias

- **express**: Framework web
- **pg**: Cliente PostgreSQL
- **bcrypt**: Encriptacion de contrasenas
- **jsonwebtoken**: Autenticacion JWT
- **joi**: Validacion de solicitudes
- **cors**: Intercambio de recursos entre origenes
- **dotenv**: Gestion de variables de entorno

## Endpoints del API

### Autenticacion
- `POST /api/auth/login` - Inicio de sesion de usuario
- `POST /api/auth/register` - Registro de usuario

### Usuarios
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
