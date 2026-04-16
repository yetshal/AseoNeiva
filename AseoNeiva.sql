--
-- PostgreSQL database dump
--

\restrict lzEBxCdk1oWfvKRuyHKC2xsRNTLApy6CpCoXIsj7QIQ4zdSHCUudPCrPQrO5Xy9

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-16 04:27:47

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16390)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16475)
-- Name: achievements; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(20),
    points_reward integer DEFAULT 0,
    trigger_type character varying(50) NOT NULL,
    trigger_value integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.achievements OWNER TO waste_admin;

--
-- TOC entry 225 (class 1259 OID 16474)
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: waste_admin
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO waste_admin;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 225
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waste_admin
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- TOC entry 233 (class 1259 OID 16718)
-- Name: collection_logs; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.collection_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assignment_id uuid,
    vehicle_id uuid NOT NULL,
    route_id uuid NOT NULL,
    collected_at timestamp with time zone DEFAULT now(),
    fuel_used numeric(8,2) DEFAULT 0,
    distance_km numeric(8,3) DEFAULT 0,
    notes text
);


ALTER TABLE public.collection_logs OWNER TO waste_admin;

--
-- TOC entry 222 (class 1259 OID 16440)
-- Name: dashboard_admins; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.dashboard_admins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(30) DEFAULT 'operator'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dashboard_admins_role_check CHECK (((role)::text = ANY ((ARRAY['superadmin'::character varying, 'admin'::character varying, 'operator'::character varying])::text[])))
);


ALTER TABLE public.dashboard_admins OWNER TO waste_admin;

--
-- TOC entry 224 (class 1259 OID 16459)
-- Name: levels; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.levels (
    id integer NOT NULL,
    level_number integer NOT NULL,
    title character varying(50) NOT NULL,
    description text,
    points_required integer NOT NULL,
    icon character varying(20),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.levels OWNER TO waste_admin;

--
-- TOC entry 223 (class 1259 OID 16458)
-- Name: levels_id_seq; Type: SEQUENCE; Schema: public; Owner: waste_admin
--

CREATE SEQUENCE public.levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.levels_id_seq OWNER TO waste_admin;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 223
-- Name: levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waste_admin
--

ALTER SEQUENCE public.levels_id_seq OWNED BY public.levels.id;


--
-- TOC entry 229 (class 1259 OID 16527)
-- Name: report_validations; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.report_validations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    report_id uuid NOT NULL,
    validated_by uuid,
    is_valid boolean NOT NULL,
    validation_notes text,
    validated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.report_validations OWNER TO waste_admin;

--
-- TOC entry 221 (class 1259 OID 16422)
-- Name: reports; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    type character varying(50) NOT NULL,
    description text,
    photo_url text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewing'::character varying, 'resolved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO waste_admin;

--
-- TOC entry 232 (class 1259 OID 16692)
-- Name: route_assignments; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.route_assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    route_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    assigned_date date DEFAULT CURRENT_DATE,
    shift character varying(20) DEFAULT 'morning'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.route_assignments OWNER TO waste_admin;

--
-- TOC entry 231 (class 1259 OID 16677)
-- Name: routes; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.routes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    zone character varying(100),
    type character varying(30) DEFAULT 'collection'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    color character varying(7) DEFAULT '#1D9E75'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.routes OWNER TO waste_admin;

--
-- TOC entry 228 (class 1259 OID 16511)
-- Name: trash_collections; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.trash_collections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    collected_at timestamp with time zone DEFAULT now(),
    points_earned integer DEFAULT 0,
    location_lat numeric(9,6),
    location_lng numeric(9,6),
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    verified_by uuid
);


ALTER TABLE public.trash_collections OWNER TO waste_admin;

--
-- TOC entry 227 (class 1259 OID 16489)
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id integer NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_achievements OWNER TO waste_admin;

--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: users; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    avatar_url text,
    points integer DEFAULT 0,
    streak integer DEFAULT 0,
    level integer DEFAULT 1,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_type character varying(30) DEFAULT 'citizen'::character varying,
    weekly_streak_data jsonb DEFAULT '[]'::jsonb,
    total_collections integer DEFAULT 0,
    total_reports integer DEFAULT 0,
    valid_reports integer DEFAULT 0,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying])::text[]))),
    CONSTRAINT users_user_type_check CHECK (((user_type)::text = ANY (ARRAY['citizen'::text, 'driver'::text, 'collector'::text, 'sweeper'::text, 'admin'::text])))
);


