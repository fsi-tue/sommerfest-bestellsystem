CREATE USER me;
CREATE DATABASE api;
GRANT ALL PRIVILEGES ON DATABASE api TO me;
\c api 
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(30),
  email VARCHAR(30)
);

INSERT INTO users (name, email)
  VALUES ('Jerry', 'jerry@example.com'), ('George', 'george@example.com');


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16409)
-- Name: pizza; Type: TABLE; Schema: public; Owner: pern_db
--

CREATE TABLE public.pizza (
    id integer NOT NULL,
    name text NOT NULL,
    price real,
    enabled boolean,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pizza OWNER TO pern_db;

--
-- TOC entry 218 (class 1259 OID 16408)
-- Name: pizza_id_seq; Type: SEQUENCE; Schema: public; Owner: pern_db
--

CREATE SEQUENCE public.pizza_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pizza_id_seq OWNER TO pern_db;

--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 218
-- Name: pizza_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pern_db
--

ALTER SEQUENCE public.pizza_id_seq OWNED BY public.pizza.id;


--
-- TOC entry 3211 (class 2604 OID 16412)
-- Name: pizza id; Type: DEFAULT; Schema: public; Owner: pern_db
--

ALTER TABLE ONLY public.pizza ALTER COLUMN id SET DEFAULT nextval('public.pizza_id_seq'::regclass);


--
-- TOC entry 3359 (class 0 OID 16409)
-- Dependencies: 219
-- Data for Name: pizza; Type: TABLE DATA; Schema: public; Owner: pern_db
--

COPY public.pizza (id, name, price, enabled, created_at) FROM stdin;
4	Four Cheese	7	t	2024-05-29 17:47:33.400485
3	Vegetarian	5	t	2024-05-29 17:47:33.400485
2	Pepperoni	4	t	2024-05-29 17:47:33.400485
1	Margherita	3	t	2024-05-29 17:47:33.400485
5	Plain	2	t	2024-05-29 17:54:51.353532
\.


--
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 218
-- Name: pizza_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pern_db
--

SELECT pg_catalog.setval('public.pizza_id_seq', 4, true);


--
-- TOC entry 3214 (class 2606 OID 16417)
-- Name: pizza pizza_pkey; Type: CONSTRAINT; Schema: public; Owner: pern_db
--

ALTER TABLE ONLY public.pizza
    ADD CONSTRAINT pizza_pkey PRIMARY KEY (id);


-- Completed on 2024-05-29 18:59:28 UTC

--
-- PostgreSQL database dump complete
--

