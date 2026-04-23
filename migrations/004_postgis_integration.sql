-- ============================================================
-- AseoNeiva – Migración 004: Integración de PostGIS
-- Habilitación de tipos espaciales y optimización de consultas geográficas
-- ============================================================

-- 1. Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Añadir columnas geográficas a Vehículos (usando Geography para cálculos en metros)
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

-- Sincronizar datos existentes
UPDATE public.vehicles 
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Añadir columnas geográficas a Reportes
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

UPDATE public.reports 
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;

-- 4. Evolución de Rutas a Polígonos
-- Añadimos una columna para el polígono de cobertura de la ruta
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS area geography(Polygon, 4326);

-- 5. Índices espaciales (GIST) para rendimiento masivo
CREATE INDEX IF NOT EXISTS idx_vehicles_geom ON public.vehicles USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_reports_geom ON public.reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_routes_area ON public.routes USING GIST (area);
