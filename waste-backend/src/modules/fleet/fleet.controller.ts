import { Request, Response } from 'express';
import { pool } from '../../config/db';

/** GET /api/fleet  – Lista todos los vehículos con filtros opcionales */
export const getActiveVehicles = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      `SELECT v.*, r.name as route_name, r.zone, ra.shift, ra.status as assignment_status
       FROM vehicles v
       JOIN route_assignments ra ON v.id = ra.vehicle_id
       JOIN routes r ON ra.route_id = r.id
       WHERE ra.assigned_date = $1 AND ra.status != 'cancelled'`,
      [today]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('getActiveVehicles error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { status, type, search } = req.query;
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(plate ILIKE $${params.length} OR driver_name ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT id, plate, model, type, status, driver_name, driver_phone,
              fuel_capacity, latitude, longitude, last_seen_at, created_at
       FROM vehicles ${where}
       ORDER BY status ASC, plate ASC`,
      params
    );

    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('getVehicles error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/fleet/:id  – Detalle de un vehículo + última asignación */
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicleRes = await pool.query(
      `SELECT id, plate, model, type, status, driver_name, driver_phone,
              fuel_capacity, latitude, longitude, last_seen_at, created_at
       FROM vehicles WHERE id = $1`,
      [id]
    );

    if (!vehicleRes.rows[0]) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const assignmentRes = await pool.query(
      `SELECT ra.id, ra.assigned_date, ra.shift, ra.status, ra.notes,
              r.name AS route_name, r.zone
       FROM route_assignments ra
       JOIN routes r ON r.id = ra.route_id
       WHERE ra.vehicle_id = $1
       ORDER BY ra.assigned_date DESC
       LIMIT 5`,
      [id]
    );

    const logsRes = await pool.query(
      `SELECT cl.collected_at, cl.fuel_used, cl.distance_km,
              r.name AS route_name
       FROM collection_logs cl
       JOIN routes r ON r.id = cl.route_id
       WHERE cl.vehicle_id = $1
       ORDER BY cl.collected_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      vehicle:     vehicleRes.rows[0],
      assignments: assignmentRes.rows,
      logs:        logsRes.rows,
    });
  } catch (err) {
    console.error('getVehicleById error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** POST /api/fleet  – Crear vehículo */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { plate, model, type, driver_name, driver_phone, fuel_capacity } = req.body;

    if (!plate) return res.status(400).json({ message: 'La placa es obligatoria' });

    const result = await pool.query(
      `INSERT INTO vehicles (plate, model, type, driver_name, driver_phone, fuel_capacity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, plate, model, type, status, driver_name, driver_phone, fuel_capacity, created_at`,
      [plate, model ?? null, type ?? 'truck', driver_name ?? null, driver_phone ?? null, fuel_capacity ?? 0]
    );

    res.status(201).json({ vehicle: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un vehículo con esa placa' });
    }
    console.error('createVehicle error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/fleet/:id  – Actualizar vehículo */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plate, model, type, status, driver_name, driver_phone, fuel_capacity } = req.body;

    const validStatuses = ['active', 'out_of_service', 'maintenance'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const result = await pool.query(
      `UPDATE vehicles
       SET plate = COALESCE($1, plate),
           model = COALESCE($2, model),
           type  = COALESCE($3, type),
           status = COALESCE($4, status),
           driver_name  = COALESCE($5, driver_name),
           driver_phone = COALESCE($6, driver_phone),
           fuel_capacity = COALESCE($7, fuel_capacity),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, plate, model, type, status, driver_name, driver_phone, fuel_capacity, updated_at`,
      [plate, model, type, status, driver_name, driver_phone, fuel_capacity, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });

    res.json({ vehicle: result.rows[0] });
  } catch (err) {
    console.error('updateVehicle error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** DELETE /api/fleet/:id  – Eliminar vehículo */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo eliminado' });
  } catch (err) {
    console.error('deleteVehicle error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/fleet/:id/location  – Actualizar posición GPS (usado por Socket.io) */
export const updateVehicleLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitud y longitud son obligatorias' });
    }

    const result = await pool.query(
      `UPDATE vehicles
       SET latitude = $1, longitude = $2, last_seen_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING id, plate, latitude, longitude, last_seen_at`,
      [latitude, longitude, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });

    res.json({ vehicle: result.rows[0] });
  } catch (err) {
    console.error('updateVehicleLocation error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/fleet/:id/nearby-reports – Reportes cercanos al vehículo */
export const getNearbyReports = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { radius = 500 } = req.query;

    const vehicleRes = await pool.query(
      'SELECT latitude, longitude FROM vehicles WHERE id = $1',
      [id]
    );

    if (!vehicleRes.rows[0] || !vehicleRes.rows[0].latitude) {
      return res.status(400).json({ message: 'El vehículo no tiene ubicación registrada' });
    }

    const { latitude, longitude } = vehicleRes.rows[0];

    const reportsRes = await pool.query(
      `SELECT r.id, r.type, r.description, r.photo_url, r.latitude, r.longitude, 
              r.status, r.created_at, u.name as user_name,
              rv.is_valid as validated, rv.validation_notes
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN report_validations rv ON r.id = rv.report_id
       WHERE r.status IN ('pending', 'reviewing')
         AND r.latitude IS NOT NULL
         AND r.longitude IS NOT NULL
         AND (
           (6371000 * acos(
             cos(radians($1)) * cos(radians(r.latitude)) * 
             cos(radians(r.longitude) - radians($2)) + 
             sin(radians($1)) * sin(radians(r.latitude))
           )) <= $3
         )
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [latitude, longitude, radius]
    );

    const reports = reportsRes.rows.map((r: any) => ({
      id: r.id,
      type: r.type,
      description: r.description,
      photoUrl: r.photo_url,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      status: r.status,
      createdAt: r.created_at,
      userName: r.user_name,
      validated: r.validated,
      validationNotes: r.validation_notes,
    }));

    res.json({ data: reports });
  } catch (err) {
    console.error('getNearbyReports error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** POST /api/fleet/:id/validate-report – Validar reporte y otorgar puntos */
export const validateReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reportId, isValid, notes } = req.body;

  if (!reportId || isValid === undefined) {
    return res.status(400).json({ message: 'reportId e isValid son requeridos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const vehicleRes = await client.query(
      'SELECT id FROM vehicles WHERE id = $1',
      [id]
    );

    if (!vehicleRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const reportRes = await client.query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );

    if (!reportRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    const existingValidation = await client.query(
      'SELECT * FROM report_validations WHERE report_id = $1',
      [reportId]
    );

    if (existingValidation.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Este reporte ya fue validado' });
    }

    await client.query(
      `INSERT INTO report_validations (report_id, validated_by, is_valid, validation_notes)
       VALUES ($1, $2, $3, $4)`,
      [reportId, id, isValid, notes || null]
    );

    const newStatus = isValid ? 'resolved' : 'reviewing';
    await client.query(
      'UPDATE reports SET status = $1 WHERE id = $2',
      [newStatus, reportId]
    );

    const userId = reportRes.rows[0].user_id;
    let pointsAwarded = 0;

    if (userId) {
      await client.query(
        'UPDATE users SET total_reports = COALESCE(total_reports, 0) + 1 WHERE id = $1',
        [userId]
      );

      if (isValid) {
        const reportReward = 5;
        pointsAwarded = reportReward;

        await client.query(
          'UPDATE users SET valid_reports = COALESCE(valid_reports, 0) + 1, points = points + $1 WHERE id = $2',
          [reportReward, userId]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      message: isValid ? 'Reporte validado como válido (+5 puntos)' : 'Reporte marcado como inválido',
      pointsAwarded,
      validated: true,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('validateReport error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  } finally {
    client.release();
  }
};
