import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getUsers = async (req: Request, res: Response) => {
  const { search, status, page = 1, limit = 20 } = req.query;
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

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
  const total = Number(countRes.rows[0].count);

  params.push(Number(limit), offset);
  const usersRes = await pool.query(
    `SELECT id, name, email, phone, points, streak, level, status, created_at
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
    'SELECT id, name, email, phone, address, points, streak, level, status, created_at FROM users WHERE id = $1',
    [id]
  );
  if (!userRes.rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

  const reportsRes = await pool.query(
    'SELECT id, type, description, status, created_at FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
    [id]
  );

  res.json({ user: userRes.rows[0], reports: reportsRes.rows });
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