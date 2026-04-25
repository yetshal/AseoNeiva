--
-- PostgreSQL database dump
--

\restrict g3afQYmcfLExfgldU87Wh5zt46XRKAEvKzL7qGLGvZIIvAU3smhY8ZvxAP4vh9N

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-25 17:33:33

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
-- TOC entry 2 (class 3079 OID 17258)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 17269)
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
-- TOC entry 221 (class 1259 OID 17280)
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
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 221
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waste_admin
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- TOC entry 222 (class 1259 OID 17281)
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
-- TOC entry 223 (class 1259 OID 17293)
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
    CONSTRAINT dashboard_admins_role_check CHECK (((role)::text = ANY (ARRAY[('superadmin'::character varying)::text, ('admin'::character varying)::text, ('operator'::character varying)::text])))
);


ALTER TABLE public.dashboard_admins OWNER TO waste_admin;

--
-- TOC entry 224 (class 1259 OID 17307)
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
-- TOC entry 225 (class 1259 OID 17317)
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
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 225
-- Name: levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: waste_admin
--

ALTER SEQUENCE public.levels_id_seq OWNED BY public.levels.id;


--
-- TOC entry 226 (class 1259 OID 17318)
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
-- TOC entry 227 (class 1259 OID 17328)
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
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('reviewing'::character varying)::text, ('resolved'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.reports OWNER TO waste_admin;

--
-- TOC entry 228 (class 1259 OID 17339)
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
-- TOC entry 229 (class 1259 OID 17353)
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
-- TOC entry 230 (class 1259 OID 17366)
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
-- TOC entry 231 (class 1259 OID 17375)
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
-- TOC entry 232 (class 1259 OID 17383)
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
    collection_schedule jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('pending'::character varying)::text]))),
    CONSTRAINT users_user_type_check CHECK (((user_type)::text = ANY (ARRAY['citizen'::text, 'driver'::text, 'collector'::text, 'sweeper'::text, 'admin'::text])))
);


ALTER TABLE public.users OWNER TO waste_admin;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN users.collection_schedule; Type: COMMENT; Schema: public; Owner: waste_admin
--

COMMENT ON COLUMN public.users.collection_schedule IS 'Store user-defined collection days and times. Format: [{"day": "Lunes", "time": "06:00"}]';


--
-- TOC entry 233 (class 1259 OID 17406)
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
-- TOC entry 4912 (class 2604 OID 17417)
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 17418)
-- Name: levels id; Type: DEFAULT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels ALTER COLUMN id SET DEFAULT nextval('public.levels_id_seq'::regclass);


--
-- TOC entry 5168 (class 0 OID 17269)
-- Dependencies: 220
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
-- TOC entry 5170 (class 0 OID 17281)
-- Dependencies: 222
-- Data for Name: collection_logs; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.collection_logs (id, assignment_id, vehicle_id, route_id, collected_at, fuel_used, distance_km, notes) FROM stdin;
\.


--
-- TOC entry 5171 (class 0 OID 17293)
-- Dependencies: 223
-- Data for Name: dashboard_admins; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.dashboard_admins (id, name, email, password_hash, role, is_active, created_at) FROM stdin;
4aafb956-3053-4b76-ad36-830284991e88	Admin Principal	admin@aseo.com	$2b$10$zrXblLJ8PgVRZRA1W7CZbuXNjApIbF9kH0lKSomb0S97KxPku0eZ2	superadmin	t	2026-04-16 00:56:54.987199-05
99957129-bd2b-40d9-84b8-8881d85843bb	Operador 1	operador1@aseo.com	$2b$10$zrXblLJ8PgVRZRA1W7CZbuXNjApIbF9kH0lKSomb0S97KxPku0eZ2	operator	t	2026-04-16 00:56:54.987199-05
\.


--
-- TOC entry 5172 (class 0 OID 17307)
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
-- TOC entry 5174 (class 0 OID 17318)
-- Dependencies: 226
-- Data for Name: report_validations; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.report_validations (id, report_id, validated_by, is_valid, validation_notes, validated_at) FROM stdin;
\.


--
-- TOC entry 5175 (class 0 OID 17328)
-- Dependencies: 227
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.reports (id, user_id, type, description, photo_url, latitude, longitude, status, created_at) FROM stdin;
\.


