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
export const updateVehicleLocation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitud y longitud son obligatorias' });
    }

    const result = await pool.query(
      `UPDATE vehicles
       SET latitude = $1, 
           longitude = $2, 
           last_seen_at = NOW(), 
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, plate, latitude, longitude, last_seen_at`,
      [latitude, longitude, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });

    const vehicle = result.rows[0];

    // EMITIR VÍA WEBSOCKET
    if (req.io) {
      // Emitir a una sala específica si el vehículo está en una ruta
      const routeRes = await pool.query(
        'SELECT route_id FROM route_assignments WHERE vehicle_id = $1 AND assigned_date = CURRENT_DATE AND status = \'in_progress\'',
        [id]
      );
      
      const eventData = {
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        timestamp: vehicle.last_seen_at
      };

      if (routeRes.rows[0]) {
        const routeId = routeRes.rows[0].route_id;
        req.io.to(`route-${routeId}`).emit('vehicle-moved', eventData);
      }
      
      // También emitir al canal general para el Dashboard
      req.io.emit('vehicle-moved-all', eventData);
    }

    res.json({ vehicle });
  } catch (err) {
    console.error('updateVehicleLocation error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/fleet/:id/nearby-reports – Reportes cercanos al vehículo (FILTRO MANUAL SIN POSTGIS) */
export const getNearbyReports = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { radius = 1000 } = req.query; // Radio en metros (default 1km)

    // 1. Obtener ubicación del vehículo
    const vehicleRes = await pool.query('SELECT latitude, longitude FROM vehicles WHERE id = $1', [id]);
    if (!vehicleRes.rows[0] || !vehicleRes.rows[0].latitude) {
      return res.json({ data: [] });
    }

    const vLat = Number(vehicleRes.rows[0].latitude);
    const vLng = Number(vehicleRes.rows[0].longitude);

    // 2. Cálculo aproximado de caja delimitadora (Bounding Box)
    // 1 grado latitud ≈ 111,111 metros
    // 1 grado longitud ≈ 111,111 * cos(latitud) metros
    const latDelta = Number(radius) / 111111;
    const lngDelta = Number(radius) / (111111 * Math.cos(vLat * Math.PI / 180));

    const reportsRes = await pool.query(
      `SELECT r.id, r.type, r.description, r.photo_url, r.latitude, r.longitude, 
              r.status, r.created_at, u.name as user_name,
              rv.is_valid as validated, rv.validation_notes
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN report_validations rv ON r.id = rv.report_id
       WHERE r.status IN ('pending', 'reviewing')
         AND r.latitude BETWEEN $1 AND $2
         AND r.longitude BETWEEN $3 AND $4
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [vLat - latDelta, vLat + latDelta, vLng - lngDelta, vLng + lngDelta]
    );

    const reports = reportsRes.rows.map((r: any) => {
      // Haversine simple para la distancia real en la respuesta
      const dLat = (Number(r.latitude) - vLat) * Math.PI / 180;
      const dLon = (Number(r.longitude) - vLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(vLat * Math.PI / 180) * Math.cos(Number(r.latitude) * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = Math.round(6371000 * c);

      return {
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
        distance: distance
      };
    });

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
