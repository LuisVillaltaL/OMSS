-- ================================================================
-- ITSM — Sistema de Gestión de Incidentes de TI
-- PostgreSQL Schema v1.0
-- Curso: INGENIERÍA DE SOFTWARE 12026-6590-042-A
-- ================================================================

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- full-text search en KB

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE perfil_enum AS ENUM ('senior','semi_senior','junior');
CREATE TYPE rol_enum    AS ENUM ('admin','tecnico_l1','tecnico_l2','usuario_final');
CREATE TYPE prioridad_enum  AS ENUM ('critico','alto','medio','bajo');
CREATE TYPE estado_ticket   AS ENUM ('abierto','en_progreso','escalado','resuelto','cerrado');
CREATE TYPE canal_enum       AS ENUM ('portal_web','correo','telefono','sistema');
CREATE TYPE estado_activo    AS ENUM ('operativo','mantenimiento','dado_de_baja','extraviado');
CREATE TYPE tipo_activo      AS ENUM ('laptop','desktop','servidor','impresora','switch','router','ups','monitor','telefono_ip','otro');
CREATE TYPE estado_sla       AS ENUM ('en_tiempo','en_riesgo','vencido','pausado');
CREATE TYPE tipo_auditoria   AS ENUM ('crear','modificar','escalar','cerrar','reabrir','asignar','comentar','adjuntar');
CREATE TYPE nivel_riesgo     AS ENUM ('critico','alto','medio','bajo');

-- ================================================================
-- 1. DEPARTAMENTOS
-- ================================================================
CREATE TABLE departamentos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE departamentos IS 'Departamentos o áreas de la organización';

-- ================================================================
-- 2. USUARIOS / EMPLEADOS
-- ================================================================
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,               -- bcrypt min 12 rounds (RNF-3)
    rol             rol_enum NOT NULL DEFAULT 'usuario_final',
    perfil          perfil_enum,                          -- solo para técnicos
    departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
    telefono        VARCHAR(30),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login    TIMESTAMPTZ,
    intentos_fallidos INT NOT NULL DEFAULT 0,             -- RNF-4 bloqueo 5 intentos
    bloqueado_hasta   TIMESTAMPTZ,                        -- RNF-4 15 min bloqueo
    token_2fa        VARCHAR(100),                        -- RF-3.2 TOTP
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_correo   ON usuarios(correo);
CREATE INDEX idx_usuarios_rol      ON usuarios(rol);
CREATE INDEX idx_usuarios_dept     ON usuarios(departamento_id);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema: admins, técnicos L1/L2 y usuarios finales (RF-3.1 a RF-3.6)';
COMMENT ON COLUMN usuarios.password_hash     IS 'bcrypt hash — mínimo 12 rounds (RNF-3)';
COMMENT ON COLUMN usuarios.intentos_fallidos IS 'Contador reiniciado al login exitoso (RNF-4)';
COMMENT ON COLUMN usuarios.bloqueado_hasta   IS 'NULL = no bloqueado. Bloqueo 15 min tras 5 intentos (RNF-4)';

-- ================================================================
-- 3. ACTIVOS TI  (RF Módulo 3 — Inventario)
-- ================================================================
CREATE TABLE activos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(30) NOT NULL UNIQUE,          -- Ej: LPT-0034
    nombre          VARCHAR(150) NOT NULL,
    tipo            tipo_activo NOT NULL,
    marca           VARCHAR(80),
    modelo          VARCHAR(80),
    numero_serie    VARCHAR(100) UNIQUE,
    estado          estado_activo NOT NULL DEFAULT 'operativo',
    fecha_compra    DATE,
    fecha_garantia  DATE,
    costo_adq       NUMERIC(12,2),
    ubicacion       VARCHAR(150),                         -- Piso, sala, rack
    departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
    asignado_a      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    notas           TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activos_codigo    ON activos(codigo);
CREATE INDEX idx_activos_tipo      ON activos(tipo);
CREATE INDEX idx_activos_estado    ON activos(estado);
CREATE INDEX idx_activos_asignado  ON activos(asignado_a);
CREATE INDEX idx_activos_dept      ON activos(departamento_id);

