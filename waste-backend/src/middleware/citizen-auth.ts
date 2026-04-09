import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CitizenRequest extends Request {
  citizen?: { id: string; email: string; type: string };
}

export const verifyCitizenToken = (req: CitizenRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'citizen') {
      return res.status(401).json({ message: 'Token inválido para ciudadanos' });
    }
    req.citizen = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