--
-- TOC entry 5176 (class 0 OID 17339)
-- Dependencies: 228
-- Data for Name: route_assignments; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.route_assignments (id, route_id, vehicle_id, assigned_date, shift, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5177 (class 0 OID 17353)
-- Dependencies: 229
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.routes (id, name, description, zone, type, status, color, created_at, updated_at) FROM stdin;
6f5b014f-fd17-42be-ac41-656b31790605	Ruta Comuna 1	\N	Norte	collection	active	#1D9E75	2026-04-23 14:38:50.679342-05	2026-04-23 14:38:50.679342-05
206c389b-f2d3-4941-ae3f-136dedadc110	Ruta Comuna 6	\N	Sur	collection	active	#185FA5	2026-04-23 14:38:50.679342-05	2026-04-23 14:38:50.679342-05
\.


--
-- TOC entry 5178 (class 0 OID 17366)
-- Dependencies: 230
-- Data for Name: trash_collections; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.trash_collections (id, user_id, collected_at, points_earned, location_lat, location_lng, verified, verified_at, verified_by) FROM stdin;
\.


--
-- TOC entry 5179 (class 0 OID 17375)
-- Dependencies: 231
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.user_achievements (id, user_id, achievement_id, unlocked_at) FROM stdin;
\.


--
-- TOC entry 5180 (class 0 OID 17383)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.users (id, name, email, password_hash, phone, address, avatar_url, points, streak, level, status, created_at, updated_at, user_type, weekly_streak_data, total_collections, total_reports, valid_reports, collection_schedule) FROM stdin;
a17b70e4-8347-4709-ab12-30c584ff9cc7	Julian Alfonso Montero Trujillo	julianalfonsomonterotrujillo@gmail.com	$2b$10$koXA.gsjZCPqR8jk/WeyOuGzPHeV.dIeXwvQi9P9oK22cvvpu4C6m	3142021695	Crra. 1h 25a 16	\N	30	0	1	active	2026-04-23 14:46:05.629714-05	2026-04-25 17:00:45.488968-05	citizen	[]	0	6	6	[{"day": "Lunes", "time": "00:00"}, {"day": "Miércoles", "time": "00:00"}, {"day": "Viernes", "time": "00:00"}]
5a24a985-9107-45e0-9960-cd4ac438639b	Carlos Rodríguez	carlos.conductor@aseo.com	$2b$10$327b3a.pK8fmYvkjezNLk.07cd./lqeW0Vu20RtIIztarFGWFwwMi	3101112221	\N	\N	0	0	1	active	2026-04-23 14:38:50.673028-05	2026-04-23 14:38:50.673028-05	driver	[]	0	0	0	[]
11de00dd-e89c-4893-a84c-244e72490059	Juan Martínez	juan.conductor@aseo.com	$2b$10$327b3a.pK8fmYvkjezNLk.07cd./lqeW0Vu20RtIIztarFGWFwwMi	3101112222	\N	\N	0	0	1	active	2026-04-23 14:38:50.673028-05	2026-04-23 14:38:50.673028-05	driver	[]	0	0	0	[]
deb2bfe3-50d1-452d-894f-1b4042884d13	Ricardo Gómez	ricardo.recolector@aseo.com	$2b$10$327b3a.pK8fmYvkjezNLk.07cd./lqeW0Vu20RtIIztarFGWFwwMi	3102223331	\N	\N	0	0	1	active	2026-04-23 14:38:50.673028-05	2026-04-23 14:38:50.673028-05	collector	[]	0	0	0	[]
a977019e-9698-4d5f-ab32-35cf9cf69ea6	yetshal 	dfghjdfgj@afasf	$2b$10$tmQKCgGOqE7/nMEvyVTmkuuAXLrm/UqlwJlQjH.aUB1NZ/FC07zDq	3142021695	Crra. 8 # 02-08	\N	40	0	1	active	2026-04-25 01:02:21.825352-05	2026-04-25 16:58:19.313297-05	citizen	[]	0	8	8	[{"day": "Martes", "time": "04:00"}, {"day": "Jueves", "time": "04:00"}, {"day": "Sábado", "time": "04:00"}]
\.


--
-- TOC entry 5181 (class 0 OID 17406)
-- Dependencies: 233
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.vehicles (id, plate, model, type, status, driver_name, driver_phone, fuel_capacity, latitude, longitude, last_seen_at, created_at, updated_at) FROM stdin;
e010c857-3e4c-4b41-95df-04fa97189b7b	HXZ-101	International	truck	active	Carlos Rodríguez	\N	0.00	2.9273000	-75.2819000	\N	2026-04-23 14:38:50.677419-05	2026-04-23 14:38:50.677419-05
1b35a50a-93ba-45e7-ae03-15e7118d319d	HXZ-102	Kenworth	truck	active	Juan Martínez	\N	0.00	2.9341000	-75.2765000	\N	2026-04-23 14:38:50.677419-05	2026-04-23 14:38:50.677419-05
\.


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 221
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: waste_admin
--

SELECT pg_catalog.setval('public.achievements_id_seq', 8, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 225
-- Name: levels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: waste_admin
--

SELECT pg_catalog.setval('public.levels_id_seq', 5, true);


--
-- TOC entry 4972 (class 2606 OID 17420)
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 17422)
-- Name: collection_logs collection_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 17424)
-- Name: dashboard_admins dashboard_admins_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_email_key UNIQUE (email);


