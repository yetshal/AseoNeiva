import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";

export const citizenLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND status = 'active'",
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: "citizen" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("citizenLogin error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const citizenRegister = async (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, address, points, streak, level, status, created_at`,
      [name, email, hash, phone || null, address || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, type: "citizen" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        points: Number(user.points),
        streak: Number(user.streak),
        level: Number(user.level),
        status: user.status,
        created_at: user.created_at
      }
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Ya existe un usuario con ese correo" });
    }
    console.error("citizenRegister error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const citizenRecovery = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo es obligatorio" });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "No se encontró una cuenta con ese correo" });
    }

    res.json({
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico"
    });
  } catch (err) {
    console.error("citizenRecovery error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getCitizenProfile = async (req: Request, res: Response) => {
  const { id } = (req as any).citizen || req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, address, avatar_url, points, streak, level, status, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
        points: Number(user.points),
        streak: Number(user.streak),
        level: Number(user.level),
        status: user.status,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error("getCitizenProfile error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateCitizenProfile = async (req: Request, res: Response) => {
  const { id } = (req as any).citizen || req.params;
  const { name, phone, address, avatar_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, address, avatar_url, points, streak, level, status, created_at`,
      [name, phone, address, avatar_url, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
        points: Number(user.points),
        streak: Number(user.streak),
        level: Number(user.level),
        status: user.status,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error("updateCitizenProfile error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
