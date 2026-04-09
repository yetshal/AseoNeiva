-- ============================================================
-- AseoNeiva – Migración 001: Nuevas tablas para módulos del dashboard
-- Tablas: vehicles, routes, route_assignments, collection_logs
-- ============================================================

-- ── Vehículos (flota) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
    id             uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plate          character varying(20) NOT NULL,
    model          character varying(100),
    type           character varying(30) DEFAULT 'truck'::character varying,  -- truck | sweeper | compactor
    status         character varying(20) DEFAULT 'active'::character varying,  -- active | out_of_service | maintenance
    driver_name    character varying(100),
    driver_phone   character varying(20),
    fuel_capacity  numeric(8,2) DEFAULT 0,
    latitude       numeric(10,7),
    longitude      numeric(10,7),
    last_seen_at   timestamp with time zone,
    created_at     timestamp with time zone DEFAULT now(),
    updated_at     timestamp with time zone DEFAULT now(),
    CONSTRAINT vehicles_pkey    PRIMARY KEY (id),
    CONSTRAINT vehicles_plate_key UNIQUE (plate),
    CONSTRAINT vehicles_status_check CHECK (
        (status)::text = ANY ((ARRAY['active','out_of_service','maintenance'])::text[])
    ),
    CONSTRAINT vehicles_type_check CHECK (
        (type)::text = ANY ((ARRAY['truck','sweeper','compactor'])::text[])
    )
);
ALTER TABLE public.vehicles OWNER TO waste_admin;

-- ── Zonas / Rutas de recolección ────────────────────────────
CREATE TABLE IF NOT EXISTS public.routes (
    id          uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name        character varying(100) NOT NULL,
    description text,
    zone        character varying(100),
    type        character varying(30) DEFAULT 'collection'::character varying, -- collection | sweeping
    status      character varying(20) DEFAULT 'active'::character varying,     -- active | inactive
    color       character varying(7)  DEFAULT '#1D9E75'::character varying,    -- hex para el mapa
    created_at  timestamp with time zone DEFAULT now(),
    updated_at  timestamp with time zone DEFAULT now(),
    CONSTRAINT routes_pkey          PRIMARY KEY (id),
    CONSTRAINT routes_status_check  CHECK ((status)::text = ANY ((ARRAY['active','inactive'])::text[])),
    CONSTRAINT routes_type_check    CHECK ((type)::text   = ANY ((ARRAY['collection','sweeping'])::text[]))
);
ALTER TABLE public.routes OWNER TO waste_admin;

-- ── Asignaciones de rutas ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.route_assignments (
    id            uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    route_id      uuid NOT NULL,
    vehicle_id    uuid NOT NULL,
    assigned_date date NOT NULL DEFAULT CURRENT_DATE,
    shift         character varying(20) DEFAULT 'morning'::character varying,  -- morning | afternoon | night
    status        character varying(20) DEFAULT 'pending'::character varying,  -- pending | in_progress | completed | cancelled
    notes         text,
    created_at    timestamp with time zone DEFAULT now(),
    updated_at    timestamp with time zone DEFAULT now(),
    CONSTRAINT route_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT route_assignments_route_fkey   FOREIGN KEY (route_id)   REFERENCES public.routes(id)   ON DELETE CASCADE,
    CONSTRAINT route_assignments_vehicle_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE,
    CONSTRAINT route_assignments_shift_check  CHECK ((shift)::text  = ANY ((ARRAY['morning','afternoon','night'])::text[])),
    CONSTRAINT route_assignments_status_check CHECK ((status)::text = ANY ((ARRAY['pending','in_progress','completed','cancelled'])::text[]))
);
ALTER TABLE public.route_assignments OWNER TO waste_admin;

