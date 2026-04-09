import { Request, Response } from 'express';
import { pool } from '../../config/db';

/** GET /api/routes  – Listar rutas con filtros */
export const getRoutes = async (req: Request, res: Response) => {
  try {
    const { status, type, zone, search } = req.query;
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
    if (zone) {
      params.push(zone);
      conditions.push(`zone = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT id, name, description, zone, type, status, color, created_at
       FROM routes ${where}
       ORDER BY zone ASC, name ASC`,
      params
    );

    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('getRoutes error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/routes/:id */
export const getRouteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const routeRes = await pool.query(
      'SELECT id, name, description, zone, type, status, color, created_at FROM routes WHERE id = $1',
      [id]
    );
    if (!routeRes.rows[0]) return res.status(404).json({ message: 'Ruta no encontrada' });

    // Asignaciones activas de hoy
    const assignRes = await pool.query(
      `SELECT ra.id, ra.assigned_date, ra.shift, ra.status, ra.notes,
              v.plate, v.driver_name, v.latitude, v.longitude
       FROM route_assignments ra
       JOIN vehicles v ON v.id = ra.vehicle_id
       WHERE ra.route_id = $1
       ORDER BY ra.assigned_date DESC LIMIT 10`,
      [id]
    );

    res.json({ route: routeRes.rows[0], assignments: assignRes.rows });
  } catch (err) {
    console.error('getRouteById error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** POST /api/routes */
export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, description, zone, type, color } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre de la ruta es obligatorio' });

    const result = await pool.query(
      `INSERT INTO routes (name, description, zone, type, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, zone, type, status, color, created_at`,
      [name, description ?? null, zone ?? null, type ?? 'collection', color ?? '#1D9E75']
    );

    res.status(201).json({ route: result.rows[0] });
  } catch (err) {
    console.error('createRoute error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/routes/:id */
export const updateRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, zone, type, status, color } = req.body;

    const result = await pool.query(
      `UPDATE routes
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           zone        = COALESCE($3, zone),
           type        = COALESCE($4, type),
           status      = COALESCE($5, status),
           color       = COALESCE($6, color),
           updated_at  = NOW()
       WHERE id = $7
       RETURNING id, name, description, zone, type, status, color, updated_at`,
      [name, description, zone, type, status, color, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Ruta no encontrada' });

    res.json({ route: result.rows[0] });
  } catch (err) {
    console.error('updateRoute error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** DELETE /api/routes/:id */
export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json({ message: 'Ruta eliminada' });
  } catch (err) {
    console.error('deleteRoute error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/routes/assignments  – Asignaciones del día o rango */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { date, vehicle_id, route_id, status } = req.query;
    const params: any[] = [];
    const conditions: string[] = [];

    const targetDate = date ? (date as string) : new Date().toISOString().slice(0, 10);
    params.push(targetDate);
    conditions.push(`ra.assigned_date = $${params.length}`);

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`ra.vehicle_id = $${params.length}`);
    }
    if (route_id) {
      params.push(route_id);
      conditions.push(`ra.route_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`ra.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT ra.id, ra.assigned_date, ra.shift, ra.status, ra.notes,
              r.id AS route_id,   r.name AS route_name,   r.zone, r.color,
              v.id AS vehicle_id, v.plate, v.driver_name, v.latitude, v.longitude, v.status AS vehicle_status
       FROM route_assignments ra
       JOIN routes   r ON r.id = ra.route_id
       JOIN vehicles v ON v.id = ra.vehicle_id
       ${where}
       ORDER BY ra.shift ASC, r.name ASC`,
      params
    );

    res.json({ data: result.rows, total: result.rowCount, date: targetDate });
  } catch (err) {
    console.error('getAssignments error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** POST /api/routes/assignments  – Crear asignación */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { route_id, vehicle_id, assigned_date, shift, notes } = req.body;

    if (!route_id || !vehicle_id) {
      return res.status(400).json({ message: 'route_id y vehicle_id son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO route_assignments (route_id, vehicle_id, assigned_date, shift, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, route_id, vehicle_id, assigned_date, shift, status, notes, created_at`,
      [
        route_id,
        vehicle_id,
        assigned_date ?? new Date().toISOString().slice(0, 10),
        shift ?? 'morning',
        notes ?? null,
      ]
    );

    res.status(201).json({ assignment: result.rows[0] });
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/routes/assignments/:id */
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { route_id, vehicle_id, assigned_date, shift, status, notes } = req.body;

    const result = await pool.query(
      `UPDATE route_assignments
       SET route_id      = COALESCE($1, route_id),
           vehicle_id    = COALESCE($2, vehicle_id),
           assigned_date = COALESCE($3, assigned_date),
           shift         = COALESCE($4, shift),
           status        = COALESCE($5, status),
           notes         = COALESCE($6, notes),
           updated_at    = NOW()
       WHERE id = $7
       RETURNING id, route_id, vehicle_id, assigned_date, shift, status, notes, updated_at`,
      [route_id, vehicle_id, assigned_date, shift, status, notes, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Asignación no encontrada' });

    res.json({ assignment: result.rows[0] });
  } catch (err) {
    console.error('updateAssignment error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** DELETE /api/routes/assignments/:id */
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM route_assignments WHERE id = $1 RETURNING id', [id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Asignación no encontrada' });
    res.json({ message: 'Asignación eliminada' });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
