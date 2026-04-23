import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db';
import { pool } from './config/db';

import { login } from './modules/auth/auth.controller';
import { verifyToken } from './middleware/auth';

// Módulos existentes
import { getUsers, getUserById, getUserStats, updateUserStatus, createUser, updateUser } from './modules/users/users.controller';

// Nuevos módulos
import { getSummary } from './modules/summary/summary.controller';
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, updateVehicleLocation, getNearbyReports, validateReport as validateVehicleReport, getActiveVehicles } from './modules/fleet/fleet.controller';
import { getStaff, getStaffById, createStaff, updateStaff, changeStaffPassword, deleteStaff } from './modules/staff/staff.controller';
import { getReportsAnalysis, getFleetAnalysis, getUsersAnalysis } from './modules/analysis/analysis.controller';
import { getRoutes, getRouteById, createRoute, updateRoute, deleteRoute, getAssignments, createAssignment, updateAssignment, deleteAssignment } from './modules/routes/routes.controller';

// Módulo ciudadano (app móvil)
import { citizenLogin, citizenRegister, citizenRecovery, getCitizenProfile, updateCitizenProfile } from './modules/citizen-auth/citizen-auth.controller';
import { verifyCitizenToken } from './middleware/citizen-auth';

// Gamificación
import { getLevels, getUserGamification, registerTrashCollection, getLeaderboard, validateReport, updateUserType, getUserCollections } from './modules/gamification/gamification.controller';

// Reportes
import { getAllReports, getReportById, updateReportStatus, validateReportAndAwardPoints, createReport, deleteReport, getMyReports } from './modules/reports/reports.controller';

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Auth ─────────────────────────────────────────────────────
app.post('/api/auth/login', login);

// ── Health check for debugging ───────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Auth Ciudadano (App Móvil) ────────────────────────────────
app.post('/api/citizen/login', citizenLogin);
app.post('/api/citizen/register', citizenRegister);
app.post('/api/citizen/recovery', citizenRecovery);
app.get('/api/citizen/profile', verifyCitizenToken, getCitizenProfile);
app.patch('/api/citizen/profile', verifyCitizenToken, updateCitizenProfile);

// ── Usuarios (ciudadanos) ────────────────────────────────────
app.get('/api/users/stats',        verifyToken, getUserStats);
app.patch('/api/users/:id/status', verifyToken, updateUserStatus);
app.get('/api/users',              verifyToken, getUsers);
app.get('/api/users/:id',         verifyToken, getUserById);
app.post('/api/users',             verifyToken, createUser);
app.patch('/api/users/:id',       verifyToken, updateUser);

// ── Resumen / Panel de control ───────────────────────────────
app.get('/api/summary', verifyToken, getSummary);

// ── Flota (vehículos) ────────────────────────────────────────
app.get('/api/fleet/active',             getActiveVehicles);
app.get('/api/fleet',                    verifyToken, getVehicles);
app.post('/api/fleet',                   verifyToken, createVehicle);
app.get('/api/fleet/:id',                verifyToken, getVehicleById);
app.patch('/api/fleet/:id',              verifyToken, updateVehicle);
app.delete('/api/fleet/:id',             verifyToken, deleteVehicle);
app.patch('/api/fleet/:id/location',     verifyToken, updateVehicleLocation);
app.get('/api/fleet/:id/nearby-reports', verifyToken, getNearbyReports);
app.post('/api/fleet/:id/validate-report', verifyToken, validateVehicleReport);

// ── Personal (admins del dashboard) ─────────────────────────
app.get('/api/staff',                    verifyToken, getStaff);
app.post('/api/staff',                   verifyToken, createStaff);
app.get('/api/staff/:id',                verifyToken, getStaffById);
app.patch('/api/staff/:id',              verifyToken, updateStaff);
app.patch('/api/staff/:id/password',     verifyToken, changeStaffPassword);
app.delete('/api/staff/:id',             verifyToken, deleteStaff);

// ── Análisis ─────────────────────────────────────────────────
app.get('/api/analysis/reports', verifyToken, getReportsAnalysis);
app.get('/api/analysis/fleet',   verifyToken, getFleetAnalysis);
app.get('/api/analysis/users',   verifyToken, getUsersAnalysis);

// ── Rutas y asignaciones (planificador) ──────────────────────
app.get('/api/routes',                       verifyToken, getRoutes);
app.post('/api/routes',                      verifyToken, createRoute);
app.get('/api/routes/assignments',           verifyToken, getAssignments);
app.post('/api/routes/assignments',          verifyToken, createAssignment);
app.patch('/api/routes/assignments/:id',     verifyToken, updateAssignment);
app.delete('/api/routes/assignments/:id',    verifyToken, deleteAssignment);
app.get('/api/routes/:id',                   verifyToken, getRouteById);
app.patch('/api/routes/:id',                 verifyToken, updateRoute);
app.delete('/api/routes/:id',                verifyToken, deleteRoute);

// ── Gamificación ─────────────────────────────────────────────
app.get('/api/gamification/levels', getLevels);
app.get('/api/gamification/profile', verifyCitizenToken, getUserGamification);
app.post('/api/gamification/collection', verifyCitizenToken, registerTrashCollection);
app.get('/api/gamification/leaderboard', getLeaderboard);
app.get('/api/gamification/collections', verifyCitizenToken, getUserCollections);

// Reportes ────────────────────────────────────────────────────────
app.get('/api/reports', verifyToken, getAllReports);
app.get('/api/reports/user', verifyCitizenToken, getMyReports);
app.post('/api/reports', verifyCitizenToken, createReport);
app.get('/api/reports/:id', verifyToken, getReportById);
app.delete('/api/reports/:id', verifyCitizenToken, deleteReport);
app.patch('/api/reports/:id/status', verifyToken, updateReportStatus);
app.patch('/api/reports/:reportId/validate', verifyToken, validateReportAndAwardPoints);

// Report validation (dashboard)
app.patch('/api/gamification/reports/:reportId/validate', verifyToken, validateReport);

// User type management
app.patch('/api/users/:userId/type', verifyToken, updateUserType);

app.listen(process.env.PORT, async () => {
  try {
    await pool.query(`
      ALTER TABLE report_validations DROP CONSTRAINT IF EXISTS report_validations_validated_by_fkey;
      ALTER TABLE report_validations ALTER COLUMN validated_by DROP NOT NULL;
    `);
    console.log('✅ FK de report_validations eliminada');
  } catch (e: any) {
    console.log('⚠️ Error al modificar FK (puede que ya esté eliminada):', e.message);
  }
  
  console.log(`🚀 Servidor en puerto ${process.env.PORT}`)
});