ALTER TABLE public.users OWNER TO waste_admin;

--
-- TOC entry 230 (class 1259 OID 16662)
-- Name: vehicles; Type: TABLE; Schema: public; Owner: waste_admin
--

CREATE TABLE public.vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plate character varying(20) NOT NULL,
    model character varying(100),
    type character varying(30) DEFAULT 'truck'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    driver_name character varying(100),
    driver_phone character varying(20),
    fuel_capacity numeric(8,2) DEFAULT 0,
    latitude numeric(10,7),
    longitude numeric(10,7),
    last_seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.vehicles OWNER TO waste_admin;

--
-- TOC entry 4933 (class 2604 OID 16478)
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 16462)
-- Name: levels id; Type: DEFAULT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels ALTER COLUMN id SET DEFAULT nextval('public.levels_id_seq'::regclass);


--
-- TOC entry 5173 (class 0 OID 16475)
-- Dependencies: 226
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.achievements (id, name, description, icon, points_reward, trigger_type, trigger_value, created_at) FROM stdin;
1	Primer paso	Saca la basura por primera vez	🌱	10	first_collection	1	2026-04-15 22:43:27.336986-05
2	Semana completa	7 días sacando la basura	📅	50	streak_days	7	2026-04-15 22:43:27.336986-05
3	Mes de racha	30 días consecutivos	🔥	200	streak_days	30	2026-04-15 22:43:27.336986-05
4	Reportero	Realiza 5 reportes válidos	📱	30	valid_reports	5	2026-04-15 22:43:27.336986-05
5	Vecino ejemplar	Invita 3 amigos	👥	100	referred_users	3	2026-04-15 22:43:27.336986-05
6	Pionero	Sé de los primeros 100 usuarios	⭐	100	early_adopter	1	2026-04-15 22:43:27.336986-05
7	Ojo crítico	Reporta 10 problemas reales	👁️	75	valid_reports	10	2026-04-15 22:43:27.336986-05
8	Recolector范例	100 colecciones registradas	♻️	150	total_collections	100	2026-04-15 22:43:27.336986-05
\.


--
-- TOC entry 5180 (class 0 OID 16718)
-- Dependencies: 233
-- Data for Name: collection_logs; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.collection_logs (id, assignment_id, vehicle_id, route_id, collected_at, fuel_used, distance_km, notes) FROM stdin;
\.


--
-- TOC entry 5169 (class 0 OID 16440)
-- Dependencies: 222
-- Data for Name: dashboard_admins; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.dashboard_admins (id, name, email, password_hash, role, is_active, created_at) FROM stdin;
4aafb956-3053-4b76-ad36-830284991e88	Admin Principal	admin@aseo.com	$2b$10$zrXblLJ8PgVRZRA1W7CZbuXNjApIbF9kH0lKSomb0S97KxPku0eZ2	superadmin	t	2026-04-16 00:56:54.987199-05
99957129-bd2b-40d9-84b8-8881d85843bb	Operador 1	operador1@aseo.com	$2b$10$zrXblLJ8PgVRZRA1W7CZbuXNjApIbF9kH0lKSomb0S97KxPku0eZ2	operator	t	2026-04-16 00:56:54.987199-05
\.


--
-- TOC entry 5171 (class 0 OID 16459)
-- Dependencies: 224
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.levels (id, level_number, title, description, points_required, icon, created_at) FROM stdin;
1	1	Novato	Acabas de empieza tu journey verde	0	���	2026-04-15 22:43:27.333656-05
2	2	Intermedio	Estás tomando el ritmo	100	🌿	2026-04-15 22:43:27.333656-05
3	3	Avanzado	Un vecino ejemplar	250	🌳	2026-04-15 22:43:27.333656-05
4	4	Experto	Maestro de la limpieza	500	🏆	2026-04-15 22:43:27.333656-05
5	5	Master	Leyenda verde de la comunidad	1000	👑	2026-04-15 22:43:27.333656-05
\.