COMMENT ON TABLE activos IS 'Inventario de activos TI — equipos, servidores, periféricos';
COMMENT ON COLUMN activos.codigo    IS 'Código único legible: LPT-0034, SRV-001, PRN-005, etc.';
COMMENT ON COLUMN activos.asignado_a IS 'Empleado al que está asignado actualmente';

-- ================================================================
-- 4. CATEGORÍAS DE TICKETS
-- ================================================================
CREATE TABLE categorias (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(100) NOT NULL UNIQUE,   -- Hardware, Software, Conectividad, Accesos
    descripcion TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subcategorias (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ================================================================
-- 5. SLAs  (RF-6.1 a RF-6.4)
-- ================================================================
CREATE TABLE slas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre              VARCHAR(150) NOT NULL,
    categoria_id        UUID REFERENCES categorias(id) ON DELETE SET NULL,
    prioridad           prioridad_enum NOT NULL,
    tiempo_respuesta_min INT NOT NULL,                    -- minutos para primera respuesta
    tiempo_resolucion_min INT NOT NULL,                   -- minutos para resolución total
    horario_laboral     BOOLEAN NOT NULL DEFAULT TRUE,    -- contar solo en horario laboral
    hora_inicio         TIME NOT NULL DEFAULT '08:00',    -- RF-6.3 calendario laboral
    hora_fin            TIME NOT NULL DEFAULT '18:00',
    dias_laborales      INT[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 1=Lun..7=Dom
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE slas IS 'Definición de SLAs por categoría y prioridad (RF-6.1)';
COMMENT ON COLUMN slas.tiempo_respuesta_min  IS 'Minutos para reconocer el ticket (MTTA)';
COMMENT ON COLUMN slas.tiempo_resolucion_min IS 'Minutos máximos para resolver (MTTR)';

-- ================================================================
-- 6. TICKETS / INCIDENTES  (RF-1.1 a RF-1.12)
-- ================================================================
CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero          SERIAL UNIQUE,                        -- INC-000001 (RF-1.2)
    titulo          VARCHAR(255) NOT NULL,
    descripcion     TEXT,
    canal           canal_enum NOT NULL DEFAULT 'portal_web',
    prioridad       prioridad_enum NOT NULL DEFAULT 'medio',
    estado          estado_ticket NOT NULL DEFAULT 'abierto',

    -- Clasificación (RF-1.3)
    categoria_id    UUID REFERENCES categorias(id) ON DELETE SET NULL,
    subcategoria_id UUID REFERENCES subcategorias(id) ON DELETE SET NULL,

    -- Personas
    reportado_por   UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,  -- usuario afectado
    asignado_a      UUID REFERENCES usuarios(id) ON DELETE SET NULL,            -- técnico
    creado_por      UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,   -- quien lo ingresó

    -- Activo relacionado
    activo_id       UUID REFERENCES activos(id) ON DELETE SET NULL,

    -- SLA (RF-6.2)
    sla_id          UUID REFERENCES slas(id) ON DELETE SET NULL,
    sla_estado      estado_sla NOT NULL DEFAULT 'en_tiempo',
    sla_inicio      TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- cuando empieza a correr
    sla_pausa_total INT NOT NULL DEFAULT 0,               -- segundos acumulados en pausa (RF-6.3)
    sla_pausado_en  TIMESTAMPTZ,                          -- momento en que se pausó (NULL = corriendo)
    sla_vence_en    TIMESTAMPTZ,                          -- calculado: sla_inicio + tiempo_resolucion

    -- Resolución (RF-1.10)
    solucion        TEXT,
    causa_raiz      TEXT,
    resuelto_en     TIMESTAMPTZ,
    cerrado_en      TIMESTAMPTZ,
    reabierto_en    TIMESTAMPTZ,                          -- RF-1.12 reapertura
    veces_reabierto INT NOT NULL DEFAULT 0,

    -- Encuesta (RF-1.11)
    satisfaccion    SMALLINT CHECK (satisfaccion BETWEEN 1 AND 5),

    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_numero      ON tickets(numero);
CREATE INDEX idx_tickets_estado      ON tickets(estado);
CREATE INDEX idx_tickets_prioridad   ON tickets(prioridad);
CREATE INDEX idx_tickets_asignado    ON tickets(asignado_a);
CREATE INDEX idx_tickets_reportado   ON tickets(reportado_por);
CREATE INDEX idx_tickets_categoria   ON tickets(categoria_id);
CREATE INDEX idx_tickets_activo      ON tickets(activo_id);
CREATE INDEX idx_tickets_sla_estado  ON tickets(sla_estado);
CREATE INDEX idx_tickets_creado      ON tickets(creado_en DESC);

COMMENT ON TABLE tickets IS 'Tickets de incidentes — ciclo de vida completo (RF-1.1 a RF-1.12)';
COMMENT ON COLUMN tickets.numero           IS 'Número correlativo legible: 1 → INC-000001 (RF-1.2)';
COMMENT ON COLUMN tickets.sla_pausa_total  IS 'Segundos acumulados mientras esperaba usuario (RF-6.3)';
COMMENT ON COLUMN tickets.veces_reabierto  IS 'Límite: 72h post-cierre para reabrir (RF-1.12)';

-- ================================================================
-- 7. NOTAS / COMENTARIOS DE TICKETS  (RF-1.7)
-- ================================================================
CREATE TABLE ticket_notas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    autor_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    contenido   TEXT NOT NULL,
    es_interna  BOOLEAN NOT NULL DEFAULT FALSE,  -- nota interna = no visible al usuario final
    tiempo_hh   NUMERIC(5,2),                    -- horas dedicadas (RF-1.7)
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notas_ticket ON ticket_notas(ticket_id);

-- ================================================================
-- 8. ADJUNTOS  (RF-1.7)
-- ================================================================
CREATE TABLE ticket_adjuntos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    subido_por  UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    nombre      VARCHAR(255) NOT NULL,
    ruta        VARCHAR(500) NOT NULL,        -- path en storage / S3
    mime_type   VARCHAR(100),
    tamano_kb   INT,                          -- RF-1.7 máx 10 MB = 10240 KB
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tamano CHECK (tamano_kb <= 10240)
);

COMMENT ON COLUMN ticket_adjuntos.tamano_kb IS 'Máximo 10 MB = 10240 KB (RF-1.7)';

-- ================================================================
-- 9. ESCALONAMIENTOS  (RF-1.8, RF-1.9)
-- ================================================================
CREATE TABLE escalamientos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    escalado_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL,   -- NULL = automático
    asignado_antes  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    asignado_ahora  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    motivo          TEXT,
    es_automatico   BOOLEAN NOT NULL DEFAULT FALSE,  -- RF-1.8 auto al 80/100% SLA
    porcentaje_sla  SMALLINT,                        -- 80 o 100
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 10. BASE DE CONOCIMIENTO  (RF-4.1 a RF-4.4)
-- ================================================================
CREATE TABLE kb_articulos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo          VARCHAR(255) NOT NULL,
    contenido       TEXT NOT NULL,
    categoria_id    UUID REFERENCES categorias(id) ON DELETE SET NULL,
    autor_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    publicado       BOOLEAN NOT NULL DEFAULT FALSE,
    etiquetas       TEXT[],                          -- RF-4.1 tags para búsqueda
    vistas          INT NOT NULL DEFAULT 0,
    util_si         INT NOT NULL DEFAULT 0,          -- votos útil
    util_no         INT NOT NULL DEFAULT 0,
    -- full-text search (RF-4.2)
    busqueda_ts     TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('spanish', titulo || ' ' || contenido)
                    ) STORED,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kb_busqueda  ON kb_articulos USING GIN(busqueda_ts);
CREATE INDEX idx_kb_etiquetas ON kb_articulos USING GIN(etiquetas);
CREATE INDEX idx_kb_categoria ON kb_articulos(categoria_id);

-- Vinculación ticket ↔ artículo KB (RF-4.3)
CREATE TABLE ticket_kb (
    ticket_id    UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    articulo_id  UUID NOT NULL REFERENCES kb_articulos(id) ON DELETE CASCADE,
    vinculado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ticket_id, articulo_id)
);

