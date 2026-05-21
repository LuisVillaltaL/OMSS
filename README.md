# ITSM — Guía de instalación y base de datos

## Stack tecnológico

| Capa        | Tecnología                        |
|-------------|-----------------------------------|
| Frontend    | React 18 + Tailwind CSS (TailAdmin palette) |
| Backend     | Node.js + Express 4               |
| Base de datos | PostgreSQL 15+                  |
| Auth        | JWT (access 8h) + Refresh tokens  |
| Hash        | bcrypt 12 rounds                  |

## Instalación rápida

```bash
# 1. Crear base de datos
createdb itsm_db
psql itsm_db < schema.sql

# 2. Crear usuario con permisos limitados (producción)
psql itsm_db -c "
  CREATE USER itsm_user WITH PASSWORD 'tu_password';
  GRANT CONNECT ON DATABASE itsm_db TO itsm_user;
  GRANT USAGE ON SCHEMA public TO itsm_user;
  GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO itsm_user;
  REVOKE UPDATE, DELETE ON auditoria FROM itsm_user;  -- tabla inmutable RF-7.2
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO itsm_user;
"

# 3. Instalar dependencias backend
npm install express pg bcrypt jsonwebtoken \
            dotenv express-validator helmet cors express-rate-limit

# 4. Configurar variables de entorno
cp .env.example .env   # editar con tus valores

# 5. Levantar servidor
node api.js
```

## Tablas del schema

| Tabla              | Módulo DERCAS     | Registros semilla |
|--------------------|-------------------|-------------------|
| departamentos      | —                 | 5                 |
| usuarios           | RF-3.1 a RF-3.6   | 1 (admin)         |
| activos            | M3: Inventario    | —                 |
| categorias         | RF-1.3            | 5 categorías      |
| subcategorias      | RF-1.3            | 11 subcategorías  |
| slas               | RF-6.1 a RF-6.4   | 8 SLAs            |
| tickets            | RF-1.1 a RF-1.12  | —                 |
| ticket_notas       | RF-1.7            | —                 |
| ticket_adjuntos    | RF-1.7            | —                 |
| escalamientos      | RF-1.8, RF-1.9    | —                 |
| kb_articulos       | RF-4.1 a RF-4.4   | —                 |
| ticket_kb          | RF-4.3            | —                 |
| notificaciones     | RF-5.1 a RF-5.4   | —                 |
| auditoria          | RF-7.1 a RF-7.3   | — (append-only)   |
| sesiones           | RF-3.1            | —                 |

## Endpoints principales

### Auth
| Método | Ruta                  | Descripción                        |
|--------|-----------------------|------------------------------------|
| POST   | /api/auth/login       | Login → JWT + refresh token        |
| POST   | /api/auth/refresh     | Renovar access token               |
| POST   | /api/auth/logout      | Revocar sesión                     |

### Tickets
| Método | Ruta                          | Descripción                    |
|--------|-------------------------------|--------------------------------|
| GET    | /api/tickets                  | Lista con filtros y paginación |
| GET    | /api/tickets/:id              | Detalle + notas + historial    |
| POST   | /api/tickets                  | Crear ticket (RF-1.1)          |
| PATCH  | /api/tickets/:id              | Actualizar estado/asignación   |
| POST   | /api/tickets/:id/notas        | Agregar nota (RF-1.7)          |
| POST   | /api/tickets/:id/escalar      | Escalar (RF-1.8, RF-1.9)       |
| POST   | /api/tickets/:id/reabrir      | Reabrir ≤72h (RF-1.12)         |

### Activos
| Método | Ruta                        | Descripción                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/activos                | Lista con filtros            |
| POST   | /api/activos                | Crear activo                 |
| PATCH  | /api/activos/:id/asignar    | Asignar activo a empleado    |

### Dashboard
| Método | Ruta                            | Descripción              |
|--------|---------------------------------|--------------------------|
| GET    | /api/dashboard/metricas         | MTTA, MTTR, SLA, totales |
| GET    | /api/dashboard/sla-compliance   | Cumplimiento por módulo  |

### Auditoría
| Método | Ruta            | Descripción              |
|--------|-----------------|--------------------------|
| GET    | /api/auditoria  | Log con filtros (admin)  |