-- ── Registro de recolecciones (para análisis y gamificación) ─
CREATE TABLE IF NOT EXISTS public.collection_logs (
    id            uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assignment_id uuid,
    vehicle_id    uuid NOT NULL,
    route_id      uuid NOT NULL,
    collected_at  timestamp with time zone DEFAULT now(),
    fuel_used     numeric(8,2) DEFAULT 0,
    distance_km   numeric(8,3) DEFAULT 0,
    notes         text,
    CONSTRAINT collection_logs_pkey           PRIMARY KEY (id),
    CONSTRAINT collection_logs_assignment_fk  FOREIGN KEY (assignment_id) REFERENCES public.route_assignments(id) ON DELETE SET NULL,
    CONSTRAINT collection_logs_vehicle_fk     FOREIGN KEY (vehicle_id)    REFERENCES public.vehicles(id)          ON DELETE CASCADE,
    CONSTRAINT collection_logs_route_fk       FOREIGN KEY (route_id)      REFERENCES public.routes(id)            ON DELETE CASCADE
);
ALTER TABLE public.collection_logs OWNER TO waste_admin;

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_route_assignments_date    ON public.route_assignments (assigned_date);
CREATE INDEX IF NOT EXISTS idx_route_assignments_route   ON public.route_assignments (route_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_vehicle ON public.route_assignments (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_collection_logs_vehicle   ON public.collection_logs (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_collection_logs_route     ON public.collection_logs (route_id);
CREATE INDEX IF NOT EXISTS idx_collection_logs_date      ON public.collection_logs (collected_at);

-- ── Datos de ejemplo ─────────────────────────────────────────
INSERT INTO public.vehicles (id, plate, model, type, status, driver_name, driver_phone, fuel_capacity, latitude, longitude, last_seen_at)
VALUES
  (public.uuid_generate_v4(), 'HUQ-432', 'Chevrolet FTR',   'truck',      'active',          'Carlos Medina',   '3112340001', 200, 2.9272, -75.2819, now() - interval '5 minutes'),
  (public.uuid_generate_v4(), 'HUQ-561', 'Kenworth T370',   'truck',      'active',          'Pedro Ospina',    '3112340002', 250, 2.9341, -75.2765, now() - interval '12 minutes'),
  (public.uuid_generate_v4(), 'HUQ-290', 'Hino 500',        'compactor',  'active',          'Jhon Vargas',     '3112340003', 180, 2.9198, -75.2901, now() - interval '3 minutes'),
  (public.uuid_generate_v4(), 'HUQ-748', 'Chevrolet FTR',   'sweeper',    'maintenance',     'Wilson Díaz',     '3112340004', 150, NULL,   NULL,     NULL),
  (public.uuid_generate_v4(), 'HUQ-115', 'Ford Cargo 1723', 'truck',      'out_of_service',  'Ricardo Mora',    '3112340005', 200, NULL,   NULL,     NULL)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO public.routes (id, name, description, zone, type, status, color)
VALUES
  (public.uuid_generate_v4(), 'Zona Norte – Ruta A', 'Barrios La Gaitana, Timanco',     'Norte',   'collection', 'active', '#1D9E75'),
  (public.uuid_generate_v4(), 'Zona Norte – Ruta B', 'Barrios Calixto, Las Palmas',     'Norte',   'collection', 'active', '#0F6E56'),
  (public.uuid_generate_v4(), 'Zona Sur – Ruta A',   'Barrios Plateado, Miraflores',    'Sur',     'collection', 'active', '#185FA5'),
  (public.uuid_generate_v4(), 'Zona Centro',         'Centro histórico Neiva',          'Centro',  'collection', 'active', '#854F0B'),
  (public.uuid_generate_v4(), 'Barrido Centro',      'Limpieza de vías centro',         'Centro',  'sweeping',   'active', '#7C3AED'),
  (public.uuid_generate_v4(), 'Zona Occidente',      'Barrios Cándido Leguízamo',       'Occidente','collection','active', '#D85A30')
ON CONFLICT DO NOTHING;