-- ================================================================
-- 11. NOTIFICACIONES  (RF-5.1 a RF-5.4)
-- ================================================================
CREATE TABLE notificaciones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
    tipo        VARCHAR(50) NOT NULL,     -- 'ticket_creado','ticket_asignado','sla_80','sla_100','ticket_resuelto'
    titulo      VARCHAR(255) NOT NULL,
    mensaje     TEXT,
    leida       BOOLEAN NOT NULL DEFAULT FALSE,
    enviada_email BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_usuario ON notificaciones(usuario_id, leida);
CREATE INDEX idx_notif_ticket  ON notificaciones(ticket_id);

-- ================================================================
-- 12. LOG DE AUDITORÍA  (RF-7.1 a RF-7.3)  — INMUTABLE
-- ================================================================
CREATE TABLE auditoria (
    id              BIGSERIAL PRIMARY KEY,              -- secuencial para ordenar
    ticket_id       UUID REFERENCES tickets(id) ON DELETE RESTRICT,  -- ON DELETE RESTRICT = no borrar
    usuario_id      UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    usuario_nombre  VARCHAR(200) NOT NULL,              -- snapshot por si se borra el usuario
    usuario_rol     rol_enum NOT NULL,
    accion          tipo_auditoria NOT NULL,
    campo           VARCHAR(100),                       -- qué campo se modificó
    valor_anterior  TEXT,                               -- valor en texto plano
    valor_nuevo     TEXT,
    ip_origen       INET,
    user_agent      TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- SIN: UPDATE, DELETE — tabla append-only (RF-7.2)
);

