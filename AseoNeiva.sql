--
-- PostgreSQL database dump
--

\restrict ODZWrAaaaJIFH0AFpd9hgsoiSPn8VR3wdgdvU8CqhilTujoY5VvGTFwxoLVKRfh

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-26 15:41:29

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
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

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
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewing'::character varying, 'resolved'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO waste_admin;

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
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO waste_admin;

--
-- TOC entry 5051 (class 0 OID 16440)
-- Dependencies: 222
-- Data for Name: dashboard_admins; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.dashboard_admins (id, name, email, password_hash, role, is_active, created_at) FROM stdin;
f752d643-8830-42f8-8afa-5ae47e006549	Administrador	admin@aseo.gov.co	$2b$10$lKX5IfXXUBiDBn26v71vOuu4nfAs5kE7M9lKkMhJpVtZyd5TjUEcq	superadmin	t	2026-03-26 13:36:57.428944-05
\.


--
-- TOC entry 5050 (class 0 OID 16422)
-- Dependencies: 221
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.reports (id, user_id, type, description, photo_url, latitude, longitude, status, created_at) FROM stdin;
37009485-0915-4efd-a598-8c6bebc8f2f0	c162ff6d-f51f-42f6-9a2e-494ac2d8a5f1	Basura acumulada	Acumulaci¢n frente al parque central	\N	\N	\N	resolved	2026-03-26 14:29:53.427154-05
47087a1a-a642-40c4-80cd-2cdc39802605	c162ff6d-f51f-42f6-9a2e-494ac2d8a5f1	Cami¢n no lleg¢	El cami¢n no pas¢ en la fecha indicada	\N	\N	\N	reviewing	2026-03-26 14:29:53.427154-05
97f72e38-2f14-4ca3-9382-28343bd2ced6	36ce76ff-817b-4576-b6c6-f60669e11dfa	Basura acumulada	Zona residencial sin recolecci¢n	\N	\N	\N	pending	2026-03-26 14:29:53.427154-05
f547bf65-e2ac-4fef-96cc-152135e3b625	65502d0e-7c7a-4481-a6ff-73e9dff588cd	Punto ilegal	Dep¢sito ilegal de escombros	\N	\N	\N	resolved	2026-03-26 14:29:53.427154-05
45113c45-fd1c-4252-b5f7-7c5e0dd88cf6	65502d0e-7c7a-4481-a6ff-73e9dff588cd	Cami¢n no lleg¢	Lleva 3 d¡as sin pasar	\N	\N	\N	pending	2026-03-26 14:29:53.427154-05
020680c6-7bbe-436e-a2ad-64c016192abb	bb4c8ace-23b5-4e6d-8dec-d20f37c1ec7b	Da¤o en contenedor	Contenedor roto en la carrera 6	\N	\N	\N	reviewing	2026-03-26 14:29:53.427154-05
0bd93f63-956b-4d39-8d3e-5ecf35e57611	e6b9d7bc-efd6-472c-aef9-688bda7ded08	Basura acumulada	Esquina con malos olores	\N	\N	\N	resolved	2026-03-26 14:29:53.427154-05
ac8cb91b-d4e0-438e-9547-d8d2067d2c2b	6ae3c30e-f5fc-4e75-bca8-e9b1607946f0	Punto ilegal	Bolsas abandonadas cerca al colegio	\N	\N	\N	pending	2026-03-26 14:29:53.427154-05
\.


--
-- TOC entry 5049 (class 0 OID 16401)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: waste_admin
--

COPY public.users (id, name, email, password_hash, phone, address, avatar_url, points, streak, level, status, created_at, updated_at) FROM stdin;
c162ff6d-f51f-42f6-9a2e-494ac2d8a5f1	Ana Lucía García	ana.garcia@gmail.com	$2b$10$placeholder	3124567890	Calle 5 #12-34, Neiva	\N	320	14	3	active	2026-03-26 14:29:51.352396-05	2026-03-26 14:29:51.352396-05
36ce76ff-817b-4576-b6c6-f60669e11dfa	Luis Eduardo Peña	lpe¤a@hotmail.com	$2b$10$placeholder	3209876543	Carrera 8 #22-10, Neiva	\N	180	7	2	active	2026-03-26 14:29:51.352396-05	2026-03-26 14:29:51.352396-05
bb4c8ace-23b5-4e6d-8dec-d20f37c1ec7b	Jorge Andrés Molina	jmolina@gmail.com	$2b$10$placeholder	3134567890	Carrera 6 #10-23, Neiva	\N	230	9	2	active	2026-03-26 14:29:51.352396-05	2026-03-26 14:29:51.352396-05
e6b9d7bc-efd6-472c-aef9-688bda7ded08	Diana Carolina Ríos	drios@gmail.com	$2b$10$placeholder	3168901234	Calle 12 #9-34, Neiva	\N	420	18	3	active	2026-03-26 14:29:51.352396-05	2026-03-26 14:29:51.352396-05
256b591c-3e4b-4eed-a06e-b43b48cfc6f8	Carlos Ruiz	carlos.r@yahoo.com	$2b$10$placeholder	3001234567	Carrera 12 #8-90, Neiva	\N	0	0	1	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:23:42.55632-05
8ae45ff7-8a03-46d0-90aa-c4ae9025047a	Andrés Felipe Cano	acano@gmail.com	$2b$10$placeholder	3045678901	Carrera 3 #18-56, Neiva	\N	0	0	1	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:24:47.271307-05
65502d0e-7c7a-4481-a6ff-73e9dff588cd	Sandra Milena L¢pez	slopez@gmail.com	$2b$10$placeholder	3187654321	Calle 9 #15-67, Neiva	\N	510	21	4	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:25:06.670613-05
6ae3c30e-f5fc-4e75-bca8-e9b1607946f0	Camilo Herrera	camerrera@gmail.com	$2b$10$placeholder	3112345678	Carrera 10 #5-78, Neiva	\N	150	6	2	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:25:14.97618-05
b51f8299-99f3-42cd-864b-1a55006dc05c	María Torres	mtorres@gmail.com	$2b$10$placeholder	3158765432	Calle 15 #3-45, Neiva	\N	40	2	1	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:25:19.814618-05
57acf91a-1897-4854-967a-e9c0f9daf0cf	Patricia Vargas	pvargas@outlook.com	$2b$10$placeholder	3223456789	Calle 20 #7-12, Neiva	\N	90	4	1	active	2026-03-26 14:29:51.352396-05	2026-03-26 15:25:36.796555-05
\.


--
-- TOC entry 4898 (class 2606 OID 16457)
-- Name: dashboard_admins dashboard_admins_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_email_key UNIQUE (email);


--
-- TOC entry 4900 (class 2606 OID 16455)
-- Name: dashboard_admins dashboard_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.dashboard_admins
    ADD CONSTRAINT dashboard_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 16434)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 16421)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4894 (class 2606 OID 16419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 16435)
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: waste_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO waste_admin;


-- Completed on 2026-03-26 15:41:29

--
-- PostgreSQL database dump complete
--

\unrestrict ODZWrAaaaJIFH0AFpd9hgsoiSPn8VR3wdgdvU8CqhilTujoY5VvGTFwxoLVKRfh

