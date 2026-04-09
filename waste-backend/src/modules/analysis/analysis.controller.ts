import { Request, Response } from 'express';
import { pool } from '../../config/db';

/** GET /api/analysis/reports?period=week|month|year&from=YYYY-MM-DD&to=YYYY-MM-DD
 *  Estadísticas detalladas de reportes ciudadanos. */
export const getReportsAnalysis = async (req: Request, res: Response) => {
  try {
    const { period = 'month', from, to } = req.query;

    // Calcular rango de fechas
    let startDate: string;
    let endDate: string = new Date().toISOString();

    if (from && to) {
      startDate = from as string;
      endDate   = to   as string;
    } else {
      const now = new Date();
      if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
      } else if (period === 'year') {
        const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
        startDate = d.toISOString();
      } else { // month
        const d = new Date(now); d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString();
      }
    }

    const [
      totalRes,
      byStatusRes,
      byTypeRes,
      byDayRes,
      topZonesRes,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM reports WHERE created_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count FROM reports
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY status`,
        [startDate, endDate]
      ),
      pool.query(
        `SELECT type, COUNT(*) AS count FROM reports
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY type ORDER BY count DESC`,
        [startDate, endDate]
      ),
      // Reportes por día (últimos 30 días si month, o agrupado según period)
      pool.query(
        `SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
         FROM reports
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY day ORDER BY day ASC`,
        [startDate, endDate]
      ),
      // Zonas con más reportes (usando geolocalización aproximada por nombre de zona si no hay PostGIS)
      pool.query(
        `SELECT type AS zone, COUNT(*) AS count, 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
         FROM reports
         WHERE created_at BETWEEN $1 AND $2 AND latitude IS NOT NULL
         GROUP BY type ORDER BY count DESC LIMIT 10`,
        [startDate, endDate]
      ),
    ]);

    res.json({
      period:      period,
      from:        startDate,
      to:          endDate,
      total:       Number(totalRes.rows[0].total),
      byStatus:    byStatusRes.rows,
      byType:      byTypeRes.rows,
      byDay:       byDayRes.rows,
      topZones:    topZonesRes.rows,
    });
  } catch (err) {
    console.error('getReportsAnalysis error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/analysis/fleet?period=week|month|year
 *  Estadísticas de la flota: combustible, rutas, distancia. */
export const getFleetAnalysis = async (req: Request, res: Response) => {
  try {
    const { period = 'month', from, to } = req.query;

    let startDate: string;
    let endDate: string = new Date().toISOString();

    if (from && to) {
      startDate = from as string;
      endDate   = to   as string;
    } else {
      const now = new Date();
      if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
      } else if (period === 'year') {
        const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
        startDate = d.toISOString();
      } else {
        const d = new Date(now); d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString();
      }
    }

    const [
      collectionsRes,
      fuelRes,
      vehicleStatsRes,
      routeStatsRes,
      byDayRes,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(distance_km), 0) AS total_km,
                COALESCE(SUM(fuel_used),   0) AS total_fuel
         FROM collection_logs
         WHERE collected_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      ),
      // Combustible ahorrado estimado
      pool.query(
        `SELECT COALESCE(SUM(distance_km), 0) AS km FROM collection_logs
         WHERE collected_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      ),
      // Estado actual de vehículos
      pool.query(
        `SELECT status, COUNT(*) AS count FROM vehicles GROUP BY status`
      ),
      // Rutas más activas
      pool.query(
        `SELECT r.name, r.zone, COUNT(cl.id) AS collections,
                COALESCE(SUM(cl.distance_km), 0) AS total_km
         FROM routes r
         LEFT JOIN collection_logs cl ON cl.route_id = r.id
           AND cl.collected_at BETWEEN $1 AND $2
         GROUP BY r.id, r.name, r.zone
         ORDER BY collections DESC LIMIT 10`,
        [startDate, endDate]
      ),
      pool.query(
        `SELECT DATE_TRUNC('day', collected_at) AS day,
                COUNT(*) AS collections,
                COALESCE(SUM(fuel_used), 0) AS fuel
         FROM collection_logs
         WHERE collected_at BETWEEN $1 AND $2
         GROUP BY day ORDER BY day ASC`,
        [startDate, endDate]
      ),
    ]);

    const km           = Number(fuelRes.rows[0].km);
    const fuelSaved    = parseFloat((km * 0.07).toFixed(2));
    const co2Saved     = parseFloat((fuelSaved * 2.68).toFixed(2)); // 2.68 kg CO2/L diesel

    res.json({
      period,
      from:        startDate,
      to:          endDate,
      collections: Number(collectionsRes.rows[0].total),
      distanceKm:  Number(collectionsRes.rows[0].total_km),
      fuelUsed:    Number(collectionsRes.rows[0].total_fuel),
      fuelSaved,
      co2Saved,
      vehicleStatus: vehicleStatsRes.rows,
      topRoutes:     routeStatsRes.rows,
      byDay:         byDayRes.rows,
    });
  } catch (err) {
    console.error('getFleetAnalysis error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/analysis/users?period=month
 *  Estadísticas de participación ciudadana. */
export const getUsersAnalysis = async (req: Request, res: Response) => {
  try {
    const { period = 'month', from, to } = req.query;

    let startDate: string;
    let endDate: string = new Date().toISOString();

    if (from && to) {
      startDate = from as string;
      endDate   = to   as string;
    } else {
      const now = new Date();
      if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
      } else if (period === 'year') {
        const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
        startDate = d.toISOString();
      } else {
        const d = new Date(now); d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString();
      }
    }

    const [
      newUsersRes,
      levelDistRes,
      pointsRes,
      streakRes,
      registrationByDayRes,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM users WHERE created_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      ),
      // Distribución por niveles
      pool.query(
        `SELECT level, COUNT(*) AS count FROM users GROUP BY level ORDER BY level`
      ),
      pool.query(
        `SELECT COALESCE(SUM(points), 0) AS total,
                COALESCE(AVG(points), 0) AS avg,
                MAX(points)              AS max
         FROM users`
      ),
      pool.query(
        `SELECT COALESCE(AVG(streak), 0) AS avg_streak,
                MAX(streak)              AS max_streak
         FROM users WHERE status = 'active'`
      ),
      pool.query(
        `SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
         FROM users WHERE created_at BETWEEN $1 AND $2
         GROUP BY day ORDER BY day ASC`,
        [startDate, endDate]
      ),
    ]);

    res.json({
      period,
      from:         startDate,
      to:           endDate,
      newUsers:     Number(newUsersRes.rows[0].total),
      levelDist:    levelDistRes.rows,
      points: {
        total: Number(pointsRes.rows[0].total),
        avg:   parseFloat(Number(pointsRes.rows[0].avg).toFixed(1)),
        max:   Number(pointsRes.rows[0].max),
      },
      streaks: {
        avg: parseFloat(Number(streakRes.rows[0].avg_streak).toFixed(1)),
        max: Number(streakRes.rows[0].max_streak),
      },
      byDay: registrationByDayRes.rows,
    });
  } catch (err) {
    console.error('getUsersAnalysis error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
