import { Request, Response } from 'express';
import { pool } from '../../config/db';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../../middleware/auth';

/** GET /api/staff  – Listar admins del dashboard */
export const getStaff = async (req: Request, res: Response) => {
  try {
    const { search, role, is_active, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (is_active !== undefined && is_active !== '') {
      params.push(is_active === 'true');
      conditions.push(`is_active = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM dashboard_admins ${where}`, params);
    const total = Number(countRes.rows[0].count);

    params.push(Number(limit), offset);
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM dashboard_admins ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ data: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('getStaff error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** GET /api/staff/:id */
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM dashboard_admins WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Personal no encontrado' });
    res.json({ admin: result.rows[0] });
  } catch (err) {
    console.error('getStaffById error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** POST /api/staff  – Crear nuevo admin (solo superadmin / admin) */
export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    const validRoles = ['superadmin', 'admin', 'operator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Solo superadmin puede crear otro superadmin
    if (role === 'superadmin' && req.admin?.role !== 'superadmin') {
      return res.status(403).json({ message: 'Sin permisos para crear superadmins' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO dashboard_admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, hash, role ?? 'operator']
    );

    res.status(201).json({ admin: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }
    console.error('createStaff error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/staff/:id  – Actualizar datos de un admin */
export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const validRoles = ['superadmin', 'admin', 'operator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Prevenir que alguien se quite a sí mismo el rol de superadmin
    if (req.admin?.id === id && role && role !== 'superadmin' && req.admin?.role === 'superadmin') {
      return res.status(400).json({ message: 'No puede cambiar su propio rol de superadmin' });
    }

    const result = await pool.query(
      `UPDATE dashboard_admins
       SET name      = COALESCE($1, name),
           email     = COALESCE($2, email),
           role      = COALESCE($3, role),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, role, is_active, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Personal no encontrado' });

    res.json({ admin: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }
    console.error('updateStaff error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** PATCH /api/staff/:id/password  – Cambiar contraseña */
export const changeStaffPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE dashboard_admins SET password_hash = $1 WHERE id = $2 RETURNING id',
      [hash, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Personal no encontrado' });

    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('changeStaffPassword error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/** DELETE /api/staff/:id  – Dar de baja (solo superadmin) */
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.admin?.id === id) {
      return res.status(400).json({ message: 'No puede eliminar su propia cuenta' });
    }

    const result = await pool.query(
      'DELETE FROM dashboard_admins WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Personal no encontrado' });

    res.json({ message: 'Personal eliminado' });
  } catch (err) {
    console.error('deleteStaff error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
