import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getUsers = async (req: Request, res: Response) => {
  const { search, status, page = 1, limit = 20, user_type } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const params: any[] = [];
  const conditions: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (user_type) {
    const types = String(user_type).split(',');
    if (types.length > 1) {
      const placeholders = types.map((_, i) => `$${params.length + i + 1}`).join(', ');
      conditions.push(`user_type IN (${placeholders})`);
      params.push(...types);
    } else {
      params.push(user_type);
      conditions.push(`user_type = $${params.length}`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
  const total = Number(countRes.rows[0].count);

  params.push(Number(limit), offset);
  const usersRes = await pool.query(
    `SELECT id, name, email, phone, points, streak, level, status, user_type, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ data: usersRes.rows, total, page: Number(page), limit: Number(limit) });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const userRes = await pool.query(
    'SELECT id, name, email, phone, address, points, streak, level, status, user_type, created_at FROM users WHERE id = $1',
    [id]
  );
  if (!userRes.rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

  const reportsRes = await pool.query(
    `SELECT r.id, r.type, r.description, r.photo_url, r.latitude, r.longitude, r.status, r.created_at,
            rv.is_valid as validated, rv.validation_notes, rv.validated_at
     FROM reports r
     LEFT JOIN report_validations rv ON r.id = rv.report_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [id]
  );

  const reports = reportsRes.rows.map((r: any) => ({
    id: r.id,
    type: r.type,
    description: r.description,
    photoUrl: r.photo_url,
    latitude: r.latitude ? Number(r.latitude) : null,
    longitude: r.longitude ? Number(r.longitude) : null,
    status: r.status,
    created_at: r.created_at,
    validation: r.validated !== null ? {
      isValid: r.validated,
      notes: r.validation_notes,
      validatedAt: r.validated_at,
      validatedBy: ''
    } : null
  }));

  res.json({ user: userRes.rows[0], reports });
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM users');
    const active = await pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'");
    const points = await pool.query('SELECT COALESCE(SUM(points), 0) as total FROM users');
    const reports = await pool.query('SELECT COUNT(*) FROM reports');

    res.json({
      totalUsers: Number(total.rows[0].count),
      activeUsers: Number(active.rows[0].count),
      totalPoints: Number(points.rows[0].total),
      totalReports: Number(reports.rows[0].count),
    });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, status, updated_at`,
      [status, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ user: result.rows[0] });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, phone, user_type, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y correo son obligatorios' });
  }

  const validTypes = ['citizen', 'driver', 'collector', 'sweeper', 'admin'];
  if (user_type && !validTypes.includes(user_type)) {
    return res.status(400).json({ message: 'Tipo de usuario inválido' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, user_type, status, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, user_type, status, created_at`,
      [name, email, phone || null, user_type || 'citizen', status || 'active', 'pending_registration']
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, user_type, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           user_type = COALESCE($4, user_type),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, phone, user_type, status, updated_at`,
      [name, email, phone, user_type, status, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }
    console.error('updateUser error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};