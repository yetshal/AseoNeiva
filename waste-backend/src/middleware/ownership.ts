import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

/**
 * Verifica si el usuario autenticado es el dueño del recurso
 * @param table Nombre de la tabla
 * @param idParam Nombre del parámetro en req.params que contiene el ID del recurso
 */
export const checkOwnership = (table: string, idParam: string = 'id') => {
  return async (req: any, res: Response, next: NextFunction) => {
    const resourceId = req.params[idParam];
    const userId = req.user?.id || req.citizen?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    try {
      const result = await pool.query(
        `SELECT user_id FROM public.${table} WHERE id = $1`,
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }

      if (result.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
      }

      next();
    } catch (error) {
      console.error(`Error verificando propiedad en ${table}:`, error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};