--
-- TOC entry 5176 (class 0 OID 16527)
-- Dependencies: 229
-- Data for Name: report_validations; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.report_validations (id, report_id, validated_by, is_valid, validation_notes, validated_at) FROM stdin;
0cc532be-b72b-4cf6-a1e0-c7f6e03484e1	0d865666-7965-4e17-b62e-1ce98f137190	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 01:47:06.971901-05
a680014e-e90c-4191-8f7d-2726319c5f06	8ccc8ad4-de8b-4575-8ba1-195e3b2c5534	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:00:30.262863-05
8754ba47-d3b8-4965-ba36-ef4bda0e35c9	4dd6f1c5-3ecf-4222-b5ed-2541eef8a6b7	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:00:37.60413-05
9f20b638-11e2-4e41-8dc9-c6cfc9ecae99	67c8dafd-6aea-4373-b010-b7841243dbba	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:00:39.501604-05
bc8edd7d-48ea-4ecc-8af0-685667ae0481	939c6f44-bf84-4856-b8e6-4af4eda731bc	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:00:54.274844-05
016e1616-27d9-427c-ac01-db120ef08e7e	4dc0f428-dafd-42d1-9c42-e05562a10254	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:01:02.293042-05
ef936bb4-fb25-4a2d-b51c-c47acd63f855	01b9b293-dfa3-49ba-a7d1-27583f4262a5	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:01:04.499644-05
60ddd86f-d1b3-463a-ad8a-3ee205c07659	a570f84c-c8aa-4ed9-993a-12a86bdb9de8	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:36:10.075442-05
e632027a-7f28-4173-a5e1-1c569bae582d	0568b50a-a810-46c1-8b12-5c12fec8d78f	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 02:51:03.392143-05
2d82cd00-728a-404a-969f-a0db481a7018	cac1de96-ab4f-48cf-a7e1-ef50a1b606bb	4aafb956-3053-4b76-ad36-830284991e88	t	Reporte verificado	2026-04-16 03:22:52.963875-05
\.


--
-- TOC entry 5168 (class 0 OID 16422)
-- Dependencies: 221
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.reports (id, user_id, type, description, photo_url, latitude, longitude, status, created_at) FROM stdin;
0d865666-7965-4e17-b62e-1ce98f137190	36006c6f-29ed-4099-93ed-bb5292d126ca	Punto ilegal	Hay un punto de botadero clandestino	\N	\N	\N	resolved	2026-04-16 00:08:54.551732-05
8ccc8ad4-de8b-4575-8ba1-195e3b2c5534	36006c6f-29ed-4099-93ed-bb5292d126ca	Daño en contenedor	El contenedores está dañado	\N	\N	\N	resolved	2026-04-16 00:08:54.55877-05
4dd6f1c5-3ecf-4222-b5ed-2541eef8a6b7	c7d80594-b914-4165-a5de-add4820c96ec	Punto ilegal	Hay un punto de botadero clandestino	\N	\N	\N	resolved	2026-04-16 00:08:54.566186-05
67c8dafd-6aea-4373-b010-b7841243dbba	c7d80594-b914-4165-a5de-add4820c96ec	Camión no llegó	El camión de basura no pasó en el día indicado	\N	\N	\N	resolved	2026-04-16 00:08:54.567546-05
939c6f44-bf84-4856-b8e6-4af4eda731bc	40e515f4-01c5-4976-95c8-9c5020da3ec5	Camión no llegó	El camión de basura no pasó en el día indicado	\N	\N	\N	resolved	2026-04-16 00:08:54.562069-05
4dc0f428-dafd-42d1-9c42-e05562a10254	d6f71df1-b542-4276-be37-d8e1ef2f145e	Daño en contenedor	El contenedores está dañado	\N	\N	\N	resolved	2026-04-16 00:08:54.570384-05
01b9b293-dfa3-49ba-a7d1-27583f4262a5	d6f71df1-b542-4276-be37-d8e1ef2f145e	Punto ilegal	Hay un punto de botadero clandestino	\N	\N	\N	resolved	2026-04-16 00:08:54.568883-05
a570f84c-c8aa-4ed9-993a-12a86bdb9de8	40e515f4-01c5-4976-95c8-9c5020da3ec5	Camión no llegó	El camión de basura no pasó en el día indicado	\N	\N	\N	resolved	2026-04-16 00:08:54.563754-05
0568b50a-a810-46c1-8b12-5c12fec8d78f	36006c6f-29ed-4099-93ed-bb5292d126ca	Camión no llegó	El camión de basura no pasó en el día indicado	\N	\N	\N	resolved	2026-04-16 00:08:54.560658-05
cac1de96-ab4f-48cf-a7e1-ef50a1b606bb	d6f71df1-b542-4276-be37-d8e1ef2f145e	Daño en contenedor	El contenedores está dañado	\N	\N	\N	resolved	2026-04-16 00:08:54.571883-05
\.


