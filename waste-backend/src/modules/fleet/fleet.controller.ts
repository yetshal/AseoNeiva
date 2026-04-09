import { Request, Response } from 'express';
import { pool } from '../../config/db';

/** GET /api/fleet  – Lista todos los vehículos con filtros opcionales */
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
