import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Asegurar que la carpeta de subidas existe
const UPLOAD_DIR = 'uploads/reports';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración básica de Multer (en memoria para procesar con Sharp)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
  }
});

/**
 * Middleware para optimizar la imagen antes de guardarla
 */
export const optimizeImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  const fileName = `report-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    await sharp(req.file.buffer)
      .resize(1200, null, { withoutEnlargement: true }) // Máximo 1200px de ancho
      .webp({ quality: 80 }) // Convertir a WebP con 80% de calidad
      .toFile(filePath);

    // Guardar la URL final en el objeto de la petición para el controlador
    // En producción esto podría ser una URL de Cloudinary/S3
    req.body.photo_url = `/uploads/reports/${fileName}`;
    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    next(error);
  }
};
