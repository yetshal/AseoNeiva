import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db';

import { login } from './modules/auth/auth.controller';
import { verifyToken } from './middleware/auth';
import { getUsers, getUserById, getUserStats, updateUserStatus } from './modules/users/users.controller';


dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Rutas auth
app.post('/api/auth/login', login);

// Rutas usuarios (protegidas)
app.get('/api/users/stats',       verifyToken, getUserStats);
app.patch('/api/users/:id/status', verifyToken, updateUserStatus);
app.get('/api/users',             verifyToken, getUsers);
app.get('/api/users/:id',         verifyToken, getUserById);

app.listen(process.env.PORT, () =>
  console.log(`🚀 Servidor en puerto ${process.env.PORT}`)
);