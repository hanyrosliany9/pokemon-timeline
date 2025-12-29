--
-- PostgreSQL database dump
--

\restrict Lpf9r7E0Y6tJ47wdcFinI92h9LHvxPcMDf21cGrzhpTNPiBScdTMENUpcbz60Lg

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pokemon_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO pokemon_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pokemon_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Currency; Type: TYPE; Schema: public; Owner: pokemon_user
--

CREATE TYPE public."Currency" AS ENUM (
    'USDT',
    'IDR'
);


ALTER TYPE public."Currency" OWNER TO pokemon_user;

--
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: pokemon_user
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'CROPPING',
    'MOTION_WORK',
    'TOOLS',
    'SOFTWARE',
    'HARDWARE',
    'OUTSOURCING',
    'MISCELLANEOUS'
);


ALTER TYPE public."ExpenseCategory" OWNER TO pokemon_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO pokemon_user;

--
-- Name: card_entries; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.card_entries (
    id text NOT NULL,
    "projectId" text NOT NULL,
    date date NOT NULL,
    "cardsAdded" integer NOT NULL,
    "cumulativeTotal" integer NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.card_entries OWNER TO pokemon_user;

--
-- Name: card_projects; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.card_projects (
    id text NOT NULL,
    title text NOT NULL,
    "goalTotal" integer NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.card_projects OWNER TO pokemon_user;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    icon text NOT NULL,
    color text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO pokemon_user;

--
-- Name: currency_cache; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.currency_cache (
    id text NOT NULL,
    "fromCurrency" text NOT NULL,
    "toCurrency" text NOT NULL,
    rate numeric(20,8) NOT NULL,
    provider text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.currency_cache OWNER TO pokemon_user;

--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.exchange_rates (
    id text NOT NULL,
    "fromCurrency" text NOT NULL,
    "toCurrency" text NOT NULL,
    rate numeric(20,8) NOT NULL,
    provider text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exchange_rates OWNER TO pokemon_user;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    description text NOT NULL,
    amount numeric(20,8) NOT NULL,
    currency public."Currency" NOT NULL,
    "amountUSDT" numeric(20,8) NOT NULL,
    "amountIDR" numeric(20,2) NOT NULL,
    "exchangeRateId" text,
    "expenseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "receiptUrl" text,
    tags text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL,
    "projectId" text
);


ALTER TABLE public.expenses OWNER TO pokemon_user;

--
-- Name: income; Type: TABLE; Schema: public; Owner: pokemon_user
--

CREATE TABLE public.income (
    id text NOT NULL,
    description text NOT NULL,
    amount numeric(20,8) NOT NULL,
    currency public."Currency" NOT NULL,
    "amountUSDT" numeric(20,8) NOT NULL,
    "amountIDR" numeric(20,2) NOT NULL,
    "incomeDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    tags text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.income OWNER TO pokemon_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f718e58a-8f78-4592-8525-5aabe871ed63	7e9171b8dad5bf41b79f462149ccb1168d7b9e8219e2016fac14a1faf03c9c64	2025-12-28 18:36:37.954554+00	20251228082236_init_prisma_7	\N	\N	2025-12-28 18:36:37.927377+00	1
ea7715a3-4691-4e75-9b47-ac9b9963e338	fd5af0f967972778b6631d5d1e5bea449845efc1607996db56378e994ee4d297	2025-12-28 18:36:37.962367+00	20251228105212_add_income_model	\N	\N	2025-12-28 18:36:37.95521+00	1
eb709e1b-ed39-43f8-9d65-4ef952a869df	3220cfed73596bd1c9cc4f85c9e9500f72077bc8b4e97c2090e39a883e426398	2025-12-28 18:36:37.972446+00	20251228110800_add_daily_progress_tracking	\N	\N	2025-12-28 18:36:37.962993+00	1
5775d0e5-5385-4feb-9d9d-243147d4eb63	dfd67ed5f9555963f2985aab12e1e70fd04db0fe4de3e75e3e952d7005496bf5	2025-12-28 18:36:45.233136+00	20251228183645_add_dynamic_categories	\N	\N	2025-12-28 18:36:45.20745+00	1
2b440a25-e3b0-4b17-a7a7-f9956b58c7c3	7e9171b8dad5bf41b79f462149ccb1168d7b9e8219e2016fac14a1faf03c9c64	2025-12-28 08:22:36.181317+00	20251228082236_init_prisma_7	\N	\N	2025-12-28 08:22:36.133059+00	1
2e0be08e-57f9-4be0-9c1f-a0716b6fd55e	fd5af0f967972778b6631d5d1e5bea449845efc1607996db56378e994ee4d297	2025-12-28 10:52:12.7217+00	20251228105212_add_income_model	\N	\N	2025-12-28 10:52:12.706871+00	1
fe9ea451-0f8f-45a1-9518-ff805a9eb793	3220cfed73596bd1c9cc4f85c9e9500f72077bc8b4e97c2090e39a883e426398	2025-12-28 11:08:00.224299+00	20251228110800_add_daily_progress_tracking	\N	\N	2025-12-28 11:08:00.209234+00	1
\.


--
-- Data for Name: card_entries; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.card_entries (id, "projectId", date, "cardsAdded", "cumulativeTotal", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: card_projects; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.card_projects (id, title, "goalTotal", progress, "createdAt", "updatedAt") FROM stdin;
88ca9e7f-105c-409c-91cf-30f300eabeb5	Pokemon Base Cropping	30000	0	2025-12-28 15:19:29.029	2025-12-28 16:01:07.946
58ce5997-df99-4548-b94d-a7859c047efc	3D Render Pokemon Card	30000	0	2025-12-28 16:54:58.516	2025-12-28 17:10:26.603
5937999a-b8c9-45ac-989a-c63e0627bf35	Full Card Front and Back	30000	0	2025-12-28 17:16:33.129	2025-12-28 17:16:33.129
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.categories (id, name, label, icon, color, "createdAt", "updatedAt") FROM stdin;
16131f19-d049-4e4a-8190-e9aab7d9a2f8	MOTION_WORK	Motion Work	Video	#007aff	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
24e22857-b6cd-4b62-9985-e3045ee7b8bf	TOOLS	Tools	Wrench	#ff9500	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
b74b1d02-9152-4514-9e00-2ee7cad77af0	SOFTWARE	Software	Code	#34c759	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
08b57be1-afc4-4ff5-988f-ab9c2f37263a	HARDWARE	Hardware	Cpu	#ff3b30	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
847358ba-c48e-4401-81a1-5f04f1adb5e0	OUTSOURCING	Outsourcing	Users	#ff2d55	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
2ae5234a-b20b-493f-bc67-8dccebb831a3	MISCELLANEOUS	Miscellaneous	MoreHorizontal	#f59e0b	2025-12-28 18:52:38.834	2025-12-28 18:52:38.834
bc8dfa89-1aa4-4da4-980b-010d105a1766	ELECTRICITY	Electricity	Cpu	#3b96f7	2025-12-29 13:11:08.798	2025-12-29 13:11:08.798
\.


--
-- Data for Name: currency_cache; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.currency_cache (id, "fromCurrency", "toCurrency", rate, provider, "expiresAt", "updatedAt") FROM stdin;
adf24b2c-5815-4914-bdd1-eac5819e4a95	USDT	IDR	16774.72000000	coingecko	2025-12-29 14:10:01.445	2025-12-29 13:10:01.451
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.exchange_rates (id, "fromCurrency", "toCurrency", rate, provider, "timestamp", "createdAt") FROM stdin;
ea649d33-4e79-4367-b826-4944ea70afb5	USDT	IDR	16770.21000000	coingecko	2025-12-28 18:40:00.896	2025-12-28 18:40:00.897
bd8380f4-5459-4784-af5d-927de7833794	USDT	IDR	16770.21000000	coingecko	2025-12-28 18:45:00.824	2025-12-28 18:45:00.825
b6e0c5b3-adda-43a1-9181-6d5e28ff8250	USDT	IDR	16770.21000000	coingecko	2025-12-28 18:50:00.75	2025-12-28 18:50:00.751
b029c9fb-a6fe-4786-8f11-2d7b94c8e954	USDT	IDR	15500.00000000	coingecko	2025-12-28 08:24:17.53	2025-12-28 08:24:17.532
cf375dd7-7c16-42c9-a65a-598bab8bd051	USDT	IDR	16770.21000000	exchangerate-api	2025-12-28 08:49:32.609	2025-12-28 08:49:32.612
e8dce8a8-ea30-4089-baa7-d4eb62b2efee	USDT	IDR	16770.21000000	coingecko	2025-12-28 08:50:00.842	2025-12-28 08:50:00.844
50931ae4-e985-4d6e-b3fc-2b0f49c6e24b	USDT	IDR	16770.21000000	coingecko	2025-12-28 08:55:01.234	2025-12-28 08:55:01.235
f0e5a23d-b78f-4c99-9858-2dfd713349e0	USDT	IDR	16770.21000000	coingecko	2025-12-28 09:00:01.113	2025-12-28 09:00:01.115
f5cc6746-5666-43e2-a164-37bf67a3ca43	USDT	IDR	16770.21000000	coingecko	2025-12-28 09:05:01.155	2025-12-28 09:05:01.157
785b7201-5753-4244-9454-9721c4722d11	USDT	IDR	16770.21000000	coingecko	2025-12-28 09:10:01.093	2025-12-28 09:10:01.094
c26ddb7b-b49e-4ba2-8478-9559bc2d20e0	USDT	IDR	16770.21000000	exchangerate-api	2025-12-28 10:48:32.5	2025-12-28 10:48:32.501
1d7c9077-ad55-4e9b-bfe7-7cc1b0cf4dcb	USDT	IDR	16770.21000000	coingecko	2025-12-28 10:50:00.799	2025-12-28 10:50:00.8
b5b66869-80a3-4b50-b508-f667b6d090a7	USDT	IDR	16770.21000000	coingecko	2025-12-28 10:55:01.1	2025-12-28 10:55:01.101
a32e964d-97cd-4e9e-ba12-0b76453bdcc7	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:00:00.875	2025-12-28 11:00:00.875
eb70c545-a9ee-40f7-b63d-37f4f1f86309	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:05:00.823	2025-12-28 11:05:00.824
12c04989-8096-460d-9048-5ea36afd771e	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:10:00.91	2025-12-28 11:10:00.911
667e1445-3cb2-4b41-a450-b9d3e8b14319	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:15:00.784	2025-12-28 11:15:00.784
55a5473e-2837-4556-8143-72a3145c4a29	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:20:01.473	2025-12-28 11:20:01.474
3c1dc953-7c8f-419e-96ee-00ef3a42e400	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:25:01.08	2025-12-28 11:25:01.081
a8dd71cf-01ee-4a94-9699-1a7ca0a908cf	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:30:00.802	2025-12-28 11:30:00.803
12417700-687d-4282-a69b-b7246271dd03	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:35:00.775	2025-12-28 11:35:00.775
e21bd31f-515e-4605-945b-979799b7e94b	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:40:01.034	2025-12-28 11:40:01.034
4f8d716e-5a71-4f10-8b3b-1001f5625153	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:45:00.762	2025-12-28 11:45:00.762
156e8955-4c40-4ec7-953b-77db7c87cf33	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:50:01.626	2025-12-28 11:50:01.626
589d24ce-079b-420e-b688-93a33406ec90	USDT	IDR	16770.21000000	coingecko	2025-12-28 11:55:01.146	2025-12-28 11:55:01.147
c6e767fa-24a6-4123-ac94-719381192858	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:00:02.109	2025-12-28 12:00:02.109
9f71ea5a-251b-41e1-8865-b54a7b314bf6	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:05:01.055	2025-12-28 12:05:01.056
1669496f-b638-4381-b21d-90213f742625	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:10:01.217	2025-12-28 12:10:01.218
ca626a84-7461-4b14-ab79-590df2098f5c	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:15:01.087	2025-12-28 12:15:01.088
c3846acf-4ebd-4886-b2b6-e99bf765e33b	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:20:01.313	2025-12-28 12:20:01.313
6975114a-5a42-4c34-ba7b-1865af4e1c30	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:25:01.022	2025-12-28 12:25:01.023
8e7f09cc-203a-4a79-8316-0b0d8956dcf2	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:30:01.063	2025-12-28 12:30:01.064
8fcb9ad1-9d4d-402f-a789-99d011b1d31f	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:35:01.117	2025-12-28 12:35:01.118
9550c977-1493-4a87-aca6-7529a43e921f	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:40:01.148	2025-12-28 12:40:01.149
e7759058-050a-43ec-a35e-401cc69f0347	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:45:01.184	2025-12-28 12:45:01.185
b1564219-af86-422f-a77b-7b98bb5d6d89	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:50:01.519	2025-12-28 12:50:01.52
49871cbb-1e6c-404b-adf9-3a6c762c5ad1	USDT	IDR	16770.21000000	coingecko	2025-12-28 12:55:01.275	2025-12-28 12:55:01.276
035c0bfd-307f-4bfe-bacf-d8a5ab9d44f2	USDT	IDR	16770.21000000	coingecko	2025-12-28 13:00:01.11	2025-12-28 13:00:01.111
6e582620-c198-441d-bd27-0e6787a6473a	USDT	IDR	16770.21000000	coingecko	2025-12-28 13:35:01.86	2025-12-28 13:35:01.861
cea08397-9447-4393-9569-a2808c8a56a5	USDT	IDR	16770.21000000	coingecko	2025-12-28 13:45:01.195	2025-12-28 13:45:01.196
a0e05cd3-0905-4e09-99e0-e1cf94b043bf	USDT	IDR	16770.21000000	coingecko	2025-12-28 13:50:01.309	2025-12-28 13:50:01.309
b99ae6d7-953a-49ca-afd9-bd4627d4518b	USDT	IDR	16770.21000000	coingecko	2025-12-28 13:55:01.036	2025-12-28 13:55:01.037
2e80ce29-a7e0-4712-ba92-9e8fa6736018	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:00:00.966	2025-12-28 14:00:00.967
2f7ceb33-0f41-4b8a-9467-7db0ab94045e	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:05:01.013	2025-12-28 14:05:01.013
dbd07061-5ac3-471b-bc1a-d8d9d3da8721	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:10:02.497	2025-12-28 14:10:02.498
98b00a75-7b2b-4a9c-989d-1934c326670d	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:15:00.911	2025-12-28 14:15:00.912
6be2f98c-a78b-4785-8cb8-2f63e250c560	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:20:01.026	2025-12-28 14:20:01.026
8128dd36-053a-43e3-bd78-5c691701657a	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:25:01.402	2025-12-28 14:25:01.403
1ba8aaee-52c4-4be8-a925-fca572430aa1	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:30:01.232	2025-12-28 14:30:01.233
d7f0484f-9dce-40b5-b8b4-047b1e6e4841	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:35:01.333	2025-12-28 14:35:01.333
25d64403-59ad-4aed-ae15-e3d5c24c3c7f	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:40:01.159	2025-12-28 14:40:01.159
7049d599-93a5-4071-ac2f-e5b3006df38f	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:45:01.183	2025-12-28 14:45:01.184
82e65b31-8bb0-43ee-80ff-2749898f097c	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:50:01.16	2025-12-28 14:50:01.161
6ad9f523-424f-4491-a640-7a4a7f54f0fe	USDT	IDR	16770.21000000	coingecko	2025-12-28 14:55:01.135	2025-12-28 14:55:01.135
aa76c659-988c-45e9-be19-afd5115fcbf0	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:00:01.3	2025-12-28 15:00:01.301
03c213df-4979-41af-ae8b-a25e968d2421	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:05:01.354	2025-12-28 15:05:01.355
7868b8bb-538b-45d2-b85d-17cf28ce1aab	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:10:03.226	2025-12-28 15:10:03.227
898971ac-d466-43de-9f6b-6db19ddcbfcd	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:15:01.3	2025-12-28 15:15:01.3
bda6eb8d-4ee9-45e3-96da-8d9b73e8ee18	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:20:00.831	2025-12-28 15:20:00.831
d55e713c-f562-43d2-88d7-54c3255a96e4	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:25:01.125	2025-12-28 15:25:01.127
0e167198-3dc3-4132-88c4-6b13f6d70893	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:40:02.222	2025-12-28 15:40:02.223
060145b3-71dd-4316-8fc3-ccf1e2d5151a	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:50:02.285	2025-12-28 15:50:02.286
0f42fe22-436e-405f-b4d8-0a27fb698c23	USDT	IDR	16770.21000000	coingecko	2025-12-28 15:55:01.204	2025-12-28 15:55:01.206
8cedef9d-d98c-4b37-91b8-2c7f7f266fc3	USDT	IDR	16770.21000000	coingecko	2025-12-28 16:00:02.041	2025-12-28 16:00:02.042
85202ced-c152-47bd-a9d9-330b502ffd57	USDT	IDR	16770.21000000	coingecko	2025-12-28 16:45:01.162	2025-12-28 16:45:01.163
f050ff57-8cd1-4cf1-ab7a-43f1735eadc1	USDT	IDR	16770.21000000	coingecko	2025-12-28 16:50:00.835	2025-12-28 16:50:00.836
9b03379f-dffd-4c4e-b9d0-bee0d1431da8	USDT	IDR	16770.21000000	coingecko	2025-12-28 16:55:00.77	2025-12-28 16:55:00.771
bfbbe3b5-0c9a-42ae-863b-7f0f131bbf42	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:00:00.747	2025-12-28 17:00:00.748
3d3a6b1d-8f4c-43f6-a78c-45425831b304	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:05:00.8	2025-12-28 17:05:00.8
96b699e8-6046-41af-9353-dd39366e2ccf	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:10:00.865	2025-12-28 17:10:00.866
5b81b2ec-4a6f-49cd-bf07-bb7a040c290c	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:15:01.618	2025-12-28 17:15:01.619
adeb5ea4-14c3-4277-91ab-eb58490890d9	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:20:00.808	2025-12-28 17:20:00.809
d0765b44-7a77-4292-b3a3-5e48dd2a945f	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:25:00.81	2025-12-28 17:25:00.811
2568b611-96d1-44f5-a924-7f03babb96c1	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:30:00.915	2025-12-28 17:30:00.915
05c18d69-9df7-4b28-9dca-1f62cfac56a7	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:35:00.855	2025-12-28 17:35:00.855
e7e64a2f-ff3a-4c15-b9cd-d657cd7808cf	USDT	IDR	16770.21000000	coingecko	2025-12-28 17:40:01.003	2025-12-28 17:40:01.003
7b9cabca-d311-4594-ab2e-aa12959c5bf9	USDT	IDR	16770.21000000	coingecko	2025-12-28 19:00:01.223	2025-12-28 19:00:01.225
7da4d94d-9078-482d-ae60-3196943a39f7	USDT	IDR	16770.21000000	coingecko	2025-12-28 19:05:00.821	2025-12-28 19:05:00.823
37fb49d9-a344-48b2-8a42-4ae08ed3d5e5	USDT	IDR	16770.21000000	coingecko	2025-12-28 19:10:00.724	2025-12-28 19:10:00.724
52ce80b2-64f6-470b-a95a-5d9657b00a34	USDT	IDR	16770.21000000	coingecko	2025-12-28 19:15:00.769	2025-12-28 19:15:00.771
68d0fa70-11cd-43e2-a6a6-bcee52e60bd1	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:05:00.681	2025-12-28 20:05:00.685
ef0a7174-45b6-4ed3-8a0d-c6df23c7a262	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:10:01.1	2025-12-28 20:10:01.102
30e81252-5468-4df6-aa6b-5df08d3ba42e	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:15:00.712	2025-12-28 20:15:00.713
c6244a56-de98-4cb1-858e-6e5ae4905082	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:20:00.903	2025-12-28 20:20:00.904
4cfc6226-0463-4704-9833-57c059b4fe18	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:25:00.68	2025-12-28 20:25:00.681
d5efb6e6-ed44-4fc4-8378-a57d5b175233	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:30:00.68	2025-12-28 20:30:00.681
43ccda3a-59a1-4cf3-aace-5f79c869b866	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:35:01.261	2025-12-28 20:35:01.263
c4f475e5-c15b-4da3-b116-a1a4964cfabf	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:40:00.673	2025-12-28 20:40:00.675
0d4a88cd-e9a4-4afe-ba7a-2f30191f6fa0	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:45:01.028	2025-12-28 20:45:01.029
a3da17fc-4760-493f-8098-29aded7d5afa	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:50:00.652	2025-12-28 20:50:00.653
0f70b0dd-16cb-43b5-b7c1-e426611d2d05	USDT	IDR	16770.21000000	coingecko	2025-12-28 20:55:00.706	2025-12-28 20:55:00.707
66a6f89a-2a66-4bb7-b6e9-955fe1258365	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:00:01.16	2025-12-28 21:00:01.161
c0ec4094-7804-43f0-947a-adf70dc4df6c	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:05:00.682	2025-12-28 21:05:00.683
6b2fb748-b7ab-4e1e-a303-65ad98650776	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:10:00.715	2025-12-28 21:10:00.717
d88f8595-50d3-41e8-8f83-870bd661f3a8	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:15:00.633	2025-12-28 21:15:00.634
8b92db07-b7d4-4cc8-aa63-c25dd52277ad	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:20:00.773	2025-12-28 21:20:00.774
3002fe00-0289-4b75-95f3-db400374c547	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:25:00.91	2025-12-28 21:25:00.911
41deccd4-2dd3-4913-b3c7-8f0df4a1b7c4	USDT	IDR	16770.21000000	coingecko	2025-12-28 21:30:00.875	2025-12-28 21:30:00.876
d5f00217-b5f6-4266-a5cc-f8c625def1e3	USDT	IDR	16774.72000000	exchangerate-api	2025-12-29 11:59:36.659	2025-12-29 11:59:36.661
f0bfe55b-1737-4cd5-9933-74180cf63c6a	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:00:01.167	2025-12-29 12:00:01.168
5120e26e-3848-4565-917e-de47cdc3bd3b	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:05:01.247	2025-12-29 12:05:01.248
65c6484a-706e-430c-ad00-1ec4406c4168	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:10:01.385	2025-12-29 12:10:01.386
1c2443a3-1ba2-4331-8679-ebacd6c87fa6	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:15:01.123	2025-12-29 12:15:01.123
d316d684-d2af-4a39-8310-10e0cce337f2	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:20:01.006	2025-12-29 12:20:01.007
6c1551f8-2a83-46bf-a365-e131c21a037c	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:25:01.208	2025-12-29 12:25:01.208
319e867b-1b4d-449c-ab0f-c80ffbdf687c	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:30:01.074	2025-12-29 12:30:01.075
6455e2af-2a32-4c7d-9b29-23e869cf4e74	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:35:01.023	2025-12-29 12:35:01.024
230d1a86-2581-4375-b825-ca8f3ce352c8	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:40:01.066	2025-12-29 12:40:01.066
873cdf94-bccd-4a42-9548-066fc33426e9	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:45:01.394	2025-12-29 12:45:01.394
df9076ba-4e5e-4d42-b33d-09037e9f2b78	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:50:01.274	2025-12-29 12:50:01.275
f7622d1d-4c02-4b6c-b7c4-d75b49cb745d	USDT	IDR	16774.72000000	coingecko	2025-12-29 12:55:01.249	2025-12-29 12:55:01.25
e779bb71-dea0-4919-adfa-19d25d0930b8	USDT	IDR	16774.72000000	coingecko	2025-12-29 13:00:04.094	2025-12-29 13:00:04.095
cc6c3b21-7b80-41b5-86a6-95f681133c70	USDT	IDR	16774.72000000	coingecko	2025-12-29 13:10:01.461	2025-12-29 13:10:01.462
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.expenses (id, description, amount, currency, "amountUSDT", "amountIDR", "exchangeRateId", "expenseDate", notes, "receiptUrl", tags, "createdAt", "updatedAt", "categoryId", "projectId") FROM stdin;
388e6984-6c3f-4609-ad55-05074b45fe6f	Reimburse Julius (Transport, 3D Asset, Render)	858000.00000000	IDR	51.16215003	858000.00	\N	2025-12-28 00:00:00	\N	\N	{}	2025-12-28 17:15:15.474	2025-12-28 17:15:15.474	847358ba-c48e-4401-81a1-5f04f1adb5e0	\N
211e9c40-9bd7-4697-9207-6badbbaa0bc4	Reimburse Kelby (Ringgit, Transport, Tools, Konsumsi)	6215000.00000000	IDR	370.59762519	6215000.00	\N	2025-12-28 00:00:00	\N	\N	{}	2025-12-28 17:16:07.879	2025-12-28 17:16:07.879	2ae5234a-b20b-493f-bc67-8dccebb831a3	\N
\.


--
-- Data for Name: income; Type: TABLE DATA; Schema: public; Owner: pokemon_user
--

COPY public.income (id, description, amount, currency, "amountUSDT", "amountIDR", "incomeDate", notes, tags, "createdAt", "updatedAt") FROM stdin;
1c99951a-1f9c-487b-bd16-7efe646eb65a	Initial Payment	34755300.00000000	IDR	2072.44274222	34755300.00	2025-12-28 00:00:00	\N	{}	2025-12-28 17:13:48.453	2025-12-28 17:13:48.453
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: card_entries card_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.card_entries
    ADD CONSTRAINT card_entries_pkey PRIMARY KEY (id);


--
-- Name: card_projects card_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.card_projects
    ADD CONSTRAINT card_projects_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: currency_cache currency_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.currency_cache
    ADD CONSTRAINT currency_cache_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: income income_pkey; Type: CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_pkey PRIMARY KEY (id);


--
-- Name: card_entries_date_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX card_entries_date_idx ON public.card_entries USING btree (date);


--
-- Name: card_entries_projectId_date_key; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE UNIQUE INDEX "card_entries_projectId_date_key" ON public.card_entries USING btree ("projectId", date);


--
-- Name: card_entries_projectId_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "card_entries_projectId_idx" ON public.card_entries USING btree ("projectId");


--
-- Name: card_projects_createdAt_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "card_projects_createdAt_idx" ON public.card_projects USING btree ("createdAt");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: currency_cache_fromCurrency_toCurrency_key; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE UNIQUE INDEX "currency_cache_fromCurrency_toCurrency_key" ON public.currency_cache USING btree ("fromCurrency", "toCurrency");


--
-- Name: exchange_rates_fromCurrency_toCurrency_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "exchange_rates_fromCurrency_toCurrency_idx" ON public.exchange_rates USING btree ("fromCurrency", "toCurrency");


--
-- Name: exchange_rates_fromCurrency_toCurrency_timestamp_key; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE UNIQUE INDEX "exchange_rates_fromCurrency_toCurrency_timestamp_key" ON public.exchange_rates USING btree ("fromCurrency", "toCurrency", "timestamp");


--
-- Name: exchange_rates_timestamp_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX exchange_rates_timestamp_idx ON public.exchange_rates USING btree ("timestamp");


--
-- Name: expenses_categoryId_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "expenses_categoryId_idx" ON public.expenses USING btree ("categoryId");


--
-- Name: expenses_currency_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX expenses_currency_idx ON public.expenses USING btree (currency);


--
-- Name: expenses_expenseDate_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "expenses_expenseDate_idx" ON public.expenses USING btree ("expenseDate");


--
-- Name: income_currency_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX income_currency_idx ON public.income USING btree (currency);


--
-- Name: income_incomeDate_idx; Type: INDEX; Schema: public; Owner: pokemon_user
--

CREATE INDEX "income_incomeDate_idx" ON public.income USING btree ("incomeDate");


--
-- Name: card_entries card_entries_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.card_entries
    ADD CONSTRAINT "card_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.card_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_exchangeRateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_exchangeRateId_fkey" FOREIGN KEY ("exchangeRateId") REFERENCES public.exchange_rates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pokemon_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.card_projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pokemon_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Lpf9r7E0Y6tJ47wdcFinI92h9LHvxPcMDf21cGrzhpTNPiBScdTMENUpcbz60Lg

