import { Request, Response } from "express";
import { pool } from "../../config/db";
import { CitizenRequest } from "../../middleware/citizen-auth";

interface AuthRequest extends Request {
  admin?: { id: string; role: string };
}

export const getAllReports = async (req: AuthRequest, res: Response) => {
  const { status, type, page = 1, limit = 20, search } = req.query;

  try {
    let whereClause = '';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (type && type !== 'all') {
      params.push(type);
      conditions.push(`r.type = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(r.description ILIKE $${params.length} OR r.type ILIKE $${params.length} OR u.name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const offset = ((Number(page)) - 1) * Number(limit);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM reports r LEFT JOIN users u ON r.user_id = u.id ${whereClause}`,
      params
    );

    params.push(Number(limit), offset);
    const result = await pool.query(
      `SELECT r.id, r.type, r.description, r.photo_url, r.latitude, r.longitude, 
              r.status, r.created_at, u.id as user_id, u.name as user_name, u.email as user_email,
              rv.is_valid as validated, rv.validation_notes, rv.validated_at,
              da.name as validated_by_name
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN report_validations rv ON r.id = rv.report_id
       LEFT JOIN dashboard_admins da ON rv.validated_by = da.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const reports = result.rows.map(r => ({
      id: r.id,
      type: r.type,
      description: r.description,
      photoUrl: r.photo_url,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      status: r.status,
      createdAt: r.created_at,
      user: r.user_id ? {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email
      } : null,
      validation: r.validated !== null ? {
        isValid: r.validated,
        notes: r.validation_notes,
        validatedAt: r.validated_at,
        validatedBy: r.validated_by_name
      } : null
    }));

    res.json({
      data: reports,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error("getAllReports error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const r = result.rows[0];
    const validationResult = await pool.query(
      `SELECT rv.*, da.name as validated_by_name
       FROM report_validations rv
       LEFT JOIN dashboard_admins da ON rv.validated_by = da.id
       WHERE rv.report_id = $1`,
      [id]
    );

    res.json({
      id: r.id,
      type: r.type,
      description: r.description,
      photoUrl: r.photo_url,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      status: r.status,
      createdAt: r.created_at,
      user: r.user_id ? {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email,
        phone: r.user_phone
      } : null,
      validation: validationResult.rows[0] ? {
        isValid: validationResult.rows[0].is_valid,
        notes: validationResult.rows[0].validation_notes,
        validatedAt: validationResult.rows[0].validated_at,
        validatedBy: validationResult.rows[0].validated_by_name
      } : null
    });
  } catch (err) {
    console.error("getReportById error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getMyReports = async (req: CitizenRequest, res: Response) => {
  const userId = req.citizen?.id;
  try {
    const result = await pool.query(
      `SELECT r.*, rv.is_valid, rv.validation_notes
       FROM reports r
       LEFT JOIN report_validations rv ON r.id = rv.report_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("getMyReports error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const createReport = async (req: CitizenRequest, res: Response) => {
  const userId = req.citizen?.id;
  // req.body.photo_url puede venir del middleware optimizeImage o del body (Base64 legacy)
  const { type, description, latitude, longitude } = req.body;
  const photoUrl = req.body.photo_url || req.body.photoUrl;

  if (!type || !description || !photoUrl || !latitude || !longitude) {
    return res.status(400).json({ message: "Todos los campos son obligatorios (tipo, descripción, foto, coordenadas)" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reports (user_id, type, description, photo_url, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, type, description, photoUrl, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createReport error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};


export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'reviewing', 'resolved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const result = await pool.query(
      `UPDATE reports SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.json({ message: "Estado actualizado", report: result.rows[0] });
  } catch (err) {
    console.error("updateReportStatus error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM reports WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }
    res.json({ message: "Reporte eliminado correctamente" });
  } catch (err) {
    console.error("deleteReport error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const validateReportAndAwardPoints = async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;
  const { isValid, notes } = req.body;
  const adminId = req.admin?.id;

  if (isValid === undefined) {
    return res.status(400).json({ message: "isValid es requerido" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reportResult = await client.query(
      "SELECT * FROM reports WHERE id = $1",
      [reportId]
    );

    if (!reportResult.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const existingValidation = await client.query(
      "SELECT * FROM report_validations WHERE report_id = $1",
      [reportId]
    );

    const previousValidation = existingValidation.rows[0];
    const wasValid = previousValidation ? previousValidation.is_valid : null;

    if (previousValidation) {
      await client.query(
        `UPDATE report_validations 
         SET is_valid = $1, validation_notes = $2, validated_at = NOW()
         WHERE report_id = $3`,
        [isValid, notes || null, reportId]
      );
    } else {
      await client.query(
        `INSERT INTO report_validations (report_id, validated_by, is_valid, validation_notes)
         VALUES ($1, $2, $3, $4)`,
        [reportId, adminId || null, isValid, notes || null]
      );
    }

    const newStatus = isValid ? 'resolved' : 'rejected';
    await client.query(
      "UPDATE reports SET status = $1 WHERE id = $2",
      [newStatus, reportId]
    );

    const userId = reportResult.rows[0].user_id;
    let pointsAwarded = 0;

    if (userId) {
      if (wasValid === true && !isValid) {
        await client.query(
          "UPDATE users SET valid_reports = COALESCE(valid_reports, 0) - 1, points = points - 5 WHERE id = $1",
          [userId]
        );
      } else if (wasValid === false && isValid) {
        await client.query(
          "UPDATE users SET valid_reports = COALESCE(valid_reports, 0) + 1, points = points + 5 WHERE id = $1",
          [userId]
        );
      } else if (wasValid === null) {
        await client.query(
          "UPDATE users SET total_reports = COALESCE(total_reports, 0) + 1 WHERE id = $1",
          [userId]
        );
        if (isValid) {
          pointsAwarded = 5;
          await client.query(
            "UPDATE users SET valid_reports = COALESCE(valid_reports, 0) + 1, points = points + $1 WHERE id = $2",
            [pointsAwarded, userId]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ message: isValid ? "Reporte validado" : "Reporte invalidado", pointsAwarded });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    client.release();
  }
};
