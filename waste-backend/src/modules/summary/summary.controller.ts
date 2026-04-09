import { Request, Response } from 'express';
import { pool } from '../../config/db';

/** GET /api/summary
 *  Panel de control general con indicadores clave del sistema. */
export const getSummary = async (_req: Request, res: Response) => {
  try {
    const [
      usersRes,
      activeUsersRes,
      totalPointsRes,
      totalReportsRes,
      pendingReportsRes,
      resolvedReportsRes,
      vehiclesRes,
      activeVehiclesRes,
      fuelSavedRes,
      collectionsRes,
      topUsersRes,
      reportsByTypeRes,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
      pool.query('SELECT COALESCE(SUM(points), 0) AS total FROM users'),
      pool.query('SELECT COUNT(*) FROM reports'),
      pool.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM reports WHERE status = 'resolved'"),
      pool.query('SELECT COUNT(*) FROM vehicles'),
      pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'active'"),
      // Combustible ahorrado estimado: 0.15 L por km promedio de ruta completada
      pool.query(`
        SELECT COALESCE(SUM(fuel_used), 0)   AS total_fuel,
               COALESCE(SUM(distance_km), 0) AS total_km
        FROM collection_logs`),
      pool.query("SELECT COUNT(*) FROM route_assignments WHERE status = 'completed'"),
      // Top 5 usuarios por puntos
      pool.query(`
        SELECT id, name, points, level, streak
        FROM users ORDER BY points DESC LIMIT 5`),
      // Reportes por tipo
      pool.query(`
        SELECT type, COUNT(*) AS count
        FROM reports GROUP BY type ORDER BY count DESC`),
    ]);

    const fuel      = Number(fuelSavedRes.rows[0].total_fuel);
    const distanceKm = Number(fuelSavedRes.rows[0].total_km);
    // Ahorro estimado: un camión de basura consume ~35 L/100km
    // vs optimización de ruta que reduce un 20% → 0.07 L/km ahorrados
    const estimatedFuelSaved = parseFloat((distanceKm * 0.07).toFixed(2));

    res.json({
      users: {
        total:   Number(usersRes.rows[0].count),
        active:  Number(activeUsersRes.rows[0].count),
        points:  Number(totalPointsRes.rows[0].total),
      },
      reports: {
        total:    Number(totalReportsRes.rows[0].count),
        pending:  Number(pendingReportsRes.rows[0].count),
        resolved: Number(resolvedReportsRes.rows[0].count),
        byType:   reportsByTypeRes.rows,
      },
      fleet: {
        total:       Number(vehiclesRes.rows[0].count),
        active:      Number(activeVehiclesRes.rows[0].count),
        fuelUsed:    fuel,
        distanceKm:  distanceKm,
        fuelSaved:   estimatedFuelSaved,
        collections: Number(collectionsRes.rows[0].count),
      },
      topUsers: topUsersRes.rows,
    });
  } catch (err) {
    console.error('getSummary error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