CREATE INDEX idx_audit_ticket  ON auditoria(ticket_id);
CREATE INDEX idx_audit_usuario ON auditoria(usuario_id);
CREATE INDEX idx_audit_accion  ON auditoria(accion);
CREATE INDEX idx_audit_fecha   ON auditoria(creado_en DESC);

-- Inmutabilidad: revocar UPDATE y DELETE de la tabla auditoria
-- (ejecutar con superuser al desplegar)
-- REVOKE UPDATE, DELETE ON auditoria FROM app_user;

COMMENT ON TABLE auditoria IS 'Log inmutable — append-only. Sin UPDATE ni DELETE (RF-7.1, RF-7.2)';
COMMENT ON COLUMN auditoria.usuario_nombre IS 'Snapshot del nombre en el momento del evento';

-- ================================================================
-- 13. SESIONES (JWT + refresh tokens)
-- ================================================================
CREATE TABLE sesiones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(500) NOT NULL UNIQUE,
    ip_origen       INET,
    user_agent      TEXT,
    expira_en       TIMESTAMPTZ NOT NULL,
    revocada        BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token   ON sesiones(refresh_token);

-- ================================================================
-- FUNCIONES Y TRIGGERS
-- ================================================================

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_activos_updated
    BEFORE UPDATE ON activos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tickets_updated
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_kb_updated
    BEFORE UPDATE ON kb_articulos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: log automático al modificar ticket
CREATE OR REPLACE FUNCTION log_ticket_cambio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO auditoria
            (ticket_id, usuario_id, usuario_nombre, usuario_rol, accion, campo, valor_anterior, valor_nuevo)
        VALUES
            (NEW.id, NEW.asignado_a, 'Sistema', 'admin', 'modificar', 'estado', OLD.estado::text, NEW.estado::text);
    END IF;
    IF OLD.prioridad IS DISTINCT FROM NEW.prioridad THEN
        INSERT INTO auditoria
            (ticket_id, usuario_id, usuario_nombre, usuario_rol, accion, campo, valor_anterior, valor_nuevo)
        VALUES
            (NEW.id, NEW.asignado_a, 'Sistema', 'admin', 'modificar', 'prioridad', OLD.prioridad::text, NEW.prioridad::text);
    END IF;
    IF OLD.asignado_a IS DISTINCT FROM NEW.asignado_a THEN
        INSERT INTO auditoria
            (ticket_id, usuario_id, usuario_nombre, usuario_rol, accion, campo, valor_anterior, valor_nuevo)
        VALUES
            (NEW.id, NEW.asignado_a, 'Sistema', 'admin', 'asignar', 'asignado_a', OLD.asignado_a::text, NEW.asignado_a::text);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_auditoria
    AFTER UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION log_ticket_cambio();