--
-- TOC entry 4978 (class 2606 OID 17426)
-- Name: dashboard_admins dashboard_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 17428)
-- Name: levels levels_level_number_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_level_number_key UNIQUE (level_number);


--
-- TOC entry 4982 (class 2606 OID 17430)
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 17432)
-- Name: report_validations report_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.report_validations
    ADD CONSTRAINT report_validations_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 17434)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 17436)
-- Name: route_assignments route_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 17438)
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 17440)
-- Name: trash_collections trash_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.trash_collections
    ADD CONSTRAINT trash_collections_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 17442)
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 4999 (class 2606 OID 17444)
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- TOC entry 5002 (class 2606 OID 17446)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5004 (class 2606 OID 17448)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 17450)
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 17452)
-- Name: vehicles vehicles_plate_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_key UNIQUE (plate);


--
-- TOC entry 5000 (class 1259 OID 17453)
-- Name: idx_reports_user_type; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_reports_user_type ON public.users USING btree (user_type);


--
-- TOC entry 4991 (class 1259 OID 17454)
-- Name: idx_trash_collections_date; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_trash_collections_date ON public.trash_collections USING btree (collected_at);


--
-- TOC entry 4992 (class 1259 OID 17455)
-- Name: idx_trash_collections_user; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_trash_collections_user ON public.trash_collections USING btree (user_id);


--
-- TOC entry 4995 (class 1259 OID 17456)
-- Name: idx_user_achievements_user; Type: INDEX; Schema: public; Owner: waste_admin
--

CREATE INDEX idx_user_achievements_user ON public.user_achievements USING btree (user_id);


--
-- TOC entry 5009 (class 2606 OID 17457)
-- Name: collection_logs collection_logs_route_fk; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_route_fk FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 17462)
-- Name: collection_logs collection_logs_vehicle_fk; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.collection_logs
    ADD CONSTRAINT collection_logs_vehicle_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 17467)
-- Name: report_validations report_validations_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.report_validations
    ADD CONSTRAINT report_validations_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 17472)
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 17477)
-- Name: route_assignments route_assignments_route_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_route_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 17482)
-- Name: route_assignments route_assignments_vehicle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.route_assignments
    ADD CONSTRAINT route_assignments_vehicle_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 17487)
-- Name: trash_collections trash_collections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.trash_collections
    ADD CONSTRAINT trash_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 17492)
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- TOC entry 5017 (class 2606 OID 17497)
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5165 (class 0 OID 17318)
-- Dependencies: 226
-- Name: report_validations; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.report_validations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5166 (class 0 OID 17366)
-- Dependencies: 230
-- Name: trash_collections; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.trash_collections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5167 (class 0 OID 17375)
-- Dependencies: 231
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: waste_admin
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO waste_admin;


-- Completed on 2026-04-25 17:33:33

--
-- PostgreSQL database dump complete
--

\unrestrict g3afQYmcfLExfgldU87Wh5zt46XRKAEvKzL7qGLGvZIIvAU3smhY8ZvxAP4vh9N