--
-- TOC entry 5179 (class 0 OID 16692)
-- Dependencies: 232
-- Data for Name: route_assignments; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.route_assignments (id, route_id, vehicle_id, assigned_date, shift, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5178 (class 0 OID 16677)
-- Dependencies: 231
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.routes (id, name, description, zone, type, status, color, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5175 (class 0 OID 16511)
-- Dependencies: 228
-- Data for Name: trash_collections; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.trash_collections (id, user_id, collected_at, points_earned, location_lat, location_lng, verified, verified_at, verified_by) FROM stdin;
\.


--
-- TOC entry 5174 (class 0 OID 16489)
-- Dependencies: 227
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.user_achievements (id, user_id, achievement_id, unlocked_at) FROM stdin;
\.


--
-- TOC entry 5167 (class 0 OID 16401)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.users (id, name, email, password_hash, phone, address, avatar_url, points, streak, level, status, created_at, updated_at, user_type, weekly_streak_data, total_collections, total_reports, valid_reports) FROM stdin;
85e1ff90-0364-4d71-b385-746c064f0d51	Roberto Díaz	roberto@empresa.com	$2a$10$test	3007777777	\N	\N	0	0	1	active	2026-04-16 00:05:14.894959-05	2026-04-16 03:22:19.747774-05	collector	[]	0	0	0
d6f71df1-b542-4276-be37-d8e1ef2f145e	Pedro Sánchez	pedro@email.com	$2a$10$test	3004444444	\N	\N	65	1	1	active	2026-04-16 00:05:14.882176-05	2026-04-16 01:13:33.901223-05	citizen	[]	0	3	3
a5633503-4b92-4e38-b983-f7bcc70c44d8	Juan Pérez	juan@empresa.com	$2a$10$test	3005555555	\N	\N	0	0	1	active	2026-04-16 00:05:14.892297-05	2026-04-16 03:24:37.74117-05	collector	[]	0	0	0
c7d80594-b914-4165-a5de-add4820c96ec	María Rodriguez	maria@email.com	$2a$10$test	3003333333	\N	\N	210	10	3	active	2026-04-16 00:05:14.882176-05	2026-04-16 00:05:14.882176-05	citizen	[]	0	2	2
dd247651-2c18-4146-b6a7-27c535f39057	Luis Mendoza	luis@empresa.com	$2a$10$test	3006666666	\N	\N	0	0	1	active	2026-04-16 00:05:14.892297-05	2026-04-16 03:24:44.211532-05	sweeper	[]	0	0	0
77b89edb-704d-4164-9424-4d60b94c2072	Miguel Torres	miguel@empresa.com	$2a$10$test	3008888888	\N	\N	0	0	1	active	2026-04-16 00:05:14.894959-05	2026-04-16 02:31:09.774358-05	driver	[]	0	0	0
40e515f4-01c5-4976-95c8-9c5020da3ec5	Carlos López	carlos@email.com	$2a$10$test	3002222222	\N	\N	90	3	1	active	2026-04-16 00:05:14.882176-05	2026-04-16 00:05:14.882176-05	citizen	[]	0	2	2
36006c6f-29ed-4099-93ed-bb5292d126ca	Ana García	ana@email.com	$2a$10$test	3001111111	\N	\N	165	5	2	active	2026-04-16 00:05:14.882176-05	2026-04-16 02:01:38.459194-05	citizen	[]	0	3	3
94e27ccd-09f7-4502-b2e6-252dbed4750c	Jorge Castro	jorge@empresa.com	$2a$10$test	3009999999	\N	\N	0	0	1	active	2026-04-16 00:05:14.894959-05	2026-04-16 02:51:18.01802-05	driver	[]	0	0	0
\.


--
-- TOC entry 5177 (class 0 OID 16662)
-- Dependencies: 230
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.vehicles (id, plate, model, type, status, driver_name, driver_phone, fuel_capacity, latitude, longitude, last_seen_at, created_at, updated_at) FROM stdin;
a40a5f18-ff49-4c21-a2c5-e06f8310b6a3	HUQ-290	Hino 500	compactor	active	Luis Mendoza	3006666666	180.00	2.9198000	-75.2901000	\N	2026-04-16 02:47:34.635739-05	2026-04-16 02:52:20.517809-05
736f2699-d665-4bad-be6e-7489439e95b6	HUQ-432	Chevrolet FTR	truck	active	Juan Pérez	3005555555	200.00	2.9272000	-75.2819000	\N	2026-04-16 02:47:34.635739-05	2026-04-16 03:22:42.887056-05
\.


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 225
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: waste_admin
--

SELECT pg_catalog.setval('public.achievements_id_seq', 8, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 223
-- Name: levels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: waste_admin
--

SELECT pg_catalog.setval('public.levels_id_seq', 5, true);


--
-- TOC entry 4986 (class 2606 OID 16488)
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 16731)
-- Name: collection_logs collection_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16457)
-- Name: dashboard_admins dashboard_admins_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_email_key UNIQUE (email);


--
-- TOC entry 4980 (class 2606 OID 16455)
-- Name: dashboard_admins dashboard_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 16473)
-- Name: levels levels_level_number_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_level_number_key UNIQUE (level_number);


