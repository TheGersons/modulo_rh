--
-- PostgreSQL database dump
--

\restrict CAtnRCcitqaXxl3I7c6XKSzeH0WC5ASoSo95GAMaJUfDO7MuSb1XVoo7mtUCvBY

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-25 13:34:32

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

ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_user_id_fkey;
ALTER TABLE ONLY public.revisores_asignados DROP CONSTRAINT revisores_asignados_revisor_id_fkey;
ALTER TABLE ONLY public.revisores_asignados DROP CONSTRAINT revisores_asignados_empleado_id_fkey;
ALTER TABLE ONLY public.puestos DROP CONSTRAINT puestos_area_id_fkey;
ALTER TABLE ONLY public.evidencias_kpi DROP CONSTRAINT "evidencias_kpi_userId_fkey";
ALTER TABLE ONLY public.evidencias_kpi DROP CONSTRAINT evidencias_kpi_revisado_por_fkey;
ALTER TABLE ONLY public.evidencias_kpi DROP CONSTRAINT evidencias_kpi_kpi_id_fkey;
ALTER TABLE ONLY public.evidencias_kpi DROP CONSTRAINT evidencias_kpi_empleado_id_fkey;
ALTER TABLE ONLY public.areas DROP CONSTRAINT areas_jefe_id_fkey;
ALTER TABLE ONLY public.areas DROP CONSTRAINT areas_area_padre_id_fkey;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_puesto_id_fkey";
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_areaId_fkey";
ALTER TABLE ONLY public."Tarea" DROP CONSTRAINT "Tarea_ordenTrabajoId_fkey";
ALTER TABLE ONLY public."SolicitudTarea" DROP CONSTRAINT "SolicitudTarea_ordenTrabajoId_fkey";
ALTER TABLE ONLY public."SolicitudTarea" DROP CONSTRAINT "SolicitudTarea_empleadoId_fkey";
ALTER TABLE ONLY public."SolicitudEdicion" DROP CONSTRAINT "SolicitudEdicion_solicitanteId_fkey";
ALTER TABLE ONLY public."SolicitudEdicion" DROP CONSTRAINT "SolicitudEdicion_ordenTrabajoId_fkey";
ALTER TABLE ONLY public."RevisionJefe" DROP CONSTRAINT "RevisionJefe_ordenTrabajoId_fkey";
ALTER TABLE ONLY public."RevisionJefe" DROP CONSTRAINT "RevisionJefe_jefeId_fkey";
ALTER TABLE ONLY public."OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_kpiId_fkey";
ALTER TABLE ONLY public."OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_empleadoId_fkey";
ALTER TABLE ONLY public."OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_creadorId_fkey";
ALTER TABLE ONLY public."OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_areaId_fkey";
ALTER TABLE ONLY public."KPI" DROP CONSTRAINT "KPI_puesto_id_fkey";
ALTER TABLE ONLY public."KPI" DROP CONSTRAINT "KPI_areaId_fkey";
ALTER TABLE ONLY public."Evidencia" DROP CONSTRAINT "Evidencia_tareaId_fkey";
ALTER TABLE ONLY public."Evaluacion" DROP CONSTRAINT "Evaluacion_evaluadorId_fkey";
ALTER TABLE ONLY public."Evaluacion" DROP CONSTRAINT "Evaluacion_empleadoId_fkey";
ALTER TABLE ONLY public."Evaluacion" DROP CONSTRAINT "Evaluacion_areaId_fkey";
ALTER TABLE ONLY public."EvaluacionDetalle" DROP CONSTRAINT "EvaluacionDetalle_kpiId_fkey";
ALTER TABLE ONLY public."EvaluacionDetalle" DROP CONSTRAINT "EvaluacionDetalle_evaluacionId_fkey";
ALTER TABLE ONLY public."Alerta" DROP CONSTRAINT "Alerta_evaluacionId_fkey";
ALTER TABLE ONLY public."Alerta" DROP CONSTRAINT "Alerta_empleadoId_fkey";
ALTER TABLE ONLY public."Alerta" DROP CONSTRAINT "Alerta_areaId_fkey";
DROP INDEX public.sessions_user_id_idx;
DROP INDEX public.sessions_refresh_token_key;
DROP INDEX public.sessions_expires_at_idx;
DROP INDEX public.sessions_access_token_key;
DROP INDEX public.revisores_asignados_revisor_id_idx;
DROP INDEX public.revisores_asignados_empleado_id_idx;
DROP INDEX public.revisores_asignados_empleado_id_activo_key;
DROP INDEX public.puestos_nombre_area_id_key;
DROP INDEX public.evidencias_kpi_status_idx;
DROP INDEX public.evidencias_kpi_periodo_idx;
DROP INDEX public.evidencias_kpi_kpi_id_idx;
DROP INDEX public.evidencias_kpi_empleado_id_idx;
DROP INDEX public."User_role_idx";
DROP INDEX public."User_email_key";
DROP INDEX public."User_email_idx";
DROP INDEX public."User_dni_key";
DROP INDEX public."User_areaId_idx";
DROP INDEX public."Tarea_ordenTrabajoId_idx";
DROP INDEX public."Tarea_completada_idx";
DROP INDEX public."SolicitudTarea_status_idx";
DROP INDEX public."SolicitudTarea_ordenTrabajoId_idx";
DROP INDEX public."SolicitudTarea_empleadoId_idx";
DROP INDEX public."SolicitudEdicion_status_idx";
DROP INDEX public."SolicitudEdicion_solicitanteId_idx";
DROP INDEX public."SolicitudEdicion_ordenTrabajoId_idx";
DROP INDEX public."RevisionJefe_status_idx";
DROP INDEX public."RevisionJefe_ordenTrabajoId_key";
DROP INDEX public."RevisionJefe_ordenTrabajoId_idx";
DROP INDEX public."RevisionJefe_jefeId_idx";
DROP INDEX public."OrdenTrabajo_tipoOrden_idx";
DROP INDEX public."OrdenTrabajo_status_idx";
DROP INDEX public."OrdenTrabajo_kpiId_idx";
DROP INDEX public."OrdenTrabajo_fechaLimite_idx";
DROP INDEX public."OrdenTrabajo_empleadoId_idx";
DROP INDEX public."OrdenTrabajo_creadorId_idx";
DROP INDEX public."KPI_tipoCriticidad_idx";
DROP INDEX public."KPI_tipoCalculo_idx";
DROP INDEX public."KPI_puesto_id_idx";
DROP INDEX public."KPI_key_key";
DROP INDEX public."KPI_areaId_idx";
DROP INDEX public."KPI_activo_idx";
DROP INDEX public."Evidencia_tareaId_idx";
DROP INDEX public."Evidencia_status_idx";
DROP INDEX public."Evaluacion_status_idx";
DROP INDEX public."Evaluacion_evaluadorId_idx";
DROP INDEX public."Evaluacion_empleadoId_periodo_anio_key";
DROP INDEX public."Evaluacion_empleadoId_idx";
DROP INDEX public."Evaluacion_anio_idx";
DROP INDEX public."EvaluacionDetalle_ordenTrabajoId_idx";
DROP INDEX public."EvaluacionDetalle_kpiId_idx";
DROP INDEX public."EvaluacionDetalle_evaluacionId_idx";
DROP INDEX public."EvaluacionDetalle_estado_idx";
DROP INDEX public."Alerta_tipo_idx";
DROP INDEX public."Alerta_status_idx";
DROP INDEX public."Alerta_nivel_idx";
DROP INDEX public."Alerta_evaluacionId_idx";
DROP INDEX public."Alerta_empleadoId_idx";
DROP INDEX public."Alerta_areaId_idx";
ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
ALTER TABLE ONLY public.revisores_asignados DROP CONSTRAINT revisores_asignados_pkey;
ALTER TABLE ONLY public.puestos DROP CONSTRAINT puestos_pkey;
ALTER TABLE ONLY public.evidencias_kpi DROP CONSTRAINT evidencias_kpi_pkey;
ALTER TABLE ONLY public.areas DROP CONSTRAINT areas_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
ALTER TABLE ONLY public."Tarea" DROP CONSTRAINT "Tarea_pkey";
ALTER TABLE ONLY public."SolicitudTarea" DROP CONSTRAINT "SolicitudTarea_pkey";
ALTER TABLE ONLY public."SolicitudEdicion" DROP CONSTRAINT "SolicitudEdicion_pkey";
ALTER TABLE ONLY public."RevisionJefe" DROP CONSTRAINT "RevisionJefe_pkey";
ALTER TABLE ONLY public."OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_pkey";
ALTER TABLE ONLY public."KPI" DROP CONSTRAINT "KPI_pkey";
ALTER TABLE ONLY public."Evidencia" DROP CONSTRAINT "Evidencia_pkey";
ALTER TABLE ONLY public."Evaluacion" DROP CONSTRAINT "Evaluacion_pkey";
ALTER TABLE ONLY public."EvaluacionDetalle" DROP CONSTRAINT "EvaluacionDetalle_pkey";
ALTER TABLE ONLY public."Alerta" DROP CONSTRAINT "Alerta_pkey";
DROP TABLE public.sessions;
DROP TABLE public.revisores_asignados;
DROP TABLE public.puestos;
DROP TABLE public.evidencias_kpi;
DROP TABLE public.areas;
DROP TABLE public._prisma_migrations;
DROP TABLE public."User";
DROP TABLE public."Tarea";
DROP TABLE public."SolicitudTarea";
DROP TABLE public."SolicitudEdicion";
DROP TABLE public."RevisionJefe";
DROP TABLE public."OrdenTrabajo";
DROP TABLE public."KPI";
DROP TABLE public."Evidencia";
DROP TABLE public."EvaluacionDetalle";
DROP TABLE public."Evaluacion";
DROP TABLE public."Alerta";
-- *not* dropping schema, since initdb creates it
--
-- TOC entry 5 (class 2615 OID 23875)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 24009)
-- Name: Alerta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Alerta" (
    id text NOT NULL,
    "areaId" text NOT NULL,
    "empleadoId" text,
    "evaluacionId" text,
    tipo text NOT NULL,
    nivel text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    "accionSugerida" text,
    responsable text,
    status text DEFAULT 'activa'::text NOT NULL,
    "fechaDeteccion" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fechaResolucion" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Alerta" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 23989)
-- Name: Evaluacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evaluacion" (
    id text NOT NULL,
    "empleadoId" text NOT NULL,
    "evaluadorId" text NOT NULL,
    periodo text NOT NULL,
    "tipoPeriodo" text,
    anio integer NOT NULL,
    "calculadaAutomaticamente" boolean DEFAULT true NOT NULL,
    "promedioGeneral" double precision,
    "kpisRojos" integer DEFAULT 0 NOT NULL,
    "porcentajeRojos" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'borrador'::text NOT NULL,
    "fechaCalculo" timestamp(3) without time zone,
    "fechaCierre" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "areaId" text
);


ALTER TABLE public."Evaluacion" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24001)
-- Name: EvaluacionDetalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EvaluacionDetalle" (
    id text NOT NULL,
    "evaluacionId" text NOT NULL,
    "kpiId" text NOT NULL,
    "ordenTrabajoId" text,
    "resultadoNumerico" double precision NOT NULL,
    "resultadoPorcentaje" double precision,
    "brechaVsMeta" double precision,
    estado text,
    "formulaUtilizada" text,
    meta double precision,
    "umbralAmarillo" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EvaluacionDetalle" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 23948)
-- Name: Evidencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evidencia" (
    id text NOT NULL,
    "tareaId" text NOT NULL,
    "archivoUrl" text NOT NULL,
    tipo text NOT NULL,
    nombre text NOT NULL,
    tamanio integer,
    intento integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'pendiente_revision'::text NOT NULL,
    "motivoRechazo" text,
    "esFueraDeTiempo" boolean DEFAULT false NOT NULL,
    apelacion text,
    "respuestaApelacion" text,
    "fechaApelacion" timestamp(3) without time zone,
    "fechaSubida" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Evidencia" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 23910)
-- Name: KPI; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KPI" (
    id text NOT NULL,
    key text NOT NULL,
    area text NOT NULL,
    "areaId" text NOT NULL,
    indicador text NOT NULL,
    descripcion text,
    "tipoCalculo" text NOT NULL,
    "formulaCalculo" text NOT NULL,
    meta double precision,
    tolerancia double precision,
    "umbralAmarillo" double precision,
    periodicidad text NOT NULL,
    sentido text NOT NULL,
    unidad text,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "operadorMeta" text DEFAULT '='::text,
    "tipoCriticidad" text DEFAULT 'no_critico'::text NOT NULL,
    puesto_id text,
    aplica_orden_trabajo boolean DEFAULT false NOT NULL,
    horas_limite_orden integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."KPI" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 23920)
-- Name: OrdenTrabajo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrdenTrabajo" (
    id text NOT NULL,
    "kpiId" text NOT NULL,
    "empleadoId" text NOT NULL,
    "creadorId" text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    "cantidadTareas" integer NOT NULL,
    "tipoOrden" text DEFAULT 'kpi_sistema'::text NOT NULL,
    status text DEFAULT 'pendiente'::text NOT NULL,
    "fechaInicio" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fechaLimite" timestamp(3) without time zone NOT NULL,
    "fechaLimiteOriginal" timestamp(3) without time zone,
    "fechaExtendida" timestamp(3) without time zone,
    "motivoExtension" text,
    "fechaCompletada" timestamp(3) without time zone,
    "enPausa" boolean DEFAULT false NOT NULL,
    "motivoPausa" text,
    "fechaPausa" timestamp(3) without time zone,
    "requiereAprobacion" boolean DEFAULT false NOT NULL,
    "tareasCompletadas" integer DEFAULT 0 NOT NULL,
    progreso double precision DEFAULT 0 NOT NULL,
    "resultadoFinal" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "valoresCalculo" text,
    "areaId" text
);


ALTER TABLE public."OrdenTrabajo" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 23980)
-- Name: RevisionJefe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RevisionJefe" (
    id text NOT NULL,
    "ordenTrabajoId" text NOT NULL,
    "jefeId" text NOT NULL,
    status text NOT NULL,
    "motivoRechazo" text,
    comentarios text,
    calificacion integer,
    "fechaRevision" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RevisionJefe" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 23970)
-- Name: SolicitudEdicion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SolicitudEdicion" (
    id text NOT NULL,
    "ordenTrabajoId" text NOT NULL,
    "solicitanteId" text NOT NULL,
    "campoAEditar" text NOT NULL,
    "valorActual" text NOT NULL,
    "valorNuevo" text NOT NULL,
    justificacion text NOT NULL,
    status text DEFAULT 'pendiente'::text NOT NULL,
    "motivoRechazo" text,
    "fechaSolicitud" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fechaRespuesta" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SolicitudEdicion" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 23960)
-- Name: SolicitudTarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SolicitudTarea" (
    id text NOT NULL,
    "ordenTrabajoId" text NOT NULL,
    "empleadoId" text NOT NULL,
    descripcion text NOT NULL,
    justificacion text NOT NULL,
    status text DEFAULT 'pendiente'::text NOT NULL,
    "motivoRechazo" text,
    "fechaSolicitud" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fechaRespuesta" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SolicitudTarea" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 23935)
-- Name: Tarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tarea" (
    id text NOT NULL,
    "ordenTrabajoId" text NOT NULL,
    descripcion text NOT NULL,
    orden integer NOT NULL,
    completada boolean DEFAULT false NOT NULL,
    "fueraDeTiempo" boolean DEFAULT false NOT NULL,
    "fechaLimite" timestamp(3) without time zone,
    "fechaCompletada" timestamp(3) without time zone,
    "solicitudAgregar" boolean DEFAULT false NOT NULL,
    "aprobadaPorJefe" boolean DEFAULT false NOT NULL,
    "intentosEvidencia" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tarea" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 23885)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    dni text,
    email text NOT NULL,
    password text NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    role text DEFAULT 'empleado'::text NOT NULL,
    "areaId" text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    puesto_id text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 23876)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24175)
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    jefe_id text,
    promedio_global double precision DEFAULT 0 NOT NULL,
    total_kpis integer DEFAULT 0 NOT NULL,
    kpis_rojos integer DEFAULT 0 NOT NULL,
    porcentaje_rojos double precision DEFAULT 0 NOT NULL,
    nivel_riesgo text DEFAULT 'BAJO'::text NOT NULL,
    ranking integer DEFAULT 0 NOT NULL,
    comentario_rrhh text,
    accion_sugerida text,
    responsable text,
    activa boolean DEFAULT true NOT NULL,
    area_padre_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.areas OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 27999)
-- Name: evidencias_kpi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evidencias_kpi (
    id text NOT NULL,
    kpi_id text NOT NULL,
    empleado_id text NOT NULL,
    periodo text NOT NULL,
    archivo_url text NOT NULL,
    tipo text NOT NULL,
    nombre text NOT NULL,
    tamanio integer,
    valor_numerico double precision,
    nota text,
    intento integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'pendiente_revision'::text NOT NULL,
    motivo_rechazo text,
    apelacion text,
    respuesta_apelacion text,
    fecha_apelacion timestamp(3) without time zone,
    es_fuera_de_tiempo boolean DEFAULT false NOT NULL,
    fecha_subida timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revisado_por text,
    fecha_revision timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public.evidencias_kpi OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24909)
-- Name: puestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puestos (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    area_id text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.puestos OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 28879)
-- Name: revisores_asignados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revisores_asignados (
    id text NOT NULL,
    empleado_id text NOT NULL,
    revisor_id text NOT NULL,
    motivo text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.revisores_asignados OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25669)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    device_info text,
    ip_address text,
    user_agent text,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_activity timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 5154 (class 0 OID 24009)
-- Dependencies: 228
-- Data for Name: Alerta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Alerta" (id, "areaId", "empleadoId", "evaluacionId", tipo, nivel, titulo, descripcion, "accionSugerida", responsable, status, "fechaDeteccion", "fechaResolucion", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5152 (class 0 OID 23989)
-- Dependencies: 226
-- Data for Name: Evaluacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evaluacion" (id, "empleadoId", "evaluadorId", periodo, "tipoPeriodo", anio, "calculadaAutomaticamente", "promedioGeneral", "kpisRojos", "porcentajeRojos", status, "fechaCalculo", "fechaCierre", "createdAt", "updatedAt", "areaId") FROM stdin;
\.