-- Función: generar código de ticket legible
CREATE OR REPLACE FUNCTION ticket_codigo(num INT)
RETURNS VARCHAR AS $$
BEGIN
    RETURN 'INC-' || LPAD(num::text, 6, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: calcular SLA restante en minutos
CREATE OR REPLACE FUNCTION sla_minutos_restantes(t tickets)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    transcurrido_seg INT;
    pausa_seg        INT;
    limite_seg       INT;
BEGIN
    IF t.sla_vence_en IS NULL THEN RETURN NULL; END IF;
    pausa_seg = t.sla_pausa_total;
    IF t.sla_pausado_en IS NOT NULL THEN
        pausa_seg = pausa_seg + EXTRACT(EPOCH FROM (NOW() - t.sla_pausado_en))::INT;
    END IF;
    RETURN GREATEST(0, EXTRACT(EPOCH FROM (t.sla_vence_en - NOW()))::INT / 60 + pausa_seg / 60);
END;
$$;

-- ================================================================
-- VISTAS
-- ================================================================

-- Vista: tickets con info completa para dashboard
CREATE OR REPLACE VIEW v_tickets AS
SELECT
    t.id,
    ticket_codigo(t.numero)         AS codigo,
    t.titulo,
    t.prioridad,
    t.estado,
    t.canal,
    t.sla_estado,
    t.creado_en,
    t.resuelto_en,
    -- Reporter
    CONCAT(ur.nombre,' ',ur.apellido) AS reportado_por_nombre,
    ur.correo                          AS reportado_por_correo,
    -- Asignado
    CONCAT(ut.nombre,' ',ut.apellido) AS asignado_a_nombre,
    ut.perfil                          AS asignado_perfil,
    -- Categoría
    c.nombre                           AS categoria,
    sc.nombre                          AS subcategoria,
    -- Activo
    a.codigo                           AS activo_codigo,
    a.nombre                           AS activo_nombre,
    -- SLA
    sla_minutos_restantes(t)           AS sla_minutos_restantes,
    -- Tiempo de resolución en horas
    CASE WHEN t.resuelto_en IS NOT NULL
         THEN ROUND(EXTRACT(EPOCH FROM (t.resuelto_en - t.creado_en))/3600, 2)
         ELSE NULL END                 AS horas_resolucion
FROM tickets t
LEFT JOIN usuarios       ur  ON t.reportado_por   = ur.id
LEFT JOIN usuarios       ut  ON t.asignado_a      = ut.id
LEFT JOIN categorias     c   ON t.categoria_id    = c.id
LEFT JOIN subcategorias  sc  ON t.subcategoria_id = sc.id
LEFT JOIN activos        a   ON t.activo_id       = a.id;

-- Vista: métricas dashboard (RF-2.1, RF-2.2, RF-2.6)
CREATE OR REPLACE VIEW v_metricas_dashboard AS
SELECT
    COUNT(*) FILTER (WHERE estado = 'abierto')     AS tickets_abiertos,
    COUNT(*) FILTER (WHERE estado = 'en_progreso') AS tickets_en_progreso,
    COUNT(*) FILTER (WHERE estado = 'escalado')    AS tickets_escalados,
    COUNT(*) FILTER (WHERE estado IN ('resuelto','cerrado')
                    AND DATE(resuelto_en) = CURRENT_DATE) AS tickets_resueltos_hoy,
    COUNT(*) FILTER (WHERE prioridad = 'critico' AND estado NOT IN ('resuelto','cerrado')) AS criticos_activos,
    -- MTTA: tiempo promedio de reconocimiento (en minutos)
    ROUND(AVG(
        EXTRACT(EPOCH FROM (
            (SELECT MIN(an.creado_en) FROM auditoria an
             WHERE an.ticket_id = t.id AND an.accion = 'asignar')
            - t.creado_en
        ))/60
    )::numeric, 1)                                 AS mtta_promedio_min,
    -- MTTR: tiempo promedio de resolución (en horas)
    ROUND(AVG(
        CASE WHEN t.resuelto_en IS NOT NULL
             THEN EXTRACT(EPOCH FROM (t.resuelto_en - t.creado_en))/3600
        END
    )::numeric, 2)                                 AS mttr_promedio_h,
    -- SLA compliance %
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE sla_estado = 'en_tiempo' AND estado IN ('resuelto','cerrado'))
        / NULLIF(COUNT(*) FILTER (WHERE estado IN ('resuelto','cerrado')), 0)
    , 1)                                           AS sla_compliance_pct
FROM tickets t;

