# Waste Backend

API REST para el sistema de gestión de residuos AseoNeiva, desarrollada con Express.js y TypeScript.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- PostgreSQL (v14 o superior)

## Instalación

```bash
cd waste-backend
npm install
```

## Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=waste_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

## Desarrollo

```bash
npm run dev
```

El servidor iniciara en `http://localhost:3000`.

## Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
waste-backend/
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── app.ts                # Configuración de Express
│   ├── config/
│   │   └── db.ts             # Conexión a PostgreSQL
│   ├── middleware/
│   │   ├── auth.ts           # Autenticación JWT
│   │   └── error.ts          # Manejo de errores
│   ├── modules/
│   │   ├── auth/             # Autenticación
│   │   │   ├── controller.ts
│   │   │   ├── model.ts
│   │   │   ├── routes.ts
│   │   │   └── validation.ts
│   │   └── users/            # Gestión de usuarios
│   │       ├── controller.ts
│   │       ├── model.ts
│   │       ├── routes.ts
│   │       └── validation.ts
│   └── utils/
│       └── response.ts       # Utilitarios de respuesta
├── .env
├── package.json
└── tsconfig.json
```

## Dependencias Principales

- **express**: Framework web
- **pg**: Cliente PostgreSQL
- **bcrypt**: Encriptación de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **joi**: Validación de datos
- **cors**: CORS
- **dotenv**: Variables de entorno

## Endpoints del API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/profile` | Obtener perfil del usuario |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor en desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar versión compilada |
| `npm run lint` | Verificar código |

## Licencia

MIT