--
-- TOC entry 5153 (class 0 OID 24001)
-- Dependencies: 227
-- Data for Name: EvaluacionDetalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EvaluacionDetalle" (id, "evaluacionId", "kpiId", "ordenTrabajoId", "resultadoNumerico", "resultadoPorcentaje", "brechaVsMeta", estado, "formulaUtilizada", meta, "umbralAmarillo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5148 (class 0 OID 23948)
-- Dependencies: 222
-- Data for Name: Evidencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evidencia" (id, "tareaId", "archivoUrl", tipo, nombre, tamanio, intento, status, "motivoRechazo", "esFueraDeTiempo", apelacion, "respuestaApelacion", "fechaApelacion", "fechaSubida", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5145 (class 0 OID 23910)
-- Dependencies: 219
-- Data for Name: KPI; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KPI" (id, key, area, "areaId", indicador, descripcion, "tipoCalculo", "formulaCalculo", meta, tolerancia, "umbralAmarillo", periodicidad, sentido, unidad, orden, activo, "createdAt", "updatedAt", "operadorMeta", "tipoCriticidad", puesto_id, aplica_orden_trabajo, horas_limite_orden) FROM stdin;
cmmuo9pp30001hkgcyevveeyg	INTELI-ANALIS-MMUO9PD3	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Tiempo de desarrollo Tecnológico funcional	El usuario solicita el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Tiempo Real gastado ","denominador":"Tiempo pactado de entrega","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 13:52:50.774	2026-03-17 13:52:50.774	>=	critico	72acb457-4425-4e6b-826c-147172df2d5e	f	0
cmmuocr5b0003hkgcg6tfvm9a	INTELI-ANALIS-MMUOCR2M	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Tiempo de implementación de mejora funcional	El usuario solicita el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Tiempo Real gastado","denominador":"Tiempo pactado de entrega","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 13:55:12.623	2026-03-17 13:55:12.623	>=	no_critico	72acb457-4425-4e6b-826c-147172df2d5e	f	0
cmmuoevi50005hkgcvuhqd902	INTELI-ANALIS-MMUOEVH1	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Analisis de datos Funcional	El usuario solicita  el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Tiempo Real gastado","denominador":"tiempo pactado de entrega","multiplicador":100,"invertir":false}	95	3	98	mensual	Mayor es mejor	%	0	t	2026-03-17 13:56:51.581	2026-03-17 14:01:35.089	>=	critico	72acb457-4425-4e6b-826c-147172df2d5e	f	0
cmmuotuq80007hkgch33nbqct	INTELI-ANALIS-MMUOTUO3	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Atencion de requerimientos	El usuario solicita el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Requerimientos completados","denominador":" Requetimientos solicitados","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:08:30.414	2026-03-17 14:08:30.414	>=	critico	72acb457-4425-4e6b-826c-147172df2d5e	f	0
cmmuowkpi0009hkgcjjqwjaqx	INTELI-ANALIS-MMUOWKMZ	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Gasto de PPTO	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Gasto Real","denominador":"Presupuesto Aprobado","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:10:37.399	2026-03-17 14:10:37.399	>=	no_critico	72acb457-4425-4e6b-826c-147172df2d5e	f	0
cmmuph6ze000dhkgc87b2osdz	INTELI-DESARR-MMUPH6WL	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Tiempo de implementacion de mejora funcional	El usuario solicita  el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Tiempo Real gastado ","denominador":" Tiempo pactado de entrega","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:26:39.386	2026-03-17 14:27:21.868	>=	no_critico	47caf69f-2485-4788-a3e9-ce5605cb2502	f	0
cmmupm4d8000fhkgclg7r0isw	INTELI-DESARR-MMUPM483	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Atencion de requerimientos	El usuario solicita  el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Requerimientos completados","denominador":" Requerimientos solicitados ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:30:29.276	2026-03-17 14:30:29.276	>=	critico	47caf69f-2485-4788-a3e9-ce5605cb2502	f	0
cmmupsn0f000hhkgc6ekvyg2f	ITCIBE-ENCARG-MMUPSMY5	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Tiempo de atención de requerimientos tecnológicos	Medición: Meta < 3hrs, si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Requerimientos atendidos dentro del SLA ","denominador":"Total requerimientos","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:35:33.376	2026-03-17 14:35:33.376	>=	critico	d1dd5032-df3a-4e19-90cc-1229c547e22a	f	0
cmmuq0cl4000jhkgczir9gl29	ITCIBE-ENCARG-MMUQ0CHK	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Cumplimiento de mantenimiento preventivo	\N	division	{"tipo":"division","numerador":"Mantenimientos ejecutados ","denominador":" Programados","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:41:33.112	2026-03-17 14:41:33.112	>=	critico	d1dd5032-df3a-4e19-90cc-1229c547e22a	f	0
cmmuq2i27000lhkgc6xxdu99q	ITCIBE-ENCARG-MMUQ2I0X	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Control del inventario de activos tecnológicos	\N	division	{"tipo":"division","numerador":"Activos tecnológicos inventariados y asignados ","denominador":"Total activos tecnológicos","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 14:43:13.52	2026-03-17 14:43:13.52	=	critico	d1dd5032-df3a-4e19-90cc-1229c547e22a	f	0
cmmuq6wxn000nhkgcb2ene7de	ITCIBE-ENCARG-MMUQ6WUP	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Seguridad y respaldo de la información	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien	division	{"tipo":"division","numerador":"Respaldos ejecutados y verificados ","denominador":" Respaldos programados","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:46:39.42	2026-03-17 14:46:39.42	>=	no_critico	d1dd5032-df3a-4e19-90cc-1229c547e22a	f	0
cmmuq9s9u000phkgcqgwfa495	ITCIBE-ENCARG-MMUQ9S8E	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Cumplimiento legal y control de licencias de software	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Software instalado con licencia válida","denominador":"Total de software instalado","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:48:53.346	2026-03-17 14:48:53.346	>=	critico	d1dd5032-df3a-4e19-90cc-1229c547e22a	f	0
cmmuqu5hp000rhkgc1bksxeeu	ITCIBE-JEFEDE-MMUQU5FP	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Cumplimiento legal y control de licencias de software	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Software instalado con licencia válida ","denominador":"Total de software instalado","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 15:04:43.596	2026-03-17 15:04:43.596	>=	critico	31650d56-28ac-4eb8-863a-076e725d10f4	f	0
cmmur1vjk000thkgcqfj5z8ol	ITCIBE-JEFEDE-MMUR1VDC	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Tiempo de atención de requerimientos tecnológicos	Meta < 3hrs	division	{"tipo":"division","numerador":"Requerimientos atendidos dentro del SLA ","denominador":"Total requerimientos","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-17 15:10:43.953	2026-03-17 15:10:43.953	>=	critico	31650d56-28ac-4eb8-863a-076e725d10f4	f	0
cmmur3rnc000vhkgcbh8sxq4y	ITCIBE-JEFEDE-MMUR3RLN	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Seguridad y respaldo de la información	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Respaldos ejecutados y verificados ","denominador":"Respaldos programados","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 15:12:12.217	2026-03-17 15:12:12.217	>=	no_critico	31650d56-28ac-4eb8-863a-076e725d10f4	f	0
cmmur6upa000xhkgcjlcl7s7t	ITCIBE-JEFEDE-MMUR6UNW	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Control del inventario de activos tecnológicos	\N	division	{"tipo":"division","numerador":"Activos tecnológicos inventariados y asignados ","denominador":" Total activos tecnológicos","multiplicador":98,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 15:14:36.142	2026-03-17 15:14:36.142	=	critico	31650d56-28ac-4eb8-863a-076e725d10f4	f	0
cmmur81s2000zhkgcoz6yqfh2	ITCIBE-JEFEDE-MMUR81QC	IT / Ciber seguridad	b396765f-621a-4ad6-8572-060d0ff5fe96	Soluciones tecnológicas implementadas y funcionales	\N	division	{"tipo":"division","numerador":"Entregables cumplidos ","denominador":"Entregables planificados","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 15:15:31.97	2026-03-17 15:15:31.97	>=	no_critico	31650d56-28ac-4eb8-863a-076e725d10f4	f	0
cmmurveml0011hkgc1e6i142g	SEGURI-JEFESE-MMURVEJE	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Incidentes de robo o sustracción no autorizada	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	conteo	{"tipo":"conteo","target":"Número de incidentes de robo o salida no autorizada"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 15:33:41.709	2026-03-17 15:33:41.709	=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmurx36s0013hkgcz1xcnp50	SEGURI-JEFESE-MMURX35H	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Control de salida de materiales	\N	division	{"tipo":"division","numerador":"Salidas con autorización y evidencia ","denominador":"Total de salidas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 15:35:00.197	2026-03-17 15:35:00.197	=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmus0mx30015hkgcrqatntdn	SEGURI-JEFESE-MMUS0MVW	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Disponibilidad del sistema de videovigilancia en todos los lugares de interes (incluidos Proyectos)	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien.	division	{"tipo":"division","numerador":"Horas operativas del sistema ","denominador":" Horas totales","multiplicador":100,"invertir":false}	100	-1	99	mensual	Mayor es mejor	%	0	t	2026-03-17 15:37:45.735	2026-03-17 15:37:45.735	=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmus48ea0017hkgcgqruxpxo	SEGURI-JEFESE-MMUS48C7	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Proyectos con Monitoreo	\N	binario	{"tipo":"binario","descripcion":"# Proyectos monitoreados=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 15:40:33.539	2026-03-17 15:40:33.539	=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmus8o7u0019hkgcn7jniq8x	SEGURI-JEFESE-MMUS8NZW	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Evaluación de Compañías de Vigilancia	\N	binario	{"tipo":"binario","descripcion":"Entrega de evaluacion trimestral del 100% companias=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 15:44:00.666	2026-03-17 15:45:05.272	=	no_critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmusw4wp001bhkgch5paxvm3	SEGURI-JEFESE-MMUSW4V5	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Reporte mensual de Seguridad y Monitoreo	\N	binario	{"tipo":"binario","descripcion":"Entrega de reporte de S&M=100%"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:02:15.385	2026-03-17 16:02:15.385	>=	no_critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmut15jp001dhkgcs3dvjjep	SEGURI-JEFESE-MMUT15GT	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Atencion a emergencia de S&M	Emergencias atendidas (< 12 hrs)	conteo	{"tipo":"conteo","target":"Emergencias atendidas (< 12 hrs)"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:06:09.493	2026-03-17 16:06:09.493	>=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmut2n3w001fhkgcsxuane7o	SEGURI-JEFESE-MMUT2N2U	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Cumplimiento de rondas y monitoreo	\N	division	{"tipo":"division","numerador":"Rondas ejecutadas ","denominador":"Rondas programadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:07:18.908	2026-03-17 16:07:18.908	>=	no_critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmuti446001hhkgctgobqydn	SEGURI-JEFESE-MMUTI42I	Seguridad y monitoreo	9a78442a-f1d2-478d-9e18-ff8c81d30580	Estadistica Vehicular Velocidad y Horarios	\N	binario	{"tipo":"binario","descripcion":"Reporte semanal estadistico vehicular=100%"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:19:20.789	2026-03-17 16:19:20.789	>=	critico	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	f	0
cmmutl3er001jhkgcs1qq04u9	PROYEC-ENCARG-MMUTL3CW	Proyectos Gerenciales	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Cumplimiento de proyectos en tiempo	si este KPI no se cumple no se paga bono, aunque otros KPIs estén bien. El solicitante pone el tiempo de ejecucion	division	{"tipo":"division","numerador":"Proyectos ejecutados en plazo","denominador":"Total de proyectos asignados","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:21:39.843	2026-03-17 16:21:39.843	>=	critico	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	f	0
cmmutovhb001lhkgcy7b50bhg	PROYEC-ENCARG-MMUTOVF6	Proyectos Gerenciales	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Trabajos sin retrabajo	\N	conteo	{"tipo":"conteo","target":"Retrabajos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 16:24:36.192	2026-03-17 16:24:36.192	=	critico	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	f	0
cmmutpzqk001nhkgcqa6l4f9p	PROYEC-ENCARG-MMUTPZOM	Proyectos Gerenciales	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Incidentes de seguridad	\N	conteo	{"tipo":"conteo","target":"Accidentes=0"}	0	-1	\N	mensual	Menor es mejor	%	0	t	2026-03-17 16:25:28.364	2026-03-17 16:25:28.364	=	critico	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	f	0
cmmutuxo4001phkgcxu2witb7	PROYEC-ENCARG-MMUTUXMD	Proyectos Gerenciales	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Cumplimiento del cronograma	\N	division	{"tipo":"division","numerador":"Actividades ejecutadas según cronograma ","denominador":"Total de actividades","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:29:18.964	2026-03-17 16:29:18.964	>=	no_critico	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	f	0
cmmutvziz001rhkgc8g4yjyhb	PROYEC-ENCARG-MMUTVZFR	Proyectos Gerenciales	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Cuidado de activos	# de danos de activos=0	conteo	{"tipo":"conteo","target":"# de danos de activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 16:30:08.028	2026-03-17 16:30:08.028	=	critico	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	f	0
cmmuum119001thkgcihz52kyt	COMPRA-COMPRA-MMUUM0ZK	Compras Nacionales	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Confiabilidad de entrega de proveedores a proyectos o almacen central (Diario)	\N	division	{"tipo":"division","numerador":"Orden entregadas completas y en fecha ","denominador":" Total ordenes emitidas ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:50:23.037	2026-03-17 16:50:23.037	>=	critico	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	f	0
cmmuun2de001vhkgcqmuzzi4t	COMPRA-COMPRA-MMUUN2C3	Compras Nacionales	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Cumplimiento Integral del ciclo de compra	\N	division	{"tipo":"division","numerador":"Ordenes cerradas dentro del tiempo definido ","denominador":"total ordenes del periodo","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:51:11.426	2026-03-17 16:51:11.426	>=	no_critico	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	f	0
cmmuupbg1001xhkgccd0a3g0y	COMPRA-COMPRA-MMUUPBEA	Compras Nacionales	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Gestión de desempeño de proveedores	\N	division	{"tipo":"division","numerador":"OC sin incidencias atribuibles al proveedor ","denominador":"Total ordenes evaluadas.","multiplicador":100,"invertir":false}	100	0	98	mensual	Mayor es mejor	%	0	t	2026-03-17 16:52:56.498	2026-03-17 16:54:04.474	=	no_critico	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	f	0
cmmuurqbh001zhkgci54vl6nc	COMPRA-COMPRA-MMUURQ8Q	Compras Nacionales	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Gestión de Costos vs Presupuesto Aprobado	\N	division	{"tipo":"division","numerador":"Costos total compras ","denominador":" Presupuesto aprobado ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:54:49.085	2026-03-17 16:54:49.085	>=	no_critico	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	f	0
cmmuusyyw0021hkgcrqrze145	COMPRA-COMPRA-MMUUSYX1	Compras Nacionales	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Eficiencia administrativa en control de pagos, entrega documental completa (48h)	\N	division	{"tipo":"division","numerador":"Solicitud de pagos validadas y enviadas ≤48h ","denominador":"Total solicitudes pago recibidos con documentación completa ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:55:46.953	2026-03-17 16:55:46.953	>=	no_critico	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	f	0
cmmuuwccb0023hkgcg0h44y6k	AREADE-COORDI-MMUUWCA6	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Cumplimiento de KPIs del Team	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:58:24.251	2026-03-17 16:58:24.251	>	critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuuxmmy0025hkgca2fs0h5j	AREADE-COORDI-MMUUXMJS	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Implementacion del Plan Operativo del area	\N	binario	{"tipo":"binario","descripcion":"Plan Operativo del área"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 16:59:24.251	2026-03-17 16:59:24.251	>=	critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuv1imq0027hkgclnibd6a2	AREADE-COORDI-MMUV1IJY	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Costo real / PPTO (global de compras hasta almacen)	\N	division	{"tipo":"division","numerador":"Costo real ","denominador":" PPTO","multiplicador":100,"invertir":false}	95	5	90	mensual	Menor es mejor	%	0	t	2026-03-17 17:02:25.682	2026-03-17 17:02:25.682	<	critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuv30lr0029hkgcq36qzgmp	AREADE-COORDI-MMUV30JU	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Costo real / PPTO (Logistica)	\N	division	{"tipo":"division","numerador":"Costo real ","denominador":" PPTO","multiplicador":100,"invertir":false}	95	5	90	mensual	Menor es mejor	%	0	t	2026-03-17 17:03:35.632	2026-03-17 17:03:35.632	<	critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuv6wz0002bhkgco0y947l6	AREADE-COORDI-MMUV6WXB	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Costo real / PPTO (Compras Locales compras competitivas)	\N	division	{"tipo":"division","numerador":"Costo real ","denominador":" PPTO","multiplicador":100,"invertir":false}	95	5	90	mensual	Menor es mejor	%	0	t	2026-03-17 17:06:37.548	2026-03-17 17:06:48.866	<	critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuv8beo002dhkgc4v1powe1	AREADE-COORDI-MMUV8BC0	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Dashboard del area	\N	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 17:07:42.913	2026-03-17 17:07:42.913	=	no_critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuv9fmb0001hk5ks8vpcwf0	AREADE-COORDI-MMUV9FJU	Área de BlockChain	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Presentación de Riesgos del área	\N	binario	{"tipo":"binario","descripcion":"Presentación de Riesgos del área"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 17:08:35.026	2026-03-17 17:08:35.026	=	no_critico	12c4a141-1b61-43d9-8e7c-2f3203040934	f	0
cmmuvh00x0003hk5k9rnxv90i	IMPORT-ESPECI-MMUVGZYT	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Despachos dentro del lead time plan	\N	division	{"tipo":"division","numerador":"Despacho en tiempo ","denominador":"Total despacho ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:14:28.064	2026-03-17 17:14:28.064	>=	critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvishq0005hk5kk92inipk	IMPORT-ESPECI-MMUVISFQ	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Gestión Aduanera y Documental sin Incidencias (Gestión documentaria, Proyeccion boletin/naviera)	\N	division	{"tipo":"division","numerador":"Despacho sin multas ni retrasos atribuibles ","denominador":" Total despacho ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:15:51.614	2026-03-17 17:15:51.614	>=	critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvmvuv0007hk5kugx3lgh8	IMPORT-ESPECI-MMUVMVQX	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Desvío costo logístico vs plan	\N	division	{"tipo":"division","numerador":"Costo logistico Real - Costo Logistico Presupuestado ","denominador":"Costo logístico Presupuestado ","multiplicador":100,"invertir":false}	3	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:19:02.599	2026-03-17 17:19:02.599	<=	critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvnz9z0009hk5kfvzj8zyd	IMPORT-ESPECI-MMUVNZ82	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Cumplimiento de SLA	\N	division	{"tipo":"division","numerador":"Actividad cumplida dentro del SLA ","denominador":"Total de actividades evaluadas ","multiplicador":100,"invertir":false}	95	4	99	mensual	Mayor es mejor	%	0	t	2026-03-17 17:19:53.687	2026-03-17 17:19:53.687	>=	no_critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvpbgg000bhk5k9g3j6zpf	IMPORT-ESPECI-MMUVPBEM	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Cumplimiento en Comunicación y Coordinación de Importaciones	\N	division	{"tipo":"division","numerador":"Comunicación realizada en tiempo ","denominador":"Total actividad comunicación programada","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:20:56.129	2026-03-17 17:20:56.129	>=	no_critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvs4fc000dhk5kn94k44ls	IMPORT-ESPECI-MMUVS4DG	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Gestión de cotización de Agentes de Carga	\N	division	{"tipo":"division","numerador":"Operaciones con minimo de 2 cotizaciones comparadas ","denominador":" Total operaciones que requerían cotización ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:23:06.984	2026-03-17 17:23:06.984	>=	no_critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuvwa4z000fhk5k2r6dn8ga	COMPRA-UNIDAD-MMUVWA1S	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	OTIF: Cumplimiento de Entrega Internacional	\N	division	{"tipo":"division","numerador":"OC y entregadas en fecha comprometida ","denominador":"Total OC internacionales","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:26:21.011	2026-03-17 17:26:21.011	>=	critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuvy0hb000hhk5klyr4imyy	COMPRA-UNIDAD-MMUVY0FC	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Cumplimiento de Cronograma de Fabricación	\N	division	{"tipo":"division","numerador":"Hitos cumplidos según cronograma ","denominador":" Total hitos programados (Incluye planos aprobados, Inicio Fabricacion, Fecha embarque)","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:27:41.807	2026-03-17 17:27:41.807	>=	critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuw2b0x000jhk5k6abehuq0	IMPORT-ESPECI-MMUW2AXU	Import / Export	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Control de Costos vs Presupuesto	\N	division	{"tipo":"division","numerador":"Costo Real total ","denominador":" Presupuesto aprobado ","multiplicador":100,"invertir":false}	95	4	91	mensual	Menor es mejor	%	0	t	2026-03-17 17:31:02.097	2026-03-17 17:31:02.097	<	critico	41b1d6a1-a569-4e60-98ef-e3591fe9e211	f	0
cmmuw3i2x000lhk5kzq0pr790	COMPRA-UNIDAD-MMUW3HWY	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Gestión estratégica de Incoterms	\N	division	{"tipo":"division","numerador":"Orden con incoterms validado ","denominador":"Total ordenes internacionales ","multiplicador":100,"invertir":false}	100	0	99	mensual	Mayor es mejor	%	0	t	2026-03-17 17:31:57.898	2026-03-17 17:32:36.016	=	critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuw5oq8000nhk5kuiea6oxf	COMPRA-UNIDAD-MMUW5ONX	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Eficiencia administrativa en control de pagos (3 dias)	\N	division	{"tipo":"division","numerador":"Solicitud de pagos validadas y enviadas ≤3 días ","denominador":" Total solicitudes pago recibidos con documentación completa","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:33:39.824	2026-03-17 17:33:39.824	>=	no_critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuw747j000phk5kqts9sued	COMPRA-UNIDAD-MMUW745B	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Gestión de Calidad Pre-Embarque (FAT+Dossier)	\N	division	{"tipo":"division","numerador":"OC embarcado con FAT aprobado y Dossier completo ","denominador":"Total Ordenes ","multiplicador":100,"invertir":false}	3	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:34:46.544	2026-03-17 17:34:46.544	<=	critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuw9gwi000rhk5khxu387fw	COMPRA-UNIDAD-MMUW9GTA	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Dependencia de proveedores críticos	\N	division	{"tipo":"division","numerador":"Valor adjudicado a proveedores criticos ","denominador":"valor total compras internacionales ","multiplicador":100,"invertir":false}	3	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:36:36.306	2026-03-17 17:36:36.306	<=	no_critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuwaws3000thk5kmjtpg677	COMPRA-UNIDAD-MMUWAWOV	Compras Internacionales	7221ded4-dd4c-450f-80ca-10361ba74274	Compras Fast Track exitosas (Urgente)	\N	division	{"tipo":"division","numerador":"Fast Track Entregadas < plazo urgente ","denominador":" Total OC x 100","multiplicador":100,"invertir":false}	3	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:37:43.539	2026-03-17 17:37:43.539	<=	critico	e7098b01-b321-49c9-8b06-f328c048bf77	f	0
cmmuwiyyo000vhk5keco1hfld	ALMACE-ENCARG-MMUWIYRT	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Tiempo promedio entrega almacén → proyecto desde requerimiento (3 días)	\N	division	{"tipo":"division","numerador":"Entregas realizadas < 3 dias ","denominador":" Total requerimiento despachado ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:43:59.616	2026-03-17 17:49:40.19	>=	critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmuwkajw000xhk5k9rl9op9m	ALMACE-ENCARG-MMUWKAI3	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	% Entregas con daño o pérdida	\N	division	{"tipo":"division","numerador":"entregas con daños o perdidas / ","denominador":"Total entregas","multiplicador":100,"invertir":false}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:45:01.292	2026-03-17 17:49:54.424	=	critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmuwpfox000zhk5kypayyq3l	ALMACE-ENCARG-MMUWPFLM	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Costo real/Presupuesto	\N	division	{"tipo":"division","numerador":"Costo logistico real ","denominador":" costo presupuestado ","multiplicador":100,"invertir":false}	95	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 17:49:01.233	2026-03-17 17:50:09.46	<	critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmuwsnxa0011hk5kc3hxz2b9	LOGIST-LOGIST-MMUWSNVL	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Auditoria  de Trazabilidad de Documentacion del Producto/equipo salida/entrega/Vivienda	\N	division	{"tipo":"division","numerador":"Expedientes completos y conformes ","denominador":"Total expedientes auditados o recibidos ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 17:51:31.871	2026-03-17 17:51:31.871	>=	no_critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmv36flc0013hk5kaaz29rqa	AREAAD-GERENC-MMV36FK8	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	Uso del sistema interbanca confiable	\N	binario	{"tipo":"binario","descripcion":"Transacciones documentadas y sin errores"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 20:50:11.952	2026-03-17 20:50:11.952	=	critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	f	0
cmmv37k4e0015hk5k431ur34c	AREAAD-GERENC-MMV37K3M	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	Disciplina presupuestaria	\N	division	{"tipo":"division","numerador":"Gasto real","denominador":"Presupuesto aprobado","multiplicador":100,"invertir":false}	95	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-17 20:51:04.478	2026-03-17 20:51:04.478	>	no_critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	f	0
cmmv3bxk10019hk5kiw85flme	AREAAD-GERENC-MMV3BXHL	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	Actualización de riesgo financiero de la empresa	\N	binario	{"tipo":"binario","descripcion":"Presentación de análisis de riesgos mensual"}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-17 20:54:28.514	2026-03-17 20:54:28.514	=	no_critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	f	0
cmmv3dw8t001bhk5kvuknoajs	AREAAD-GERENC-MMV3DW87	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	KPIs verdes del team	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	90	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 20:56:00.126	2026-03-17 20:56:00.126	>	critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	f	0
cmmv3fp4i001dhk5k3ihy6boq	AREAAD-GERENC-MMV3FP3W	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	Presentación de dashboards	\N	dashboard_presentado	{"tipo":"dashboard_presentado"}	95	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 20:57:24.211	2026-03-17 20:57:24.211	>=	no_critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	f	0
cmmv49usd001jhk5kjb8p9qup	LOGIST-LOGIST-MMV49UOR	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Auditoria  de Trazabilidad de Documentacion del Producto/equipo salida/entrega/Vivienda	\N	division	{"tipo":"division","numerador":"Expedientes completos y conformes ","denominador":" Total expedientes auditados o recibidos","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:20:51.228	2026-03-17 21:20:51.228	>=	no_critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmv4bjaj001lhk5kgio5zkx0	LOGIST-LOGIST-MMV4BJ6P	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Gestión de reclamos de seguros (5 días)	\N	division	{"tipo":"division","numerador":"Suma dias gestion reclamo ","denominador":"Total requerimientos despacho o traslado ","multiplicador":100,"invertir":false}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 21:22:09.643	2026-03-17 21:22:09.643	=	critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmv4crqi001nhk5krc254q5d	LOGIST-LOGIST-MMV4CRNH	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Tiempo de Respuesta ante Incidencias Operativas (24h)	\N	division	{"tipo":"division","numerador":"Incidencias respondidas < 24h ","denominador":"Total Incidencias reportadas ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 21:23:07.242	2026-03-17 21:23:07.242	=	no_critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmmv4g1kf001phk5k8gs46hf6	ALMACE-ENCARG-MMV4G1G7	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Inventario ERP vs físico en Almacén Central	\N	division	{"tipo":"division","numerador":"Unidades coincidentes ","denominador":"Total unidades auditadas","multiplicador":100,"invertir":false}	95	4	99	mensual	Mayor es mejor	%	0	t	2026-03-17 21:25:39.951	2026-03-17 21:25:39.951	>	critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4hi1c001rhk5kya9pdgnt	ALMACE-ENCARG-MMV4HHYB	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Inventario ERP vs físico en Almacenes de Proyectos	\N	division	{"tipo":"division","numerador":"Unidades coincidentes ","denominador":" Total unidades auditadas ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:26:47.952	2026-03-17 21:26:47.952	>	critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4qior001thk5kjv6p2wzd	ALMACE-ENCARG-MMV4QILF	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Cumplimiento de estándares almacenamiento seguro (no estar expuesto a riesgo de deterioro o accidentes)	\N	division	{"tipo":"division","numerador":"Items conformidades detectados ","denominador":"Total items evaluados ","multiplicador":100,"invertir":false}	95	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 21:33:48.699	2026-03-17 21:33:48.699	<	critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4s3mh001vhk5kqlc8forv	ALMACE-ENCARG-MMV4S3J9	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Registro oportuno de movimientos en Odoo (Entrada o salida registrada, 4h)	\N	division	{"tipo":"division","numerador":"Movimientros registrados  <4h ","denominador":"Total movimientos ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:35:02.49	2026-03-17 21:35:02.49	>	no_critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4uiqi001xhk5knhnw4fc8	ALMACE-ENCARG-MMV4UIMZ	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Auditoria de rotulación y trazabilidad en almacenes (equipos/Proyectos)	\N	division	{"tipo":"division","numerador":"Items con error en rotulacion ","denominador":" Total items auditados ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:36:55.386	2026-03-17 21:36:55.386	>	no_critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4x0vt001zhk5ku4i1lcs8	ALMACE-ENCARG-MMV4X0S1	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Perdidas de materiales/equipos/herramientas, insumos, otros	\N	division	{"tipo":"division","numerador":"Valor económico de perdida ","denominador":" valor total del inventario bajo custodia","multiplicador":100,"invertir":false}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 21:38:52.217	2026-03-17 21:38:52.217	=	critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv4zbar0021hk5k3ks7esq1	ALMACE-ENCARG-MMV4ZB7R	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Gestión de asignación de activos fijos (herramientas, equipos)	\N	division	{"tipo":"division","numerador":"Activos correctamente asignados y documentados ","denominador":"Total activos bajo custodia x 100","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 21:40:39.028	2026-03-17 21:40:39.028	=	critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv5cijq0023hk5kxbsv2nkq	ALMACE-ENCARG-MMV5CIFW	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Auditoria de 5S + Reporte de Incidencias	\N	division	{"tipo":"division","numerador":"Incidencias reportadas el mismo día de detección ","denominador":"Total incidencias reportadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 21:50:54.95	2026-03-17 21:50:54.95	=	no_critico	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	f	0
cmmv6bfkh0025hk5k4sgug4gc	ALMACE-AUXILI-MMV6BFIO	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Cumplimiento de conteos ciclicos asignados	\N	division	{"tipo":"division","numerador":"Conteos realizados ","denominador":" conteos programados ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 22:18:04.048	2026-03-17 22:18:04.048	=	critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6dqyz0027hk5kl0smhbac	ALMACE-AUXILI-MMV6DQX3	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Despacho y recepción sin error documental y físico	\N	division	{"tipo":"division","numerador":"Movimiento sin error /","denominador":" total movimiento ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 22:19:52.139	2026-03-17 22:19:52.139	>	critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6f9180029hk5kqs4n9pru	ALMACE-AUXILI-MMV6F8ZS	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Material/equipo dañado por mala manipulación	\N	division	{"tipo":"division","numerador":"Monto Unidades dañadas atribuibles ","denominador":"Monto Total unidades manipuladas ","multiplicador":100,"invertir":false}	0.5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 22:21:02.204	2026-03-17 22:21:02.204	<	critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6ginc002bhk5ks12xcntd	ALMACE-AUXILI-MMV6GIM1	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Incidencias detectadas y reportadas oportunamente (mismo dia)	\N	division	{"tipo":"division","numerador":"Incidencias reportadas oportunamente ","denominador":" total incidencias detectadas ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-17 22:22:01.321	2026-03-17 22:22:01.321	=	no_critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6juws002dhk5kvr1vvc6p	ALMACE-AUXILI-MMV6JUSY	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Reporte de auditoría de 5S	\N	division	{"tipo":"division","numerador":"Hallazgos detectados ","denominador":" total items evaluados ","multiplicador":100,"invertir":false}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 22:24:37.18	2026-03-17 22:24:37.18	<	no_critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6lgdm002fhk5k31zkk92d	ALMACE-AUXILI-MMV6LGAR	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Perdidas atribuibles a mala gestión operativa	\N	division	{"tipo":"division","numerador":"Valor de perdidas atribuibles confirmadas ","denominador":"valor total de inventario bajo gestión ","multiplicador":100,"invertir":false}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-17 22:25:51.658	2026-03-17 22:25:51.658	=	critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv6modp002hhk5kyqeydn6a	ALMACE-AUXILI-MMV6MOA2	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Tiempo de respuesta a solicitudes internas de despacho ( respuesta 3h)	\N	division	{"tipo":"division","numerador":"Solicitud atendidas < 3 horas ","denominador":"total solicitudes atendidas ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 22:26:48.685	2026-03-17 22:26:48.685	>	no_critico	9fa0c900-aada-469b-881c-a12a4fe1c2a9	f	0
cmmv7t1wg0003hk6kzo17y90j	VENTAS-VENTAS-MMV7T1RG	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas Trimestrales	\N	division	{"tipo":"division","numerador":"Venta Trimestral Concretada","denominador":"Meta Trimestral","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-17 22:59:45.76	2026-03-17 22:59:45.76	=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmv7nr1l0001hk6k0zxrp2g7	VENTAS-VENTAS-MMV7NQT6	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas Anuales	\N	division	{"tipo":"division","numerador":"Ventas Concretadas Anual","denominador":"Metal Anual","multiplicador":100,"invertir":false}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-17 22:55:38.407	2026-03-17 23:01:54.581	=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmw4jwku0005hk6ks7yvat65	VENTAS-VENTAS-MMW4JWEQ	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Retencion de Clientes	\N	division	{"tipo":"division","numerador":"Clientes Activos","denominador":"Clientes Asignador ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:16:26.281	2026-03-18 14:16:26.281	=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmw4pmk00007hk6k0h433o5v	VENTAS-VENTAS-MMW4PMIR	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Activacion de Clientes Inactivos	\N	division	{"tipo":"division","numerador":"Clientes Inactivos Convertidos ","denominador":" 8 ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:20:53.232	2026-03-18 14:20:53.232	>=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmw4qu000009hk6kf9ngtt1e	VENTAS-VENTAS-MMW4QTWP	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Nuevos Clientes	\N	division	{"tipo":"division","numerador":"Nuevos Clientes Generación ","denominador":"6","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:21:49.536	2026-03-18 14:21:49.536	>=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmw4s5z4000bhk6kng04qqni	VENTAS-VENTAS-MMW4S5Y7	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Proyeccion y Forecast	\N	division	{"tipo":"division","numerador":"Venta Concretada Trimestral","denominador":"Forecast Proyectado Trimestral","multiplicador":100,"invertir":false}	80	20	100	mensual	Mayor es mejor	%	0	t	2026-03-18 14:22:51.713	2026-03-18 14:22:51.713	>=	critico	62481707-fc46-4f6d-ac8d-e38235d8ba29	f	0
cmmw4u0rl000dhk6krze38fkw	VENTAS-VENTAS-MMW4U0QE	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas Anuales	\N	division	{"tipo":"division","numerador":"Ventas Concretadas Anual","denominador":"Metal Anual","multiplicador":100,"invertir":false}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-18 14:24:18.273	2026-03-18 14:24:18.273	=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw4vhg0000fhk6kvqzop81i	VENTAS-VENTAS-MMW4VHEX	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas Trimestrales	KPI que desbloquea el bono	division	{"tipo":"division","numerador":"Venta Trimestral Concretada","denominador":"Meta Trimestral","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 14:25:26.545	2026-03-18 14:25:26.545	=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw4wypd000hhk6kgyufdvgb	VENTAS-VENTAS-MMW4WYOB	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Retención de Clientes	\N	division	{"tipo":"division","numerador":"Clientes Activos","denominador":"Clientes Asignador ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:26:35.569	2026-03-18 14:26:35.569	=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw4yi1h000jhk6ktjkc9clv	VENTAS-VENTAS-MMW4YHYH	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Activación de Clientes Inactivos	\N	division	{"tipo":"division","numerador":"Clientes Inactivos Convertidos ","denominador":"30","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:27:47.286	2026-03-18 14:27:47.286	=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw4zs6f000lhk6kxr13k1nx	VENTAS-VENTAS-MMW4ZS5N	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Nuevos Clientes	\N	division	{"tipo":"division","numerador":"Nuevos Clientes Generación ","denominador":"4","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:28:47.079	2026-03-18 14:28:47.079	>=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw51cmf000nhk6kvj0myrfn	VENTAS-VENTAS-MMW51CLY	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Proyección y Forecast	\N	division	{"tipo":"division","numerador":"Venta Concretada Trimestral","denominador":"Forecast Proyectado Trimestral","multiplicador":100,"invertir":false}	80	20	100	trimestral	Mayor es mejor	%	0	t	2026-03-18 14:30:00.231	2026-03-18 14:30:00.231	>=	critico	5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	f	0
cmmw58zwl000phk6k2bstggtw	VENTAS-VENTAS-MMW58ZWE	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas Anuales	\N	division	{"tipo":"division","numerador":"Ventas Concretadas Anual","denominador":"Metal Anual","multiplicador":98,"invertir":false}	100	-2	98	anual	Mayor es mejor	%	0	t	2026-03-18 14:35:56.997	2026-03-18 14:35:56.997	=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmw5b9gm000rhk6ky9qobt48	VENTAS-VENTAS-MMW5B9GD	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Penetración de Suministros con Cartera Existente	\N	division	{"tipo":"division","numerador":"Clientes actuales que compraron suministros ","denominador":"90","multiplicador":100,"invertir":false}	30	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:37:42.695	2026-03-18 14:45:36.525	>=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmv3j5aa001fhk5kjsdlcs4z	CONTAB-ANALIS-MMV3J55K	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Exactitud proyección flujo	\N	precision	{"tipo":"precision","labelEsperado":"Proyección de flujo","valorEsperado":"5","labelObtenido":"flujo real obtenido","modoEvaluacion":"tolerancia","toleranciaPorc":5}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:00:05.122	2026-03-18 14:56:26.534	>=	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmv3l2vn001hhk5knbxqrnts	CONTAB-ANALIS-MMV3L2US	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Liquidez corriente	\N	precision	{"tipo":"precision","labelEsperado":"Lizquidez corriente","valorEsperado":"1.2","labelObtenido":"Liquidez corriente","modoEvaluacion":"umbral"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 21:01:35.315	2026-03-18 15:02:12.218	>=	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw5en46000vhk6kss7ky5c5	VENTAS-VENTAS-MMW5EN2X	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Tasa de conversión oportunidad → venta	\N	division	{"tipo":"division","numerador":"Ventas ","denominador":"Oportunidades","multiplicador":100,"invertir":false}	40	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:40:20.358	2026-03-18 14:40:20.358	>=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmw5da4d000thk6kva0shyzm	VENTAS-VENTAS-MMW5DA48	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Nuevos Clientes Suministros	\N	division	{"tipo":"division","numerador":"Nuevos clientes con venta concretada suministros","denominador":"Meta","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:39:16.861	2026-03-18 14:44:19.314	=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmw5n7ts000xhk6kq47u2il5	VENTAS-VENTAS-MMW5N7ST	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Proyeccion y Forecast	\N	division	{"tipo":"division","numerador":"Valor del Pipeline","denominador":"Meta Anual","multiplicador":100,"invertir":false}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-18 14:47:00.448	2026-03-18 14:47:00.448	=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmw5q81z000zhk6k4c0nrgp2	VENTAS-VENTAS-MMW5Q7ZH	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Penetración Regional	\N	division	{"tipo":"division","numerador":"Contactos realizados ","denominador":"Meta mensual","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:49:20.711	2026-03-18 14:49:20.711	=	critico	c828b5c4-0120-4474-9df1-8c7c4a44db10	f	0
cmmw5ve040011hk6kydoc4roj	VENTAS-BUSINE-MMW5VDXR	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Clientes Nuevos Activados	\N	division	{"tipo":"division","numerador":"Clientes nuevos ","denominador":"10","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 14:53:21.7	2026-03-18 14:53:21.7	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw5x3ki0013hk6k1r3u8zhr	VENTAS-BUSINE-MMW5X3IE	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Venta Anual	\N	division	{"tipo":"division","numerador":"Venta Trimestral Concretada","denominador":"Meta Trimestral","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 14:54:41.49	2026-03-18 14:54:41.49	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw61kz70015hk6k8rnjsr83	VENTAS-BUSINE-MMW61KXX	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Leads EPC Identificados	\N	conteo	{"tipo":"conteo","target":"Cantidad de Leads EPC detectados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 14:58:10.675	2026-03-18 14:58:10.675	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw64reg0017hk6k2ph2n5by	VENTAS-BUSINE-MMW64RC1	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Oportunidades Calificadas	\N	division	{"tipo":"division","numerador":"Numero de oportunidades calificadas creadas","denominador":"50","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:00:38.968	2026-03-18 15:00:38.968	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw66r600019hk6ke0d8bdx4	VENTAS-BUSINE-MMW66R4J	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Tasa de conversión oportunidad → venta	\N	division	{"tipo":"division","numerador":"Ventas ","denominador":"Oportunidades ","multiplicador":100,"invertir":false}	60	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:02:11.976	2026-03-18 15:02:11.976	>=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw6dklx001bhk6kil4pyxyx	VENTAS-BUSINE-MMW6DKFI	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Feria El Salvador	\N	division	{"tipo":"division","numerador":"Feria Realizada","denominador":"1","multiplicador":100,"invertir":false}	100	0	\N	semestral	Mayor es mejor	%	0	t	2026-03-18 15:07:30.068	2026-03-18 15:07:30.068	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw6elf6001dhk6kdv85sr9w	VENTAS-BUSINE-MMW6ELDO	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Leads EPCs Solares Identificados	\N	conteo	{"tipo":"conteo","target":"Cantidad de Leads Calificados EPCs detectados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:08:17.779	2026-03-18 15:08:17.779	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw6fnwi001fhk6kjlgjd206	VENTAS-BUSINE-MMW6FNV2	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Propuestas EPC presentadas	\N	division	{"tipo":"division","numerador":"Propuestas EPCs enviadas","denominador":"3","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:09:07.651	2026-03-18 15:09:07.651	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw6vsrh001hhk6krlb1e7jv	CONTAB-ANALIS-MMW6VSP5	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Capital de trabajo optimo	\N	conteo	{"tipo":"conteo","target":"Capital de trabajo"}	100	5	105	mensual	Mayor es mejor	%	0	t	2026-03-18 15:21:40.444	2026-03-18 15:21:40.444	=	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw6xr64001jhk6ksbvtbxjc	CONTAB-ANALIS-MMW6XR51	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Días cuentas por cobrar	\N	precision	{"tipo":"precision","labelEsperado":"Dias cuentas por cobrar","valorEsperado":"60","labelObtenido":"Resultado obtenido","modoEvaluacion":"umbral"}	90	10	80	mensual	Menor es mejor	%	0	t	2026-03-18 15:23:11.692	2026-03-18 15:23:11.692	<	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw71mtp001lhk6kh2g9o5xx	CONTAB-ANALIS-MMW71MOY	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Margen	\N	precision	{"tipo":"precision","labelEsperado":"Variacion margen real vs presupuestado","valorEsperado":"2","labelObtenido":"Variacion margen real vs presupuestado","modoEvaluacion":"umbral"}	93	5	88	mensual	Menor es mejor	%	0	t	2026-03-18 15:26:12.686	2026-03-18 15:26:12.686	<	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw75tc6001nhk6kvuko30y4	VENTAS-BUSINE-MMW75T9U	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Proyecto EPC Concretado	\N	conteo	{"tipo":"conteo","target":"Proyecto EPC Concretado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:29:27.751	2026-03-18 15:29:27.751	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw779m6001phk6kyttq4msn	VENTAS-BUSINE-MMW779KO	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Venta de Servicio/Suministros	\N	division	{"tipo":"division","numerador":"Ventas Concretadas servicios/suministros ","denominador":"Meta Anual ","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 15:30:35.502	2026-03-18 15:30:35.502	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw77h8c001rhk6k770hok9b	CONTAB-ANALIS-MMW77H7K	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Desviación de PPTOs de proyectos	\N	conteo	{"tipo":"conteo","target":"Proyectos con desviación > 10%"}	95	5	90	mensual	Menor es mejor	%	0	t	2026-03-18 15:30:45.372	2026-03-18 15:30:45.372	<	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw78u2c001thk6k6g40kk3v	CONTAB-ANALIS-MMW78U0O	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	EBIDTDA	\N	binario	{"tipo":"binario","descripcion":"EBITDA mensual dentro de objetivo"}	94	3	97	mensual	Mayor es mejor	%	0	t	2026-03-18 15:31:48.66	2026-03-18 15:31:48.66	>	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw7blw8001vhk6kxf5plcoi	CONTAB-ANALIS-MMW7BLTC	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Control de costos	\N	binario	{"tipo":"binario","descripcion":"Control de costos indirectos"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 15:33:58.039	2026-03-18 15:33:58.039	>	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw7fkau001xhk6kly5jon8i	CONTAB-ANALIS-MMW7FK92	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Uso de PPTO Operativo	\N	binario	{"tipo":"binario","descripcion":"Reporte real vs presupuesto antes día 10"}	95	4	99	mensual	Mayor es mejor	%	0	t	2026-03-18 15:37:02.598	2026-03-18 15:37:02.598	>	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw7hwxy001zhk6kpt7o1ukh	VENTAS-BUSINE-MMW7HWV0	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Venta EPC Solar	\N	division	{"tipo":"division","numerador":"Ventas Concretadas servicios/suministros ","denominador":"Meta Anual ","multiplicador":100,"invertir":false}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-18 15:38:52.294	2026-03-18 15:38:52.294	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw7inou0021hk6k6wu2g4q2	CONTAB-ANALIS-MMW7INO7	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Desviaciones detectadas	\N	conteo	{"tipo":"conteo","target":"Desviaciones detectadas anticipadamente"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 15:39:26.958	2026-03-18 15:39:26.958	>	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw7jvpu0023hk6kv7sd1n4m	VENTAS-BUSINE-MMW7JVNE	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Clientes Contactados (Primer Acercamiento)	\N	division	{"tipo":"division","numerador":"Contactos realizados","denominador":"50","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:40:24.018	2026-03-18 15:40:24.018	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw7n6jo0027hk6ktiro8vz9	CONTAB-ANALIS-MMW7N6I2	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reduccion de gastos	\N	precision	{"tipo":"precision","labelEsperado":"Reducción de gasto","valorEsperado":"7","labelObtenido":"Reducción de gasto","modoEvaluacion":"umbral"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 15:42:58.021	2026-03-18 15:42:58.021	>=	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw7qbvn0029hk6k08w28511	VENTAS-BUSINE-MMW7QBTK	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Relación Estratégica	\N	division	{"tipo":"division","numerador":"Alianza concretada por país","denominador":"1","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 15:45:24.898	2026-03-18 15:45:24.898	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw7ufml002bhk6khotn9ew9	VENTAS-BUSINE-MMW7UFED	Ventas	8962f5ab-f870-4fa9-9dd9-705a961e518b	Proyección y Forecast	\N	division	{"tipo":"division","numerador":"Venta Concretada Trimestral","denominador":"Forecast Proyectado Trimestral","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 15:48:36.381	2026-03-18 15:48:36.381	=	critico	d609c25e-8f53-4e47-870f-33caf899b7b8	f	0
cmmw7wi9w002dhk6k5u5xorf9	LICITA-LICITA-MMW7WI78	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Proposal Win Rate	\N	division	{"tipo":"division","numerador":"Licitaciones ganadas ","denominador":"Licitaciones adjudicadas por cliente final ","multiplicador":100,"invertir":false}	60	40	100	trimestral	Mayor es mejor	%	0	t	2026-03-18 15:50:13.125	2026-03-18 15:50:13.125	>=	no_critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw7zyyr002fhk6kcm1vpum9	LICITA-LICITA-MMW7ZYWH	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Indice de Subsanaciones (Por Licitacion)	\N	division	{"tipo":"division","numerador":"Subsanaciones recibidas ","denominador":"Licitaciones presentadas ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:52:54.723	2026-03-18 15:52:54.723	=	critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw827y6002hhk6k2fqqyd4r	LICITA-LICITA-MMW827UO	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Licitaciones Perdidas por Error Interno	Si se tiene ≥1 no aplica incentivo	division	{"tipo":"division","numerador":"Licitaciones perdidas por error interno ","denominador":"Licitaciones presentadas ","multiplicador":100,"invertir":false}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 15:54:39.678	2026-03-18 15:55:33.38	=	critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw88qit002jhk6kgk7aj2fx	LICITA-LICITA-MMW88QET	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Licitaciones No Participadas por Falta de Proveedor / Consorcio	\N	division	{"tipo":"division","numerador":"Licitaciones no participadas por falta de partner ","denominador":" Total licitaciones mapeadas ","multiplicador":100,"invertir":false}	10	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 15:59:43.685	2026-03-18 16:00:25.169	<	critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw8boeb002lhk6kytj8bsb1	LICITA-LICITA-MMW8BOCC	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Monitoreo Activo de Licitaciones	\N	division	{"tipo":"division","numerador":"Días de monitoreo registrados/","denominador":"Días laborales del mes ","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:02:00.899	2026-03-18 16:02:00.899	=	critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw8d2mq002nhk6k9sdaoxm9	LICITA-LICITA-MMW8D2KK	Licitaciones	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Participación Internacional en Licitaciones	\N	division	{"tipo":"division","numerador":"Licitaciones presentadas fuera de HN ","denominador":" Total de licitaciones presentadas","multiplicador":100,"invertir":false}	20	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:03:06.002	2026-03-18 16:03:06.002	>=	critico	f1a840a1-caf7-477a-8748-59bc8366e735	f	0
cmmw8j5ei002phk6kwfq0bhtj	PRESUP-PROPOS-MMW8J5BL	presupuestos	c850514e-c1d2-41c5-b886-86640891247d	Proposal Win Rate	\N	division	{"tipo":"division","numerador":"Ofertas ganadas ","denominador":" Ofertas Totales","multiplicador":100,"invertir":false}	60	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:07:49.53	2026-03-18 16:07:49.53	>=	critico	6dc65853-cd35-4c7b-9422-0e7aaf379908	f	0
cmmw8mk3u002rhk6k12m164im	PRESUP-PROPOS-MMW8MK1N	presupuestos	c850514e-c1d2-41c5-b886-86640891247d	Tiempo de Ciclo de Propuesta	\N	personalizado	{"tipo":"personalizado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:10:28.555	2026-03-18 16:10:28.555	=	critico	6dc65853-cd35-4c7b-9422-0e7aaf379908	f	0
cmmw8nrts002thk6k065igimy	PRESUP-PROPOS-MMW8NRRV	presupuestos	c850514e-c1d2-41c5-b886-86640891247d	Retrabajos en Ofertas (Rework Rate)	\N	division	{"tipo":"division","numerador":"# ofertas retrabajadas ","denominador":" # ofertas totales","multiplicador":100,"invertir":false}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 16:11:25.217	2026-03-18 16:11:25.217	=	critico	6dc65853-cd35-4c7b-9422-0e7aaf379908	f	0
cmmw8ya3n002vhk6kkkrj3us1	MERCAD-MARKET-MMW8YA11	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Actividad en Redes Sociales (LinkedIn- Prioritario)	\N	division	{"tipo":"division","numerador":"Publicaciones realizadas","denominador":"Publicación planificadas ","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:19:35.458	2026-03-18 16:19:35.458	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw9024j002xhk6k0a3b4mnh	MERCAD-MARKET-MMW90216	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Engagement en Redes Sociales (LinkedIn- Prioritario)	\N	division	{"tipo":"division","numerador":"(Likes + Comentarios + Shares) ","denominador":" Impresiones","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:20:58.436	2026-03-18 16:20:58.436	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw913f9002zhk6k5mlzvax0	MERCAD-MARKET-MMW913CP	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Crecimiento de Comunidad (LinkedIn)	\N	division	{"tipo":"division","numerador":"Nuevos Seguidores","denominador":"1000","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:21:46.773	2026-03-18 16:21:46.773	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw93m7d0031hk6kcpctj0u9	MERCAD-MARKET-MMW93M4X	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Blog Activo y Contenido Técnico	\N	division	{"tipo":"division","numerador":"Artículos publicados ","denominador":" Meta","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:23:44.425	2026-03-18 16:23:44.425	=	no_critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw98xn40033hk6kbsg2acro	MERCAD-MARKET-MMW98XGP	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Material Corporativo	\N	division	{"tipo":"division","numerador":"Material actualizado ","denominador":" Material total","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:27:52.528	2026-03-18 16:27:52.528	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw9aml60035hk6kkerh1xx9	MERCAD-MARKET-MMW9AMHM	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Presentaciones de Unidades de Negocio Actualizadas	\N	division	{"tipo":"division","numerador":"Presentaciones actualizadas ","denominador":"Total unidades","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:29:11.514	2026-03-18 16:29:11.514	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw9buuu0037hk6kwrf8zscl	MERCAD-MARKET-MMW9BURJ	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Eventos y Posicionamiento de Marca	\N	division	{"tipo":"division","numerador":"Eventos ejecutados","denominador":"Meta","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:30:08.887	2026-03-18 16:30:08.887	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw9dl9x0039hk6k0h5oqrup	MERCAD-MARKET-MMW9DL71	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Relaciones Estrategicas con Gremios	\N	division	{"tipo":"division","numerador":"Relaciones estratégicas formalizadas","denominador":" Meta anual","multiplicador":100,"invertir":false}	100	0	\N	semestral	Mayor es mejor	%	0	t	2026-03-18 16:31:29.782	2026-03-18 16:31:29.782	=	critico	cdb0b914-13e2-460b-869b-a11f1a6070b0	f	0
cmmw9gx7z003dhk6knu27kcm4	CONTAB-ANALIS-MMW9GX6F	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Análisis de sensibilidad	\N	precision	{"tipo":"precision","labelEsperado":"Análisis de sensibilidad","valorEsperado":"199995","labelObtenido":"Análisis de sensibilidad","modoEvaluacion":"umbral"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 16:34:05.232	2026-03-18 16:34:05.232	>	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	f	0
cmmw9j2o0003hhk6kfpf66r6t	MERCAD-DISENA-MMW9J2L2	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Cumplimiento de Entregables en Tiempo	\N	division	{"tipo":"division","numerador":"Entregables en tiempo ","denominador":" Total de entregables","multiplicador":100,"invertir":false}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:35:45.6	2026-03-18 16:35:45.6	=	critico	b9ad8309-113e-4ff4-a3d6-0551c992c02b	f	0
cmmw9ki3x003jhk6kax9j8fhs	MERCAD-DISENA-MMW9KI1C	Mercadeo	4027d1be-6dc1-4b09-a2f7-78441396efe1	Tasa de Retrabajo	\N	division	{"tipo":"division","numerador":"Piezas que requieren más de 2 revisiones","denominador":"Total de piezas","multiplicador":100,"invertir":false}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 16:36:52.269	2026-03-18 16:36:52.269	=	critico	b9ad8309-113e-4ff4-a3d6-0551c992c02b	f	0
cmmwa6jll003vhk6kj2d39q30	FLOTAV-ENCARG-MMWA6JK1	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Tablero de control	\N	binario	{"tipo":"binario","descripcion":"Registro de costo de mantenimiento preventivo por vehiculo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:54:00.633	2026-03-18 16:54:00.633	>	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	f	0
cmmw9koqz003lhk6k1e7cm4my	LEGAL-ENCARG-MMW9KOQA	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Cumplimiento de obligaciones legales aplicables	\N	binario	{"tipo":"binario","descripcion":"Atención de Obligaciones contractuales conforme a requisitos=100%"}	100	0	97	mensual	Mayor es mejor	%	0	t	2026-03-18 16:37:00.876	2026-03-24 21:31:25.662	>=	critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	72
cmmw9mprg003nhk6kk2fkky0c	LEGAL-ENCARG-MMW9MPQQ	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Matriz de riesgo	\N	binario	{"tipo":"binario","descripcion":"Presentar matriz trimestralmente"}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 16:38:35.5	2026-03-24 21:32:57.458	=	no_critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	48
cmmw9trea003phk6ksdta32a7	LEGAL-ENCARG-MMW9TR92	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Gestión de riesgos legales	\N	division	{"tipo":"division","numerador":"Riesgos mitigados","denominador":"Riesgos identificados","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:44:04.21	2026-03-24 21:33:41.006	>=	critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	120
cmmwa1fbu003rhk6k8my0emah	LEGAL-ENCARG-MMWA1F78	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Tiempo de respuesta legal interna	Atención de solicitudes internas	precision	{"tipo":"precision","labelEsperado":"dias","valorEsperado":"2","labelObtenido":"dias","modoEvaluacion":"umbral"}	100	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 16:50:01.818	2026-03-24 21:34:02.034	<=	no_critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	48
cmmwa3j4h003thk6kkfeejaz3	LEGAL-ENCARG-MMWA3J3S	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Tablero de control actualizado	Debe tener su tablero con todas las gestiones que esta atendiendo el area legal y su estatus	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:51:40.049	2026-03-24 21:34:41.16	=	no_critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	24
cmmwa8q3a003xhk6kzs74zcqm	FLOTAV-ENCARG-MMWA8Q1O	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Registro de presupuesto de mantenimiento correctivo menor	\N	binario	{"tipo":"binario","descripcion":"Registro de costo de mantenimiento correctivo menor por vehiculo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:55:42.358	2026-03-24 21:35:14.593	=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmmw9erih003bhk6k7ieiqx15	LEGAL-ENCARG-MMW9ERHN	Legal	19c19474-d3da-48ca-94dc-a536ee9b2205	Gestión de contratos	\N	precision	{"tipo":"precision","labelEsperado":"dias","valorEsperado":"2","labelObtenido":"dias","modoEvaluacion":"umbral"}	99	0	\N	mensual	Mayor es mejor	unidades	0	t	2026-03-18 16:32:24.521	2026-03-24 21:31:03.192	<=	no_critico	c1826f7f-629f-4216-b103-9c22105e8b36	t	48
cmmwaoaq10049hk6k5qr0ts7n	FLOTAV-ENCARG-MMWAOAOK	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Servicio al cliente interno por manto correctivo	\N	binario	{"tipo":"binario","descripcion":"Tiempo de respuesta después de la solicitud menor a 24 Horas"}	100	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 17:07:48.937	2026-03-24 21:37:54.817	=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmmwahahk0043hk6k119fmhdh	FLOTAV-ENCARG-MMWAHACU	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Cumplimiento de Contratacion de talleres para mantenimiento	Debe establecerse un procedimiento de contratación de talleres para poder medir	binario	{"tipo":"binario","descripcion":"Auditoria que valida el cumplimiento"}	100	-2	98	mensual	Mayor es mejor	%	0	t	2026-03-18 17:02:22.041	2026-03-18 17:02:22.041	=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	f	0
cmmwalj4d0047hk6kcetnqlvk	FLOTAV-ENCARG-MMWALJ3Q	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Disciplina presupuestaria	\N	division	{"tipo":"division","numerador":"Costo real de mantenimiento por vehiculo","denominador":"costo presupuestado","multiplicador":100,"invertir":false}	100	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 17:05:39.854	2026-03-18 17:05:39.854	<=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	f	0
cmmwb7i1n004hhk6kxore9ajz	FLOTAV-ENCARG-MMWB7I0V	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Entrega de dashboard por areas de la empresa	Disponibilidad mensual del vehículo, costos de mantenimiento, seguros, accidentes, etc.	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 17:22:44.891	2026-03-18 17:22:44.891	=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	f	0
cmmwbv83i004lhk6kpqhkfsou	ISO-GESTOR-MMWBV80K	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Certificación ISO - Auditorias sin no conformidades mayores	\N	division	{"tipo":"division","numerador":"Auditorias sin no conformidades mayores","denominador":"Total auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 17:41:11.739	2026-03-18 17:41:11.739	<=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwh9jn7004vhk6kahijjwp9	ISO-GESTOR-MMWH9JMJ	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Cumplimiento del plan de certificación/capacitación	\N	binario	{"tipo":"binario","descripcion":"Cumplimiento del plan"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:12:17.971	2026-03-18 20:12:17.971	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwhdeg4004zhk6kgmwi7u6g	ISO-GESTOR-MMWHDEFF	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Medición de cultura de gestión de procesos	\N	division	{"tipo":"division","numerador":"Areas que trabajan por proceso","denominador":"Total de áreas de la empresa","multiplicador":100,"invertir":false}	95	5	100	trimestral	Mayor es mejor	%	0	t	2026-03-18 20:15:17.86	2026-03-18 20:15:17.86	>=	critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwajkmp0045hk6ker343y0q	FLOTAV-ENCARG-MMWAJKLB	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Medición de calidad y no pago doble por reparaciones	\N	conteo	{"tipo":"conteo","target":"Numero de reclamos por misma falla de vehículo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 17:04:08.497	2026-03-24 21:37:01.39	<=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmmwat2gl004bhk6kkbrtsnx9	FLOTAV-ENCARG-MMWAT2CA	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Entrega del vehículo sin rechazo reparación menor	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega del vehículo en reparaciones menores"}	72	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 17:11:31.509	2026-03-24 21:38:26.685	<=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	72
cmmwb3nb5004dhk6kglo5if6i	FLOTAV-ENCARG-MMWB3N6A	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Entrega del vehículo sin rechazo reparación mayor	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega del vehículo en reparaciones mayores"}	15	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 17:19:45.09	2026-03-24 21:39:31.687	<=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	150
cmmwb5e9l004fhk6kcqkvxitw	FLOTAV-ENCARG-MMWB5E8V	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Entrega del vehículo sin rechazo cambio de aceite	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega del vehículo por cambio de aceite en horas"}	8	0	\N	mensual	Menor es mejor	unidades	0	t	2026-03-18 17:21:06.681	2026-03-24 21:39:52.803	<=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	8
cmmwgkbpy004nhk6krapqipua	ISO-GESTOR-MMWGKBOZ	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Auditorias de documentación	\N	binario	{"tipo":"binario","descripcion":"Auditar el 100% de las areas con documentos actualizados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 19:52:41.301	2026-03-24 21:40:55.383	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	72
cmmwh46w0004phk6ksx3mj8xw	ISO-GESTOR-MMWH46RP	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Auditorias de procesos	\N	binario	{"tipo":"binario","descripcion":"Auditar el 100% de las áreas, procesos actualizados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:08:08.156	2026-03-24 21:41:12.059	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	72
cmmwh6ctq004rhk6kq3hm2ttp	ISO-GESTOR-MMWH6CSV	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Reportes de incidencias del SGC	\N	binario	{"tipo":"binario","descripcion":"Reportes de incidencias del SGC"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:09:49.166	2026-03-24 21:41:39.622	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	48
cmmwh7jwl004thk6kiviye0ro	ISO-GESTOR-MMWH7JVZ	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Auditar acciones correctivas	\N	binario	{"tipo":"binario","descripcion":"Auditar el 100% de las áreas con acciones correctivas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:10:44.997	2026-03-24 21:41:56.632	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	72
cmmwhat28004xhk6kzzwujn5r	ISO-GESTOR-MMWHAT0R	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Portal actualizado	\N	binario	{"tipo":"binario","descripcion":"Auditoria al portal para validar actualización "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:13:16.831	2026-03-24 19:39:15.333	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	0
cmmwabb5h0041hk6ks4akba2c	FLOTAV-ENCARG-MMWABB4X	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Ejecución de plan de mantenimientos preventivos	Debe presentarse un plan de mantenimiento preventivo	binario	{"tipo":"binario","descripcion":"Registro de mantenimientos preventivos en tiempo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:57:42.966	2026-03-24 21:36:21.223	=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmmwhimpw0053hk6kzlxw7ws0	ISO-GESTOR-MMWHIMO5	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Actualización de dashboards por áreas	Presentación de Dashboards actualizados, Documentos, procesos, acciones correctivas, 5S, etc.	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:19:21.86	2026-03-18 20:19:21.86	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwi4lyq0055hk6kcmsi6otw	ISO-GESTOR-MMWI4LW6	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Auditoria que valida que doc publicados están al 100% y actualizados	\N	binario	{"tipo":"binario","descripcion":"Informe de auditoría de doc actualizada y de todas las áreas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:36:27.311	2026-03-18 20:36:27.311	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwi61rz0057hk6krzuqh8ne	ISO-GESTOR-MMWI61R1	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	No conformidades del SGC de usuaiors	\N	conteo	{"tipo":"conteo","target":"No conformidades mayores del SGC"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:37:34.463	2026-03-18 20:37:34.463	<=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwiddig005bhk6k100kssma	ISO-GESTOR-MMWIDDHR	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Cumplimiento de KPIs del equipo	KPIs del equipo = verde	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:43:16.265	2026-03-18 20:43:16.265	=	critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	f	0
cmmwiin1m005hhk6kr7euetd8	AREATE-GERENC-MMWIIMXU	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento de Programas de Trabajo (PDTS) semanal	\N	division	{"tipo":"division","numerador":"Actividades ejecutadas","denominador":"Actividades programadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 20:47:21.898	2026-03-18 20:47:21.898	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwik3rj005jhk6kff5zzw6n	AREATE-GERENC-MMWIK3PH	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento de Órdenes de Trabajo (OT)	\N	division	{"tipo":"division","numerador":"OT cerradas ","denominador":"OT asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 20:48:30.223	2026-03-18 20:48:30.223	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwimj07005nhk6kozg2fr6z	AREATE-GERENC-MMWIMIUI	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Planificación de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 20:50:23.288	2026-03-18 20:50:23.288	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwipjpl005phk6ko3uz2re1	AREATE-GERENC-MMWIPJJZ	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Control de Descansos Compensatorios	\N	conteo	{"tipo":"conteo","target":"Personal con mora de descanso compensatorio < 5 dias, "}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 20:52:44.169	2026-03-18 20:52:44.169	<	no_critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwit2hj005thk6kmex10qnm	AREATE-GERENC-MMWIT2DM	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Entrega de informes técnicos en tiempo	\N	conteo	{"tipo":"conteo","target":"Informes entregados sin rechazos después de ejecutado el trabajo < 3 dias"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 20:55:28.471	2026-03-18 20:55:28.471	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwit412005vhk6kaiqw2uyb	SYSO-GESTOR-MMWIT40I	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia por accidentes	\N	conteo	{"tipo":"conteo","target":"Numero de accidentes ocurridos 'graves/mortales'"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 20:55:30.47	2026-03-18 20:55:30.47	<=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	f	0
cmmwiu6u6005xhk6kso48n1yv	SYSO-GESTOR-MMWIU6TL	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia de accidentes	\N	conteo	{"tipo":"conteo","target":"Numero de accidentes ocurridos"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:56:20.766	2026-03-18 20:56:20.766	<=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	f	0
cmmwiug91005zhk6krjth2otu	AREATE-GERENC-MMWIUG57	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento de Minutas y Planes de Acción	\N	division	{"tipo":"division","numerador":"Acciones cerradas ","denominador":"Acciones acordadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 20:56:32.965	2026-03-18 20:56:32.965	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwivryl0061hk6kyr0dlhoo	SYSO-GESTOR-MMWIVRXW	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Reportes de incidentes	\N	binario	{"tipo":"binario","descripcion":"numero de reportes de incidentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:57:34.797	2026-03-18 20:57:34.797	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	f	0
cmmwj0qhr0065hk6kihl162vh	AREATE-GERENC-MMWJ0QEK	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento de Presupuesto Técnico por OT	\N	division	{"tipo":"division","numerador":"Gasto real ","denominador":"Presupuesto aprobado","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:01:26.175	2026-03-18 21:01:26.175	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwikr7d005lhk6kaoogmf5e	ISO-OFICIA-MMWIKR6Q	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Ejecución del plan anual	\N	binario	{"tipo":"binario","descripcion":"Ejecución de auditorías conforme al plan "}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 20:49:00.601	2026-03-24 21:44:11.625	=	no_critico	05207495-2ab9-43a1-b24d-bf093614c3f8	t	72
cmmwiqadh005rhk6kalgpjnn3	ISO-OFICIA-MMWIQACQ	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Ejecutar auditorias requeridas	\N	division	{"tipo":"division","numerador":"Numero de auditorias o seguimientos ejecutados","denominador":"total de auditorías y seguimientos solicitados","multiplicador":100,"invertir":false}	95	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-18 20:53:18.725	2026-03-24 21:44:27.889	=	no_critico	05207495-2ab9-43a1-b24d-bf093614c3f8	t	72
cmmwix8lw0063hk6k0hryoa8z	SYSO-GESTOR-MMWIX8L6	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Capacitación y certificacion	\N	binario	{"tipo":"binario","descripcion":"Cumplimiento del plan de capacitación/certificación  "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:58:43.028	2026-03-24 21:46:53.109	=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	24
cmmwievj7005dhk6ko216lcm7	ISO-OFICIA-MMWIEVII	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Documentacion SGC actualizada	\N	binario	{"tipo":"binario","descripcion":"Informe de auditoría de doc actualizada y de todas las áreas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:44:26.274	2026-03-24 21:43:21.298	=	critico	05207495-2ab9-43a1-b24d-bf093614c3f8	t	72
cmmwj1txc0069hk6kmixi3vzr	AREATE-GERENC-MMWJ1TU3	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Presupuesto total de Ordenes de Trabajo	\N	division	{"tipo":"division","numerador":"Gasto real de todas las OT)","denominador":" Presupuesto aprobado de todas las OT","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:02:17.28	2026-03-18 21:02:17.28	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwj3fio006dhk6kk4bw4lae	AREATE-GERENC-MMWJ3FEY	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Control de Viáticos	\N	conteo	{"tipo":"conteo","target":"Total de Viáticos liquidados correctamente < 7 dias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:03:31.921	2026-03-18 21:03:31.921	=	no_critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwj4dve006fhk6k04am5xya	AREATE-GERENC-MMWJ4DRG	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento de Mantenimiento de Equipos	\N	conteo	{"tipo":"conteo","target":" Equipos con mantenimiento o certificación conforme a programa de Trabajo= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:04:16.442	2026-03-18 21:04:16.442	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwj5t4n006jhk6k8ju3mtzp	AREATE-GERENC-MMWJ5T0V	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Operación y Mantenimiento de Equipos	\N	conteo	{"tipo":"conteo","target":"Equipos o accesorios danados = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:05:22.871	2026-03-18 21:05:22.871	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwj83dp006nhk6ko4ergvo8	AREATE-GERENC-MMWJ83AD	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Operación y Mantenimiento de Herramientas	\N	conteo	{"tipo":"conteo","target":"Herramientas o accesorios dañados = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:07:09.47	2026-03-18 21:07:09.47	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwj98p4006phk6kdq4f5pjh	AREATE-GERENC-MMWJ98LL	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Operación y Mantenimiento de vehículos	\N	conteo	{"tipo":"conteo","target":"Vehiculos dañados por mal uso=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:08:03.017	2026-03-18 21:08:03.017	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwja4vi006thk6klfu6lipr	AREATE-GERENC-MMWJA4RV	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Incidentes graves de seguridad	\N	conteo	{"tipo":"conteo","target":"# de incidentes graves de seguridad=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:08:44.719	2026-03-18 21:08:44.719	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjbmrm006vhk6kzy8s5v4i	AREATE-GERENC-MMWJBMLS	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Registro de accidente menores	\N	conteo	{"tipo":"conteo","target":"Registro de accidentes menores=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:09:54.562	2026-03-18 21:09:54.562	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjd9y6006zhk6kjhu6tp9k	AREATE-GERENC-MMWJD9V6	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Plan de Carrera	\N	conteo	{"tipo":"conteo","target":"Ejecución del plan de carrera conforme a Programa = 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:11:11.262	2026-03-18 21:11:11.262	=	no_critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjeyve0071hk6kh3nl1ot9	AREATE-GERENC-MMWJEYSB	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Certificacion de Personal Critico	\N	conteo	{"tipo":"conteo","target":"Personal Certificado=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:12:30.218	2026-03-18 21:12:30.218	=	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjgjv70075hk6kghzzy4hs	AREATE-GERENC-MMWJGJQ5	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Reporte de Incidencias disciplinarias	\N	conteo	{"tipo":"conteo","target":"Registro y comunicación de incidentes= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:13:44.083	2026-03-18 21:13:44.083	=	no_critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjhreu0079hk6k8l24ts6u	AREATE-GERENC-MMWJHRBB	Área Técnica	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Cumplimiento Global de KPIs del Área Técnica	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:14:40.519	2026-03-18 21:14:40.519	>	critico	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	f	0
cmmwjijjy007bhk6k8tdxqbvh	SYSO-GESTOR-MMWJIJJA	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Cumplimiento de KPIs del equipo	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:15:16.99	2026-03-18 21:15:16.99	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	f	0
cmmwj6okf006lhk6krlu1xn5c	SYSO-GESTOR-MMWJ6OJX	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Actualización del plan de contingencia	\N	binario	{"tipo":"binario","descripcion":"Auditoria del plan de higiene y seguridad"}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-18 21:06:03.615	2026-03-24 21:49:26.606	=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	120
cmmwj9vdd006rhk6kdz7vy0rf	SYSO-GESTOR-MMWJ9VAW	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Informe preliminar	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega del informe preliminar del accidente, despues de lo ocurrido, en Horas"}	12	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:08:32.401	2026-03-24 21:49:43.707	<=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	12
cmmwjci33006xhk6kugbone5u	SYSO-GESTOR-MMWJCI29	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Investigación de accidentes/incidentes	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega de informe de accidente/incidente en Dias"}	3	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:10:35.15	2026-03-24 21:50:11.628	<=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	72
cmmwjf7w10073hk6kheq5q4i3	SYSO-GESTOR-MMWJF7VB	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Personal con seguro contra accidente	\N	binario	{"tipo":"binario","descripcion":"Comprobacion 100% del personal este asegurado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:12:41.906	2026-03-24 21:50:40.17	=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	48
cmmwjgyey0077hk6kdln9qvch	SYSO-GESTOR-MMWJGYE7	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Cierre de acciones correctivas	\N	division	{"tipo":"division","numerador":"Acciones cerradas","denominador":"Acciones generadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:14:02.939	2026-03-24 21:51:09.202	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	72
cmmwj3bzd006bhk6kuhefsue5	SYSO-GESTOR-MMWJ3BX2	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Análisis de riesgo	\N	binario	{"tipo":"binario","descripcion":"Auditorias de análisis de riesgo de trabajo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:03:27.337	2026-03-24 21:48:14.716	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	24
cmmwjkoyg007dhk6kcbqte45x	SYSO-OFICIA-MMWJKOXO	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia de accidentes	\N	conteo	{"tipo":"conteo","target":"Número de accidentes ocurridos graves/mortales"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:16:57.305	2026-03-18 21:16:57.305	<=	critico	ff7d3e82-3b5b-4101-b900-53951817a187	f	0
cmmwjkvll007fhk6ksxj5gvfh	SMO-PLANIF-MMWJKVI1	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Elaborar Programas de Trabajo (PDTS)	\N	conteo	{"tipo":"conteo","target":"# de Programas elaborados=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:17:05.914	2026-03-18 21:17:05.914	=	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwjrvvi007hhk6km89uxg5m	SMO-PLANIF-MMWJRVQK	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Cumplimiento de Programas de Trabajo	\N	division	{"tipo":"division","numerador":"# de OT Ejecutadas","denominador":" # de OT Programadas,","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:22:32.862	2026-03-18 21:22:32.862	>	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwjt0d9007jhk6k220n3wxi	SMO-PLANIF-MMWJT086	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Cumplimiento de Órdenes de Trabajo (OT)	\N	division	{"tipo":"division","numerador":"OT cerradas ","denominador":"OT asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:23:25.341	2026-03-18 21:23:25.341	>	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwjtzm0007lhk6k1p4fyqpc	SMO-PLANIF-MMWJTZH3	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Planificacion de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:24:11.017	2026-03-18 21:24:11.017	=	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwjvme7007nhk6kmgjxljqd	SMO-PLANIF-MMWJVMAC	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Control de Descansos Compensatorios	\N	conteo	{"tipo":"conteo","target":" Personal con mora de descanso compensatorio < 5 días"}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-18 21:25:27.199	2026-03-18 21:26:00.737	<	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwjyj2u007phk6kynl8o310	SMO-PLANIF-MMWJYIX6	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Programación de compromisos de Minutas y Planes de Acción	\N	division	{"tipo":"division","numerador":"Acciones cerradas ","denominador":" Acciones acordadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-18 21:27:42.871	2026-03-18 21:27:42.871	>	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwk1pvq007rhk6kcytchi1h	SMO-PLANIF-MMWK1PRR	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Registro de desviaciones del PDT	\N	conteo	{"tipo":"conteo","target":"Registro de desviaciones= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:30:11.655	2026-03-18 21:30:11.655	=	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwk2kdo007thk6k9prvwtns	SMO-PLANIF-MMWK2K9N	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Tablero de OT/Tareas: Ejecutadas, En Proceso, Pendientes	\N	conteo	{"tipo":"conteo","target":"Tablero Actualizado= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:30:51.18	2026-03-18 21:30:51.18	=	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwk3pau007vhk6k1heobyq1	SMO-PLANIF-MMWK3P6Z	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Programar Capacitación del Personal	\N	conteo	{"tipo":"conteo","target":"Ejecucion del plan de carrera conforme a Programa = 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:31:44.215	2026-03-18 21:31:44.215	=	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwk65hh007xhk6kpud70cku	SMO-PLANIF-MMWK65BY	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Generar alarmas ante atrasos de actividades o retrabajos	\N	conteo	{"tipo":"conteo","target":"Reporte de alarmas=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:33:38.501	2026-03-18 21:33:38.501	=	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwkxrgx007zhk6kvirf97pn	SMO-PLANIF-MMWKXRC0	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Informe de Trabajo Diario	\N	conteo	{"tipo":"conteo","target":"Seguimiento de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:55:06.705	2026-03-18 21:55:06.705	=	critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwkylnr0081hk6kbgygcobp	SMO-PLANIF-MMWKYLK9	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Presentación de Informe de desempeño y registros	\N	conteo	{"tipo":"conteo","target":"Presentar informes completos en tiempo=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:55:45.832	2026-03-18 21:55:45.832	=	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwkz9ii0083hk6kayyt1fbq	SMO-PLANIF-MMWKZ9F3	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Control de Hr de Trabajo del Personal	\N	conteo	{"tipo":"conteo","target":"Informe del registro de hrs de colaboradores=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:56:16.746	2026-03-18 21:56:16.746	=	no_critico	34998070-af98-4fb7-8574-36937ff05677	f	0
cmmwsaudv0001hkzo3mrocdzq	SYSO-OFICIA-MMWSAU3T	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia de accidentes menores	\N	conteo	{"tipo":"conteo","target":"Número de accidentes ocurridos menores menores/mortales"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 01:21:14.319	2026-03-19 01:21:14.319	<=	critico	ff7d3e82-3b5b-4101-b900-53951817a187	f	0
cmmxkrac80001hkdo52p6l2zr	SMO-ADMINI-MMXKRA7Z	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Control  de Presupuesto  por OT	\N	division	{"tipo":"division","numerador":"Gasto real ","denominador":"Presupuesto aprobado","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 14:37:50.737	2026-03-19 14:37:50.737	>	critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxkt0el0003hkdovsq8zza9	SMO-ADMINI-MMXKT0CH	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Presupuesto total de Ordenes de Trabajo	\N	division	{"tipo":"division","numerador":"Gasto real de todas las OT","denominador":"Presupuesto aprobado de todas las OT","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 14:39:11.181	2026-03-19 14:39:11.181	>	critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxkw9f00005hkdom52dmhxv	SMO-ADMINI-MMXKW961	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Atencion de OTI	\N	division	{"tipo":"division","numerador":"# de OTI ejecutadas","denominador":"# total de OTI","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 14:41:42.828	2026-03-19 14:41:42.828	>	critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxkxct50007hkdomhpf178d	SMO-ADMINI-MMXKXCRE	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Control de Viáticos	\N	conteo	{"tipo":"conteo","target":"  Total de Viáticos liquidados correctamente < 7 dias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:42:33.881	2026-03-19 14:42:33.881	=	critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxkyzvm0009hkdocm1xi8sd	SMO-ADMINI-MMXKYZSI	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Registro de Gastos del area: reparaciones, Certificaciones, mantenimientos preventivos, correctivos, capacitaciones, accidentes	\N	conteo	{"tipo":"conteo","target":"Registro de gastos del área=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:43:50.434	2026-03-19 14:43:50.434	=	no_critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxo3ixw002lhkdo5wlpy35w	UPM-INGENI-MMXO3IWN	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Incidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"# de incidentes reportados= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:11:20.613	2026-03-19 16:11:20.613	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxl0753000bhkdolp4rlw6g	SMO-ADMINI-MMXL0724	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Presentar planes de acción ante gastos o sobrecostos	\N	conteo	{"tipo":"conteo","target":"Planes de acción = 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:44:46.503	2026-03-19 14:44:46.503	=	no_critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxl44ik000fhkdozzogv4mo	SMO-ADMINI-MMXL449R	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Presentación de Informe de desempeño y registros (Dashboards)	\N	binario	{"tipo":"binario","descripcion":"Presentar informes completos en tiempo=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:47:49.724	2026-03-19 14:47:49.724	=	no_critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxldc4o000hhkdo0p0hk2wj	SMO-ADMINI-MMXLDBRZ	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Coordinación Logística	\N	conteo	{"tipo":"conteo","target":"Solicitudes administrativas < 4 dias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:54:59.495	2026-03-19 14:54:59.495	=	critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxliihw000nhkdomvsao1nc	SMO-ADMINI-MMXLIIFL	SMO	89629a77-e179-40ee-8c65-3f48e7cc55c8	Plan de analisis de ahorro	\N	binario	{"tipo":"binario","descripcion":"Presentacion de plan de ahorro del 10% del gasto = 1 al trimestre"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:59:01.027	2026-03-19 14:59:01.027	=	no_critico	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	f	0
cmmxlrft0000vhkdoxr1pchxa	UAT-INGENI-MMXLRFR6	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Ejecución del programa de trabajo	\N	division	{"tipo":"division","numerador":"OT ejecutadas en plazo ","denominador":"OT programadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:05:57.445	2026-03-19 15:05:57.445	>	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxlq9fl000thkdo5ixifk27	UAT-INGENI-MMXLQ99F	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Ejecución del programa de trabajo	\N	division	{"tipo":"division","numerador":"OT ejecutadas en plazo ","denominador":"OT programadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:05:02.529	2026-03-19 15:06:19.014	>	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxlwhkr000zhkdorxeml85y	UAT-INGENI-MMXLWHFM	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:09:53.02	2026-03-19 15:09:53.02	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxlxcir0011hkdo3r2oaldd	UAT-INGENI-MMXLXCC8	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Accidentes de Trabajo Graves	\N	conteo	{"tipo":"conteo","target":"# accidentes de Graves=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:10:33.124	2026-03-19 15:10:33.124	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxlxnrz0013hkdofre1vcgd	SYSO-OFICIA-MMXLXNP2	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia de accidentes	\N	conteo	{"tipo":"conteo","target":"Numero de accidentes ocurridos menores/mortales"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:10:47.712	2026-03-19 15:10:47.712	<=	critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	f	0
cmmxm37r70015hkdozw7t24ui	UAT-INGENI-MMXM37MN	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Accidentes de Trabajo menores	\N	conteo	{"tipo":"conteo","target":"# accidentes menores =0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:15:06.884	2026-03-19 15:15:06.884	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxm4vod0017hkdoy6d2668i	UAT-INGENI-MMXM4VJH	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Incidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"# de incidentes reportados= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:16:24.539	2026-03-19 15:16:24.539	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxm616a0019hkdomyixjhfd	UAT-INGENI-MMXM6123	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Cumplimiento de uso de EPP del personal bajo cargo	\N	division	{"tipo":"division","numerador":"Inspecciones conformes ","denominador":" Inspecciones realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:17:18.322	2026-03-19 15:17:18.322	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxm76ud001bhkdo54qturuc	UAT-INGENI-MMXM76RR	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de daños a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:18:12.325	2026-03-19 15:18:12.325	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxm88vc001dhkdodw814vgv	UAT-INGENI-MMXM88S4	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Validación de Check List de OT	\N	conteo	{"tipo":"conteo","target":"# de OT con Check List= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:19:01.608	2026-03-19 15:19:01.608	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmb64b001fhkdozqap1lxq	UAT-INGENI-MMXMB5Y3	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecución del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:21:18.011	2026-03-19 15:21:18.011	>	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxldn8p000jhkdok8xpuk1a	SYSO-OFICIA-MMXLDN5W	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorias de formularios llenados por SYSO por trabajo	\N	binario	{"tipo":"binario","descripcion":"Entrega de informe de auditorías ejecutadas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:55:13.897	2026-03-24 21:52:55.569	=	critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	72
cmmxlgn8i000lhkdohjv1vx4w	SYSO-OFICIA-MMXLGN6E	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Informe preliminar	\N	conteo	{"tipo":"conteo","target":"Entrega del informe preliminar del accidente 12 horas después de lo ocurrido"}	12	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 14:57:33.857	2026-03-24 21:53:43.398	<=	critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	12
cmmxlmfkt000phkdod4ervuce	SYSO-OFICIA-MMXLMFGL	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Gestión de riesgos	\N	binario	{"tipo":"binario","descripcion":"Ejecucion y/o gestion de acciones ccorrectivas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:02:03.869	2026-03-24 21:53:59.224	=	no_critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	72
cmmxlnxkm000rhkdoh8igxk6w	SYSO-OFICIA-MMXLNXHQ	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Personal con seguro contra accidente	\N	binario	{"tipo":"binario","descripcion":"Comprobación 100% personal este asegurado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:03:13.846	2026-03-24 21:54:17.998	=	no_critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	48
cmmxl2cgm000dhkdo7wbq1dtb	SYSO-OFICIA-MMXL2CEC	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Reporte del incidente	\N	binario	{"tipo":"binario","descripcion":"Numero de reportes de incidentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 14:46:26.71	2026-03-24 21:46:35.892	=	no_critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	4
cmmxmcj0v001hhkdoopsf5b2e	UAT-INGENI-MMXMCIV5	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Resolución de problemas Técnicos	\N	conteo	{"tipo":"conteo","target":"Resolución de problemas técnicos > 95%"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:22:21.391	2026-03-19 15:22:21.391	>	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmgvj4001jhkdoifykrarj	UAT-INGENI-MMXMGVGH	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Reportes de trabajo Diario	\N	conteo	{"tipo":"conteo","target":"# de reportes de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:25:44.224	2026-03-19 15:25:44.224	=	critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmi5g6001lhkdovk4vqwhi	UAT-INGENI-MMXMI5BJ	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":"Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:26:43.734	2026-03-19 15:26:43.734	>	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmjhmz001nhkdooepqrztx	UAT-INGENI-MMXMJHFW	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Capacitaciones técnicas impartidas	\N	division	{"tipo":"division","numerador":"Ejecución de Capacitaciones asignadas ","denominador":"Capacitaciones planificadas ","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:27:46.187	2026-03-19 15:27:46.187	>	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmld20001phkdo9pqh2i35	UAT-INGENI-MMXMLCZ6	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluación del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:29:13.56	2026-03-19 15:29:13.56	>	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxmmjmy001rhkdo8cv3v5p1	UAT-INGENI-MMXMMJJM	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:30:08.746	2026-03-19 15:30:08.746	=	no_critico	f94b42d4-5097-465c-93f3-058a34575f8c	f	0
cmmxn10ty001thkdok8nx38tf	UAT-TECNIC-MMXN10J6	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Cumplimiento de la OT diaria	\N	division	{"tipo":"division","numerador":"Actividades ejecutadas","denominador":"Actividades asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:41:24.209	2026-03-19 15:41:24.209	>	critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxn2gse001vhkdoutzxcub0	UAT-TECNIC-MMXN2GOL	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:42:31.543	2026-03-19 15:42:31.543	=	critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxn41uu001xhkdo4mw2yb1t	UAT-TECNIC-MMXN41PP	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Cumplimiento de normas de higiene y seguridad	\N	conteo	{"tipo":"conteo","target":"# incidentes por incumplimiento=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:43:45.509	2026-03-19 15:43:45.509	=	critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxn578l001zhkdocyrw0oxn	UPM-INGENI-MMXN575N	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Reportes de trabajo Diario	\N	conteo	{"tipo":"conteo","target":"# de reportes de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:44:39.141	2026-03-19 15:44:39.141	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxncv2t0021hkdo52w8pcyq	UAT-TECNIC-MMXNCUS4	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de danos a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:50:36.629	2026-03-19 15:50:36.629	=	critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnel4y0023hkdolstsd95k	UAT-TECNIC-MMXNEKY7	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecucion del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:51:57.059	2026-03-19 15:51:57.059	>	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnfwu00025hkdol8ug5xox	UAT-TECNIC-MMXNFWRK	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Uso de herramientas y equipos	\N	conteo	{"tipo":"conteo","target":"# de danos de herramienta por mal uso=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:52:58.872	2026-03-19 15:52:58.872	=	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxngz6d0027hkdotmh8jx5r	UAT-TECNIC-MMXNGZ41	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":" Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:53:48.566	2026-03-19 15:53:48.566	>	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnhu3o0029hkdo9pr5mevz	UAT-TECNIC-MMXNHU16	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Informe de incidencias de trabajo/accidentes	\N	conteo	{"tipo":"conteo","target":"# de reportes de incidencias=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:54:28.644	2026-03-19 15:54:28.644	=	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnipb8002bhkdooa349xpr	UAT-TECNIC-MMXNIP5V	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluacion del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 15:55:09.093	2026-03-19 15:55:09.093	>	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnjvtn002dhkdoi08sv7va	UAT-TECNIC-MMXNJVL3	UAT	8aac33f9-5688-41dc-b859-44a1a6b313a1	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 15:56:04.188	2026-03-19 15:56:04.188	=	no_critico	84b3b3b8-7ab1-4f41-9978-e90661648294	f	0
cmmxnzyin002fhkdoec6erjdy	UPM-INGENI-MMXNZYH9	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:08:34.175	2026-03-19 16:08:34.175	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxo0sio002hhkdogml5y8fq	UPM-INGENI-MMXO0SHL	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Accidentes de Trabajo Graves	\N	conteo	{"tipo":"conteo","target":"# accidentes de Graves=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:09:13.057	2026-03-19 16:09:13.057	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxo2ywh002jhkdoeg2bzfcb	UPM-INGENI-MMXO2YVF	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Accidentes de Trabajo menores	\N	conteo	{"tipo":"conteo","target":"# accidentes menores =0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:10:54.642	2026-03-19 16:10:54.642	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxo46dn002nhkdow1td932l	UPM-INGENI-MMXO46BZ	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Cumplimiento de uso de EPP del personal bajo cargo	\N	division	{"tipo":"division","numerador":"Inspecciones conformes ","denominador":" Inspecciones realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:11:50.988	2026-03-19 16:11:50.988	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxo5i9o002phkdohe1th4m1	UPM-INGENI-MMXO5I88	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de daños a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:12:53.053	2026-03-19 16:12:53.053	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxoh2wo002rhkdo3c86rao4	UPM-INGENI-MMXOH2P7	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Validación de Check List de OT	\N	conteo	{"tipo":"conteo","target":"# de OT con Check List= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:21:53.016	2026-03-19 16:21:53.016	=	critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxolccf002thkdopr18d3c7	UPM-INGENI-MMXOLCAH	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecución del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:25:11.872	2026-03-19 16:25:11.872	>	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxon9op002vhkdotgf724qp	UPM-INGENI-MMXON9NA	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Resolución de problemas Técnicos	\N	conteo	{"tipo":"conteo","target":"Resolución de problemas técnicos > 95%"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:26:41.737	2026-03-19 16:26:41.737	>	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxonwwi002xhkdovshdslpn	UPM-INGENI-MMXONWVA	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":"Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:27:11.827	2026-03-19 16:27:11.827	>	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxoomcf002zhkdot0tlwk75	UPM-INGENI-MMXOOMAM	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Capacitaciones técnicas impartidas	\N	division	{"tipo":"division","numerador":"Ejecución de Capacitaciones asignadas ","denominador":"Capacitaciones planificadas ","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:27:44.8	2026-03-19 16:27:44.8	>	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxop5u60031hkdolgcx46zs	UPM-INGENI-MMXOP5T0	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluación del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:28:10.062	2026-03-19 16:28:10.062	>	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxoqmb00033hkdom5mhta1l	UPM-INGENI-MMXOQM9A	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:29:18.06	2026-03-19 16:29:18.06	=	no_critico	167eb963-84c5-49c6-b317-71beed9ad0b5	f	0
cmmxpag250035hkdow3086dd1	USED-INGENI-MMXPAFZC	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución del programa de trabajo	\N	division	{"tipo":"division","numerador":"OT ejecutadas en plazo ","denominador":"OT programadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:44:43.082	2026-03-19 16:44:43.082	>	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpbh1y0037hkdoywhi1lgu	USED-INGENI-MMXPBH0H	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:45:31.03	2026-03-19 16:45:31.03	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpdcwt0039hkdopzc5n44g	USED-INGENI-MMXPDCUJ	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Accidentes de Trabajo Graves	\N	conteo	{"tipo":"conteo","target":"# accidentes de Graves=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:46:58.973	2026-03-19 16:46:58.973	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpersd003bhkdodw0kqd8i	USED-INGENI-MMXPERQT	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Accidentes de Trabajo menores	\N	conteo	{"tipo":"conteo","target":"# accidentes menores =0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:48:04.909	2026-03-19 16:48:04.909	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpfd61003dhkdoykcv2in1	USED-INGENI-MMXPFD3L	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Incidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"# de incidentes reportados= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:48:32.618	2026-03-19 16:48:32.618	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpg5dw003fhkdov4v9vraj	USED-INGENI-MMXPG5B2	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de uso de EPP del personal bajo cargo	\N	division	{"tipo":"division","numerador":"Inspecciones conformes ","denominador":" Inspecciones realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:49:09.189	2026-03-19 16:49:09.189	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxph1wd003hhkdo1ekpzmt6	USED-INGENI-MMXPH1U8	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de daños a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 16:49:51.325	2026-03-19 16:49:51.325	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpho3r003jhkdofxnyii3w	USED-INGENI-MMXPHO21	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Validación de Check List de OT	\N	conteo	{"tipo":"conteo","target":"# de OT con Check List= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:50:20.103	2026-03-19 16:50:20.103	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpidcw003lhkdot3bb4x3m	USED-INGENI-MMXPIDAF	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecución del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 16:50:52.833	2026-03-19 16:50:52.833	>	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxlsqie000xhkdoz1gu4id9	SYSO-OFICIA-MMXLSQFT	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ocurrencia de accidentes	\N	conteo	{"tipo":"conteo","target":"Número de accidentes ocurridos graves/mortales"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 15:06:57.972	2026-03-19 16:50:55.257	<=	critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	f	0
cmmzbppzm00cvhkdo2eoaylgi	UNIDAD-GESTOR-MMZBPPXE	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Accidentes	\N	conteo	{"tipo":"conteo","target":"Accidentes"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 20:00:13.522	2026-03-20 20:00:13.522	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmmxpu8u1003rhkdoa3pagl6d	USED-INGENI-MMXPU8RD	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Resolución de problemas Técnicos	\N	conteo	{"tipo":"conteo","target":"Resolución de problemas técnicos > 95%"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:00:06.841	2026-03-19 17:00:06.841	>	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpuxjv003thkdoef8pdqth	USED-INGENI-MMXPUXHP	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Reportes de trabajo Diario	\N	conteo	{"tipo":"conteo","target":"# de reportes de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:00:38.875	2026-03-19 17:00:38.875	=	critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxpvt96003vhkdouv7v7qyu	USED-INGENI-MMXPVT5Y	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":"Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:01:19.962	2026-03-19 17:01:19.962	>	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxqjar30045hkdorgz98psa	USED-INGENI-MMXQJAPA	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Capacitaciones técnicas impartidas	\N	division	{"tipo":"division","numerador":"Ejecución de Capacitaciones asignadas ","denominador":"Capacitaciones planificadas ","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:19:35.727	2026-03-19 17:19:35.727	>	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxqldxa0047hkdo5xefxagj	CONTAB-CONTAD-MMXQLDWP	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Estados financieros confiables por empresa/unidad/proyecto	\N	division	{"tipo":"division","numerador":"Estados financieros sin ajustes posteriores","denominador":"Total estados emitidos","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:21:13.15	2026-03-19 17:21:13.15	>=	critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmxqquuw0049hkdo3um9eano	USED-INGENI-MMXQQUSA	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluación del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:25:28.377	2026-03-19 17:25:28.377	>	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxqruqm004bhkdobvlxppgy	USED-INGENI-MMXQRUOO	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:26:14.879	2026-03-19 17:26:14.879	=	no_critico	7018e73b-b29a-426a-88c4-6c51a464edad	f	0
cmmxqrw67004dhkdor0x8nerq	CONTAB-CONTAD-MMXQRW5K	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reportar alarmas/incidencias a gerencia a tiempo	\N	division	{"tipo":"division","numerador":"Reporte de alarmas","denominador":"incidencias","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:26:16.735	2026-03-19 17:26:16.735	>=	no_critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmxr0hs5004fhkdojnslw7ot	USED-SUPERV-MMXR0HN9	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento del programa de trabajo	\N	division	{"tipo":"division","numerador":"OT ejecutadas en tiempo","denominador":"OT programadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:32:57.989	2026-03-19 17:32:57.989	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr1gz7004hhkdofdmukx0h	USED-SUPERV-MMXR1GVU	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 17:33:43.603	2026-03-19 17:33:43.603	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr3566004jhkdo6uiwdj7l	USED-SUPERV-MMXR353Y	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Accidentes de Trabajo Graves	\N	conteo	{"tipo":"conteo","target":"# accidentes de Graves=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 17:35:01.614	2026-03-19 17:35:01.614	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr3xk0004lhkdok2a8k32m	USED-SUPERV-MMXR3XHR	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Accidentes de Trabajo menores	\N	conteo	{"tipo":"conteo","target":"# accidentes menores =0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 17:35:38.4	2026-03-19 17:35:38.4	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr4y9o004nhkdo8zyifeuj	USED-SUPERV-MMXR4Y6U	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Incidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"# de incidentes reportados= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:36:25.976	2026-03-19 17:36:25.976	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr5rbc004phkdoxng3abnh	USED-SUPERV-MMXR5R94	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de uso de EPP del personal bajo cargo	\N	division	{"tipo":"division","numerador":"Inspecciones conformes ","denominador":" Inspecciones realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:37:03.624	2026-03-19 17:37:03.624	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr6ab4004rhkdobhkc0bbe	USED-SUPERV-MMXR6A94	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de daños a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 17:37:28.241	2026-03-19 17:37:28.241	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxq82e0003zhkdor3gpq91w	SYSO-OFICIA-MMXQ82D7	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Informe preliminar	\N	conteo	{"tipo":"conteo","target":"Tiempo de entrega"}	12	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:10:51.672	2026-03-24 21:55:40.422	<=	critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	12
cmmxq9zng0041hkdo6o57bio4	SYSO-OFICIA-MMXQ9ZMT	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Gestión de riesgos	\N	binario	{"tipo":"binario","descripcion":"Ejecucion y/o gestion de acciones correctivas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:12:21.436	2026-03-24 21:56:00.427	=	no_critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	72
cmmxqfjd00043hkdomz2cf96z	SYSO-OFICIA-MMXQFJA9	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Personal con seguro contra accidente	\N	binario	{"tipo":"binario","descripcion":"Comprobación 100% del personal este asegurado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:16:40.261	2026-03-24 21:56:14.783	=	critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	48
cmmxplufk003phkdo7oixj3r5	SYSO-OFICIA-MMXPLUEP	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorias de formularios llenados de SYSO por trabajo	\N	binario	{"tipo":"binario","descripcion":"Informe de auditoría realizado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:53:34.929	2026-03-24 21:55:00.194	=	no_critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	72
cmmxr6vcx004thkdoevwj0414	USED-SUPERV-MMXR6VAF	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Validación de Check List de OT	\N	conteo	{"tipo":"conteo","target":"# de OT con Check List= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:37:55.522	2026-03-19 17:37:55.522	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr7sc0004vhkdohtczj3i3	USED-SUPERV-MMXR7S9B	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecución del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:38:38.257	2026-03-19 17:38:38.257	>	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxr89ed004xhkdowlooq0qy	USED-SUPERV-MMXR89CD	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Resolución de problemas Técnicos	\N	conteo	{"tipo":"conteo","target":"Resolución de problemas técnicos > 80%"}	80	20	100	mensual	Mayor es mejor	%	0	t	2026-03-19 17:39:00.374	2026-03-19 17:40:24.681	>	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxryeum004zhkdon824pmuc	USED-SUPERV-MMXRYESR	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Reportes de trabajo Diario	\N	conteo	{"tipo":"conteo","target":"# de reportes de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:59:20.492	2026-03-19 17:59:20.492	=	critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxrz9lx0051hkdo7xlomms4	USED-SUPERV-MMXRZ9K7	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":"Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 18:00:00.357	2026-03-19 18:00:00.357	>	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxs028h0053hkdogxcxtk7s	USED-SUPERV-MMXS0268	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Capacitaciones técnicas impartidas	\N	division	{"tipo":"division","numerador":"Ejecución de Capacitaciones asignadas ","denominador":"Capacitaciones planificadas ","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 18:00:37.457	2026-03-19 18:00:37.457	>	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxs0v4l0055hkdoghfs1zh6	USED-SUPERV-MMXS0V36	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluación del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 18:01:14.901	2026-03-19 18:01:14.901	>	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxs26qh0057hkdo7ane63jn	USED-SUPERV-MMXS26O6	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":"Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 18:02:16.601	2026-03-19 18:02:16.601	=	no_critico	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	f	0
cmmxs55h10059hkdoamnchzgf	USED-LABORA-MMXS55EE	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento del programa de trabajo	\N	division	{"tipo":"division","numerador":"OT ejecutadas en tiempo","denominador":"OT programadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 18:04:34.933	2026-03-19 18:04:34.933	=	critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxv9uit005bhkdo4paoxskk	USED-LABORA-MMXV9UG4	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 19:32:12.867	2026-03-19 19:32:12.867	=	critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvci5h005dhkdovkwn2upn	USED-LABORA-MMXVCI28	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimientos de Normativa de SYSO	\N	conteo	{"tipo":"conteo","target":"# accidentes de trabajo=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 19:34:16.806	2026-03-19 19:34:16.806	=	critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvd8ux005fhkdo7fr0m1n9	USED-LABORA-MMXVD8RU	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de danos a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 19:34:51.417	2026-03-19 19:34:51.417	=	critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxveejm005hhkdogmc0pw9r	USED-LABORA-MMXVEEGD	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Asistencia en Planificación de Trabajos	\N	conteo	{"tipo":"conteo","target":"# de OT con Check List= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 19:35:45.442	2026-03-19 19:35:45.442	=	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvgl67005jhkdoirheer53	USED-LABORA-MMXVGL11	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecución del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 19:37:27.343	2026-03-19 19:37:27.343	>	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvhcak005lhkdouns4odl9	USED-LABORA-MMXVHC7Y	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Resolución de problemas Técnicos	\N	conteo	{"tipo":"conteo","target":"Resolución de problemas técnicos > 80%"}	80	20	100	mensual	Mayor es mejor	%	0	t	2026-03-19 19:38:02.492	2026-03-19 19:38:02.492	>	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvial7005nhkdoadd5ohrf	USED-LABORA-MMXVIAIC	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Reportes de trabajo Diario	\N	conteo	{"tipo":"conteo","target":"# de reportes de trabajo diario= 100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 19:38:46.94	2026-03-19 19:38:46.94	=	critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvizr9005phkdodxa4xpl8	USED-LABORA-MMXVIZNP	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":"Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 19:39:19.557	2026-03-19 19:39:19.557	>	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvkan4005rhkdo9pb7x6my	USED-LABORA-MMXVKAJR	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluación del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 19:40:20.32	2026-03-19 19:40:20.32	>	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxvroth005thkdooubt24st	USED-LABORA-MMXVROQI	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":"Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 19:46:05.286	2026-03-19 19:46:05.286	=	no_critico	9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	f	0
cmmxxdjzr005vhkdo8vx2pqqo	UPM-TECNIC-MMXXDJU6	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Cumplimiento de la OT diaria	\N	division	{"tipo":"division","numerador":"Actividades ejecutadas","denominador":"Actividades asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 20:31:05.079	2026-03-19 20:31:05.079	>	critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxefgy005xhkdo4prqioxb	UPM-TECNIC-MMXXEFBX	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 20:31:45.874	2026-03-19 20:31:45.874	=	critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxf0ev005zhkdo0spmrbv3	UPM-TECNIC-MMXXF0A4	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Cumplimiento de normas de higiene y seguridad	\N	conteo	{"tipo":"conteo","target":"# incidentes por incumplimiento=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 20:32:13.015	2026-03-19 20:32:13.015	=	critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxflsn0061hkdorpltpnm3	UPM-TECNIC-MMXXFLON	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de danos a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 20:32:40.727	2026-03-19 20:32:40.727	=	critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxkch70063hkdo47qjmlqc	UPM-TECNIC-MMXXKCER	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecucion del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 20:36:21.931	2026-03-19 20:36:21.931	>	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxky6m0065hkdo7l31ucr6	UPM-TECNIC-MMXXKY41	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Uso de herramientas y equipos	\N	conteo	{"tipo":"conteo","target":"# de danos de herramienta por mal uso=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 20:36:50.062	2026-03-19 20:36:50.062	=	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxlor60067hkdotvt4ao4q	UPM-TECNIC-MMXXLOND	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":" Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 20:37:24.498	2026-03-19 20:37:24.498	>	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxo2vq0069hkdog06fs6ul	UPM-TECNIC-MMXXO2TW	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Informe de incidencias de trabajo/accidentes	\N	conteo	{"tipo":"conteo","target":"# de reportes de incidencias=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 20:39:16.119	2026-03-19 20:39:16.119	=	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxxopxa006bhkdo282jtszl	UPM-TECNIC-MMXXOPVL	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluacion del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 20:39:45.982	2026-03-19 20:39:45.982	>	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxy8s8d006dhkdo7oi3cdl9	UPM-TECNIC-MMXY8S6G	UPM	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 20:55:22.093	2026-03-19 20:55:22.093	=	no_critico	75e9d907-6974-45a2-81d7-f6855cf2247a	f	0
cmmxyfnk4006fhkdo4bdxm52g	USED-TECNIC-MMXYFNHQ	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de la OT diaria	\N	division	{"tipo":"division","numerador":"Actividades ejecutadas","denominador":"Actividades asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 21:00:42.629	2026-03-19 21:00:42.629	>	critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxyg7g0006hhkdomwxvznsk	USED-TECNIC-MMXYG7DQ	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Trabajo	\N	conteo	{"tipo":"conteo","target":"Trabajo ejecutado sin reproceso o retraso = 0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 21:01:08.4	2026-03-19 21:01:08.4	=	critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxygv1b006jhkdo2q8s6emd	USED-TECNIC-MMXYGUYY	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de normas de higiene y seguridad	\N	conteo	{"tipo":"conteo","target":"# incidentes por incumplimiento=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 21:01:38.976	2026-03-19 21:01:38.976	=	critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxyhktv006lhkdo2vmhfwrc	USED-TECNIC-MMXYHKQE	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Daño a activos	\N	conteo	{"tipo":"conteo","target":"# de danos a activos=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 21:02:12.403	2026-03-19 21:02:12.403	=	critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxyiary006nhkdoammkptka	USED-TECNIC-MMXYIAPN	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Ejecución de Mantenimiento de Activos	\N	division	{"tipo":"division","numerador":"Ejecucion del Mantenimiento ejecutado","denominador":"Programa de mantenimiento","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-19 21:02:46.03	2026-03-19 21:02:46.03	>	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxylp6h006phkdotlzcnr8u	USED-TECNIC-MMXYLP43	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Uso de herramientas y equipos	\N	conteo	{"tipo":"conteo","target":"# de danos de herramienta por mal uso=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-19 21:05:24.666	2026-03-19 21:05:24.666	=	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxym6t1006rhkdodrut2d2u	USED-TECNIC-MMXYM6QJ	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Plan de crecimiento profesional	\N	division	{"tipo":"division","numerador":"Competencias cerradas ","denominador":" Competencias planificadas","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 21:05:47.51	2026-03-19 21:05:47.51	>	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxymth9006thkdoqn70ftjr	USED-TECNIC-MMXYMTFN	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Informe de incidencias de trabajo/accidentes	\N	conteo	{"tipo":"conteo","target":"# de reportes de incidencias=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 21:06:16.893	2026-03-19 21:06:16.893	=	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxynebm006vhkdof61k212w	USED-TECNIC-MMXYNE9Q	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Satisfacción del cliente interno y externo	\N	conteo	{"tipo":"conteo","target":"Promedio de evaluación del cliente externo >90%, Evaluacion del Cliente Interno >90%"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-19 21:06:43.906	2026-03-19 21:06:43.906	>	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmxynylc006xhkdokud7gkar	USED-TECNIC-MMXYNYJK	USED	b6830dac-ed5b-428a-bea5-be4ca4676347	Cumplimiento de procedimientos ISO	\N	division	{"tipo":"division","numerador":"Auditorías conformes ","denominador":" Auditorías realizadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 21:07:10.176	2026-03-19 21:07:10.176	=	no_critico	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	f	0
cmmz06hn6006zhkdos90xweq8	CONTAB-CONTAD-MMZ06HGF	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Información contable actualizada	\N	precision	{"tipo":"precision","labelEsperado":"Reporte auditoria","valorEsperado":"95","labelObtenido":"Informacion actualizada","modoEvaluacion":"umbral"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:37:20.464	2026-03-20 14:37:20.464	>=	no_critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz0a3440071hkdo24k7fpvd	CONTAB-CONTAD-MMZ0A332	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cumplimiento fiscal sin sanciones	\N	conteo	{"tipo":"conteo","target":"Numero de sanciones fiscales"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 14:40:08.26	2026-03-20 14:40:08.26	<=	critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz0de940073hkdoe83r1ucw	CONTAB-CONTAD-MMZ0DE6L	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cierre contable oportuno anual	\N	binario	{"tipo":"binario","descripcion":"< primeros 10 días de Enero"}	100	0	\N	anual	Mayor es mejor	%	0	t	2026-03-20 14:42:42.663	2026-03-20 14:42:42.663	=	critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz0fcfe0075hkdoto1iw139	CONTAB-CONTAD-MMZ0FCEQ	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cierre contable oportuno mensual	\N	binario	{"tipo":"binario","descripcion":"< a los primeros 8 dias del mes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:44:13.611	2026-03-20 14:44:13.611	=	critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz0gjdx0077hkdojoyqtqln	AREADE-GERENC-MMZ0GJC2	Área de Proyectos	90820b7e-932d-4bbd-ad1a-c0402bf35049	Rentabilidad global EPC	\N	conteo	{"tipo":"conteo","target":"Rentabilidad global EPC"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:45:09.285	2026-03-20 14:45:09.285	>	no_critico	0b28a256-8b5f-4cd5-92d0-66477edd832a	f	0
cmmz0h21u0079hkdo50crfaku	AREADE-GERENC-MMZ0H205	Área de Proyectos	90820b7e-932d-4bbd-ad1a-c0402bf35049	% Proyectos en verde	\N	conteo	{"tipo":"conteo","target":"% Proyectos en verde"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:45:33.475	2026-03-20 14:45:33.475	>	no_critico	0b28a256-8b5f-4cd5-92d0-66477edd832a	f	0
cmmz0kpjf007bhkdo5fhivlek	AREADE-GERENC-MMZ0KPG5	Área de Proyectos	90820b7e-932d-4bbd-ad1a-c0402bf35049	% CAF cerrados vs plan	\N	conteo	{"tipo":"conteo","target":"% CAF cerrados vs plan"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:48:23.883	2026-03-20 14:48:23.883	>	no_critico	0b28a256-8b5f-4cd5-92d0-66477edd832a	f	0
cmmz0lch5007dhkdoevwy46gh	PMO-ENCARG-MMZ0LCF4	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	SPI	\N	conteo	{"tipo":"conteo","target":"SPI"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:48:53.609	2026-03-20 14:48:53.609	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0ly8n007fhkdo0tr2d8kp	PMO-ENCARG-MMZ0LY6P	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	CPI	\N	conteo	{"tipo":"conteo","target":"CPI"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:49:21.815	2026-03-20 14:49:21.815	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0mf6a007hhkdo7eide6r9	PMO-ENCARG-MMZ0MF4F	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Gate 0 aprobados	\N	conteo	{"tipo":"conteo","target":"Gate 0 aprobados"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:49:43.762	2026-03-20 14:49:43.762	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0o64w007jhkdoscukipni	PMO-ENCARG-MMZ0O632	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	CAP emitidos conforme contrato	\N	conteo	{"tipo":"conteo","target":"CAP emitidos conforme contrato"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:51:05.36	2026-03-20 14:51:05.36	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0qevp007lhkdovjj8lkso	PMO-ENCARG-MMZ0QETM	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	CAF cerrados conforme contrato	\N	conteo	{"tipo":"conteo","target":"CAF cerrados conforme contrato"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:52:50.006	2026-03-20 14:52:50.006	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0r04o007nhkdoo6enjw1d	PMO-ENCARG-MMZ0R02X	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Informes a Gerencia (Dashboards)	\N	conteo	{"tipo":"conteo","target":"Informes a Gerencia (Dashboards)"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:53:17.544	2026-03-20 14:53:17.544	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz0w7xx007phkdotwpybimr	CONTAB-CONTAD-MMZ0W7W5	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reportes financieros útiles y oportunos	\N	binario	{"tipo":"binario","descripcion":"Reporte entregado sin rechazo antes del 12 de cada mes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:57:20.949	2026-03-20 14:57:20.949	=	no_critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz0x8fd007rhkdoyog3996c	CONTAB-CONTAD-MMZ0X8EK	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cumplimiento de KPIs del equipo	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:58:08.233	2026-03-20 14:58:08.233	>=	no_critico	91f83910-89a9-4312-813f-0bf79efccbe6	f	0
cmmz13hw1007xhkdorlhuef6a	CONTAB-CONTAD-MMZ13HUG	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cumplimiento del cierre contable	\N	binario	{"tipo":"binario","descripcion":"< que los primeros 5 dias del mes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:03:00.433	2026-03-20 15:03:00.433	=	critico	d7a085a5-512a-4642-b360-9f232b92c20a	f	0
cmmz0yive007thkdoo5ri0r4o	CONTAB-AUDITO-MMZ0YITR	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Ejecución de la actividad contable sin reprocesos	\N	binario	{"tipo":"binario","descripcion":"Revisión de registros sin reproceso"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 14:59:08.426	2026-03-20 15:03:49.493	=	critico	d7a085a5-512a-4642-b360-9f232b92c20a	f	0
cmmz0zpm9007vhkdoyrnljj2b	CONTAB-AUDITO-MMZ0ZPLJ	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Estados financieros sin ajustes posteriores	\N	binario	{"tipo":"binario","descripcion":"Estados financieros en tiempo y sin rechazo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:00:03.825	2026-03-20 15:04:14.673	=	critico	d7a085a5-512a-4642-b360-9f232b92c20a	f	0
cmmz16omi007zhkdoc0md8o1w	CONTAB-CONTAD-MMZ16OLU	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de auditoria documental contable completa y valida	\N	binario	{"tipo":"binario","descripcion":"Reporte de auditoria"}	95	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:05:29.131	2026-03-20 15:05:29.131	>=	no_critico	d7a085a5-512a-4642-b360-9f232b92c20a	f	0
cmmz186ik0081hkdotv29l27y	CONTAB-AUDITO-MMZ186HT	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de Auditoria	\N	binario	{"tipo":"binario","descripcion":"Control y existencia de activos fijos"}	95	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:06:38.972	2026-03-20 15:06:38.972	>=	critico	fa3b8780-14a3-4fbf-8ca6-16201624508a	f	0
cmmz19czk0083hkdojdvd92h2	CONTAB-AUDITO-MMZ19CYT	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de auditoria	\N	binario	{"tipo":"binario","descripcion":"Confiabilidad del inventario auditado"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 15:07:34.017	2026-03-20 15:07:34.017	>=	critico	fa3b8780-14a3-4fbf-8ca6-16201624508a	f	0
cmmz1b3mi0085hkdooxhtd7p0	CONTAB-AUDITO-MMZ1B3L2	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de auditorías en almacenes externos	\N	binario	{"tipo":"binario","descripcion":"Reporte de auditoria de almacenes externos, Gestión de activos de proyectos"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 15:08:55.194	2026-03-20 15:08:55.194	>=	critico	fa3b8780-14a3-4fbf-8ca6-16201624508a	f	0
cmmz1cj780087hkdoixpaodl1	PMO-ENCARG-MMZ1CJ55	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Planes de acción ante eventos	\N	conteo	{"tipo":"conteo","target":"Planes de accion ante eventos"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:10:02.035	2026-03-20 15:10:02.035	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz1d3cz0089hkdoeb5spic2	PMO-ENCARG-MMZ1D3B4	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Análisis de riesgo actualizado	\N	conteo	{"tipo":"conteo","target":"Análisis de riesgo actualizado"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:10:28.164	2026-03-20 15:10:28.164	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz1dnab008bhkdo4x5ozvmk	PMO-ENCARG-MMZ1DN86	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reportes de Incidencias (Alarmas-Ruta Critica)	\N	conteo	{"tipo":"conteo","target":"Reportes de Incidencias (Alarmas-Ruta Critica)"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:10:53.987	2026-03-20 15:10:53.987	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz1e4ro008dhkdonfuc87pa	PMO-ENCARG-MMZ1E4PN	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Proyecto en Riesgo	\N	conteo	{"tipo":"conteo","target":"Proyecto en Riesgo"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:11:16.645	2026-03-20 15:11:16.645	>	no_critico	42a5c8ca-bddb-4efb-9b63-3bd68bd91233	f	0
cmmz1gwmk008fhkdo16gh7083	PMO-ENCARG-MMZ1GWKC	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Uso Procore	\N	conteo	{"tipo":"conteo","target":"Uso Procore"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:13:26.06	2026-03-20 15:13:26.06	=	critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1hs6t008hhkdodzqca1y6	PMO-ENCARG-MMZ1HS3Q	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Versiones documentales correctas	\N	conteo	{"tipo":"conteo","target":"Versiones documentales correctas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:14:06.965	2026-03-20 15:14:06.965	=	critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1iicd008jhkdorivbs6og	PMO-ENCARG-MMZ1II9A	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	KPIs publicados mensualmente	\N	conteo	{"tipo":"conteo","target":"KPIs publicados mensualmente"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:14:40.861	2026-03-20 15:14:40.861	=	critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1pxyz008lhkdocbzgilmd	PMO-ENCARG-MMZ1PXUY	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Actas emitidas	\N	conteo	{"tipo":"conteo","target":"Actas emitidas"}	\N	\N	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:20:27.708	2026-03-20 15:20:27.708	>	no_critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1qp14008nhkdoeayd6jl5	PMO-ENCARG-MMZ1QOZ8	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Auditorías sin hallazgos documentales	\N	conteo	{"tipo":"conteo","target":"Auditorías sin hallazgos documentales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:21:02.776	2026-03-20 15:21:02.776	=	no_critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1rg8k008phkdoix0q4j2l	PMO-ENCARG-MMZ1RG6L	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Almacenamiento de información	\N	conteo	{"tipo":"conteo","target":"Almacenamiento de informacion "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:21:38.036	2026-03-20 15:21:38.036	=	critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1sb0m008rhkdow5m8l09o	PMO-ENCARG-MMZ1SAYB	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Gestión de la comunicación	\N	conteo	{"tipo":"conteo","target":"Gestion de la cumunicacion "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:22:17.926	2026-03-20 15:22:17.926	=	no_critico	5b3bc564-11c7-4787-99fb-b916cdee3390	f	0
cmmz1uil2008thkdofxv1m4m7	PMO-ADMINI-MMZ1UIG0	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Hitos de cobro contractual emitidas a tiempo	\N	conteo	{"tipo":"conteo","target":"Hitos de cobro contractual emitidas a tiempo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:24:01.046	2026-03-20 15:24:01.046	=	critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz1vnqz008vhkdooykmel5a	PMO-ADMINI-MMZ1VNJ1	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reclamos documentados oportunamente	\N	conteo	{"tipo":"conteo","target":"Reclamos documentados oportunamente"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:24:54.395	2026-03-20 15:24:54.395	=	critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz1z4hc008xhkdomu455qrq	PMO-ADMINI-MMZ1Z4B8	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reporte de Cumplimiento de Contratos	\N	conteo	{"tipo":"conteo","target":"Reporte de Cumplimiento de Contratos"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:27:36.048	2026-03-20 15:27:36.048	=	critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz1zxtp008zhkdodiaz81v5	PMO-ADMINI-MMZ1ZXRI	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reporte de Incidencias contractuales	\N	conteo	{"tipo":"conteo","target":"Reporte de Incidencias contractuales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:28:14.077	2026-03-20 15:28:14.077	=	no_critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz20zek0091hkdodjo0ox50	PMO-ADMINI-MMZ20ZAA	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Análisis de riesgo contractual	\N	conteo	{"tipo":"conteo","target":"Analisis de riesgo contractual"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:29:02.781	2026-03-20 15:29:02.781	=	no_critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz21s2l0093hkdoni11r142	PMO-ADMINI-MMZ21RZF	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	CAP / CAF conforme contrato	\N	conteo	{"tipo":"conteo","target":"CAP / CAF conforme contrato"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 15:29:39.934	2026-03-20 15:29:39.934	=	critico	13beaf85-81f1-4887-801a-04131a08d73b	f	0
cmmz22yj40095hkdoalbc03cx	PMO-ENCARG-MMZ22YH4	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Desviación de costo Vs Presupuesto	\N	conteo	{"tipo":"conteo","target":"Desviación de costo Vs Presupuesto"}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 15:30:34.961	2026-03-20 15:30:34.961	<=	critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz27k0p0097hkdowj6nb3ra	PMO-ENCARG-MMZ27JWV	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Estimaciones cobradas a tiempo	\N	conteo	{"tipo":"conteo","target":"Estimaciones cobradas a tiempo"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 15:34:09.433	2026-03-20 15:34:09.433	>=	critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz3lc430099hkdof71nmvyk	CONTAB-AUDITO-MMZ3LC32	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de auditoria	\N	binario	{"tipo":"binario","descripcion":"Auditoria de cumplimiento del reglamento de viaticos"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 16:12:51.987	2026-03-20 16:12:51.987	>=	no_critico	fa3b8780-14a3-4fbf-8ca6-16201624508a	f	0
cmmz3mp0y009bhkdozsp1tk25	CONTAB-AUDITO-MMZ3MP0A	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Informes entregados sin reproceso y a tiempo	\N	binario	{"tipo":"binario","descripcion":"Reportes de calidad y oportunidad de informes entregados y aceptados sin rechazo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:13:55.379	2026-03-20 16:13:55.379	=	no_critico	fa3b8780-14a3-4fbf-8ca6-16201624508a	f	0
cmmz3p5wk009dhkdogv18qmzf	CONTAB-AUXILI-MMZ3P5V1	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Ejecución de la actividad contable sin reprocesos	\N	binario	{"tipo":"binario","descripcion":"Revisión de registros sin reproceso"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:15:50.564	2026-03-20 16:15:50.564	=	critico	0cf75a1e-4b46-4728-a266-e3c0767b01b9	f	0
cmmz3v6c4009fhkdo95uk27lp	CONTAB-AUXILI-MMZ3V6AP	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Estados financieros sin ajustes posteriores	\N	binario	{"tipo":"binario","descripcion":"Estados financieros confiables de la unidad o empresa, en tiempo y sin rechazo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:20:31.061	2026-03-20 16:20:31.061	=	critico	0cf75a1e-4b46-4728-a266-e3c0767b01b9	f	0
cmmz3x1ul009hhkdonktfg5m3	PMO-ENCARG-MMZ3X1R6	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Estimaciones cobradas a tiempo	\N	conteo	{"tipo":"conteo","target":"Estimaciones cobradas a tiempo"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 16:21:58.558	2026-03-20 16:21:58.558	>=	critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz3xru1009jhkdonf1i6lvp	PMO-ENCARG-MMZ3XRQZ	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Informes dashboard financiero	\N	conteo	{"tipo":"conteo","target":"Informes dashboard financiero"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:22:32.234	2026-03-20 16:22:32.234	=	no_critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz3yi8k009lhkdo88w4is8a	PMO-ENCARG-MMZ3YI5H	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Control de sobrecosto por retrabajos o rechazos	\N	conteo	{"tipo":"conteo","target":"Control de sobrecosto por retrabajos o rechazos"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:23:06.452	2026-03-20 16:23:06.452	=	no_critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz3z8t8009nhkdoe95meef5	PMO-ENCARG-MMZ3Z8QD	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Cumplimiento de Proceso contrataciones de servicios	\N	conteo	{"tipo":"conteo","target":"Cumplimiento de Proceso contrataciones de servicios"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:23:40.893	2026-03-20 16:23:40.893	=	no_critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz3zhv3009phkdowe6tlyut	CONTAB-AUXILI-MMZ3ZHUF	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Cumplimiento del cierre contable	\N	binario	{"tipo":"binario","descripcion":"Cierre contable oportuno entregado en los primeros 5 días del mes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:23:52.623	2026-03-20 16:23:52.623	=	critico	0cf75a1e-4b46-4728-a266-e3c0767b01b9	f	0
cmmz40bzb009rhkdott7y79qi	PMO-ENCARG-MMZ40BWL	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Evaluacion de Contratistas	\N	conteo	{"tipo":"conteo","target":"Evaluacion de Contratistas"}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-20 16:24:31.656	2026-03-20 16:24:31.656	=	no_critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz40ozc009thkdoiuqagr6d	CONTAB-AUXILI-MMZ40OYQ	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Reporte de auditoria documental contable completa y valida	\N	binario	{"tipo":"binario","descripcion":"Reporte de auditoria"}	95	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:24:48.505	2026-03-20 16:24:48.505	>=	no_critico	0cf75a1e-4b46-4728-a266-e3c0767b01b9	f	0
cmmz418tr009vhkdoti829e00	PMO-ENCARG-MMZ418R2	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Pagos conforme contrato	\N	conteo	{"tipo":"conteo","target":"Pagos conforme contrato"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:25:14.224	2026-03-20 16:25:14.224	=	critico	7a36a221-7bd4-4d23-8c24-f3f54dc963ca	f	0
cmmz43pck009xhkdojb3ygak4	RRHH-ASISTE-MMZ43PA2	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Auditoria de exactitud de actualización de información del personal	\N	division	{"tipo":"division","numerador":"Registros correctos y actualizados","denominador":"total de registros actualizados","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:27:08.948	2026-03-20 16:27:08.948	>=	no_critico	a4c07a43-ab93-4467-af09-eccd112f12d8	f	0
cmmz44uvf009zhkdo79d08s1k	RRHH-ASISTE-MMZ44UUO	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Expedientes actualizados	\N	division	{"tipo":"division","numerador":"Expedientes completos","denominador":"total de expedientes activos","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:28:02.763	2026-03-20 16:28:02.763	>=	no_critico	a4c07a43-ab93-4467-af09-eccd112f12d8	f	0
cmmz4c5pi00a5hkdot48r4s0m	RRHH-ENCARG-MMZ4C5NW	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento de limpieza	\N	binario	{"tipo":"binario","descripcion":"Auditoria de limpieza"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:33:43.399	2026-03-20 16:33:43.399	>=	critico	1067a5a0-7ae1-4a86-844c-14be0fede89b	f	0
cmmz4d3s300a7hkdonpbldaza	RRHH-ENCARG-MMZ4D3RD	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Quejas por limpieza	\N	conteo	{"tipo":"conteo","target":"Número de quejas formales"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 16:34:27.555	2026-03-20 16:34:27.555	<=	no_critico	1067a5a0-7ae1-4a86-844c-14be0fede89b	f	0
cmmz4knel00abhkdoc1a4my2c	RRHH-ENCARG-MMZ4KND1	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento del procedimiento de reclutamiento	Proyectos: ≤ 3 días\nOtras vacantes: ≤ 15 días	division	{"tipo":"division","numerador":"Contrataciones conforme a procedimiento aprobado","denominador":"total contrataciones","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:40:19.581	2026-03-20 16:40:19.581	>=	no_critico	c25115ff-5982-4d49-907a-d66b0497b5da	f	0
cmmz4royr00adhkdob5qxr3ai	RRHH-ENCARG-MMZ4ROX7	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Calidad mínima de contratación	\N	division	{"tipo":"division","numerador":"Contrataciones que superan periodo de prueba","denominador":"total de contrataciones","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:45:48.196	2026-03-20 16:45:48.196	>=	no_critico	c25115ff-5982-4d49-907a-d66b0497b5da	f	0
cmmz4ukq200ahhkdojbixaljr	RRHH-ENCARG-MMZ4UKPA	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Calidad de contratacion	Base activa de candidatos	division	{"tipo":"division","numerador":"Candidatos calificados activos","denominador":"Objetivo definido","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:48:02.666	2026-03-20 16:48:02.666	>=	no_critico	c25115ff-5982-4d49-907a-d66b0497b5da	f	0
cmmz4tcbr00afhkdob47dqds1	RRHH-ENCARG-MMZ4TCB5	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Presentación Dashboard Semanal	Presentación de dashboard del 100% de las plazas	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:47:05.127	2026-03-24 21:58:08.388	=	no_critico	c25115ff-5982-4d49-907a-d66b0497b5da	t	120
cmmz4wlnp00ajhkdoy1o2d72z	RRHH-GENERA-MMZ4WLN5	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Procesos disciplinarios gestionados en plazo	\N	binario	{"tipo":"binario","descripcion":"Número de acciones disciplinarias con proceso documentado menor a 10 dias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:49:37.19	2026-03-24 22:00:22.98	=	no_critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	t	120
cmmz529al00alhkdo2r2i35n9	RRHH-GENERA-MMZ52990	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Exactitud de nomina	\N	division	{"tipo":"division","numerador":"Nominas entregadas en fecha y sin errores","denominador":"Nominas procesadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:54:01.101	2026-03-24 22:01:49.506	>=	no_critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	t	120
cmmz47jty00a3hkdolablpcc7	RRHH-ASISTE-MMZ47JTD	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento de solicitudes fe Gerencia	\N	binario	{"tipo":"binario","descripcion":"Número de solicitudes atendidas segun requerimiento"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:30:08.422	2026-03-24 21:56:55.106	=	critico	a4c07a43-ab93-4467-af09-eccd112f12d8	t	1
cmmz53zt900anhkdo7u7qx5wx	RRHH-GENERA-MMZ53ZS7	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Expedientes completos	Gestión ordenada de contrataciones en proyectos	division	{"tipo":"division","numerador":"Cotrataciones de proyecto con expediente completo y contrato vigente","denominador":"Total contrataciones de proyecto","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:55:22.125	2026-03-20 16:55:22.125	>=	critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	f	0
cmmz584zs00arhkdow2g1audw	RRHH-GENERA-MMZ584YD	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Expedientes completos por colaborador	Expedientes completos	division	{"tipo":"division","numerador":"Numero de colaboradoes con expedientes completos","denominador":"Total de colaboradores","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 16:58:35.464	2026-03-20 16:58:35.464	>=	no_critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	f	0
cmmz59thj00athkdo13824gwf	RRHH-GENERA-MMZ59TFF	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Inscripciones y pagos	Actualización de inscripciones en instituciones del estado	division	{"tipo":"division","numerador":"Numero de colaboradores inscritos","denominador":"Total de colaboradores laborando","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:59:53.863	2026-03-20 16:59:53.863	>=	no_critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	f	0
cmmz5ntqa00avhkdowc5d1gzt	RRHH-GENERA-MMZ5NTJT	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Pólizas de seguros vigentes	\N	division	{"tipo":"division","numerador":"Pólizas vigentes y correctamente actualizadas","denominador":"Total pólizas requeridas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:10:47.361	2026-03-20 17:10:47.361	>=	critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	f	0
cmmz5o5k700axhkdoum4vtt0w	INGENI-INGENI-MMZ5O5HF	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 17:11:02.695	2026-03-20 17:11:02.695	>=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5oxvg00azhkdobw3ykj4s	INGENI-INGENI-MMZ5OXSG	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Cambios con ECN	\N	conteo	{"tipo":"conteo","target":"Cambios con ECN"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:11:39.388	2026-03-20 17:11:39.388	=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5rclb00b1hkdowa5mm60y	INGENI-INGENI-MMZ5RCIY	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Retrabajos de ingeniería	\N	conteo	{"tipo":"conteo","target":"Retrabajos de ingeniería"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:13:31.775	2026-03-20 17:13:31.775	<=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5t3tc00b5hkdoxomo0mi8	INGENI-INGENI-MMZ5T3QK	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Reportes diarios	\N	conteo	{"tipo":"conteo","target":"Reportes diarios"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 17:14:53.712	2026-03-20 17:14:53.712	>=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5tkf600b7hkdopkcltk7e	RRHH-GESTOR-MMZ5TKEO	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Medición de la gestión de desarrollo y crecimiento	Gestión del plan de desarrollo y crecimiento de talento	division	{"tipo":"division","numerador":"Colaboradores con plan de desarrollo activo","denominador":"Colaboradores clave definidos","multiplicador":100,"invertir":false}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-20 17:15:15.234	2026-03-20 17:15:15.234	>=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz5tvwa00b9hkdovk9tx3yw	INGENI-INGENI-MMZ5TVTK	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 17:15:30.107	2026-03-20 17:15:30.107	>=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5vmm600bbhkdowdkj1gwz	RRHH-GESTOR-MMZ5VMKM	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Gestion del recurso humano basado en resultados	Gestión del desempeño basado en KPIs	division	{"tipo":"division","numerador":"Colaboradores con gestion de desempeño","denominador":"Total de colaboradores","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:16:51.39	2026-03-20 17:16:51.39	>=	critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz5vo2q00bdhkdoc8sx3tpa	INGENI-INGENI-MMZ5VO09	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Uso de Plataforma Procore	\N	conteo	{"tipo":"conteo","target":"Uso de Plataforma Procore"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:16:53.282	2026-03-20 17:16:53.282	=	no_critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5xhrd00bfhkdo6p9dl34y	INGENI-INGENI-MMZ5XHO9	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Tiempo ECN	\N	conteo	{"tipo":"conteo","target":"Tiempo ECN"}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 17:18:18.409	2026-03-20 17:18:18.409	<=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz5xlgq00bhhkdozm8t18da	RRHH-GESTOR-MMZ5XLG1	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Clima organizacional	Clima organizacional	conteo	{"tipo":"conteo","target":"Encuesta clima laboral"}	85	15	100	semestral	Mayor es mejor	%	0	t	2026-03-20 17:18:23.21	2026-03-20 17:18:23.21	>=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz5z00c00bjhkdoyhzf4ij1	INGENI-INGENI-MMZ5YZX2	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 17:19:28.716	2026-03-20 17:19:28.716	=	critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz60qnj00blhkdoi31c4o4c	INGENI-INGENI-MMZ60QJQ	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Ingeniería cerrada por proyecto	\N	conteo	{"tipo":"conteo","target":"Ingeniería cerrada por proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:20:49.903	2026-03-20 17:20:49.903	=	no_critico	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	f	0
cmmz61llm00bnhkdobm9b6q6n	RRHH-GESTOR-MMZ61LL1	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Avances en el alineamiento de la cultura organizacional	\N	division	{"tipo":"division","numerador":"Casos de desviacion cultural gestionados preventivamente","denominador":"Casos detectados","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:21:30.01	2026-03-24 22:07:30.961	>=	no_critico	905361b2-11d4-4241-8905-06808eefd357	t	24
cmmz65jkl00bphkdoibvlw6jq	RRHH-GESTOR-MMZ65JJ3	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Colaboradores integrados exitosamente	Proceso de integración de nuevos colaboradores	binario	{"tipo":"binario","descripcion":"Numero de colaboradores integrados después de 6 meses de su contratacion"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:24:34.005	2026-03-20 17:24:34.005	=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz6ac5j00brhkdol3o4gu8h	RRHH-GESTOR-MMZ6AC42	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Auditoria de proceso de integración por colaborador	Proceso de integracion de nuevos colaboradores	division	{"tipo":"division","numerador":"Auditoria del proceso de integración por colaborador","denominador":"Total de colaboradores contratados","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:28:17.672	2026-03-20 17:28:17.672	>=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz6biya00bthkdobkczw0ha	RRHH-GESTOR-MMZ6BIXL	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento del plan de capacitacion	Plan de capacitacion	binario	{"tipo":"binario","descripcion":"Cumplimiento del plan de capacitacion"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:29:13.138	2026-03-20 17:29:13.138	=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmz6d7pv00bvhkdonev9zo8p	RRHH-GESTOR-MMZ6D7OD	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento de KPIs del equipo	\N	porcentaje_kpis_equipo	{"tipo":"porcentaje_kpis_equipo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 17:30:31.891	2026-03-20 17:30:31.891	>=	no_critico	905361b2-11d4-4241-8905-06808eefd357	f	0
cmmzb2ncm00bxhkdopn54yi0q	UNIDAD-GESTOR-MMZB2NF4	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 19:42:17.013	2026-03-20 19:42:17.013	>=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzb40th00bzhkdocwgsght3	UNIDAD-GESTOR-MMZB40VI	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Retrabajos	\N	conteo	{"tipo":"conteo","target":"Retrabajos"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:43:21.126	2026-03-20 19:43:21.126	<=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzb5m6g00c1hkdo043i8x7r	UNIDAD-GESTOR-MMZB5M71	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	NCR (No Conformidades Recibidas)	\N	conteo	{"tipo":"conteo","target":"NCR (No Conformidades Recibidas)"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 19:44:35.464	2026-03-20 19:44:35.464	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzb6hgh00c3hkdo7jdoh6fz	UNIDAD-GESTOR-MMZB6HJA	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Accidentes	\N	conteo	{"tipo":"conteo","target":"Accidentes"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 19:45:16.001	2026-03-20 19:45:16.001	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzb8rs300c5hkdo08s4in15	UNIDAD-GESTOR-MMZB8RRD	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:47:02.691	2026-03-20 19:47:02.691	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzb9jyj00c7hkdo1hfog8za	UNIDAD-GESTOR-MMZB9JXY	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Elaboración de planes de acción	\N	conteo	{"tipo":"conteo","target":"Elaboración de planes de acción"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 19:47:39.211	2026-03-20 19:47:39.211	>	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbaecg00c9hkdoqlodeqaq	UNIDAD-GESTOR-MMZBAEBK	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Reuniones de trabajo con Ingenieros Residentes	\N	conteo	{"tipo":"conteo","target":"Reuniones de trabajo con Ingenieros Residentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:48:18.592	2026-03-20 19:48:18.592	=	no_critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbbljs00cbhkdofgskyl5r	UNIDAD-GESTOR-MMZBBLI9	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Adjudicar contratos u obras fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Adjudicar contratos u obras fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:49:14.584	2026-03-20 19:49:14.584	=	no_critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbcr2t00cdhkdorw0zk3cc	UNIDAD-GESTOR-MMZBCQZ8	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Contratación de personal fuera del proceso	\N	conteo	{"tipo":"conteo","target":"Contratación de personal fuera del proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:50:08.405	2026-03-20 19:50:08.405	=	no_critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbdi4h00cfhkdorpq0j0gk	UNIDAD-GESTOR-MMZBDI1P	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Aprobación de gastos fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Aprobación de gastos fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:50:43.458	2026-03-20 19:50:43.458	=	no_critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbe8pi00chhkdosx5joldz	UNIDAD-GESTOR-MMZBE8M4	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:51:17.91	2026-03-20 19:51:17.91	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbf3j000cjhkdowgpsuujv	UNIDAD-GESTOR-MMZBF3G4	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 19:51:57.852	2026-03-20 19:51:57.852	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbfvsa00clhkdok8ylqas2	UNIDAD-GESTOR-MMZBFVOK	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Análisis de riesgos de ejecución mensuales	\N	conteo	{"tipo":"conteo","target":"Análisis de riesgos de ejecución mensuales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:52:34.474	2026-03-20 19:52:34.474	=	no_critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbgpos00cnhkdo9cm2ztyo	UNIDAD-GESTOR-MMZBGPME	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:53:13.228	2026-03-20 19:53:13.228	=	critico	e1636fdb-be70-4831-906a-89932b337f15	f	0
cmmzbi1fg00cphkdoz33x0hvz	UNIDAD-GESTOR-MMZBI1DU	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 19:54:15.1	2026-03-20 19:54:15.1	>=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmmzbillv00crhkdonjdfb0m4	UNIDAD-GESTOR-MMZBILK4	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Retrabajos	\N	conteo	{"tipo":"conteo","target":"Retrabajos"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 19:54:41.251	2026-03-20 19:54:41.251	<=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmmzbj7j300cthkdofmd74pbf	UNIDAD-GESTOR-MMZBJ7GV	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	NCR (No Conformidades Recibidas)	\N	conteo	{"tipo":"conteo","target":"NCR (No Conformidades Recibidas)"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-20 19:55:09.663	2026-03-20 19:55:09.663	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmmzcg7om00cxhkdozmqv463y	UNIDAD-INGENI-MMZCG7LU	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Reportes diarios	\N	conteo	{"tipo":"conteo","target":"Reportes diarios"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-20 20:20:49.509	2026-03-20 20:20:49.509	>=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn39p8jg00czhkdoz8wlbnft	UNIDAD-GESTOR-MN39P8ID	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:14:56.379	2026-03-23 14:14:56.379	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39qkhu00d1hkdo8w52y29b	UNIDAD-GESTOR-MN39QKGJ	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Elaboración de planes de acción	\N	conteo	{"tipo":"conteo","target":"Elaboración de planes de acción"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 14:15:58.531	2026-03-23 14:15:58.531	>	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39r0wa00d3hkdoot48r57q	UNIDAD-GESTOR-MN39R0V0	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reuniones de trabajo con Ingenieros Residentes	\N	conteo	{"tipo":"conteo","target":"Reuniones de trabajo con Ingenieros Residentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:16:19.786	2026-03-23 14:16:19.786	=	no_critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39rew000d5hkdoq70t1o4g	UNIDAD-GESTOR-MN39REUS	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Adjudicar contratos u obras fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Adjudicar contratos u obras fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:16:37.921	2026-03-23 14:16:37.921	=	no_critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39sias00d7hkdojyqe24yd	UNIDAD-GESTOR-MN39SI9H	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Contratación de personal fuera del proceso	\N	conteo	{"tipo":"conteo","target":"Contratación de personal fuera del proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:17:28.997	2026-03-23 14:17:28.997	=	no_critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39v44v00d9hkdoeqs0ia8h	UNIDAD-GESTOR-MN39V43L	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Aprobación de gastos fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Aprobación de gastos fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:19:30.607	2026-03-23 14:19:30.607	=	no_critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39vt4100dbhkdofxkmp34w	UNIDAD-GESTOR-MN39VT2S	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:20:02.977	2026-03-23 14:20:02.977	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39wkph00ddhkdosk2aea4h	UNIDAD-GESTOR-MN39WKNL	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 14:20:38.741	2026-03-23 14:20:38.741	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39xjqo00dfhkdoa9gey4ji	UNIDAD-GESTOR-MN39XJPH	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Análisis de riesgos de ejecución mensuales	\N	conteo	{"tipo":"conteo","target":"Análisis de riesgos de ejecución mensuales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:21:24.145	2026-03-23 14:21:24.145	=	no_critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn39y13900dhhkdo1u7bifrk	UNIDAD-GESTOR-MN39Y125	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:21:46.63	2026-03-23 14:21:46.63	=	critico	e7a26477-ba32-46e3-b62a-2ab95874c8db	f	0
cmn3a4z4800drhkdoxj23u8ix	UNIDAD-SENIOR-MN3A4Z36	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:27:10.665	2026-03-23 17:15:37.256	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a5ivs00dthkdoieruzu2n	UNIDAD-SENIOR-MN3A5IUN	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Elaboración de planes de acción	\N	conteo	{"tipo":"conteo","target":"Elaboración de planes de acción"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 14:27:36.28	2026-03-23 17:16:12.473	>	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a6r2m00dvhkdo2wp0q2fn	UNIDAD-SENIOR-MN3A6R1L	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Reuniones de trabajo con Ingenieros Residentes	\N	conteo	{"tipo":"conteo","target":"Reuniones de trabajo con Ingenieros Residentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:28:33.55	2026-03-23 17:16:36.964	=	no_critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a77x300dxhkdos1xzq8za	UNIDAD-SENIOR-MN3A77W4	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Adjudicar contratos u obras fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Adjudicar contratos u obras fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:28:55.384	2026-03-23 17:17:02.607	=	no_critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a7oei00dzhkdo012avwnf	UNIDAD-SENIOR-MN3A7ODG	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Contratación de personal fuera del proceso	\N	conteo	{"tipo":"conteo","target":"Contratación de personal fuera del proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:29:16.746	2026-03-23 17:17:27.629	=	no_critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a89fb00e1hkdod1ez9efg	UNIDAD-SENIOR-MN3A89E5	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Aprobación de gastos fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Aprobación de gastos fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:29:43.991	2026-03-23 17:17:51.78	=	no_critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3a9jw700e3hkdoq2oaeloj	UNIDAD-SENIOR-MN3A9JV3	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:30:44.215	2026-03-23 17:18:23.582	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3advn100ebhkdo2vh6se44	INGENI-COORDI-MN3ADVLV	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 14:34:06.061	2026-03-23 14:34:06.061	>=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3aejsd00edhkdoiwav7b2a	INGENI-COORDI-MN3AEJR5	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Retrabajos	\N	conteo	{"tipo":"conteo","target":"Retrabajos"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:34:37.357	2026-03-23 14:34:37.357	<=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3aisb700efhkdoae5l71tb	INGENI-COORDI-MN3AISA1	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	NCR (No Conformidades Recibidas)	\N	conteo	{"tipo":"conteo","target":"NCR (No Conformidades Recibidas)"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 14:37:55.027	2026-03-23 14:37:55.027	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3ajoqx00ehhkdog6hm64tb	INGENI-COORDI-MN3AJOPN	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Accidentes	\N	conteo	{"tipo":"conteo","target":"Accidentes"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 14:38:37.065	2026-03-23 14:38:37.065	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3akhoy00ejhkdoxdhflva7	INGENI-COORDI-MN3AKHNO	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:39:14.578	2026-03-23 14:39:14.578	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3akvxn00elhkdool87oxpv	INGENI-COORDI-MN3AKVWL	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Elaboración de planes de acción	\N	conteo	{"tipo":"conteo","target":"Elaboración de planes de acción"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 14:39:33.035	2026-03-23 14:39:33.035	>	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3alp7e00enhkdo5sm0hkuq	INGENI-COORDI-MN3ALP6B	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Reuniones de trabajo con Ingenieros Residentes	\N	conteo	{"tipo":"conteo","target":"Reuniones de trabajo con Ingenieros Residentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:40:10.971	2026-03-23 14:40:10.971	=	no_critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3am5nn00ephkdows3qre5o	INGENI-COORDI-MN3AM5MJ	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Adjudicar contratos u obras fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Adjudicar contratos u obras fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:40:32.291	2026-03-23 14:40:32.291	=	no_critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3an2a500erhkdo3uw6mrd7	INGENI-COORDI-MN3AN294	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Contratación de personal fuera del proceso	\N	conteo	{"tipo":"conteo","target":"Contratación de personal fuera del proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:41:14.573	2026-03-23 14:41:14.573	=	no_critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3anwsc00ethkdooc5m8anp	INGENI-COORDI-MN3ANWRA	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Aprobación de gastos fuera de proceso	\N	conteo	{"tipo":"conteo","target":"Aprobación de gastos fuera de proceso"}	0	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:41:54.108	2026-03-23 14:41:54.108	=	no_critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3aom7i00evhkdohu6yc0ar	INGENI-COORDI-MN3AOM5Y	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:42:27.05	2026-03-23 14:42:27.05	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3ap0wg00exhkdolltn4o8i	INGENI-COORDI-MN3AP0U9	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 14:42:46.096	2026-03-23 14:42:46.096	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3aph4e00ezhkdoaxuzhquq	INGENI-COORDI-MN3APH39	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Análisis de riesgos de ejecución mensuales	\N	conteo	{"tipo":"conteo","target":"Análisis de riesgos de ejecución mensuales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:43:07.118	2026-03-23 14:43:07.118	=	no_critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3apysf00f1hkdohev0o143	INGENI-COORDI-MN3APYRB	Ingeniería-Diseño	5bf14aac-20bf-440a-8210-752e98edd3ee	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:43:30.015	2026-03-23 14:43:30.015	=	critico	ca9b6ea1-b19c-4886-95be-e779b4bd7330	f	0
cmn3auew800f3hkdocl9s4n7b	UNIDAD-INGENI-MN3AUETJ	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-23 14:46:57.512	2026-03-23 14:46:57.512	>=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3ava3m00f5hkdomjs328u8	UNIDAD-INGENI-MN3AVA1V	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Planes de acción ejecutados	\N	conteo	{"tipo":"conteo","target":"Planes de acción ejecutados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:47:37.954	2026-03-23 14:47:37.954	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3aw52200f7hkdodqx2b425	UNIDAD-INGENI-MN3AW4XN	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:48:18.074	2026-03-23 14:48:18.074	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3b82og00f9hkdou31q4jsp	UNIDAD-INGENI-MN3B82GB	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Reporte de incidencias de seguridad	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de seguridad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:57:34.863	2026-03-23 14:57:34.863	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3b9r5g00fbhkdoj181o2yj	UNIDAD-INGENI-MN3B9R4G	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:58:53.237	2026-03-23 14:58:53.237	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3aab7c00e5hkdoory7fqt8	UNIDAD-SENIOR-MN3AAB68	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 14:31:19.609	2026-03-23 17:18:48.86	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3abrxo00e9hkdo6jhjyp26	UNIDAD-SENIOR-MN3ABRWL	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:32:27.948	2026-03-23 17:19:14.152	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3balwr00fdhkdog23o7ize	UNIDAD-INGENI-MN3BALVB	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Reporte de incidencias de proyecto	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:59:33.098	2026-03-23 14:59:33.098	=	no_critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3bbb5a00ffhkdorm7l86ca	UNIDAD-INGENI-MN3BBB49	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:00:05.807	2026-03-23 15:00:05.807	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3bd8bo00fhhkdot1j00evg	UNIDAD-INGENI-MN3BD89P	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Accidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"Accidentes de trabajo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:01:35.461	2026-03-23 15:01:35.461	=	critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3be6yy00fjhkdo3cevkaj2	UNIDAD-INGENI-MN3BE6XC	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:02:20.362	2026-03-23 15:02:20.362	=	no_critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3bfcdk00flhkdo0o0w1idn	UNIDAD-INGENI-MN3BFC9T	Unidad Civil	923edd2b-80bb-4d16-a5c6-4ee2871335ce	Inspección de material/equipo al llegar a sitio	\N	conteo	{"tipo":"conteo","target":"Inspección de material/equipo al llegar a sitio"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:03:14.024	2026-03-23 15:03:14.024	=	no_critico	8f13dde6-eb52-4a36-99a4-a07946b016d6	f	0
cmn3ct1q600fnhkdo4u2nrz09	UNIDAD-INGENI-MN3CT1PH	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reportes diarios	\N	conteo	{"tipo":"conteo","target":"Reportes diarios"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 15:41:53.021	2026-03-23 15:41:53.021	>=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3ctko300fphkdod9s2zzjj	UNIDAD-INGENI-MN3CTKNG	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-23 15:42:17.572	2026-03-23 15:42:17.572	>=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cu1mz00frhkdocwqb6okf	UNIDAD-INGENI-MN3CU1MB	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Planes de acción ejecutados	\N	conteo	{"tipo":"conteo","target":"Planes de acción ejecutados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:42:39.563	2026-03-23 15:42:39.563	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cuka600fthkdofxhjanj9	UNIDAD-INGENI-MN3CUKA2	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:43:03.727	2026-03-23 15:43:03.727	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cv1z500fvhkdoz0diviuc	UNIDAD-INGENI-MN3CV1Y4	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reporte de incidencias de seguridad	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de seguridad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:43:26.657	2026-03-23 15:43:26.657	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cvtyp00fxhkdo8om3i71w	UNIDAD-INGENI-MN3CVTXC	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:44:02.929	2026-03-23 15:44:02.929	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cwf9n00fzhkdo6jp22v63	UNIDAD-INGENI-MN3CWF8O	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reporte de incidencias de proyecto	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:44:30.539	2026-03-23 15:44:30.539	=	no_critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cwww100g1hkdouvcziz8l	UNIDAD-INGENI-MN3CWWV3	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:44:53.377	2026-03-23 15:44:53.377	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cxf0r00g3hkdoah8c2zo1	UNIDAD-INGENI-MN3CXEZX	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Accidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"Accidentes de trabajo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:45:16.875	2026-03-23 15:45:16.875	=	critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cxx3a00g5hkdoviq8rozc	UNIDAD-INGENI-MN3CXX2C	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:45:40.294	2026-03-23 15:45:40.294	=	no_critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3cycnn00g7hkdo433oe22w	UNIDAD-INGENI-MN3CYCMM	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Inspección de material/equipo al llegar a sitio	\N	conteo	{"tipo":"conteo","target":"Inspección de material/equipo al llegar a sitio"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:46:00.467	2026-03-23 15:46:00.467	=	no_critico	69239f58-ae3f-4b23-a6df-6b598704bfd1	f	0
cmn3d0spe00g9hkdox9a92sh8	UNIDAD-SUPERV-MN3D0SNF	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Atender/Elaborar OT diario	\N	conteo	{"tipo":"conteo","target":"Atender/Elaborar OT diario"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:47:54.578	2026-03-23 15:47:54.578	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d1of300gbhkdog3s0w195	UNIDAD-SUPERV-MN3D1OC0	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-23 15:48:35.679	2026-03-23 15:48:35.679	>=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d64ty00gdhkdoilpmbre1	UNIDAD-SUPERV-MN3D64Q9	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Planes de acción ejecutados	\N	conteo	{"tipo":"conteo","target":"Planes de acción ejecutados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:52:03.574	2026-03-23 15:52:03.574	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d6tmp00gfhkdoxh11g1k1	UNIDAD-SUPERV-MN3D6TL6	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:52:35.713	2026-03-23 15:52:35.713	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d7la200ghhkdoy94qwxn3	UNIDAD-SUPERV-MN3D7L88	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Reporte de incidencias de seguridad	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de seguridad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:53:11.546	2026-03-23 15:53:11.546	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d7zym00gjhkdoumg4w7kf	UNIDAD-SUPERV-MN3D7ZWV	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Reporte de incidencias de proyecto	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 15:53:30.574	2026-03-23 15:53:30.574	=	no_critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d8ihv00glhkdoqdkycnst	UNIDAD-SUPERV-MN3D8IGN	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:53:54.596	2026-03-23 15:53:54.596	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3d8zer00gnhkdoxgaffg7u	UNIDAD-SUPERV-MN3D8ZDG	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Accidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"Accidentes de trabajo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 15:54:16.515	2026-03-23 15:54:16.515	=	critico	5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	f	0
cmn3dgkr200gphkdocbhedxhq	ALMACE-ALMACE-MN3DGKOL	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Inventario actualizado	\N	conteo	{"tipo":"conteo","target":"Inventario actualizado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:00:10.766	2026-03-23 16:00:10.766	=	critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3dniff00grhkdoth8wj2yn	ALMACE-ALMACE-MN3DNIC2	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Pérdidas	\N	conteo	{"tipo":"conteo","target":"Pérdidas"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 16:05:34.347	2026-03-23 16:05:34.347	=	critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3dt9wa00gthkdomvot37vc	ALMACE-ALMACE-MN3DT9SZ	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Reporte de incidencias	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:10:03.225	2026-03-23 16:10:03.225	=	no_critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3eia2300gvhkdobfr3fk55	ALMACE-ALMACE-MN3EI9U0	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Ejecución de plan de almacenamiento	\N	conteo	{"tipo":"conteo","target":"Ejecución de plan de almacenamiento"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:29:29.832	2026-03-23 16:29:29.832	=	no_critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3ekgay00gxhkdohd7n5fj5	ALMACE-ALMACE-MN3EKG6X	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Integración del almacén en el ERP	\N	conteo	{"tipo":"conteo","target":"Integración del almacén en el ERP"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:31:11.24	2026-03-23 16:31:11.24	=	critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3eur6v00gzhkdoo9alaci9	ALMACE-ALMACE-MN3EUR3B	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Almacenamiento adecuado	\N	conteo	{"tipo":"conteo","target":"Almacenamiento adecuado "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:39:11.909	2026-03-23 16:39:11.909	=	critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3ex8wl00h1hkdoyorxns92	ALMACE-ALMACE-MN3EX8TS	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Señalización del producto en almacén	\N	conteo	{"tipo":"conteo","target":"Señalización del producto en almacén"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:41:08.181	2026-03-23 16:41:08.181	=	no_critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3ey30600h3hkdo32d0yzss	ALMACE-ALMACE-MN3EY2XD	Almacen	c921aca9-eabc-4246-a9e4-2ed890587ad1	Control de entradas/salidas de materiales, herramientas, insumos	\N	conteo	{"tipo":"conteo","target":"Control de entradas/salidas de materiales, herramientas, insumos"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:41:47.19	2026-03-23 16:41:47.19	=	critico	843ae3c3-585c-41df-8fb7-22e8b45adbe6	f	0
cmn3f0ai900h5hkdojthxubpj	UNIDAD-TECNIC-MN3F0AF2	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Atender OT diario	\N	conteo	{"tipo":"conteo","target":"Atender OT diario"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:43:30.225	2026-03-23 16:43:30.225	=	critico	2368972b-83ca-4232-b31f-98e5f88d272a	f	0
cmn3f1tqo00h7hkdof3xu41rd	UNIDAD-TECNIC-MN3F1TL5	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reporte de incidencias de seguridad	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de seguridad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:44:41.809	2026-03-23 16:44:41.809	=	no_critico	2368972b-83ca-4232-b31f-98e5f88d272a	f	0
cmn3f2npp00h9hkdovo8zdgkc	UNIDAD-TECNIC-MN3F2NM0	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Reporte de incidencias de proyecto	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 16:45:20.653	2026-03-23 16:45:20.653	=	no_critico	2368972b-83ca-4232-b31f-98e5f88d272a	f	0
cmn3f36xd00hbhkdo7g8zlcte	UNIDAD-TECNIC-MN3F36UV	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 16:45:45.553	2026-03-23 16:45:45.553	=	critico	2368972b-83ca-4232-b31f-98e5f88d272a	f	0
cmn3f3unn00hdhkdoht6mfau0	UNIDAD-TECNIC-MN3F3UL4	Unidad Electrica	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Accidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"Accidentes de trabajo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 16:46:16.307	2026-03-23 16:46:16.307	=	critico	2368972b-83ca-4232-b31f-98e5f88d272a	f	0
cmn3abdxv00e7hkdouhvirix5	UNIDAD-SENIOR-MN3ABDWS	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Análisis de riesgos de ejecución mensuales	\N	conteo	{"tipo":"conteo","target":"Análisis de riesgos de ejecución mensuales"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 14:32:09.811	2026-03-23 16:51:55.8	=	no_critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3g0xhs00hfhkdohu6aw8iy	UNIDAD-SENIOR-MN3G0XET	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 17:11:59.631	2026-03-23 17:11:59.631	>=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3g1luo00hhhkdoc4ffbrip	UNIDAD-SENIOR-MN3G1LSD	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Retrabajos	\N	conteo	{"tipo":"conteo","target":"Retrabajos"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:12:31.2	2026-03-23 17:12:31.2	<=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3g261i00hjhkdo0cgw7vfg	UNIDAD-SENIOR-MN3G25ZG	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	NCR (No Conformidades Recibidas)	\N	conteo	{"tipo":"conteo","target":"NCR (No Conformidades Recibidas)"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:12:57.366	2026-03-23 17:12:57.366	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3g2xmr00hlhkdoi3kurusa	UNIDAD-SENIOR-MN3G2XKI	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Accidentes	\N	conteo	{"tipo":"conteo","target":"Accidentes"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:13:33.124	2026-03-23 17:13:33.124	=	critico	4391a454-1349-4118-b2e5-7a82cf82c444	f	0
cmn3gk5ln00hnhkdoh8lg69v3	CALIDA-INGENI-MN3GK5I0	Calidad	4908b343-924e-44d0-a529-afe75f4b8e23	Rechazos	\N	conteo	{"tipo":"conteo","target":"Rechazos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:26:56.602	2026-03-23 17:26:56.602	=	no_critico	3894d976-60b0-4664-acf2-9b32281c211d	f	0
cmn3gla9200hphkdoytld77fm	CALIDA-INGENI-MN3GLA52	Calidad	4908b343-924e-44d0-a529-afe75f4b8e23	Gestión de documentación técnica en campo	\N	conteo	{"tipo":"conteo","target":"Gestión de documentacion tecnica en campo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:27:49.286	2026-03-23 17:27:49.286	=	critico	3894d976-60b0-4664-acf2-9b32281c211d	f	0
cmn3l5cky00izhkdo5zlaykhm	UNIDAD-INGENI-MN3L5CHT	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 19:35:23.891	2026-03-23 19:35:23.891	=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3gmals00hrhkdom9tsr1vz	CALIDA-INGENI-MN3GMAE2	Calidad	4908b343-924e-44d0-a529-afe75f4b8e23	Llenado de formatos de calidad de construcción	\N	conteo	{"tipo":"conteo","target":"Llenado de formatos de calidad de construcción"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:28:36.4	2026-03-23 17:28:36.4	=	critico	3894d976-60b0-4664-acf2-9b32281c211d	f	0
cmn3gn3q000hthkdo4hm2jwco	CALIDA-INGENI-MN3GN3NJ	Calidad	4908b343-924e-44d0-a529-afe75f4b8e23	NCR repetitivos	\N	conteo	{"tipo":"conteo","target":"NCR repetitivos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:29:14.136	2026-03-23 17:29:14.136	=	critico	3894d976-60b0-4664-acf2-9b32281c211d	f	0
cmn3go4ub00hvhkdo0nid7eaa	CALIDA-INGENI-MN3GO4RU	Calidad	4908b343-924e-44d0-a529-afe75f4b8e23	Reporte de Incidencias de Calidad	\N	conteo	{"tipo":"conteo","target":"Reporte de Incidencias de Calidad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:30:02.243	2026-03-23 17:30:02.243	=	critico	3894d976-60b0-4664-acf2-9b32281c211d	f	0
cmn3gs9sr00hxhkdom371nmbn	UNIDAD-INGENI-MN3GS9QC	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Reportes diarios	\N	conteo	{"tipo":"conteo","target":"Reportes diarios"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 17:33:15.292	2026-03-23 17:33:15.292	>=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h0zha00hzhkdoqchxoct5	UNIDAD-INGENI-MN3H0ZEK	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	90	10	100	mensual	Mayor es mejor	%	0	t	2026-03-23 17:40:01.819	2026-03-23 17:40:01.819	>=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h1h1p00i1hkdo0sn1rjxj	UNIDAD-INGENI-MN3H1GZX	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Planes de acción ejecutados	\N	conteo	{"tipo":"conteo","target":"Planes de acción ejecutados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:40:24.59	2026-03-23 17:40:24.59	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h21ec00i3hkdo97g0ayaq	UNIDAD-INGENI-MN3H21C5	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Uso de planos vigentes	\N	conteo	{"tipo":"conteo","target":"Uso de planos vigentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:40:50.965	2026-03-23 17:40:50.965	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h2wgg00i5hkdo9j0ve1qk	UNIDAD-INGENI-MN3H2WEE	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Reporte de incidencias de seguridad	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de seguridad"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:41:31.217	2026-03-23 17:41:31.217	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h3f0o00i7hkdoulqb4ba1	UNIDAD-INGENI-MN3H3EYV	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Uso del ERP y Procore en la gestión	\N	conteo	{"tipo":"conteo","target":"Uso del ERP y Procore en la gestión"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:41:55.272	2026-03-23 17:41:55.272	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h3tjx00i9hkdos6udhn1m	UNIDAD-INGENI-MN3H3TIF	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Reporte de incidencias de proyecto	\N	conteo	{"tipo":"conteo","target":"Reporte de incidencias de proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:42:14.11	2026-03-23 17:42:14.11	=	no_critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h4eh200ibhkdo0bepc13t	UNIDAD-INGENI-MN3H4EE7	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Daño de activos	\N	conteo	{"tipo":"conteo","target":"Daño de activos"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:42:41.222	2026-03-23 17:42:41.222	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h4vth00idhkdo08ope78z	UNIDAD-INGENI-MN3H4VRY	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Accidentes de trabajo	\N	conteo	{"tipo":"conteo","target":"Accidentes de trabajo"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 17:43:03.701	2026-03-23 17:43:03.701	=	critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3h5gnn00ifhkdoz6n9z0ok	UNIDAD-INGENI-MN3H5GLE	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Documentación para cobro/pago estimaciones	\N	conteo	{"tipo":"conteo","target":"Documentación para cobro/pago estimaciones"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:43:30.707	2026-03-23 17:43:30.707	=	no_critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3hkxjg00ihhkdophr39avn	UNIDAD-INGENI-MN3HKXHS	Unidad Mecanica	2dcf6888-74fc-4ed7-8963-eb1003650dfc	Inspección de material/equipo al llegar a sitio	\N	conteo	{"tipo":"conteo","target":"Inspección de material/equipo al llegar a sitio"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 17:55:32.427	2026-03-23 17:55:32.427	=	no_critico	da9b460a-6070-4286-9138-14726f795b74	f	0
cmn3l1uo200ijhkdorh0x30rd	UNIDAD-INGENI-MN3L1UKU	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Avance vs plan	\N	conteo	{"tipo":"conteo","target":"Avance vs plan"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 19:32:40.704	2026-03-23 19:32:40.704	>=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l2bo500ilhkdo2b3bpl38	UNIDAD-INGENI-MN3L2BKY	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Cambios con ECN	\N	conteo	{"tipo":"conteo","target":"Cambios con ECN"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:33:02.741	2026-03-23 19:33:02.741	=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l2puf00inhkdo7nu8y9xp	UNIDAD-INGENI-MN3L2PR6	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Retrabajos de ingeniería	\N	conteo	{"tipo":"conteo","target":"Retrabajos de ingeniería"}	3	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:33:21.111	2026-03-23 19:33:21.111	<=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l34ip00iphkdomwumaxbc	UNIDAD-INGENI-MN3L34FM	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Reportes diarios	\N	conteo	{"tipo":"conteo","target":"Reportes diarios"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 19:33:40.13	2026-03-23 19:33:40.13	>=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l3jaq00irhkdonbbbtcd4	UNIDAD-INGENI-MN3L3J74	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Cumplimiento plan semanal	\N	conteo	{"tipo":"conteo","target":"Cumplimiento plan semanal"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 19:33:59.283	2026-03-23 19:33:59.283	>=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l44jp00ithkdovi70k3s0	UNIDAD-INGENI-MN3L44G6	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Planes de acción ejecutados	\N	conteo	{"tipo":"conteo","target":"Planes de acción ejecutados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:34:26.821	2026-03-23 19:34:26.821	=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l4kcl00ivhkdoj5so5lm2	UNIDAD-INGENI-MN3L4K9G	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Uso de Plataforma Procore	\N	conteo	{"tipo":"conteo","target":"Uso de Plataforma Procore"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:34:47.301	2026-03-23 19:34:47.301	=	no_critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l4xz700ixhkdowvgxeg4t	UNIDAD-INGENI-MN3L4XVX	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Tiempo ECN	\N	conteo	{"tipo":"conteo","target":"Tiempo ECN"}	5	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 19:35:04.963	2026-03-23 19:35:04.963	<=	critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3l5rl600j1hkdopsklnjv7	UNIDAD-INGENI-MN3L5RHX	Unidad de Ingeniería - Líneas	7c631196-ec9b-4751-ac5d-4e4671056c36	Ingeniería cerrada por proyecto	\N	conteo	{"tipo":"conteo","target":"Ingeniería cerrada por proyecto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:35:43.338	2026-03-23 19:35:43.338	=	no_critico	77137125-a1cc-43b8-8461-8c6f742e95a7	f	0
cmn3lpluk00j3hkdois9o45z8	PMO-ADMINI-MN3LPLNM	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Compras bajo presupuesto	\N	conteo	{"tipo":"conteo","target":"Compras bajo presupuesto"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:51:09.017	2026-03-23 19:51:09.017	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lqa0m00j5hkdoxaebftz3	PMO-ADMINI-MN3LQ9X5	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Incidentes reportados	\N	conteo	{"tipo":"conteo","target":"Incidentes reportados"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:51:40.342	2026-03-23 19:51:40.342	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lr0lv00j7hkdotnwc0z7e	PMO-ADMINI-MN3LR0I1	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Presentación de informes diarios	\N	conteo	{"tipo":"conteo","target":"Presentación de informes diarios"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:52:14.803	2026-03-23 19:52:14.803	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lsgoi00j9hkdo1ipglkkm	PMO-ADMINI-MN3LSGKY	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Control de pago de maquinaria en sitio	\N	conteo	{"tipo":"conteo","target":"Control de pago de maquinaria en sitio"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:53:22.29	2026-03-23 19:53:22.29	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3ltig000jbhkdoaanu7qc7	PMO-ADMINI-MN3LTICI	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Control de pago de Planillas en sitio	\N	conteo	{"tipo":"conteo","target":"Control de pago de Planillas en sitio"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:54:11.232	2026-03-23 19:54:11.232	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lu9px00jdhkdos1nukj7d	PMO-ADMINI-MN3LU9MR	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reporte confiable de uso de Caja Chica	\N	conteo	{"tipo":"conteo","target":"Reporte confiable de uso de Caja Chica"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:54:46.581	2026-03-23 19:54:46.581	=	critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lvk9200jfhkdoxjiok9gv	PMO-ADMINI-MN3LVJZM	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reporte sobre gestión de almacén	\N	conteo	{"tipo":"conteo","target":"Reporte sobre gestion de almacen"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:55:46.887	2026-03-23 19:55:46.887	=	no_critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3lxbr300jhhkdo6h0r3632	PMO-ADMINI-MN3LXBKM	PMO	947566df-cd44-4ea7-aeb2-2adbc1b73a25	Reclamos por no brindar apoyo al Ingeniero Residente	\N	conteo	{"tipo":"conteo","target":"Reclamos por no brindar apoyo al Ingeniero Residente"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 19:57:09.183	2026-03-23 19:57:09.183	=	no_critico	a1833a07-7ceb-496b-bcee-362b10c5eb28	f	0
cmn3ma9dd00jlhkdo7f24bz02	SYSO-OFICIA-MN3MA99H	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Registro de incidentes menores	\N	conteo	{"tipo":"conteo","target":"Registro de incidentes menores"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:07:12.625	2026-03-23 20:07:12.625	=	no_critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3m97qg00jjhkdov9ifepzb	SYSO-OFICIA-MN3M97LW	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Accidentes mayores	\N	conteo	{"tipo":"conteo","target":"Ocurrencia de accidentes mayores=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 20:06:23.846	2026-03-23 20:07:55.712	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mckqu00jnhkdouldhd9mt	SYSO-OFICIA-MN3MCKKF	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Planes de acción por accidentes/incidentes	\N	conteo	{"tipo":"conteo","target":"Planes de acción propuestos y ejecutados < 5 dias"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:09:00.676	2026-03-23 20:09:00.676	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mjm0e00jphkdoypf4an93	SYSO-OFICIA-MN3MJLU6	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Uso de EPP con identificacion	\N	conteo	{"tipo":"conteo","target":"registro de Personal Usando EPP=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:14:28.908	2026-03-23 20:14:28.908	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mkhnr00jrhkdodbwawd2h	SYSO-OFICIA-MN3MKHJK	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Charlas de Seguridad	\N	conteo	{"tipo":"conteo","target":"Charlas impartidas conforme a PDT=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:15:09.928	2026-03-23 20:15:09.928	=	no_critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mo3xs00jthkdoyaow2npp	SYSO-OFICIA-MN3MO3RP	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Medición de Riesgos	\N	conteo	{"tipo":"conteo","target":"Medición de Riesgos "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:17:58.767	2026-03-23 20:17:58.767	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3msw7400jvhkdoz6rhz6xw	SYSO-OFICIA-MN3MSVW6	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorias de SYSO	\N	conteo	{"tipo":"conteo","target":"Ejecución de auditorías conforme a requerimiento=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:21:42.013	2026-03-23 20:21:42.013	=	no_critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mu1e200jxhkdo3ehjc7yf	SYSO-OFICIA-MN3MU1A4	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Certificaciones actualizadas	\N	conteo	{"tipo":"conteo","target":"Certificación conforme a PDT=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:22:35.403	2026-03-23 20:22:35.403	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3muwiz00jzhkdo6wm2h3pd	SYSO-OFICIA-MN3MUWFH	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Aseguramiento de seguros contra accidentes al día	\N	conteo	{"tipo":"conteo","target":"Personal asegurado=100%"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:23:15.755	2026-03-23 20:23:15.755	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mw4bv00k1hkdoej85kbti	SYSO-OFICIA-MN3MW47L	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Investigación de accidentes	\N	division	{"tipo":"division","numerador":"Informes de incidentes","denominador":"accidentes","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:24:12.523	2026-03-23 20:24:12.523	=	critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mx24i00k3hkdoywh2ktkj	SYSO-OFICIA-MN3MX21B	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Informe de investigación preliminar	\N	conteo	{"tipo":"conteo","target":"Informe entregado < 24 hrs"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:24:56.322	2026-03-23 20:24:56.322	=	no_critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3mxyr400k5hkdohulyl6ul	SYSO-OFICIA-MN3MXYNB	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Informe de investigación definitivo	\N	conteo	{"tipo":"conteo","target":"Informe entregado < 96 hrs"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 20:25:38.609	2026-03-23 20:25:38.609	=	no_critico	54fc159d-2b2a-4557-8dc4-1049ee806b15	f	0
cmn3ozzrc00k7hkdob7d5j0yq	LOGIST-CONSER-MN3OZZNM	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Cumplimiento de diligencias en tiempo	\N	division	{"tipo":"division","numerador":"Diligencias realizadas en tiempo ","denominador":" Total de diligencias asignadas","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 21:23:12.455	2026-03-23 21:23:12.455	>=	no_critico	ff48062b-6108-4e20-a42a-7f6d08906ca3	f	0
cmn3p15qn00k9hkdokcckvgq2	LOGIST-CONSER-MN3P15N2	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Cumplimiento de rutas planificadas	\N	division	{"tipo":"division","numerador":"Rutas ejecutadas sin retraso ","denominador":" Total rutas asignadas ","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-23 21:24:06.863	2026-03-23 21:24:06.863	>=	no_critico	ff48062b-6108-4e20-a42a-7f6d08906ca3	f	0
cmn3p1x9l00kbhkdorxc2zpa8	LOGIST-CONSER-MN3P1X4Z	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Incidencias por mal uso del vehículo	\N	conteo	{"tipo":"conteo","target":"Incidencias por mal uso del vehículo=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 21:24:42.537	2026-03-23 21:24:42.537	=	critico	ff48062b-6108-4e20-a42a-7f6d08906ca3	f	0
cmn3p2y5700kdhkdoexouo5q1	LOGIST-CONSER-MN3P2Y1C	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Cumplimiento de revisiones del vehículo	\N	division	{"tipo":"division","numerador":"Revisiones realizadas ","denominador":" Revisiones programadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-23 21:25:30.331	2026-03-23 21:25:30.331	=	critico	ff48062b-6108-4e20-a42a-7f6d08906ca3	f	0
cmn3p3xrv00kfhkdokjy7h47u	LOGIST-LOGIST-MN3P3XO7	Logistica	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Cumplimiento de normas de tránsito y cero infracciones	\N	conteo	{"tipo":"conteo","target":"Cumplimiento de normas de tránsito y cero infracciones=0"}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-23 21:26:16.508	2026-03-23 21:26:16.508	=	critico	c497c878-1300-40e1-af43-682ca2d5f8c9	f	0
cmn4tkgcj0001hkkg0zu092ha	SYSO-AUXILI-MN4TKG8U	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Cumplimiento del plan de mantenimiento preventivo	\N	conteo	{"tipo":"conteo","target":" Ejecución del plan de mantenimiento preventivo 100%"}	100	-1	99	mensual	Mayor es mejor	%	0	t	2026-03-24 16:18:51.71	2026-03-24 16:18:51.71	=	critico	4a2ea03d-ffd4-4160-895a-26db0d70fd3e	f	0
cmn4to6eg0003hkkgkqnjkt05	SYSO-AUXILI-MN4TO667	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Ejecucion de solicitudes correctivas	\N	conteo	{"tipo":"conteo","target":"Ejecución de solicitud 100% "}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-24 16:21:45.447	2026-03-24 16:21:45.447	=	critico	4a2ea03d-ffd4-4160-895a-26db0d70fd3e	f	0
cmn4tpaof0005hkkgmqor7m5w	SYSO-AUXILI-MN4TPAIW	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Retrabajos	\N	conteo	{"tipo":"conteo","target":"Retrabajos "}	0	0	\N	mensual	Menor es mejor	%	0	t	2026-03-24 16:22:37.647	2026-03-24 16:22:37.647	=	no_critico	4a2ea03d-ffd4-4160-895a-26db0d70fd3e	f	0
cmmuozewt000bhkgcvmbvr3s7	INTELI-ANALIS-MMUOZEUF	Inteligencia de Negocios	7216c1ae-8e48-4956-83b1-fdc347ef591e	Tiempo de desarrollo Tecnologico funcional	El usuario solicita el tiempo en que debe de entregarse	division	{"tipo":"division","numerador":"Tiempo Real gastado","denominador":" Tiempo pactado de entrega","multiplicador":100,"invertir":false}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-17 14:12:49.853	2026-03-24 17:04:08.223	>=	critico	47caf69f-2485-4788-a3e9-ce5605cb2502	f	0
cmmw7jye90025hk6kkrss45qf	CONTAB-ANALIS-MMW7JYDP	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Evaluaciones financieras	\N	binario	{"tipo":"binario","descripcion":"Evaluaciones financieras de inversion"}	95	3	98	mensual	Mayor es mejor	%	0	t	2026-03-18 15:40:27.49	2026-03-24 21:29:58.451	>	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	t	48
cmn50ajo40007hkbwupdbxzxb	CONTAB-ANALIS-MN50AJML	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Modelos financieros	Análisis estratégico	binario	{"tipo":"binario","descripcion":"Preparación modelo financiero bancable"}	95	5	100	mensual	Mayor es mejor	%	0	t	2026-03-24 19:27:06.772	2026-03-24 21:30:12.662	>=	no_critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	t	48
cmmw9hths003fhk6klvd62f8e	CONTAB-ANALIS-MMW9HTGA	Contabilidad	a9780486-f1ab-41e8-9d5f-c016d666b1ff	Informes (Dashboards)	\N	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 16:34:47.056	2026-03-24 21:30:35.513	=	critico	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	t	24
cmmwaa2di003zhk6kzrehlfjz	FLOTAV-ENCARG-MMWAA2CS	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Registro de presupuesto de mantenimiento correctivo mayor	\N	binario	{"tipo":"binario","descripcion":"Registro de costo de mantenimiento correctivo mayor por vehiculo"}	100	0	93	mensual	Mayor es mejor	%	0	t	2026-03-18 16:56:44.934	2026-03-24 21:35:34.766	=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmn50inyj000hhkbwqa8nk61f	FLOTAV-ENCARG-MN50INWZ	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Registro de presupuesto de mantenimiento preventivo	Registro de costo de mantenimiento preventivo por vehiculo	binario	{"tipo":"binario","descripcion":"Registro de costo de mantenimiento preventivo por vehiculo"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-24 19:33:25.58	2026-03-24 21:35:53.079	>=	no_critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	24
cmmwb9v03004jhk6kogj6cge4	FLOTAV-ENCARG-MMWB9UYK	Flota Vehicular	808be458-29be-48b6-9cac-87acaee84d4f	Gestión y cuidado de los activos de la empresa	Aplicación de reglamento de flota vehicular	division	{"tipo":"division","numerador":"Casos con deduccion o acta de responsabilidad aplicada","denominador":"casos de daño atribuible al usuario","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 17:24:34.995	2026-03-24 21:40:13.171	>=	critico	f9e2962e-8625-4a87-8766-87d936da8f0a	t	48
cmmwhfqf10051hk6k0ypih7m4	ISO-GESTOR-MMWHFQDG	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Medición de retrabajos o reprocesos por áreas	Entrega de Dashboard de KPIs por retrabajo/reproceso del 100% areas	dashboard_presentado	{"tipo":"dashboard_presentado"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:17:06.685	2026-03-24 21:42:17.239	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	24
cmmwib24n0059hk6kmmv1x24q	ISO-GESTOR-MMWIB224	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Auditoria de 5S	\N	binario	{"tipo":"binario","descripcion":"Auditar el 100% de las areas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:41:28.199	2026-03-24 21:42:42.809	=	no_critico	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	t	72
cmmwigz7b005fhk6kbzg0omhp	ISO-OFICIA-MMWIGZ6L	ISO	fe4cd906-3b58-488b-83c2-fe905be1b30f	Registro de ejecución de acciones correctivas	\N	division	{"tipo":"division","numerador":"Acciones correctivas con seguimiento oportuno y evidencia cargada","denominador":"Total acciones asignadas","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 20:46:04.343	2026-03-24 21:43:35.915	>=	critico	05207495-2ab9-43a1-b24d-bf093614c3f8	t	72
cmmxpk59l003nhkdog8fd8wem	SYSO-GESTOR-MMXPK58X	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Reporte del incidente	\N	binario	{"tipo":"binario","descripcion":"Numero de reportes de incidentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 16:52:15.657	2026-03-24 21:46:21.756	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	4
cmmv39k5n0017hk5k2vox6li8	AREAAD-GERENC-MMV39K52	Área Administrativa	6827e3ee-7821-49c9-9132-241b6b91a255	Registro y alarmas de incidentes	\N	binario	{"tipo":"binario","descripcion":"Reportes de incidentes"}	100	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-17 20:52:37.835	2026-03-24 21:29:09.347	=	critico	77a1f5ff-15f2-418f-b2d1-fb97a18de52a	t	48
cmmwj15w30067hk6k32ih1hcx	SYSO-GESTOR-MMWJ15VG	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorías internas/externas, al menos 2 por semana	\N	binario	{"tipo":"binario","descripcion":"Entrega de informes de auditorias ejecutadas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-18 21:01:46.132	2026-03-24 21:47:45.689	=	no_critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	24
cmmwj596l006hhk6kmvbvt81x	SYSO-GESTOR-MMWJ595Z	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Cumplimiento legal SYSO	\N	division	{"tipo":"division","numerador":"Requisistos legales y acciones SYSO cumplidos y cerrados en plazo","denominador":"Total aplicables","multiplicador":100,"invertir":false}	95	5	100	trimestral	Mayor es mejor	%	0	t	2026-03-18 21:04:57.021	2026-03-24 21:48:45.961	>=	critico	d58ed957-8eee-4a7f-9cf6-cb340ea1a814	t	120
cmn51p8ih000thkbw25sf8bkq	SYSO-OFICIA-MN51P8HT	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorías internas / externas, al menos 2 por semana	\N	binario	{"tipo":"binario","descripcion":"Entrega de informe de auditorías ejecutadas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-24 20:06:31.77	2026-03-24 21:53:20.094	=	critico	ff7d3e82-3b5b-4101-b900-53951817a187	t	72
cmn51n4dv000rhkbwjuku5pco	SYSO-OFICIA-MN51N4D6	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Reporte del incidente	\N	binario	{"tipo":"binario","descripcion":"Numero de reportes de incidentes"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-24 20:04:53.108	2026-03-24 21:54:39.71	=	no_critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	4
cmmxq5muy003xhkdowkrpsbc2	SYSO-OFICIA-MMXQ5MTA	SYSO	871edc75-df17-4922-ac8f-95af5c770f85	Auditorías internas / externas, al menos 2 por semana	\N	binario	{"tipo":"binario","descripcion":"Entrega de informe de auditorías ejecutadas"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-19 17:08:58.235	2026-03-24 21:55:23.706	=	critico	b4409975-ef69-45e8-a0e9-7aa80d29aa3d	t	72
cmmz46hqj00a1hkdoqcpdm7uf	RRHH-ASISTE-MMZ46HPW	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Cumplimiento de solicitudes de RRHH	\N	binario	{"tipo":"binario","descripcion":"Numero de solicitudes atendidas segun requerimiento"}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:29:19.052	2026-03-24 21:56:39.972	=	critico	a4c07a43-ab93-4467-af09-eccd112f12d8	t	2
cmmz4icgi00a9hkdooxpsm54j	RRHH-ENCARG-MMZ4ICE7	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Tiempo de cobertura de vacantes	Proyectos: ≤ 3 días\nOtras vacantes: ≤ 15 días	division	{"tipo":"division","numerador":"Vacantes cubiertas dentro del plazo definido","denominador":"Vacantes totales","multiplicador":100,"invertir":false}	100	0	\N	mensual	Mayor es mejor	%	0	t	2026-03-20 16:38:32.082	2026-03-24 21:57:47.359	>=	critico	c25115ff-5982-4d49-907a-d66b0497b5da	t	240
cmmz55dgt00aphkdozy32tsyn	RRHH-GENERA-MMZ55DG1	RRHH	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	Gestion Legal	Cumplimiento legal laboral	conteo	{"tipo":"conteo","target":"Número de incidentes legales laborales atribuibles a RRHH"}	0	0	\N	trimestral	Mayor es mejor	%	0	t	2026-03-20 16:56:26.477	2026-03-24 22:04:21.835	>=	critico	b3b2663e-3d10-48ea-9f34-c80d21b1924f	t	48
\.


--
-- TOC entry 5146 (class 0 OID 23920)
-- Dependencies: 220
-- Data for Name: OrdenTrabajo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrdenTrabajo" (id, "kpiId", "empleadoId", "creadorId", titulo, descripcion, "cantidadTareas", "tipoOrden", status, "fechaInicio", "fechaLimite", "fechaLimiteOriginal", "fechaExtendida", "motivoExtension", "fechaCompletada", "enPausa", "motivoPausa", "fechaPausa", "requiereAprobacion", "tareasCompletadas", progreso, "resultadoFinal", "createdAt", "updatedAt", "valoresCalculo", "areaId") FROM stdin;
\.


--
-- TOC entry 5151 (class 0 OID 23980)
-- Dependencies: 225
-- Data for Name: RevisionJefe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RevisionJefe" (id, "ordenTrabajoId", "jefeId", status, "motivoRechazo", comentarios, calificacion, "fechaRevision", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5150 (class 0 OID 23970)
-- Dependencies: 224
-- Data for Name: SolicitudEdicion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SolicitudEdicion" (id, "ordenTrabajoId", "solicitanteId", "campoAEditar", "valorActual", "valorNuevo", justificacion, status, "motivoRechazo", "fechaSolicitud", "fechaRespuesta", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5149 (class 0 OID 23960)
-- Dependencies: 223
-- Data for Name: SolicitudTarea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SolicitudTarea" (id, "ordenTrabajoId", "empleadoId", descripcion, justificacion, status, "motivoRechazo", "fechaSolicitud", "fechaRespuesta", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5147 (class 0 OID 23935)
-- Dependencies: 221
-- Data for Name: Tarea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tarea" (id, "ordenTrabajoId", descripcion, orden, completada, "fueraDeTiempo", "fechaLimite", "fechaCompletada", "solicitudAgregar", "aprobadaPorJefe", "intentosEvidencia", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5144 (class 0 OID 23885)
-- Dependencies: 218
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, dni, email, password, nombre, apellido, role, "areaId", activo, "createdAt", "updatedAt", puesto_id) FROM stdin;
cmm5clinw0003hknwoy6isr2c	0501-1998-00799	amejia@energiapd.com	$2b$10$KBkeTEYCqXKZolCNfzzRs.hHwaR.313iieM706aof.ymXhxTjcC3u	ANDREA GISSEL	MEJIA FLORES	empleado	5f5fedee-1ec7-4327-8473-009a95a2376d	t	2026-02-27 20:31:51.739	2026-03-16 16:04:02.725	\N
cmm5clk540015hknw6s0k8dfs	0601-1997-00358	ealvarez@energiapd.com	$2b$10$vH0sSfSM96xLvXhM4M0s8.XviNRX.xCZIKjSCn0T1Hvjjzj73fJOi	ERICK ALEXANDER	ALVAREZ RODRIGUEZ	jefe	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-02-27 20:31:53.657	2026-03-23 22:00:45.633	0a5bb1cb-dcfa-4461-87f2-627a133d8dd2
cmm5clnit003khknw2gvrc7cl	0508-1999-000597	oficialsyso@energiapd.com	$2b$10$nzlFOTN1QW0V1z3lIw5WROggQy4P5uDRuSYVk2IiLPwqb99cxIvEK	EVER ALDAIR	VALLE JIMENEZ	empleado	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-02-27 20:31:58.038	2026-03-23 22:08:19.554	ff7d3e82-3b5b-4101-b900-53951817a187
cmm5clkgu001dhknwtidqv8yi	1809-2000-00569	solucionestecnologicas@energiapd.com	$2b$10$P4G7izM8vq.dgxzmGqfPauV.cctuB2KnD89pzhQfcbN84hYZoJAV.	GERSON ADALID	MURILLO PALMA	admin	7216c1ae-8e48-4956-83b1-fdc347ef591e	t	2026-02-27 20:31:54.079	2026-03-24 22:48:38.263	47caf69f-2485-4788-a3e9-ce5605cb2502
cmm5clik20001hknwe8n0a1wt	1808-1975-00766	alba.flores@energiapd.com	$2b$10$P4G7izM8vq.dgxzmGqfPauV.cctuB2KnD89pzhQfcbN84hYZoJAV.	ALBA AMELIA	FLORES MARTINEZ	empleado	\N	t	2026-02-27 20:31:51.599	2026-03-16 16:13:55.666	\N
cmmtduuoi0001hktsmzb9ce31	0501199608213	lmartinez@energiapd.com	$2b$10$JV2J0MlIsNyaX5BBhqNtr.wcMtoPMpAUCCeVJzqV.jIYFRAZaZ2FK	LOANY	MARTINEZ	jefe	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	t	2026-03-16 16:13:35.024	2026-03-23 22:40:02.27	12c4a141-1b61-43d9-8e7c-2f3203040934
cmm5cllwk002ghknw7351bdjp	0512-1990-00357	encargadoflotavehicular@energiapd.com	$2b$10$Tfata0mt7nTeps76L50g2ukuXXLnyy72qCPHoXkwo2c494LU6zgv2	MARCO ANTONIO	HERNANDEZ MOLINA	empleado	808be458-29be-48b6-9cac-87acaee84d4f	t	2026-02-27 20:31:55.941	2026-03-23 22:45:27.69	f9e2962e-8625-4a87-8766-87d936da8f0a
cmm5clonu0049hknww3zinzrf	0511-1992-01628	recepcion@energiapd.com	$2b$10$d1q0TeB2cwHFu3/0xeB4UeN7hdU2s.nrjP6ZlFYHxtfS7KozjFmUO	MARTHA STHEFANY	PINEDA TORRES	empleado	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-02-27 20:31:59.514	2026-03-23 22:47:16.584	a4c07a43-ab93-4467-af09-eccd112f12d8
cmn503n5k0001hkbwo1w02rrx	0703200100219	oficialalmacen.ueper@energiapd.com	$2b$10$VBAKGfTeqs1xywlfGluPWeQ4STom.9eFwOjxGMeiPPkgVXTAZfs0O	MANUEL EDUARDO	PAVON GARCIA	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-24 19:21:44.693	2026-03-24 19:21:44.693	9fa0c900-aada-469b-881c-a12a4fe1c2a9
cmn5050h90003hkbw2pkfjwta	0609199300255	osmajosuepastranalinarez12@gmail.com	$2b$10$wXfYrdYaFVfQJEwlHzgmsuHgqrNRUogsvzJQXISbJzT/abkIUuOCi	OSMAN JOSUE	PASTRANA LINAREZ	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-24 19:22:48.622	2026-03-24 19:22:48.622	2368972b-83ca-4232-b31f-98e5f88d272a
cmm5clj0e000chknw6zi83002	0501-1995-08213	analistadenegocios@energiapd.com	$2b$10$MTLZnnCcN7uodXSiYmF.3.vX.HFMI4aNTbzo8myNaHQvJVFH15QuO	BRENNEDY ADONAY	MARTINEZ CLAROS	jefe	7216c1ae-8e48-4956-83b1-fdc347ef591e	t	2026-02-27 20:31:52.19	2026-03-24 22:49:43.959	72acb457-4425-4e6b-826c-147172df2d5e
cmm5cliqc0004hknwsr1eqwju	0501-1996-08802	automatizacion1@energiapd.com	$2b$10$fhRxxEHuRalxvQtuOJDrr.pNWl5Jk/jkt.81R9PMDt/pvJFOjjs4S	ANDRES EMILIO	ALVARADO ARIAS	empleado	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-02-27 20:31:51.829	2026-03-23 21:39:20.724	f94b42d4-5097-465c-93f3-058a34575f8c
cmm5clisx0006hknwk62b0i6e	1627-2000-00342	aventura@energiapd.com	$2b$10$yMKPJwjTZe2iyKGjCSx9XuwzyXnpUa3PxGHqLXBv1xhy5AqTVDYQ.	ANGELA MARIA	VENTURA TINOCO	empleado	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-02-27 20:31:51.921	2026-03-23 21:40:08.026	62481707-fc46-4f6d-ac8d-e38235d8ba29
cmm5clivh0008hknwv9a4t99t	0501-2001-14450	electrico.ingenieria@energiapd.com	$2b$10$uZ5ffvoQoGV.DPDOQ3uBr.wnYKtKV0l3iLajmHXm3wGdVpUoJhRfq	ANGIE NICOLE	SIU DERAS	empleado	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:52.013	2026-03-23 21:41:29.957	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b
cmm5cliy2000ahknwooj6bys3	0801-1994-12884	presupuestos1@energiapd.com	$2b$10$6Qec6qm.Tghdh6W03BXnjucktoPAg7AIYbmPya7YwcuT2ua5mC/im	BIANCA PAOLA	LOPEZ CRUZ	empleado	c850514e-c1d2-41c5-b886-86640891247d	t	2026-02-27 20:31:52.106	2026-03-23 21:42:40.35	6dc65853-cd35-4c7b-9422-0e7aaf379908
cmm5cln63003chknwa96rhsi9	0501-1991-08006	carlos.gomez2308@gmail.com	$2b$10$tw/roPVnpxB5w1PCgK3Ie.pmGyPNjutGkjCptp2aOGhc8ZwLRLC4a	CARLOS ARTURO	GOMEZ RIVERA	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-02-27 20:31:57.579	2026-03-23 21:46:03.106	9fa0c900-aada-469b-881c-a12a4fe1c2a9
cmm5clj5c000fhknwrmnd4pmq	0501-2000-15121	oficialtecnicolicitaciones@energiapd.com	$2b$10$OJTqBC0o/gcKLvASa9/M5OXPM/SCKfF.KlZ6vEiHPmPANCGMpfQwe	CHRISTOPHER ALEXANDER	MATUTE CANALES	empleado	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	t	2026-02-27 20:31:52.369	2026-03-23 21:46:40.403	f1a840a1-caf7-477a-8748-59bc8366e735
cmm5cljex000mhknw5zn33x9a	0501-1996-05054	dreyes@energiapd.com	$2b$10$RZ3/aJX45auSfqOEi8nqAOs5CXGah.A.WzvjEtMNcvjoh4KfgxK2S	DANIA MARIEL	REYES ACOSTA	empleado	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-02-27 20:31:52.713	2026-03-23 21:49:23.438	62481707-fc46-4f6d-ac8d-e38235d8ba29
cmm5clkc6001ahknwhukhqrd7	0801-2002-05610	protecciones1@energiapd.com	$2b$10$wPRB9Q7g6Sg8iIQLJE/4S.d8/6wy/SnKNsvfHNcfIAudq13M32bp2	FERNANDO JOSUE	ALONZO ESPINO	empleado	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-02-27 20:31:53.91	2026-03-23 22:13:54.361	167eb963-84c5-49c6-b317-71beed9ad0b5
cmm5clldn0022hknwej5ftzjd	0501-1993-07305	jhasbun@energiapd.com	$2b$10$gJ322Fph72B28dtNpvQPsuKUlew.eMW1u9czMbKV38T4WBr/GraPS	JOSUE JONATHAN	HASBUN HUEZO	empleado	7c631196-ec9b-4751-ac5d-4e4671056c36	t	2026-02-27 20:31:55.259	2026-03-23 22:34:17.338	4391a454-1349-4118-b2e5-7a82cf82c444
cmm5clkv0001ohknwpa85xftt	1808-1994-00787	dmelendez@energiapd.com	$2b$10$jQaVvcutuIKY3xe6DUk9W.ixkqtCVkOC9An5MpL7hHG9sNEPOrI2e	INGRID DAYANA	MARTINEZ MELENDEZ	empleado	\N	t	2026-02-27 20:31:54.588	2026-03-16 15:49:06.923	\N
cmm5clknx001ihknw3fvne325	0510-1991-00191	ingsupervisorused@energiapd.com	$2b$10$7SUv34BPy5nqjRRgoMH6eOHcq9GMfqgcKJyKH5bM05DBfjFST1rwG	HECTOR FRANCISCO	SUAZO ZEPEDA	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:54.333	2026-03-23 22:16:42.65	7018e73b-b29a-426a-88c4-6c51a464edad
cmm5clkxb001qhknw2emewrh8	0509-1994-00412	imartinez@energiapd.com	$2b$10$9fEFWa927F8F.bdeMJfDtu02QCu6DC2dSKK//dZH1osqdTSUULdgG	IVONNE ESTHELA	MARTINEZ CRUZ	jefe	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:54.672	2026-03-23 22:25:59.512	ca9b6ea1-b19c-4886-95be-e779b4bd7330
cmm5clnb3003fhknw3rvlu3mh	0501-1991-07006	armandoll91@hotmail.com	$2b$10$y4qgTTdfa9GN6a2oRhIPn.66rXH0b8kJCs7N.GL896T3mEyqNN11O	DIEGO ARMANDO	LOPEZ LEITZELAR	empleado	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	t	2026-02-27 20:31:57.759	2026-03-23 21:55:28.941	ff48062b-6108-4e20-a42a-7f6d08906ca3
cmm5clk9t0019hknwd7v4dbis	0318-1998-02088	ebenites@energiapd.com	$2b$10$5Pp2sUq0jeqYEv58oqblEOxoqqwM3AmNpHoD8HBMnxNNshOCkTrpa	ESTEBAN DANIEL	BENITES SABILLON	empleado	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-02-27 20:31:53.826	2026-03-23 21:59:49.796	d609c25e-8f53-4e47-870f-33caf899b7b8
cmm5cll4b001vhknwsb9kb922	0501-1995-01480	jeysonm@energiapd.com	$2b$10$UXQaxDa3Pmg1GrAWCPBtnOt61y/nPEUk44yEQnAWgq98Dh77BgBVu	JEYSON SAMUEL	MEJIA HERNANDEZ	jefe	9a78442a-f1d2-478d-9e18-ff8c81d30580	t	2026-02-27 20:31:54.924	2026-03-23 22:28:01.337	628ed6bc-8f74-4dba-8cd7-e3ee8c61f615
cmm5cll6n001xhknwaxoco610	0703-1998-04885	jcampos@energiapd.com	$2b$10$nxV6EZBF3twGkwQ2jkSOVu3IcNwBkEm/lUFbxCXDfdDAFoZHpzH/m	JORGE ISIDRO	CAMPOS SANABRIA	empleado	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-02-27 20:31:55.007	2026-03-23 22:28:54.865	8f13dde6-eb52-4a36-99a4-a07946b016d6
cmm5cll8x001zhknw9jiluaax	1807-2000-00891	residentecivil@energiapd.com	$2b$10$BW3PosP8W6YEx5wsU6/eve6FWWzXo/Hkq/ym1AAOjz1nm8sf9wzAS	JOSE ALBERTO	RIVERA GARCIA	empleado	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-02-27 20:31:55.089	2026-03-23 22:29:57.971	8f13dde6-eb52-4a36-99a4-a07946b016d6
cmm5cllb90020hknwki95tlsg	0501-2002-01694	automatizacion2@energiapd.com	$2b$10$WCpBTPnZOLUwYpkpLUIJGuGGbSmrMZBbfXE3fkzqAMrx26BOguQFa	JOSE RAUL	RIOS MEJIA	empleado	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-02-27 20:31:55.174	2026-03-23 22:34:01.366	f94b42d4-5097-465c-93f3-058a34575f8c
cmm5clo2c003whknwxgaer80f	0511-2005-01294	juliocesarbonillacuellar17@gmail.com	$2b$10$Wh/00cWWma/Xhn5nNkKrRuqyoKALAdOHorTr8MlleNLCrJsUrq5ve	JULIO CESAR	BONILLA CUELLAR	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:58.741	2026-03-23 22:34:52.168	2368972b-83ca-4232-b31f-98e5f88d272a
cmm5cllfy0023hknw1bsdh1si	1804-1998-03537	pcm_cad2@energiapd.com	$2b$10$i4cw0q9SXB.8QDKPwhFHhOoqxNEZ2zVR/LH1Lp.YY0KAahQFGJF3C	KARLA NEREIDA	ALFARO HERNANDEZ	empleado	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-02-27 20:31:55.342	2026-03-23 22:35:38.258	167eb963-84c5-49c6-b317-71beed9ad0b5
cmm5cloe70042hknwy6cddizf	0510-2003-00378	lestersagastume66@gmail.com	$2b$10$vMq2ubYlwqDH7QLLwlcQ6Ofyn5fkf3FG.GVp5uX7R5vRgXg0dHJg2	LESTER JOSUE	SAGASTUME CASTELLANOS	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:59.167	2026-03-23 22:38:51.705	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clm3v002khknwbhg41p17	0512-1997-02339	it@energiapd.com	$2b$10$jcrbnFyA9vhU/gzVUUr74OeR8xPStr15VyhSbAedXn1sHVwa1gSei	NESTOR FERNANDO	MENDOZA NUÑEZ	jefe	b396765f-621a-4ad6-8572-060d0ff5fe96	t	2026-02-27 20:31:56.203	2026-03-23 22:48:10.987	31650d56-28ac-4eb8-863a-076e725d10f4
cmm5clkzo001rhknwv4t0damd	0201-1994-01227	jmejia@energiapd.com	$2b$10$eYnuG9lO8uitq6XzGO.SX.5UYO8n6w1AmrMkhlh4K/rgh7oqp04n2	JAMIL ENRIQUE	MEJIA MARTINEZ	empleado	c850514e-c1d2-41c5-b886-86640891247d	t	2026-02-27 20:31:54.756	2026-03-24 14:44:38.912	6dc65853-cd35-4c7b-9422-0e7aaf379908
cmm5clkek001chknwlbyazv23	0501-2000-14963	solardesign@energiapd.com	$2b$10$KaqHJz6H9Ve5g7rut3EV5.naYpaIai.vazmfKvdkD3RwOiqb0K2Qe	GABRIEL FERNANDO	MONCADA CARACCIOLI	empleado	\N	t	2026-02-27 20:31:53.997	2026-03-16 15:49:06.923	\N
cmn508y7h0005hkbweulf06fa	0703199901648	syso.jamastran@energiapd.com	$2b$10$IVLtpw7fqFy3IB8NeqWHSOjas/uvymY7yjLThFQuhJxyRmP1sQEl.	DANILO JOSE	PONCE URRUTIA	empleado	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-24 19:25:52.301	2026-03-24 19:25:52.301	b4409975-ef69-45e8-a0e9-7aa80d29aa3d
cmn50bsh60009hkbwcj95lju3	0703199000599	almacen.jamastran@energiapd.com	$2b$10$BPwqliLyICqUq2YvHym5s.gYapO/Vr579VyuU05JTlyeL5menMcIK	ANTONY DAVID	BRENES CRUZ	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-24 19:28:04.842	2026-03-24 19:28:04.842	9fa0c900-aada-469b-881c-a12a4fe1c2a9
cmm5clnnd003mhknw1z7ix38t	0501-2002-09843	alvaradofranklin43@gmail.com	$2b$10$pfEJnppDmGEyqYg4tzF/mO1wE0HKxr4Ub1O23dr0iMUltaZr3s5i.	FRANKLIN JARED	CHAVEZ ALVARADO	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:58.202	2026-03-23 22:14:16.53	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clolg0047hknwc2wlnwvy	0301-2003-02545	marlonmendozalizama84@gmail.com	$2b$10$LHBjBqMq0xNdyPQDZ.XYJe3yZmfy9Rft1yZka6fCvrz65cuSDWp4i	MARLON JOSUE	MENDOZA LIZAMA	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:59.428	2026-03-23 22:46:39.291	2368972b-83ca-4232-b31f-98e5f88d272a
cmm5clmwv0036hknwe2jhm5va	0107-1990-00623	ymurillo@energiapd.com	$2b$10$rH2cOq3rxIWHBKRVlAClAuqc1orSB/c.BjxBzVSqrdHT3nAe29CtW	YUNIOR XAVIER	MURILLO MARTINEZ	empleado	b492ee01-a0bf-44e9-8d5c-fea697a9132a	t	2026-02-27 20:31:57.247	2026-03-23 22:58:10.438	56472212-3718-498a-9a47-61c5799818de
cmm5clmkr002xhknwxwl3b9n1	0501-1997-13464	marketing@energiapd.com	$2b$10$YMbg03aMngQKHrRoBIquiOazkisusDwZPFee/ctQW7t9mcVHR41qO	SARIA MARIELA	ZUNIGA MARTINEZ	jefe	4027d1be-6dc1-4b09-a2f7-78441396efe1	t	2026-02-27 20:31:56.812	2026-03-23 22:51:47.078	cdb0b914-13e2-460b-869b-a11f1a6070b0
cmm5clmu90034hknw4uyet3z3	0205-2000-01028	tguzman@energiapd.com	$2b$10$P8qOFL2.bdq/0yLeW5KtSeoExTaXZmFqNbeJu6Pguf0XJHX.LbryC	TULIO GUSTAVO	HERNANDEZ GUZMAN	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:57.153	2026-03-23 22:57:08.873	7018e73b-b29a-426a-88c4-6c51a464edad
cmn50dpsz000bhkbwjgrxjvej	0703200003741	calidad.jamastran@energiapd.com	$2b$10$1cfg500UTDuQxbIR7pijE.VOwWbEoN6WEMsM8koXDMdcnqdeGCyFm	DUNIA ELIZABETH	FLORES GONZALES	empleado	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-03-24 19:29:34.691	2026-03-24 19:29:34.691	8f13dde6-eb52-4a36-99a4-a07946b016d6
cmm5cln8d003dhknwwnfh297e	1627-2006-00455	danielalejandroth@gmail.com	$2b$10$jxSO1i6Jm/fs1SOygDYLeOqQqiGwqdMJzzXb28pz/YsBSuDrrMb8e	DANIEL ALEJANDRO	TORRES HERNANDEZ	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:57.661	2026-03-23 21:49:46.504	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clnde003ghknwta9ui3lm	0510-2005-01593	moreno_edgar7@icloud.com	$2b$10$FTsd8j/lEMSZI7S2eXZAZeZiHxqgTnhdrxqzbaWayyJ1OacHAXh.e	EDGAR OTONIEL	MORENO AGUILAR	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:57.842	2026-03-23 21:56:27.032	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clng6003ihknw45xifz7v	0501-2004-03084	martinezjasiel2020@gmail.com	$2b$10$6OLxwJ3E4T2qCIFrOcEV3u/0LjGwoNNdur8n9uz6vwSJCa7fg24Ci	EDSON JASIEL	CASTRO MARTINEZ	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:57.942	2026-03-23 21:56:51.871	2368972b-83ca-4232-b31f-98e5f88d272a
cmm5clnl2003lhknw3zx2n95y	0501-2005-09388	emilalvarado58@gmail.com	$2b$10$jzLJUSKGXYBpzMk8gNIXGuA0q7MdIxtsZjAlCXc7SgGOFt5/s4ZyW	EMILSON ALEXIS	ALVARADO CEBALLOS	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:58.119	2026-03-23 21:59:15.793	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clmz50037hknwrp0ehyan	0502-2003-01351	aaguilarsantos26@gmail.com	$2b$10$72K0gqebdH7n8VI6o1qblegOUYFeoJ348s.VUnJzvHgeN/6XKJhHa	AXEL RENE	AGUILAR SANTOS	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:57.33	2026-03-23 21:42:09.437	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5cln1j0039hknw5uuifa4l	0501-2000-07222	brandonlara30062000@gmail.com	$2b$10$BaRSqI6.E6LJmDwj6C74quHQ6Lok3isKfFXk5jwWlvSmzHNMwo63S	BRANDON ADALBERTO	SARMIENTO LARA	empleado	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	t	2026-02-27 20:31:57.415	2026-03-23 21:44:17.932	b4d09e9f-7d6f-45dc-a73e-e9bfab582c31
cmm5cln3t003ahknwhysdqjb8	1627-2005-00040	andresduronsalgado2019@gmail.com	$2b$10$n3YLymCsnif2b1L5Wvi/jeIEOFT3993Gyp5bJGaxguHNTrPGlbRlW	CARLOS ANDRES	SALGADO MATAMOROS	empleado	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-02-27 20:31:57.498	2026-03-23 21:45:37.02	84b3b3b8-7ab1-4f41-9978-e90661648294
cmm5clk7i0017hknwzlvutm75	0601-1990-01904	emajano@energiapd.com	$2b$10$9kuUX5jp9yhnD2pfhGq2vuY6RHeWkUoyQIhUBLMwX9i8e7yXxgR8a	ERIK MARCELO	JURGER MAJANO GUEVARA	jefe	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:53.742	2026-03-23 22:00:37.699	e7a26477-ba32-46e3-b62a-2ab95874c8db
cmm5clmpl0031hknwr3a6iplz	0501-1998-01928	auxiliaroperaciones@energiapd.com	$2b$10$pL1ihxfZmTfz0SYrb3HXk.5fY4rMZzRSebWKGYCY16IkJG7/qItDK	SINDY MARIELA	BUSTILLO ACEVEDO	jefe	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	t	2026-02-27 20:31:56.986	2026-03-23 22:55:33.784	c497c878-1300-40e1-af43-682ca2d5f8c9
cmn50flp2000dhkbwqq0kdm5i	0101199603066	almacen.sotocano@energiapd.com	$2b$10$u9arGSoIurZEit5IubRp8.C6zCRWIBauzCvTzZFM5V.w1Ig8/pE2i	CESAR AUGUSTO	GOMEZ RIZO	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-24 19:31:02.679	2026-03-24 19:31:02.679	9fa0c900-aada-469b-881c-a12a4fe1c2a9
cmn50hiii000fhkbwkyja9mrf	05011997007813	residenteelectrico@energiapd.com	$2b$10$YgmhevqhymYaD9Okwdhfje/tnjdj3ztJyyF63DBoMfDy8p59WTFFO	EDUARDO ANTONIO	LOPEZ ESPINAL	empleado	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-03-24 19:32:31.866	2026-03-24 19:32:31.866	8f13dde6-eb52-4a36-99a4-a07946b016d6
cmn50jrwy000jhkbwmprq6dr4	1501199701288	oficialsysoproyecto01@energiapd.com	$2b$10$yls8iBNcEAL9YsbUY8exOeuwsNdvasZf0wm.Z/qIDDHzqxCHhkW9m	CLAUDIA FRANCISCA	DUBON ELVIR	empleado	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-24 19:34:17.363	2026-03-24 19:34:17.363	b4409975-ef69-45e8-a0e9-7aa80d29aa3d
cmm5cljxx0010hknwvlpp38yd	0501-2003-00155	eperdomo@energiapd.com	$2b$10$cu66MGUEg4bGvuZ3Y9F6fuAyHhGY0w9m88.Ekr4Fc34eGwlpEBHoe	EDWIN ROBERTO	PERDOMO RODRIGUEZ	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:53.397	2026-03-23 21:58:10.32	69239f58-ae3f-4b23-a6df-6b598704bfd1
cmm5clk080011hknwwfv33y3e	1808-1996-00281	emejia@energiapd.com	$2b$10$7sk8JBr9iIb0zyR8Z079XOQlW1gRrHn6jOI70j6yC3tTH1bJHKWp6	ELMIN EDAN	MEJIA FLORES	empleado	7221ded4-dd4c-450f-80ca-10361ba74274	t	2026-02-27 20:31:53.48	2026-03-23 21:58:49.901	e7098b01-b321-49c9-8b06-f328c048bf77
cmm5cllib0025hknwbgo7qxm4	0512-1986-01203	contratos.proyectos@energiapd.com	$2b$10$Yy5eIYv9DrZECuqnA1j6s.9yycjV8r9JX.kSIL7c4CXESmWsbDbL.	KARLA PATRICIA	PORTILLO	empleado	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-02-27 20:31:55.427	2026-03-23 22:35:59.687	13beaf85-81f1-4887-801a-04131a08d73b
cmm5clln40029hknwunbclht2	0506-2003-00047	kmonge@energiapd.com	$2b$10$VTWcTuSspcBTaMslwhKcL.ggaLy6.aWyEonk1c6z2wkN4eKNe5uW6	KEYLI YANELY	MONGE GARZA	empleado	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:55.6	2026-03-23 22:37:50.915	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b
cmm5cllph002bhknw5fmlxbff	0501-2004-14230	cadista01@energiapd.com	$2b$10$GwAdGSXEVxLufq18Rq5aq.5zRAkNRwdRQ5AAo6GK5IYrQl41j/B/2	LADY ALEJANDRA	AGUILAR LANZA	empleado	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:55.685	2026-03-23 22:38:24.314	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b
cmm5cllu8002ehknw9ghcreaq	0501-1985-06733	auxiliarit@energiapd.com	$2b$10$edeC8bov25ZevFz7KaagCeTBJWDpkm9bxw2jXMV.M27SbzKDBWc1C	MANUEL ANTONIO	CANALES VILLA	empleado	b396765f-621a-4ad6-8572-060d0ff5fe96	t	2026-02-27 20:31:55.856	2026-03-23 22:45:03.978	d1dd5032-df3a-4e19-90cc-1229c547e22a
cmm5cllz0002hhknwuqmli96z	0208-2001-00816	msolis@energiapd.com	$2b$10$xs2IJHWHdeg77MUDmM9IsON.WZFYoVHA.v1G0E1PxvV1OnjdXviN6	MARLON GABRIEL	SOLIS ALFARO	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:56.029	2026-03-23 22:46:14.979	7018e73b-b29a-426a-88c4-6c51a464edad
cmm5clm1l002ihknw80dovwju	0508-1999-00578	supervisorude@energiapd.com	$2b$10$A/UfYBJ2js8KSotDVEXVVeh.gYDifFqt3OXFCNxjQER.tAW368WMS	MAXWELL ALEXANDER	LOPEZ FUNEZ	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:56.121	2026-03-23 22:47:43.227	e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97
cmm5clk2m0013hknwzxccsy5e	1808-1972-00647	eemejia@energiapd.com	$2b$10$odGHRZCbDBPti.O./cPgA.9UsWHAkVC6T0m433NrfubfkrF4/m1EW	ELMIN EDAN	MEJIA MARTINEZ	jefe	90820b7e-932d-4bbd-ad1a-c0402bf35049	t	2026-02-27 20:31:53.567	2026-03-16 21:07:41.661	0b28a256-8b5f-4cd5-92d0-66477edd832a
cmm5clm68002lhknwbbih6i87	0501-1969-07782	nalfaro@energiapd.com	$2b$10$iyxSxm8vjyNBEBhSm/WlQupMDNq3H07exfe13FVeQOSjCl7rIaYeq	NICOLAS ALEXI	ALFARO CASTILLO	jefe	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	t	2026-02-27 20:31:56.288	2026-03-23 22:47:58.341	2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb
cmm5clmdi002rhknwtk4bkqpb	0301-1998-02151	ofranco@energiapd.com	$2b$10$bQskeg0nTSh7qUPzpAxTUeHF3i0GpGt1/6.Vbs4A7UoT/oOPrv0w.	OSVIN JOSUE	FRANCO GUIFARRO	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:56.55	2026-03-23 22:49:21.253	69239f58-ae3f-4b23-a6df-6b598704bfd1
cmn4tyj4l0007hkkgqv3re5qq	0501198903424	documentacion_proyectos@energiapd.com	$2b$10$Gfp/S63r1IegpsWj6VqLz.0cxaV.6NfYp1ebTuV3bA5W.BIVn79ve	RICCY MABEL	PINEDA ROBLES	empleado	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-24 16:29:48.498	2026-03-24 16:29:48.498	5b3bc564-11c7-4787-99fb-b916cdee3390
cmn50q835000lhkbwa2vdk5t5	0501198207304	kvargas@energiapd.com	$2b$10$suDMbzhEz8nDPDQwXywYN.MouPsFVSKjqZJfIrB304i2fKTuPKXmK	KARINA YESSENIA	VARGAS DUARTE	empleado	19c19474-d3da-48ca-94dc-a536ee9b2205	t	2026-03-24 19:39:18.257	2026-03-24 19:39:18.257	c1826f7f-629f-4216-b103-9c22105e8b36
cmn50sydq000nhkbwkrgy6ir1	05010000157852	supervisor.mecanico-ext@energiapd.com	$2b$10$07SnelbAk6Q/v0wEjwXVOeXdR9Fg2Ve3QLt1AvL9GRUbkZOey0dQO	JOFFRE ALCIDES	BAYAS	empleado	2dcf6888-74fc-4ed7-8963-eb1003650dfc	t	2026-03-24 19:41:25.646	2026-03-24 19:41:25.646	e030b8aa-536d-4ff4-a19e-924abd76edfd
cmm5clo9d0040hknwds2wssnx	0511-2004-00215	kennypaz2021@gmail.com	$2b$10$FRkqTQJ4YduCOXKZn5qdW.FL.tb04ZnbLv1.sF.nKN0bdnerPbfge	KENNY ALEXANDER	PAZ REYEZ	empleado	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-02-27 20:31:58.994	2026-03-23 22:37:08.077	84b3b3b8-7ab1-4f41-9978-e90661648294
cmm5cloc00041hknwawl9m1km	0510-2004-00562	kev2003romero@gmail.com	$2b$10$mrCHwfSrsI9us4eTsG.mrO1FUEhlU0WdbgUL7IhcoiRvjFsOvDg5S	KEVIN ANTHONY	ROMERO	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:59.088	2026-03-23 22:37:27.478	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5closl004bhknwjgenz87g	1627-2006-00590	ramirezyoni4@gmail.com	$2b$10$NgvAE7OA0gmNPdtyk2acYuYhR9dZ4RHgdM0gyTkJAZpDUo2Ad1Z6u	YONI HUMBERTO	POSADAS RAMIREZ	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:59.685	2026-03-23 22:57:47.473	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmn50v80b000phkbwj70d6bvx	0801199903896	automatizacion3@energiapd.com	$2b$10$Z06lustpVvhlXAel3cK1SuFLjuF.44I3uqOGk7uMgyYKPPUPdBjnq	IVAN HUMBERTO	HERRERA PALACIOS	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-24 19:43:11.435	2026-03-24 19:43:11.435	69239f58-ae3f-4b23-a6df-6b598704bfd1
cmm5clnps003ohknwj6gymccw	0512-1990-01756	esau19908@gmail.com	$2b$10$0Ehd/eJiwCbAn.qEVQu8vOptrK8rPwe9nCsbnR2l.35dSN6c/pB.i	GERSON ESAU	PAZ VALLADARES	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-02-27 20:31:58.288	2026-03-23 22:15:10.556	9fa0c900-aada-469b-881c-a12a4fe1c2a9
cmm5clns5003qhknwc55besjk	0508-2006-00584	jafetramirez963@gmail.com	$2b$10$uZYpiXeAU7X1CkXVIkoHfOvCrzMwWJo.cZq3PzkMiFPYd1uzUfPB6	GUSTAVO DAVID	DIAS NAVARRO	empleado	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-02-27 20:31:58.373	2026-03-23 22:15:43.254	2368972b-83ca-4232-b31f-98e5f88d272a
cmm5clnus003rhknwmhjordsw	0502-2002-01446	isaicaleb23@gmail.com	$2b$10$J6jl3IctuGEsAHO/2HlKqOX./hzmAwaKz7oTdkXlTP0zZh.x9N6Ja	ISAI CALEB	AGUILAR PONCE	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:58.468	2026-03-23 22:25:45.978	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clmg4002thknwz6ighehv	1606-2001-00152	mecanico.ingenieria@energiapd.com	$2b$10$5hi9Nl0iFh7qVq4d6O9jG.jEOVjB/m3m/icCGtojKtLQW4DJXFpxW	ROBERTO CARLOS	RIVERA ALFARO	empleado	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:56.644	2026-03-23 22:50:51.949	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b
cmm5clkj4001fhknwsul6py2k	0501-1999-11701	disenografico@energiapd.com	$2b$10$t2oMUtc8L53Ge.oAq9OZQuacLWT9/.O1Ohmaiuy2Veows0A4ND1ca	GYLMA PAOLASALDIVAR	BARAHONA	empleado	4027d1be-6dc1-4b09-a2f7-78441396efe1	t	2026-02-27 20:31:54.16	2026-03-23 22:16:14.614	b9ad8309-113e-4ff4-a3d6-0551c992c02b
cmm5clksq001mhknwe8xxo20m	0502-1995-01854	reclutamiento@energiapd.com	$2b$10$LVEd7lPTq1uy1OWavqvBUOGp/orLu7Lb5sgzZmVoDvnKRVBZZwVv.	HILSY MARISOL	RODRIGUEZ VASQUEZ	empleado	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-02-27 20:31:54.507	2026-03-23 22:22:00.854	c25115ff-5982-4d49-907a-d66b0497b5da
cmm5clnx2003shknwjbnwlzkh	0501-2007-01844	oillab@energiapd.com	$2b$10$hhW9qAfIOrix3S0cW8ADsOgTyqmwGdbmvUPkudIDZzAaSVNh21VDa	JADE JULIETH	DAVILA SOTO	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:58.551	2026-03-23 22:26:32.955	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clo4n003xhknw66mxa27t	0501-1996-01915	cpc1234tjk@gmail.com	$2b$10$B/TVm7vYvhwViGiSYpugnuYbo6bItPzvyAkUro.w3r6Y3q8BJFMpy	JULIO CESAR	PEREZ CUELLAR	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:58.823	2026-03-23 22:35:11.937	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clo6y003zhknwgq0ftk95	1618-1992-00797	auxiliarcontable@energiapd.com	$2b$10$dFYqcHju.3OU21IdEL5FvO7r44RhpAFvTsVOiEHeIGcpupMBKjoIW	KENIA LIZETH	DIAZ ARAGON	empleado	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-02-27 20:31:58.906	2026-03-23 22:36:44.814	0cf75a1e-4b46-4728-a266-e3c0767b01b9
cmm5cllrz002dhknwoyzpox87	0512-1987-01498	compras@energiapd.com	$2b$10$28IajbRwRJz4CaauDHxAneMS38/9xKaBpJXx4EbcUU2wJ5o66aGiG	LEVY ALCESTER	CRUZ HERNANDEZ	empleado	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	t	2026-02-27 20:31:55.776	2026-03-23 22:39:48.247	b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97
cmm5clp02004ghknw0denowlk	0501-2004-07235	andresserranorivera14@gmail.com	$2b$10$ykUxR3oKnRlQYrA1lM4xMe8zhv0ZVMxVSh8vRAlHYcIkv6ra4e4lm	LUIS ANDRES	SERRANO RIVERA	empleado	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-02-27 20:31:59.955	2026-03-23 22:40:25.156	75e9d907-6974-45a2-81d7-f6855cf2247a
cmm5cloxo004ehknwxs2rb1t1	0501-1969-04564	alexisvega1969@gmail.com	$2b$10$iq43fFp3MFLlSYWEDjLfS.p1yhoNdE2hcCAvcC7RV1YucdNOw9Lka	ALEXIS WILFREDO	VEGA RAMOS	empleado	\N	t	2026-02-27 20:31:59.868	2026-03-16 15:49:06.923	\N
cmm5clp2d004hhknwr5hyi3az	0508-1977-00506	evrvay190@gmail.com	$2b$10$TnW4tZBBMxHk5TU3u57ecuWMJrHxf9OqFMyftOXCJNAWtEqNrn9BW	EVER NATANAEL	VALLE TEJADA	empleado	\N	t	2026-02-27 20:32:00.038	2026-03-16 15:49:06.923	\N
cmm5cloj60045hknwmc2cclqi	0302-2002-00053	raulchavarriamario02@gmail.com	$2b$10$8zI9VbdG8WM.k2ot7nYfxe.kSSRgIXs0PBY7vSfhDeFBsnaHbx6VC	MARIO RAUL	CHAVARRIA LEIVA	empleado	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-02-27 20:31:59.347	2026-03-23 22:45:46.005	75e9d907-6974-45a2-81d7-f6855cf2247a
cmm5clmat002phknwadmulqpb	1601-1990-00614	oleiva@energiapd.com	$2b$10$4xAxZ9l10/PPw0aBnoGTTOQC.BxCw6r2TI7bRdskD9su49vf1uyYy	OSCAR ARMANDO	LEIVA RAMIREZ	empleado	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-02-27 20:31:56.454	2026-03-23 22:48:59.371	fa3b8780-14a3-4fbf-8ca6-16201624508a
cmm5clmie002vhknwbtb28ri3	0501-1997-06023	oficialiso@energiapd.com	$2b$10$RnSaHWgHyR3l.P/BfjBHauTpu8U5oktHKoyCVqRskyF7TGXtwGV8S	SAMUEL GUSTAVO	AVILA PEÑA	empleado	fe4cd906-3b58-488b-83c2-fe905be1b30f	t	2026-02-27 20:31:56.727	2026-03-23 22:51:20.398	05207495-2ab9-43a1-b24d-bf093614c3f8
cmm5clj2o000dhknwblgoeiqz	1804-2001-04520	gespro@energiapd.com	$2b$10$fVJU.BI5T4seIwzSu4VofuvhisUdXyTxd2QO.k0vM3ioT6h1BnYEO	CARLA DARIELA	SANCHEZ ERAZO	empleado	7221ded4-dd4c-450f-80ca-10361ba74274	t	2026-02-27 20:31:52.272	2026-03-23 21:44:51.813	e7098b01-b321-49c9-8b06-f328c048bf77
cmm5clj7r000hhknwulxxj6xv	0512-1986-00701	recursoshumanos@energiapd.com	$2b$10$z/8DBkrUpsXH61se7gX0oOx7tgO83MqFfykWhKUyk5nsGLrV8x0dO	CINDY KORITZA	AYALA HERNANDEZ	empleado	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-02-27 20:31:52.455	2026-03-23 21:48:12.713	b3b2663e-3d10-48ea-9f34-c80d21b1924f
cmm5clja3000jhknwb1ujxjz4	0801-1992-11773	cbustillo@energiapd.com	$2b$10$zpwwr21ph6H1mzUzNvQ.iuf6L5aWKC2q.1zTwg2FnMd4JbxpFC.Z2	CRISTHIAN JOSUE	BUSTILLO AGUILAR	empleado	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-02-27 20:31:52.54	2026-03-23 21:48:30.826	e1636fdb-be70-4831-906a-89932b337f15
cmm5cljci000khknwqevlwex9	0501-2003-11652	ingenieroused@energiapd.com	$2b$10$w4cq7B8zX2fu07yQbND6FePuXC5/qzPKA52FHkq96VeGK/JdAHTA6	CRISTIAN JAFET	LAINEZ NUÑEZ	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:52.626	2026-03-23 21:48:56.746	7018e73b-b29a-426a-88c4-6c51a464edad
cmm5cljh8000ohknwmji7kdfg	0806-1999-00028	pcm_cad@energiapd.com	$2b$10$zBvjCH//drmT/4yQ2wzuLukMrQuGtaYEI5Evbyze3to.dpp3x8CwC	DANIELA MICHELLE	MARADIAGA CRUZ	empleado	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-02-27 20:31:52.796	2026-03-23 21:50:23.679	b43eae18-b989-4c2a-81bc-1cc94a9e6b5b
cmm5cljlt000rhknwip3kn41a	1401-1995-00384	dromero@energiapd.com	$2b$10$vISsVyluI5S33QnCINTcbu5ffk958UB.joPhw2owRt/2VDr2RlgWy	DENNIS STIVEN	ROMERO SAGASTUME	empleado	89629a77-e179-40ee-8c65-3f48e7cc55c8	t	2026-02-27 20:31:52.962	2026-03-23 21:53:31.64	0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e
cmm5cljoa000thknwfieqey28	0501-1982-10715	auxiliaradministrativo@energiapd.com	$2b$10$wirE.xMt2XrYVsWCvuLYY.KE8dAnKIrrMn5eOvYtcQhxBc65toeSm	DENNISSE ELIZABETH	CERROS AGUILAR	empleado	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-02-27 20:31:53.051	2026-03-23 21:55:06.196	0cf75a1e-4b46-4728-a266-e3c0767b01b9
cmm5cljqq000uhknwtwal29kg	1307-1988-00130	importexport@energiapd.com	$2b$10$gIWCoU4569oEd.2OlSd84.hjXuF7wOKlBC93Q9o4A6tfURLnImqDi	DILCIA ELIZABETH	NUÑEZ LOPEZ	empleado	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	t	2026-02-27 20:31:53.139	2026-03-23 21:55:46.148	41b1d6a1-a569-4e60-98ef-e3591fe9e211
cmm5cljvn000yhknwi41zrho5	0501-1989-00632	bodega@energiapd.com	$2b$10$PakbZzZxDNbFYket6VrOB.CQ133oAQNyvVKY3PnAJmPG5xMOSKsYu	EDWIN MAURICIO	CRUZ	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-02-27 20:31:53.315	2026-03-23 21:57:41.896	95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7
cmm5clmry0033hknwz8n9gffj	0101-1988-00566	gprocesos@energiapd.com	$2b$10$Zaa8ZclN/9IsaGZrqTbg3.sEWOF9mIzgZpqeHDpgk2fWsuWjwQOJG	SUYAPA ISABEL	MATUTE HERNANDEZ	jefe	fe4cd906-3b58-488b-83c2-fe905be1b30f	t	2026-02-27 20:31:57.07	2026-03-23 22:55:59.392	8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2
cmm5cloq4004ahknwyyz4efwe	0508-2004-00594	twilmer636@gmail.com	$2b$10$PPUqFmdwBqZwVAc51wzqE.J.QTRBnRbWMeZFvVPrU4V8PTOmLyULK	WILMER DAVID	MEJIA TORRES	empleado	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-02-27 20:31:59.596	2026-03-23 22:57:26.43	fbc3e7f1-41ca-4006-b78b-9879d8eec1ab
cmm5clnzr003uhknwli49183y	1621-1993-00490	marvinperdomo522@gmail.com	$2b$10$Jkz.aWPDj1UNluEevArQJudOePdlTAgsOkDuhnDwyG.wNZqi8jpuq	JOSE MARVIN	PEREZ PERDOMO	empleado	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-02-27 20:31:58.647	2026-03-24 16:23:50.632	4a2ea03d-ffd4-4160-895a-26db0d70fd3e
cmm5cllkm0027hknw3m8xktji	0501-1995-03252	kmelgar@energiapd.com	$2b$10$4wdjiNvkcUcV7KLuip5X5OfDDjyTllKSxoyQ8mdHR/iVtnuGdtwU6	KEIDY YOLIBETH	MELGAR CARBAJAL	jefe	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-02-27 20:31:55.511	2026-03-24 22:53:19.976	905361b2-11d4-4241-8905-06808eefd357
cmm5cljt5000whknwlx4vk6ff	1807-1992-01096	sarahym@energiapd.com	$2b$10$I/V8szh9GYk66MZI4oorOe2M6wwXvUDNrBfHEYACfDKT2EW9L3Noe	DINORA SARAHY	MUÑOZ CARCAMO	jefe	6827e3ee-7821-49c9-9132-241b6b91a255	t	2026-02-27 20:31:53.225	2026-03-25 17:52:18.406	77a1f5ff-15f2-418f-b2d1-fb97a18de52a
cmm5clov9004dhknwc626905r	0501-1989-01684	tania@energiapd.com	$2b$10$QQTTHiuWfkkZW2MIVmP4CeIWw1ucbQdyUItOPwMv6jkeRAvD4QEQ.	TANIA ALEJANDRA	MUÑOZ CARCAMO	empleado	\N	t	2026-02-27 20:31:59.781	2026-03-16 15:49:06.923	\N
cmm5clogi0044hknwybzs9xxn	0501-1997-04340	lfernandoherrera12@gmail.com	$2b$10$jFbRBDREgxNvtdc4qTw8ZeymFxGYcuYLVBfPRYDVE9vdlAunKp1qG	LUIS FERNANDO	ARITA HERRERA	empleado	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-02-27 20:31:59.25	2026-03-23 22:44:43.843	9fa0c900-aada-469b-881c-a12a4fe1c2a9
\.


--
-- TOC entry 5143 (class 0 OID 23876)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
de5e6cf3-16ca-47fb-854e-50bf4254d62f	b16ac4a4e9b156480c888106b66a84e94989dd76d4ae01ac577f4c54fccd3eba	2026-02-27 13:57:59.685751-06	20260226152808_inicial_kpis	\N	\N	2026-02-27 13:57:59.585798-06	1
0d85d586-c938-40c9-967c-db996c5e796d	248572b099bdd38d79dcfe97929ac06ee8159fa638360d252e4763d2daf63f1d	2026-02-27 13:57:59.689918-06	20260226164839_add_kpi_criticidad_operador	\N	\N	2026-02-27 13:57:59.686456-06	1
acc469e6-19b3-4586-9490-8c0d3fa00959	3cf31adb41d8037a00a754f9e5f74ad1403f2ab02d6dd0dd309d9c8976a81ea5	2026-02-27 13:57:59.707258-06	20260227195351_add_area_jerarquia	\N	\N	2026-02-27 13:57:59.690309-06	1
ded864db-97e1-4b8b-bbdb-00f68332b7b2	e8ae8e32f2050bcc7e78d767eccb8164ab10aee8fbf53f2f5b0166bb934d26c1	2026-02-27 14:49:33.030858-06	20260227204932_add_puestos_table	\N	\N	2026-02-27 14:49:32.911016-06	1
6aebd1ce-c51c-494f-891d-197f002c13bb	250731449670e0156607f7fed7237817286ef6ca95158b6a235df7ae17597f0c	2026-03-02 11:12:02.354797-06	20260302171202_add_sessions_table	\N	\N	2026-03-02 11:12:02.258832-06	1
3ff68bb2-7ace-404e-a3ae-723a421b97d3	46629d0f4c2599131fcde77ba96fdd6fe47f2e32e71823ffa8079f9eed48e9ff	2026-03-02 15:11:21.313366-06	20260302211121_add_refresh_token	\N	\N	2026-03-02 15:11:21.245826-06	1
c28aa327-5e7e-473a-b05d-f369d1e3fe01	b61d6b41fde07505a0d7d3da14db54c3558ecd66c924126ee7cd873173e4440c	2026-03-03 10:25:17.76835-06	20260303162517_add_evidencias_kpi	\N	\N	2026-03-03 10:25:17.642561-06	1
8a1e6958-ff96-4a1a-9e1f-95768554abcb	9be6ca792cbec0ecfcff217f61c29608438ec7e3d6e1425377644bb2d6365308	2026-03-05 15:08:38.359019-06	20260305210838_revision_adicional	\N	\N	2026-03-05 15:08:38.298162-06	1
7af37b19-096b-423f-a755-49ef73adc94f	13fd54b7761ce500a2ee351e783235c6750f7aaa07a7c1453e9b9db3bff1d2c6	2026-03-24 10:30:20.694036-06	20260324163020_add_aplica_orden_trabajo	\N	\N	2026-03-24 10:30:20.66167-06	1
b7607b5b-ee29-4b33-bde4-2783aa34f983	a940cf54efe84af0fd5e59e5b9fd33e9a5c7e0a1edcab94b8b170687700c4950	2026-03-24 15:04:50.515572-06	20260324210450_add_horas_limite_orden	\N	\N	2026-03-24 15:04:50.491817-06	1
\.


--
-- TOC entry 5155 (class 0 OID 24175)
-- Dependencies: 229
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id, nombre, descripcion, jefe_id, promedio_global, total_kpis, kpis_rojos, porcentaje_rojos, nivel_riesgo, ranking, comentario_rrhh, accion_sugerida, responsable, activa, area_padre_id, created_at, updated_at) FROM stdin;
90820b7e-932d-4bbd-ad1a-c0402bf35049	Área de Proyectos	\N	cmm5clk7i0017hknwzlvutm75	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:09:09.368	2026-03-16 16:09:09.368
370785a3-a42c-4053-ac88-e3b2d7c123fb	Área de Gerencia	\N	cmm5clk2m0013hknwzxccsy5e	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:10:12.086	2026-03-16 16:10:12.086
b492ee01-a0bf-44e9-8d5c-fea697a9132a	Unidad Ambiental	\N	cmm5clmwv0036hknwe2jhm5va	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:18:45.047	2026-03-16 17:18:45.047
4908b343-924e-44d0-a529-afe75f4b8e23	Calidad	\N	cmm5closl004bhknwjgenz87g	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:19:14.681	2026-03-16 17:19:14.681
fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	Área Técnica	\N	cmm5clm68002lhknwbbih6i87	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:01:25.911	2026-03-16 16:03:42.496
5f5fedee-1ec7-4327-8473-009a95a2376d	Área Comercial	\N	cmm5clinw0003hknwoy6isr2c	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:04:02.722	2026-03-16 16:04:02.722
6827e3ee-7821-49c9-9132-241b6b91a255	Área Administrativa	\N	cmm5cljt5000whknwlx4vk6ff	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:03:28.032	2026-03-16 16:04:12.42
a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	Área de BlockChain	\N	cmmtduuoi0001hktsmzb9ce31	0	0	0	0	BAJO	0	\N	\N	\N	t	\N	2026-03-16 16:08:34.404	2026-03-16 21:45:31.141
89629a77-e179-40ee-8c65-3f48e7cc55c8	SMO	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	2026-03-16 17:07:16.045	2026-03-24 23:06:15.859
b6830dac-ed5b-428a-bea5-be4ca4676347	USED	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	2026-03-16 17:07:41.001	2026-03-24 23:06:15.859
cb57220b-e0fd-45e0-bf9c-89f8d3245de9	UPM	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	2026-03-16 17:08:25.233	2026-03-24 23:06:15.859
8aac33f9-5688-41dc-b859-44a1a6b313a1	UAT	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	2026-03-16 17:08:36.352	2026-03-24 23:06:15.859
947566df-cd44-4ea7-aeb2-2adbc1b73a25	PMO	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:08:59.13	2026-03-24 23:06:15.859
5bf14aac-20bf-440a-8210-752e98edd3ee	Ingeniería-Diseño	\N	cmm5clkxb001qhknw2emewrh8	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 21:46:03.033	2026-03-16 21:49:16.382
7c631196-ec9b-4751-ac5d-4e4671056c36	Unidad de Ingeniería - Líneas	\N	cmm5clldn0022hknwej5ftzjd	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 21:47:59.429	2026-03-16 21:49:33.583
923edd2b-80bb-4d16-a5c6-4ee2871335ce	Unidad Civil	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:09:22.052	2026-03-24 23:06:15.859
191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	Unidad Electrica	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:09:47.813	2026-03-24 23:06:15.859
2dcf6888-74fc-4ed7-8963-eb1003650dfc	Unidad Mecanica	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	90820b7e-932d-4bbd-ad1a-c0402bf35049	2026-03-16 17:17:45.093	2026-03-24 23:06:15.859
76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	Compras Nacionales	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	2026-03-16 20:31:20.115	2026-03-24 23:06:15.859
7221ded4-dd4c-450f-80ca-10361ba74274	Compras Internacionales	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	2026-03-16 20:31:46.464	2026-03-24 23:06:15.859
d431a980-bf1a-4dbb-8d6f-0cad33495bdc	Import / Export	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	2026-03-16 20:33:55.61	2026-03-24 23:06:15.859
fa8af43a-6a19-48a9-87b2-11f49b6b38f3	Logistica	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	2026-03-16 20:34:46.413	2026-03-24 23:06:15.859
c921aca9-eabc-4246-a9e4-2ed890587ad1	Almacen	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	2026-03-16 20:35:04.089	2026-03-24 23:06:15.859
8962f5ab-f870-4fa9-9dd9-705a961e518b	Ventas	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	5f5fedee-1ec7-4327-8473-009a95a2376d	2026-03-16 20:35:29.037	2026-03-24 23:06:15.859
4027d1be-6dc1-4b09-a2f7-78441396efe1	Mercadeo	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	5f5fedee-1ec7-4327-8473-009a95a2376d	2026-03-16 20:35:42.645	2026-03-24 23:06:15.859
115bb66a-d2f2-4a86-a45c-6b5573ad9d03	Licitaciones	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	5f5fedee-1ec7-4327-8473-009a95a2376d	2026-03-16 20:36:21.421	2026-03-24 23:06:15.859
c850514e-c1d2-41c5-b886-86640891247d	presupuestos	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	5f5fedee-1ec7-4327-8473-009a95a2376d	2026-03-16 20:38:28.124	2026-03-24 23:06:15.859
8c2d8df2-7183-4bb6-b0ad-36f1525e2118	RRHH	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:40:55.174	2026-03-24 23:06:15.859
a9780486-f1ab-41e8-9d5f-c016d666b1ff	Contabilidad	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:41:19.507	2026-03-24 23:06:15.859
fe4cd906-3b58-488b-83c2-fe905be1b30f	ISO	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:41:31.737	2026-03-24 23:06:15.859
808be458-29be-48b6-9cac-87acaee84d4f	Flota Vehicular	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:42:03.91	2026-03-24 23:06:15.859
19c19474-d3da-48ca-94dc-a536ee9b2205	Legal	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:42:16.036	2026-03-24 23:06:15.859
e5419ce5-90a7-4a9d-83d9-c67197b72b35	Administración de Gerencias	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	370785a3-a42c-4053-ac88-e3b2d7c123fb	2026-03-16 20:42:52.797	2026-03-24 23:06:15.859
b396765f-621a-4ad6-8572-060d0ff5fe96	IT / Ciber seguridad	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	370785a3-a42c-4053-ac88-e3b2d7c123fb	2026-03-16 20:43:10.21	2026-03-24 23:06:15.859
871edc75-df17-4922-ac8f-95af5c770f85	SYSO	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	6827e3ee-7821-49c9-9132-241b6b91a255	2026-03-16 20:41:49.082	2026-03-24 23:06:15.859
9a78442a-f1d2-478d-9e18-ff8c81d30580	Seguridad y monitoreo	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	370785a3-a42c-4053-ac88-e3b2d7c123fb	2026-03-16 20:43:26.358	2026-03-24 23:06:15.859
7216c1ae-8e48-4956-83b1-fdc347ef591e	Inteligencia de Negocios	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	370785a3-a42c-4053-ac88-e3b2d7c123fb	2026-03-16 20:43:42.25	2026-03-24 23:06:15.859
d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	Proyectos Gerenciales	\N	\N	0	0	0	0	BAJO	0	\N	\N	\N	t	370785a3-a42c-4053-ac88-e3b2d7c123fb	2026-03-16 20:43:59.626	2026-03-24 23:06:15.859
\.


--
-- TOC entry 5158 (class 0 OID 27999)
-- Dependencies: 232
-- Data for Name: evidencias_kpi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evidencias_kpi (id, kpi_id, empleado_id, periodo, archivo_url, tipo, nombre, tamanio, valor_numerico, nota, intento, status, motivo_rechazo, apelacion, respuesta_apelacion, fecha_apelacion, es_fuera_de_tiempo, fecha_subida, revisado_por, fecha_revision, created_at, updated_at, "userId") FROM stdin;
\.


--
-- TOC entry 5156 (class 0 OID 24909)
-- Dependencies: 230
-- Data for Name: puestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puestos (id, nombre, descripcion, area_id, activo, created_at, updated_at) FROM stdin;
45df59e8-e98b-4686-b42f-5de21ffd215f	Jefe de Licitaciones	\N	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	t	2026-03-16 16:50:05.487	2026-03-16 20:52:04.508
251e8bf2-d088-48fd-82c9-3f15c3eaf02c	Jefe de Presupuestos	\N	c850514e-c1d2-41c5-b886-86640891247d	t	2026-03-16 16:50:42.417	2026-03-16 20:52:17.226
2b35ea05-d6c5-43d3-bb4b-69c0466de00f	Jefe de Ventas	\N	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-03-16 16:49:33.714	2026-03-16 20:52:24.669
63681b78-b93f-472b-96b0-bc72e72f4a2c	Jefe Gerencias	\N	e5419ce5-90a7-4a9d-83d9-c67197b72b35	t	2026-03-16 16:52:29.396	2026-03-16 20:53:46.463
9765fcf4-8fd8-47fb-9afa-4b55f7134a5c	Jefe Inteligencia de Negocios	\N	7216c1ae-8e48-4956-83b1-fdc347ef591e	t	2026-03-16 16:53:19.709	2026-03-16 20:53:52.619
628ed6bc-8f74-4dba-8cd7-e3ee8c61f615	Jefe Seguridad y Monitoreo	\N	9a78442a-f1d2-478d-9e18-ff8c81d30580	t	2026-03-16 16:53:01.822	2026-03-16 20:54:11.828
77a1f5ff-15f2-418f-b2d1-fb97a18de52a	Gerencia Administrativa Financiera	\N	6827e3ee-7821-49c9-9132-241b6b91a255	t	2026-03-16 20:55:03.181	2026-03-16 20:55:03.181
2c22805e-4c2d-4ee4-bbaf-1d1edd1293fb	Gerencia Administrativa Tecnica	\N	fd61ac12-dcbc-4764-8d78-07aa6dec9ab9	t	2026-03-16 20:58:33.838	2026-03-16 20:58:33.838
0b28a256-8b5f-4cd5-92d0-66477edd832a	Gerencia General	\N	90820b7e-932d-4bbd-ad1a-c0402bf35049	t	2026-03-16 20:59:00.141	2026-03-16 20:59:00.141
47caf69f-2485-4788-a3e9-ce5605cb2502	Desarrollador	\N	7216c1ae-8e48-4956-83b1-fdc347ef591e	t	2026-03-16 21:21:36.603	2026-03-16 21:21:36.603
34998070-af98-4fb7-8574-36937ff05677	Planificador de Área Técnica	\N	89629a77-e179-40ee-8c65-3f48e7cc55c8	t	2026-03-16 21:21:43.73	2026-03-16 21:21:43.73
0a5fbf2d-ee16-4ab2-8ddd-b41580fdcd3e	Administrador del Área Técnica	\N	89629a77-e179-40ee-8c65-3f48e7cc55c8	t	2026-03-16 21:22:36.963	2026-03-16 21:22:36.963
fe746a43-818c-4352-8e67-609bcb16b149	Oficial SYSO - Unidades de Negocio	\N	89629a77-e179-40ee-8c65-3f48e7cc55c8	t	2026-03-16 21:23:13.761	2026-03-16 21:23:13.761
d1dd5032-df3a-4e19-90cc-1229c547e22a	Encargado de Mantenimiento IT	\N	b396765f-621a-4ad6-8572-060d0ff5fe96	t	2026-03-16 21:23:43.221	2026-03-16 21:23:43.221
7018e73b-b29a-426a-88c4-6c51a464edad	Ingeniero de USED	\N	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-03-16 21:24:40.212	2026-03-16 21:24:40.212
f94b42d4-5097-465c-93f3-058a34575f8c	Ingeniero de UAT	\N	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-03-16 21:24:51.518	2026-03-16 21:24:51.518
167eb963-84c5-49c6-b317-71beed9ad0b5	Ingeniero UPM	\N	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-03-16 21:25:02.865	2026-03-16 21:25:02.865
e9f3e5d3-c557-4c1f-b92e-f0d0aecd2d97	Supervisor Técnico	\N	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-03-16 21:25:37.942	2026-03-16 21:25:37.942
9fcd6c02-2586-4b78-bcbb-5c1cf1b102b0	Laboratista	\N	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-03-16 21:25:57.953	2026-03-16 21:25:57.953
fbc3e7f1-41ca-4006-b78b-9879d8eec1ab	Técnico USED	\N	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-03-16 21:27:01.567	2026-03-16 21:27:01.567
75e9d907-6974-45a2-81d7-f6855cf2247a	Técnico UPM	\N	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-03-16 21:27:14.645	2026-03-16 21:27:14.645
84b3b3b8-7ab1-4f41-9978-e90661648294	Técnico UAT	\N	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-03-16 21:27:32.428	2026-03-16 21:27:32.428
42a5c8ca-bddb-4efb-9b63-3bd68bd91233	Encargado de Control y Seguimiento de Proyectos	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-16 21:30:21.386	2026-03-16 21:30:21.386
5b3bc564-11c7-4787-99fb-b916cdee3390	Encargado de Documentacion y KPIS de Proyectos	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-16 21:34:08.567	2026-03-16 21:34:08.567
13beaf85-81f1-4887-801a-04131a08d73b	Administrador de Contraros	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-16 21:34:48.453	2026-03-16 21:34:48.453
7a36a221-7bd4-4d23-8c24-f3f54dc963ca	Encargado de Presupuesto y Estimaciones	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-16 21:35:21.668	2026-03-16 21:35:21.668
72acb457-4425-4e6b-826c-147172df2d5e	Analista de Inteligencia de Negocios	\N	7216c1ae-8e48-4956-83b1-fdc347ef591e	t	2026-03-16 21:20:33.403	2026-03-16 21:44:43.879
b43eae18-b989-4c2a-81bc-1cc94a9e6b5b	Ingeniería - Diseño	\N	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-03-16 21:51:44.275	2026-03-16 21:51:44.275
12c4a141-1b61-43d9-8e7c-2f3203040934	Coordinadora de operaciones	\N	a39b14cd-1ccc-4aa9-9b06-88a2f936aea5	t	2026-03-16 16:12:47.633	2026-03-16 16:12:47.633
31650d56-28ac-4eb8-863a-076e725d10f4	Jefe de IT/Ciberseguridad	\N	b396765f-621a-4ad6-8572-060d0ff5fe96	t	2026-03-16 16:52:41.051	2026-03-16 22:06:49.136
b4d09e9f-7d6f-45dc-a73e-e9bfab582c31	Encargado de Proyectos Gerenciales	\N	d7f9206d-7bed-4eba-88a0-1f4cefd3fc66	t	2026-03-16 16:53:31.739	2026-03-16 22:08:12.152
e7098b01-b321-49c9-8b06-f328c048bf77	Unidad de Compras Internacionales	\N	7221ded4-dd4c-450f-80ca-10361ba74274	t	2026-03-16 16:48:39.462	2026-03-16 22:11:27.129
95f87b6e-c7aa-4cc7-aaf8-2743d174b3e7	Encargado Almacen	\N	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-16 16:49:17.416	2026-03-16 22:11:51.709
9fa0c900-aada-469b-881c-a12a4fe1c2a9	Auxiliar de Almacen	\N	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-16 22:12:29.571	2026-03-16 22:12:29.571
41b1d6a1-a569-4e60-98ef-e3591fe9e211	Especialista de Importaciones	\N	d431a980-bf1a-4dbb-8d6f-0cad33495bdc	t	2026-03-16 16:48:51.714	2026-03-16 22:13:23.751
c497c878-1300-40e1-af43-682ca2d5f8c9	Logística Operativa	\N	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	t	2026-03-16 16:49:05.879	2026-03-16 22:13:48.839
cdb0b914-13e2-460b-869b-a11f1a6070b0	Marketing	\N	4027d1be-6dc1-4b09-a2f7-78441396efe1	t	2026-03-16 16:49:47.434	2026-03-16 22:29:18.109
0a5bb1cb-dcfa-4461-87f2-627a133d8dd2	Analista Financiero	\N	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-03-16 16:51:22.324	2026-03-16 22:42:01.14
b3b2663e-3d10-48ea-9f34-c80d21b1924f	Generalista de Recursos Humanos	\N	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-03-16 16:51:11.329	2026-03-16 22:48:51.974
c1826f7f-629f-4216-b103-9c22105e8b36	Encargado de Asuntos Legales	\N	19c19474-d3da-48ca-94dc-a536ee9b2205	t	2026-03-16 16:52:17.788	2026-03-16 22:50:31.716
f9e2962e-8625-4a87-8766-87d936da8f0a	Encargado de flota vehicular	\N	808be458-29be-48b6-9cac-87acaee84d4f	t	2026-03-16 16:52:04.487	2026-03-16 22:50:49.198
8c8b88eb-ddb3-43bc-80ef-320ce7cda8f2	Gestor de Procesos	\N	fe4cd906-3b58-488b-83c2-fe905be1b30f	t	2026-03-16 16:51:35.929	2026-03-16 22:51:12.563
56472212-3718-498a-9a47-61c5799818de	Jefe Unidad Ambiental	\N	b492ee01-a0bf-44e9-8d5c-fea697a9132a	t	2026-03-16 17:20:11.329	2026-03-16 17:20:11.329
593953de-2e4e-4f8d-8bb8-97a31c9cce07	Jefe de calidad	\N	4908b343-924e-44d0-a529-afe75f4b8e23	t	2026-03-16 17:21:05.159	2026-03-16 17:21:05.159
f802ee92-24f9-454a-b56b-5ba147e61501	Jefe SMO	\N	89629a77-e179-40ee-8c65-3f48e7cc55c8	t	2026-03-16 16:45:39.993	2026-03-16 20:48:15.457
15ae8ba3-5a09-4226-aebf-a9c87aba8588	Jefe UAT	\N	8aac33f9-5688-41dc-b859-44a1a6b313a1	t	2026-03-16 16:46:15.218	2026-03-16 20:48:24.052
8e729726-8630-47ac-88d8-4a9b1b896d0d	Jefe UPM	\N	cb57220b-e0fd-45e0-bf9c-89f8d3245de9	t	2026-03-16 16:46:05.974	2026-03-16 20:48:33.122
ad872614-5cc6-43a2-bf40-1043e58ae831	Jefe USED	\N	b6830dac-ed5b-428a-bea5-be4ca4676347	t	2026-03-16 16:45:47.741	2026-03-16 20:49:17.055
70676c5e-a584-4317-a5e5-67779f53e103	Jefe PMO	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-16 16:46:26.218	2026-03-16 20:49:58.19
4fd2101a-ba36-4824-9d63-3e68d0177cef	Jefe unidad Civil	\N	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-03-16 16:46:40.216	2026-03-16 20:50:20.737
e74cac1c-d745-4860-a5e2-51dd27e28143	Jefe Unidad Electrica	\N	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-16 16:46:52.826	2026-03-16 20:50:34.986
51e54cc5-dffe-45e0-aacd-3f1cc0c580a8	Jefe Unidad Mecanica	\N	2dcf6888-74fc-4ed7-8963-eb1003650dfc	t	2026-03-16 16:47:09.461	2026-03-16 20:50:41.787
d58ed957-8eee-4a7f-9cf6-cb340ea1a814	Gestor de SYSO	\N	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-16 16:51:50.721	2026-03-16 22:52:36.435
b22bfe2a-f5c7-4efe-810e-7fe60fbc0a97	Compras Nacionales	\N	76e6d81e-6174-4d9f-8d84-80fda0b2dc3d	t	2026-03-16 16:48:25.811	2026-03-16 22:12:57.704
b9ad8309-113e-4ff4-a3d6-0551c992c02b	Diseñador Gráfico	\N	4027d1be-6dc1-4b09-a2f7-78441396efe1	t	2026-03-16 22:30:13.3	2026-03-16 22:30:13.3
62481707-fc46-4f6d-ac8d-e38235d8ba29	Ventas Generación	\N	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-03-16 22:35:30.765	2026-03-16 22:35:30.765
5e1877fe-5969-410f-8ee6-f2cd9f0dd4e3	Ventas Industria	\N	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-03-16 22:36:19.209	2026-03-16 22:36:37.013
c828b5c4-0120-4474-9df1-8c7c4a44db10	Ventas Suministros	\N	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-03-16 22:37:06.395	2026-03-16 22:37:06.395
d609c25e-8f53-4e47-870f-33caf899b7b8	Business Developer	\N	8962f5ab-f870-4fa9-9dd9-705a961e518b	t	2026-03-16 22:37:45.109	2026-03-16 22:37:45.109
f1a840a1-caf7-477a-8748-59bc8366e735	Licitaciones	\N	115bb66a-d2f2-4a86-a45c-6b5573ad9d03	t	2026-03-16 22:38:18.199	2026-03-16 22:38:18.199
6dc65853-cd35-4c7b-9422-0e7aaf379908	Proposal Engineer	\N	c850514e-c1d2-41c5-b886-86640891247d	t	2026-03-16 22:39:07.019	2026-03-16 22:39:07.019
91f83910-89a9-4312-813f-0bf79efccbe6	Contador General	\N	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-03-16 22:42:31.829	2026-03-16 22:42:31.829
fa3b8780-14a3-4fbf-8ca6-16201624508a	Auditor de Viaticos	\N	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-03-16 22:44:59.243	2026-03-16 22:45:53.701
d7a085a5-512a-4642-b360-9f232b92c20a	Contador Jr.	\N	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-03-16 22:46:09.947	2026-03-16 22:46:09.947
0cf75a1e-4b46-4728-a266-e3c0767b01b9	Auxiliar Contable	\N	a9780486-f1ab-41e8-9d5f-c016d666b1ff	t	2026-03-16 22:46:44.503	2026-03-16 22:46:44.503
905361b2-11d4-4241-8905-06808eefd357	Gestor de Recursos Humanos	\N	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-03-16 22:49:06.294	2026-03-16 22:49:06.294
c25115ff-5982-4d49-907a-d66b0497b5da	Encargado de Reclutamiento	\N	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-03-16 22:49:26.111	2026-03-16 22:49:26.111
a4c07a43-ab93-4467-af09-eccd112f12d8	Asistente de Recursos Humanos / Recepción	\N	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-03-16 22:49:46.009	2026-03-16 22:49:46.009
1067a5a0-7ae1-4a86-844c-14be0fede89b	Encargada de Limpieza	\N	8c2d8df2-7183-4bb6-b0ad-36f1525e2118	t	2026-03-16 22:50:00.028	2026-03-16 22:50:00.028
05207495-2ab9-43a1-b24d-bf093614c3f8	Oficial ISO	\N	fe4cd906-3b58-488b-83c2-fe905be1b30f	t	2026-03-16 22:51:37.273	2026-03-16 22:51:37.273
ff7d3e82-3b5b-4101-b900-53951817a187	Oficial de SYSO Unidades de Negocio	\N	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-16 22:52:55.814	2026-03-16 22:52:55.814
b4409975-ef69-45e8-a0e9-7aa80d29aa3d	Oficial de SYSO Proyectos	\N	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-16 22:53:09.945	2026-03-16 22:53:09.945
e1636fdb-be70-4831-906a-89932b337f15	Gestor Civil	\N	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-03-20 17:25:28.226	2026-03-20 17:25:28.226
e7a26477-ba32-46e3-b62a-2ab95874c8db	Gestor Eléctrico	\N	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-20 17:31:10.887	2026-03-20 17:31:10.887
e030b8aa-536d-4ff4-a19e-924abd76edfd	Gestor Mecánico	\N	2dcf6888-74fc-4ed7-8963-eb1003650dfc	t	2026-03-20 17:31:46.019	2026-03-20 17:31:46.019
ca9b6ea1-b19c-4886-95be-e779b4bd7330	Coordinador de Ingenieria	\N	5bf14aac-20bf-440a-8210-752e98edd3ee	t	2026-03-20 17:33:18.129	2026-03-20 17:33:18.129
8f13dde6-eb52-4a36-99a4-a07946b016d6	Ingeniero residente civil	\N	923edd2b-80bb-4d16-a5c6-4ee2871335ce	t	2026-03-20 20:05:47.929	2026-03-20 20:05:47.929
69239f58-ae3f-4b23-a6df-6b598704bfd1	Ingeniero residente electrico	\N	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-20 20:06:05.032	2026-03-20 20:06:05.032
da9b460a-6070-4286-9138-14726f795b74	Ingeniero residente mecanico	\N	2dcf6888-74fc-4ed7-8963-eb1003650dfc	t	2026-03-20 20:06:18.003	2026-03-20 20:06:18.003
5da7f92d-acb3-43d9-87ba-a3179f2d0ca1	Supervisor Técnico	\N	2dcf6888-74fc-4ed7-8963-eb1003650dfc	t	2026-03-23 15:47:24.522	2026-03-23 15:47:24.522
843ae3c3-585c-41df-8fb7-22e8b45adbe6	Almacenista	\N	c921aca9-eabc-4246-a9e4-2ed890587ad1	t	2026-03-23 15:59:25.428	2026-03-23 15:59:25.428
2368972b-83ca-4232-b31f-98e5f88d272a	Técnico Eléctrico	\N	191ecc41-1347-4c41-8b6b-dcd6fbdbbfbb	t	2026-03-23 16:42:49.794	2026-03-23 16:42:49.794
4391a454-1349-4118-b2e5-7a82cf82c444	SENIOR ELECTROMECHANICAL ENGINEER	\N	7c631196-ec9b-4751-ac5d-4e4671056c36	t	2026-03-20 17:32:39.82	2026-03-23 16:49:59.401
3894d976-60b0-4664-acf2-9b32281c211d	Ingeniero de Calidad	\N	4908b343-924e-44d0-a529-afe75f4b8e23	t	2026-03-23 17:20:10.244	2026-03-23 17:20:10.244
77137125-a1cc-43b8-8461-8c6f742e95a7	Ingeniería-Diseño	\N	7c631196-ec9b-4751-ac5d-4e4671056c36	t	2026-03-23 19:31:17.962	2026-03-23 19:31:17.962
a1833a07-7ceb-496b-bcee-362b10c5eb28	Administrador Operativo	\N	947566df-cd44-4ea7-aeb2-2adbc1b73a25	t	2026-03-23 19:43:27.425	2026-03-23 19:43:27.425
54fc159d-2b2a-4557-8dc4-1049ee806b15	Oficial SYSYO Área Técnica	\N	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-23 19:58:53.557	2026-03-23 19:58:53.557
ff48062b-6108-4e20-a42a-7f6d08906ca3	Conserje/Motorista	\N	fa8af43a-6a19-48a9-87b2-11f49b6b38f3	t	2026-03-23 21:22:05.071	2026-03-23 21:22:05.071
4a2ea03d-ffd4-4160-895a-26db0d70fd3e	Auxiliar de Mantenimiento	\N	871edc75-df17-4922-ac8f-95af5c770f85	t	2026-03-24 16:17:18.164	2026-03-24 16:17:18.164
\.


--
-- TOC entry 5159 (class 0 OID 28879)
-- Dependencies: 233
-- Data for Name: revisores_asignados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revisores_asignados (id, empleado_id, revisor_id, motivo, activo, created_at, updated_at) FROM stdin;
cmmdzlaib0001hkl8ndn0w9zc	cmm5cljt5000whknwlx4vk6ff	cmm5clk2m0013hknwzxccsy5e	Evaluada por CEO	t	2026-03-05 21:37:41.747	2026-03-05 21:37:41.747
cmmdzlq1z0003hkl8n1kc2bvm	cmm5cllkm0027hknw3m8xktji	cmm5cljt5000whknwlx4vk6ff	jefe inmediato	t	2026-03-05 21:38:01.896	2026-03-05 21:38:01.896
cmmtof36b001thktsrwne8pjn	cmm5clj0e000chknw6zi83002	cmm5clk2m0013hknwzxccsy5e	\N	t	2026-03-16 21:09:15.346	2026-03-16 21:09:15.346
cmmtogbeo001vhktsu69ee0b5	cmm5clm3v002khknwbhg41p17	cmm5cljt5000whknwlx4vk6ff	\N	t	2026-03-16 21:10:12.672	2026-03-16 21:10:12.672
cmmtogshk001xhktsa136k7zn	cmm5cll4b001vhknwsb9kb922	cmm5clk2m0013hknwzxccsy5e	\N	t	2026-03-16 21:10:34.809	2026-03-16 21:10:34.809
cmmtohowe001zhkts1el3jb8p	cmm5clkek001chknwlbyazv23	cmm5clk2m0013hknwzxccsy5e	\N	t	2026-03-16 21:11:16.814	2026-03-16 21:11:16.814
\.


--
-- TOC entry 5157 (class 0 OID 25669)
-- Dependencies: 231
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, device_info, ip_address, user_agent, expires_at, created_at, last_activity, access_token, refresh_token) FROM stdin;
eb1414e031780a770c40bf48fb26f4c2	cmm5cljt5000whknwlx4vk6ff	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb|::ffff:192.168.10.166	::ffff:192.168.10.166	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-03-25 20:08:26.459	2026-03-25 17:52:15.395	2026-03-25 19:08:27.064	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW01Y2xqdDUwMDB3aGtud2x4NHZrNmZmIiwiZW1haWwiOiJzYXJhaHltQGVuZXJnaWFwZC5jb20iLCJyb2xlIjoiamVmZSIsInNlc3Npb25JZCI6ImViMTQxNGUwMzE3ODBhNzcwYzQwYmY0OGZiMjZmNGMyIiwiaWF0IjoxNzc0NDY1NzA2LCJleHAiOjE3NzQ0NjY2MDZ9.bvyANBofX4lHlslurn7OT67PrIRh2SRgor8YDy38-iw	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW01Y2xqdDUwMDB3aGtud2x4NHZrNmZmIiwic2Vzc2lvbklkIjoiZWIxNDE0ZTAzMTc4MGE3NzBjNDBiZjQ4ZmIyNmY0YzIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ2NTcwNiwiZXhwIjoxNzc0NDY5MzA2fQ.VEKNYnsVOYJPrgLv3GfUO18QcBXTKmj2i7InV-AtFmc
962583588e1949a152fd3b5e530279e5	cmm5clkgu001dhknwtidqv8yi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb|::ffff:192.168.3.38	::ffff:192.168.3.38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-03-25 19:52:11.087	2026-03-25 17:52:10.887	2026-03-25 18:52:11.087	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW01Y2xrZ3UwMDFkaGtud3RpZHF2OHlpIiwiZW1haWwiOiJzb2x1Y2lvbmVzdGVjbm9sb2dpY2FzQGVuZXJnaWFwZC5jb20iLCJyb2xlIjoiYWRtaW4iLCJzZXNzaW9uSWQiOiI5NjI1ODM1ODhlMTk0OWExNTJmZDNiNWU1MzAyNzllNSIsImlhdCI6MTc3NDQ2NDczMSwiZXhwIjoxNzc0NDY1NjMxfQ.ZSnEri38zyBNorcthkDSBV3-p_OA4abXP9RX6Mt8bzg	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW01Y2xrZ3UwMDFkaGtud3RpZHF2OHlpIiwic2Vzc2lvbklkIjoiOTYyNTgzNTg4ZTE5NDlhMTUyZmQzYjVlNTMwMjc5ZTUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ2NDczMSwiZXhwIjoxNzc0NDY4MzMxfQ.QlC8vwNArnXRSPx3Sgo_L5Jz-QZKx1D5IrOoa9zHJAQ
\.


--
-- TOC entry 4939 (class 2606 OID 24018)
-- Name: Alerta Alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alerta"
    ADD CONSTRAINT "Alerta_pkey" PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 24008)
-- Name: EvaluacionDetalle EvaluacionDetalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EvaluacionDetalle"
    ADD CONSTRAINT "EvaluacionDetalle_pkey" PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 24000)
-- Name: Evaluacion Evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_pkey" PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 23959)
-- Name: Evidencia Evidencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evidencia"
    ADD CONSTRAINT "Evidencia_pkey" PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 23919)
-- Name: KPI KPI_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KPI"
    ADD CONSTRAINT "KPI_pkey" PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 23934)
-- Name: OrdenTrabajo OrdenTrabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdenTrabajo"
    ADD CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 23988)
-- Name: RevisionJefe RevisionJefe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RevisionJefe"
    ADD CONSTRAINT "RevisionJefe_pkey" PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 23979)
-- Name: SolicitudEdicion SolicitudEdicion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudEdicion"
    ADD CONSTRAINT "SolicitudEdicion_pkey" PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 23969)
-- Name: SolicitudTarea SolicitudTarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudTarea"
    ADD CONSTRAINT "SolicitudTarea_pkey" PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 23947)
-- Name: Tarea Tarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tarea"
    ADD CONSTRAINT "Tarea_pkey" PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 23894)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 23884)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 24189)
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 28010)
-- Name: evidencias_kpi evidencias_kpi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencias_kpi
    ADD CONSTRAINT evidencias_kpi_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 24917)
-- Name: puestos puestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos
    ADD CONSTRAINT puestos_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 28887)
-- Name: revisores_asignados revisores_asignados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisores_asignados
    ADD CONSTRAINT revisores_asignados_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 25677)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 1259 OID 24061)
-- Name: Alerta_areaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_areaId_idx" ON public."Alerta" USING btree ("areaId");


--
-- TOC entry 4935 (class 1259 OID 24062)
-- Name: Alerta_empleadoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_empleadoId_idx" ON public."Alerta" USING btree ("empleadoId");


--
-- TOC entry 4936 (class 1259 OID 24063)
-- Name: Alerta_evaluacionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_evaluacionId_idx" ON public."Alerta" USING btree ("evaluacionId");


--
-- TOC entry 4937 (class 1259 OID 24065)
-- Name: Alerta_nivel_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_nivel_idx" ON public."Alerta" USING btree (nivel);


--
-- TOC entry 4940 (class 1259 OID 24064)
-- Name: Alerta_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_status_idx" ON public."Alerta" USING btree (status);


--
-- TOC entry 4941 (class 1259 OID 24066)
-- Name: Alerta_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alerta_tipo_idx" ON public."Alerta" USING btree (tipo);


--
-- TOC entry 4928 (class 1259 OID 24060)
-- Name: EvaluacionDetalle_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EvaluacionDetalle_estado_idx" ON public."EvaluacionDetalle" USING btree (estado);


--
-- TOC entry 4929 (class 1259 OID 24057)
-- Name: EvaluacionDetalle_evaluacionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EvaluacionDetalle_evaluacionId_idx" ON public."EvaluacionDetalle" USING btree ("evaluacionId");


--
-- TOC entry 4930 (class 1259 OID 24058)
-- Name: EvaluacionDetalle_kpiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EvaluacionDetalle_kpiId_idx" ON public."EvaluacionDetalle" USING btree ("kpiId");


--
-- TOC entry 4931 (class 1259 OID 24059)
-- Name: EvaluacionDetalle_ordenTrabajoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EvaluacionDetalle_ordenTrabajoId_idx" ON public."EvaluacionDetalle" USING btree ("ordenTrabajoId");


--
-- TOC entry 4921 (class 1259 OID 24055)
-- Name: Evaluacion_anio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evaluacion_anio_idx" ON public."Evaluacion" USING btree (anio);


--
-- TOC entry 4922 (class 1259 OID 24052)
-- Name: Evaluacion_empleadoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evaluacion_empleadoId_idx" ON public."Evaluacion" USING btree ("empleadoId");


--
-- TOC entry 4923 (class 1259 OID 24056)
-- Name: Evaluacion_empleadoId_periodo_anio_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Evaluacion_empleadoId_periodo_anio_key" ON public."Evaluacion" USING btree ("empleadoId", periodo, anio);


--
-- TOC entry 4924 (class 1259 OID 24053)
-- Name: Evaluacion_evaluadorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evaluacion_evaluadorId_idx" ON public."Evaluacion" USING btree ("evaluadorId");


--
-- TOC entry 4927 (class 1259 OID 24054)
-- Name: Evaluacion_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evaluacion_status_idx" ON public."Evaluacion" USING btree (status);


--
-- TOC entry 4903 (class 1259 OID 24041)
-- Name: Evidencia_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evidencia_status_idx" ON public."Evidencia" USING btree (status);


--
-- TOC entry 4904 (class 1259 OID 24040)
-- Name: Evidencia_tareaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evidencia_tareaId_idx" ON public."Evidencia" USING btree ("tareaId");


--
-- TOC entry 4881 (class 1259 OID 24029)
-- Name: KPI_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KPI_activo_idx" ON public."KPI" USING btree (activo);


--
-- TOC entry 4882 (class 1259 OID 24028)
-- Name: KPI_areaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KPI_areaId_idx" ON public."KPI" USING btree ("areaId");


--
-- TOC entry 4883 (class 1259 OID 24027)
-- Name: KPI_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "KPI_key_key" ON public."KPI" USING btree (key);


--
-- TOC entry 4886 (class 1259 OID 24919)
-- Name: KPI_puesto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KPI_puesto_id_idx" ON public."KPI" USING btree (puesto_id);


--
-- TOC entry 4887 (class 1259 OID 24031)
-- Name: KPI_tipoCalculo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KPI_tipoCalculo_idx" ON public."KPI" USING btree ("tipoCalculo");


--
-- TOC entry 4888 (class 1259 OID 24174)
-- Name: KPI_tipoCriticidad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KPI_tipoCriticidad_idx" ON public."KPI" USING btree ("tipoCriticidad");


--
-- TOC entry 4889 (class 1259 OID 24034)
-- Name: OrdenTrabajo_creadorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_creadorId_idx" ON public."OrdenTrabajo" USING btree ("creadorId");


--
-- TOC entry 4890 (class 1259 OID 24033)
-- Name: OrdenTrabajo_empleadoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_empleadoId_idx" ON public."OrdenTrabajo" USING btree ("empleadoId");


--
-- TOC entry 4891 (class 1259 OID 24036)
-- Name: OrdenTrabajo_fechaLimite_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_fechaLimite_idx" ON public."OrdenTrabajo" USING btree ("fechaLimite");


--
-- TOC entry 4892 (class 1259 OID 24032)
-- Name: OrdenTrabajo_kpiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_kpiId_idx" ON public."OrdenTrabajo" USING btree ("kpiId");


--
-- TOC entry 4895 (class 1259 OID 24035)
-- Name: OrdenTrabajo_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_status_idx" ON public."OrdenTrabajo" USING btree (status);


--
-- TOC entry 4896 (class 1259 OID 24037)
-- Name: OrdenTrabajo_tipoOrden_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdenTrabajo_tipoOrden_idx" ON public."OrdenTrabajo" USING btree ("tipoOrden");


--
-- TOC entry 4915 (class 1259 OID 24050)
-- Name: RevisionJefe_jefeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RevisionJefe_jefeId_idx" ON public."RevisionJefe" USING btree ("jefeId");


--
-- TOC entry 4916 (class 1259 OID 24049)
-- Name: RevisionJefe_ordenTrabajoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RevisionJefe_ordenTrabajoId_idx" ON public."RevisionJefe" USING btree ("ordenTrabajoId");


--
-- TOC entry 4917 (class 1259 OID 24048)
-- Name: RevisionJefe_ordenTrabajoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RevisionJefe_ordenTrabajoId_key" ON public."RevisionJefe" USING btree ("ordenTrabajoId");


--
-- TOC entry 4920 (class 1259 OID 24051)
-- Name: RevisionJefe_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RevisionJefe_status_idx" ON public."RevisionJefe" USING btree (status);


--
-- TOC entry 4910 (class 1259 OID 24045)
-- Name: SolicitudEdicion_ordenTrabajoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudEdicion_ordenTrabajoId_idx" ON public."SolicitudEdicion" USING btree ("ordenTrabajoId");


--
-- TOC entry 4913 (class 1259 OID 24046)
-- Name: SolicitudEdicion_solicitanteId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudEdicion_solicitanteId_idx" ON public."SolicitudEdicion" USING btree ("solicitanteId");


--
-- TOC entry 4914 (class 1259 OID 24047)
-- Name: SolicitudEdicion_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudEdicion_status_idx" ON public."SolicitudEdicion" USING btree (status);


--
-- TOC entry 4905 (class 1259 OID 24043)
-- Name: SolicitudTarea_empleadoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudTarea_empleadoId_idx" ON public."SolicitudTarea" USING btree ("empleadoId");


--
-- TOC entry 4906 (class 1259 OID 24042)
-- Name: SolicitudTarea_ordenTrabajoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudTarea_ordenTrabajoId_idx" ON public."SolicitudTarea" USING btree ("ordenTrabajoId");


--
-- TOC entry 4909 (class 1259 OID 24044)
-- Name: SolicitudTarea_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SolicitudTarea_status_idx" ON public."SolicitudTarea" USING btree (status);


--
-- TOC entry 4897 (class 1259 OID 24039)
-- Name: Tarea_completada_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Tarea_completada_idx" ON public."Tarea" USING btree (completada);


--
-- TOC entry 4898 (class 1259 OID 24038)
-- Name: Tarea_ordenTrabajoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Tarea_ordenTrabajoId_idx" ON public."Tarea" USING btree ("ordenTrabajoId");


--
-- TOC entry 4874 (class 1259 OID 24021)
-- Name: User_areaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_areaId_idx" ON public."User" USING btree ("areaId");


--
-- TOC entry 4875 (class 1259 OID 24019)
-- Name: User_dni_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_dni_key" ON public."User" USING btree (dni);


--
-- TOC entry 4876 (class 1259 OID 24022)
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- TOC entry 4877 (class 1259 OID 24020)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4880 (class 1259 OID 24023)
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- TOC entry 4953 (class 1259 OID 28012)
-- Name: evidencias_kpi_empleado_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evidencias_kpi_empleado_id_idx ON public.evidencias_kpi USING btree (empleado_id);


--
-- TOC entry 4954 (class 1259 OID 28011)
-- Name: evidencias_kpi_kpi_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evidencias_kpi_kpi_id_idx ON public.evidencias_kpi USING btree (kpi_id);


--
-- TOC entry 4955 (class 1259 OID 28013)
-- Name: evidencias_kpi_periodo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evidencias_kpi_periodo_idx ON public.evidencias_kpi USING btree (periodo);


--
-- TOC entry 4958 (class 1259 OID 28014)
-- Name: evidencias_kpi_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evidencias_kpi_status_idx ON public.evidencias_kpi USING btree (status);


--
-- TOC entry 4944 (class 1259 OID 24918)
-- Name: puestos_nombre_area_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX puestos_nombre_area_id_key ON public.puestos USING btree (nombre, area_id);


--
-- TOC entry 4959 (class 1259 OID 28890)
-- Name: revisores_asignados_empleado_id_activo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX revisores_asignados_empleado_id_activo_key ON public.revisores_asignados USING btree (empleado_id, activo);


--
-- TOC entry 4960 (class 1259 OID 28888)
-- Name: revisores_asignados_empleado_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revisores_asignados_empleado_id_idx ON public.revisores_asignados USING btree (empleado_id);


--
-- TOC entry 4963 (class 1259 OID 28889)
-- Name: revisores_asignados_revisor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revisores_asignados_revisor_id_idx ON public.revisores_asignados USING btree (revisor_id);


--
-- TOC entry 4947 (class 1259 OID 27223)
-- Name: sessions_access_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_access_token_key ON public.sessions USING btree (access_token);


--
-- TOC entry 4948 (class 1259 OID 25680)
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- TOC entry 4951 (class 1259 OID 27224)
-- Name: sessions_refresh_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_refresh_token_key ON public.sessions USING btree (refresh_token);


--
-- TOC entry 4952 (class 1259 OID 25679)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- TOC entry 4985 (class 2606 OID 24220)
-- Name: Alerta Alerta_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alerta"
    ADD CONSTRAINT "Alerta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 24162)
-- Name: Alerta Alerta_empleadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alerta"
    ADD CONSTRAINT "Alerta_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4987 (class 2606 OID 24167)
-- Name: Alerta Alerta_evaluacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alerta"
    ADD CONSTRAINT "Alerta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES public."Evaluacion"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4983 (class 2606 OID 24147)
-- Name: EvaluacionDetalle EvaluacionDetalle_evaluacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EvaluacionDetalle"
    ADD CONSTRAINT "EvaluacionDetalle_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES public."Evaluacion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 24152)
-- Name: EvaluacionDetalle EvaluacionDetalle_kpiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EvaluacionDetalle"
    ADD CONSTRAINT "EvaluacionDetalle_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES public."KPI"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4980 (class 2606 OID 24215)
-- Name: Evaluacion Evaluacion_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4981 (class 2606 OID 24137)
-- Name: Evaluacion Evaluacion_empleadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4982 (class 2606 OID 24142)
-- Name: Evaluacion Evaluacion_evaluadorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4973 (class 2606 OID 24102)
-- Name: Evidencia Evidencia_tareaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evidencia"
    ADD CONSTRAINT "Evidencia_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES public."Tarea"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 24205)
-- Name: KPI KPI_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KPI"
    ADD CONSTRAINT "KPI_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 24925)
-- Name: KPI KPI_puesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KPI"
    ADD CONSTRAINT "KPI_puesto_id_fkey" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4968 (class 2606 OID 24210)
-- Name: OrdenTrabajo OrdenTrabajo_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdenTrabajo"
    ADD CONSTRAINT "OrdenTrabajo_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4969 (class 2606 OID 24092)
-- Name: OrdenTrabajo OrdenTrabajo_creadorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdenTrabajo"
    ADD CONSTRAINT "OrdenTrabajo_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4970 (class 2606 OID 24087)
-- Name: OrdenTrabajo OrdenTrabajo_empleadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdenTrabajo"
    ADD CONSTRAINT "OrdenTrabajo_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4971 (class 2606 OID 24082)
-- Name: OrdenTrabajo OrdenTrabajo_kpiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdenTrabajo"
    ADD CONSTRAINT "OrdenTrabajo_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES public."KPI"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4978 (class 2606 OID 24132)
-- Name: RevisionJefe RevisionJefe_jefeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RevisionJefe"
    ADD CONSTRAINT "RevisionJefe_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4979 (class 2606 OID 24127)
-- Name: RevisionJefe RevisionJefe_ordenTrabajoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RevisionJefe"
    ADD CONSTRAINT "RevisionJefe_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES public."OrdenTrabajo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4976 (class 2606 OID 24117)
-- Name: SolicitudEdicion SolicitudEdicion_ordenTrabajoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudEdicion"
    ADD CONSTRAINT "SolicitudEdicion_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES public."OrdenTrabajo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4977 (class 2606 OID 24122)
-- Name: SolicitudEdicion SolicitudEdicion_solicitanteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudEdicion"
    ADD CONSTRAINT "SolicitudEdicion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4974 (class 2606 OID 24112)
-- Name: SolicitudTarea SolicitudTarea_empleadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudTarea"
    ADD CONSTRAINT "SolicitudTarea_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4975 (class 2606 OID 24107)
-- Name: SolicitudTarea SolicitudTarea_ordenTrabajoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SolicitudTarea"
    ADD CONSTRAINT "SolicitudTarea_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES public."OrdenTrabajo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4972 (class 2606 OID 24097)
-- Name: Tarea Tarea_ordenTrabajoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tarea"
    ADD CONSTRAINT "Tarea_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES public."OrdenTrabajo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 24190)
-- Name: User User_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4965 (class 2606 OID 24920)
-- Name: User User_puesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_puesto_id_fkey" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4988 (class 2606 OID 24195)
-- Name: areas areas_area_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_area_padre_id_fkey FOREIGN KEY (area_padre_id) REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4989 (class 2606 OID 24200)
-- Name: areas areas_jefe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_jefe_id_fkey FOREIGN KEY (jefe_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4992 (class 2606 OID 28020)
-- Name: evidencias_kpi evidencias_kpi_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencias_kpi
    ADD CONSTRAINT evidencias_kpi_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4993 (class 2606 OID 28015)
-- Name: evidencias_kpi evidencias_kpi_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencias_kpi
    ADD CONSTRAINT evidencias_kpi_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public."KPI"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 28025)
-- Name: evidencias_kpi evidencias_kpi_revisado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencias_kpi
    ADD CONSTRAINT evidencias_kpi_revisado_por_fkey FOREIGN KEY (revisado_por) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4995 (class 2606 OID 28030)
-- Name: evidencias_kpi evidencias_kpi_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencias_kpi
    ADD CONSTRAINT "evidencias_kpi_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4990 (class 2606 OID 24930)
-- Name: puestos puestos_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos
    ADD CONSTRAINT puestos_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 28891)
-- Name: revisores_asignados revisores_asignados_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisores_asignados
    ADD CONSTRAINT revisores_asignados_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 28896)
-- Name: revisores_asignados revisores_asignados_revisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisores_asignados
    ADD CONSTRAINT revisores_asignados_revisor_id_fkey FOREIGN KEY (revisor_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 25681)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-25 13:34:32

--
-- PostgreSQL database dump complete
--

\unrestrict CAtnRCcitqaXxl3I7c6XKSzeH0WC5ASoSo95GAMaJUfDO7MuSb1XVoo7mtUCvBY