-- Vista: inventario activos con empleado asignado
CREATE OR REPLACE VIEW v_activos AS
SELECT
    a.id,
    a.codigo,
    a.nombre,
    a.tipo,
    a.marca,
    a.modelo,
    a.numero_serie,
    a.estado,
    a.ubicacion,
    a.fecha_garantia,
    d.nombre                           AS departamento,
    CONCAT(u.nombre,' ',u.apellido)    AS asignado_a_nombre,
    u.correo                           AS asignado_a_correo,
    COUNT(t.id)                        AS total_tickets
FROM activos a
LEFT JOIN departamentos d  ON a.departamento_id = d.id
LEFT JOIN usuarios      u  ON a.asignado_a      = u.id
LEFT JOIN tickets       t  ON t.activo_id       = a.id
GROUP BY a.id, d.nombre, u.nombre, u.apellido, u.correo;

-- ================================================================
-- DATOS SEMILLA (SEED)
-- ================================================================

-- Departamentos
INSERT INTO departamentos (nombre, descripcion) VALUES
    ('Tecnología de la Información', 'Área de soporte y desarrollo TI'),
    ('Recursos Humanos',             'Gestión del talento humano'),
    ('Marketing',                    'Marketing y comunicación'),
    ('Contabilidad',                 'Finanzas y contabilidad'),
    ('Operaciones',                  'Operaciones y logística');

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Hardware',      'Equipos físicos: laptops, impresoras, servidores'),
    ('Software',      'Aplicaciones, licencias, actualizaciones'),
    ('Conectividad',  'Red, VPN, WiFi, switches'),
    ('Accesos',       'Permisos, cuentas, SharePoint, correo'),
    ('Correo',        'Exchange, Outlook, correo corporativo');

-- Subcategorías (Hardware)
INSERT INTO subcategorias (categoria_id, nombre) VALUES
    ((SELECT id FROM categorias WHERE nombre='Hardware'), 'Laptop / Desktop'),
    ((SELECT id FROM categorias WHERE nombre='Hardware'), 'Impresora / Escáner'),
    ((SELECT id FROM categorias WHERE nombre='Hardware'), 'Monitor'),
    ((SELECT id FROM categorias WHERE nombre='Hardware'), 'Servidor físico'),
    ((SELECT id FROM categorias WHERE nombre='Software'), 'Microsoft 365'),
    ((SELECT id FROM categorias WHERE nombre='Software'), 'Adobe Creative Cloud'),
    ((SELECT id FROM categorias WHERE nombre='Software'), 'Antivirus / EDR'),
    ((SELECT id FROM categorias WHERE nombre='Conectividad'), 'VPN'),
    ((SELECT id FROM categorias WHERE nombre='Conectividad'), 'Red LAN / Switch'),
    ((SELECT id FROM categorias WHERE nombre='Accesos'), 'Active Directory'),
    ((SELECT id FROM categorias WHERE nombre='Accesos'), 'SharePoint / OneDrive');

-- SLAs
INSERT INTO slas (nombre, categoria_id, prioridad, tiempo_respuesta_min, tiempo_resolucion_min) VALUES
    ('SLA Crítico — Hardware',      (SELECT id FROM categorias WHERE nombre='Hardware'),      'critico', 15,  240),
    ('SLA Alto — Hardware',         (SELECT id FROM categorias WHERE nombre='Hardware'),      'alto',    30,  480),
    ('SLA Medio — Hardware',        (SELECT id FROM categorias WHERE nombre='Hardware'),      'medio',   60, 1440),
    ('SLA Bajo — Hardware',         (SELECT id FROM categorias WHERE nombre='Hardware'),      'bajo',   120, 2880),
    ('SLA Crítico — Conectividad',  (SELECT id FROM categorias WHERE nombre='Conectividad'), 'critico',  15,  180),
    ('SLA Alto — Conectividad',     (SELECT id FROM categorias WHERE nombre='Conectividad'), 'alto',     30,  480),
    ('SLA Crítico — Correo',        (SELECT id FROM categorias WHERE nombre='Correo'),       'critico',  15,  240),
    ('SLA Medio — Accesos',         (SELECT id FROM categorias WHERE nombre='Accesos'),      'medio',    60, 1440);

-- Usuario admin por defecto
-- Contraseña: Admin1234! (hash bcrypt placeholder — reemplazar en deploy)
INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) VALUES
    ('Admin', 'Sistema', 'admin@itsm.gt',
     '$2b$12$placeholder_reemplazar_en_deploy_con_bcrypt',
     'admin');