--
-- TOC entry 4984 (class 2606 OID 16471)
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 16538)
-- Name: report_validations report_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.report_validations
    ADD CONSTRAINT report_validations_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 16434)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 16707)
-- Name: route_assignments route_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 16691)
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 16521)
-- Name: trash_collections trash_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.trash_collections
    ADD CONSTRAINT trash_collections_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 16498)
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 16500)
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- TOC entry 4972 (class 2606 OID 16421)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4974 (class 2606 OID 16419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4999 (class 2606 OID 16674)
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 16676)
-- Name: vehicles vehicles_plate_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_key UNIQUE (plate);


--
-- TOC entry 4970 (class 1259 OID 16558)
-- Name: idx_reports_user_type; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_reports_user_type ON public.users USING btree (user_type);


--
-- TOC entry 4992 (class 1259 OID 16557)
-- Name: idx_trash_collections_date; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_trash_collections_date ON public.trash_collections USING btree (collected_at);


--
-- TOC entry 4993 (class 1259 OID 16556)
-- Name: idx_trash_collections_user; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_trash_collections_user ON public.trash_collections USING btree (user_id);


--
-- TOC entry 4987 (class 1259 OID 16555)
-- Name: idx_user_achievements_user; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_user_achievements_user ON public.user_achievements USING btree (user_id);


--
-- TOC entry 5015 (class 2606 OID 16737)
-- Name: collection_logs collection_logs_route_fk; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_route_fk FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 16732)
-- Name: collection_logs collection_logs_vehicle_fk; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_vehicle_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 16539)
-- Name: report_validations report_validations_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.report_validations
    ADD CONSTRAINT report_validations_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 16435)
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 16708)
-- Name: route_assignments route_assignments_route_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_route_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 16713)
-- Name: route_assignments route_assignments_vehicle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_vehicle_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 16522)
-- Name: trash_collections trash_collections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.trash_collections
    ADD CONSTRAINT trash_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 16506)
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- TOC entry 5010 (class 2606 OID 16501)
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5166 (class 0 OID 16527)
-- Dependencies: 229
-- Name: report_validations; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.report_validations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5165 (class 0 OID 16511)
-- Dependencies: 228
-- Name: trash_collections; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.trash_collections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5164 (class 0 OID 16489)
-- Dependencies: 227
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO waste_admin;


-- Completed on 2026-04-16 04:27:47

--
-- PostgreSQL database dump complete
--

\unrestrict lzEBxCdk1oWfvKRuyHKC2xsRNTLApy6CpCoXIsj7QIQ4zdSHCUudPCrPQrO5Xy9

