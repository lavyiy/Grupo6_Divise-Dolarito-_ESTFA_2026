-- Migración 012: Tabla de mensajes de contacto de usuarios a administradores
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id_mensaje SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(150) NOT NULL,
  asunto VARCHAR(200),
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  respondido BOOLEAN DEFAULT FALSE,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensajes_contacto_fecha ON mensajes_contacto(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_contacto_leido ON mensajes_contacto(leido);
