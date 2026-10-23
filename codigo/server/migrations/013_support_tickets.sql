-- Migración 013: Tickets de soporte generados desde el chatbot/asistente del dashboard
CREATE TABLE IF NOT EXISTS soporte_tickets (
  id_ticket SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE,
  id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  nombre VARCHAR(100),
  email VARCHAR(150) NOT NULL,
  categoria VARCHAR(40) DEFAULT 'otro',
  prioridad VARCHAR(20) DEFAULT 'media',
  asunto VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'abierto',
  respuesta_admin TEXT,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resuelto_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_soporte_tickets_fecha ON soporte_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soporte_tickets_estado ON soporte_tickets(estado);
CREATE INDEX IF NOT EXISTS idx_soporte_tickets_usuario ON soporte_tickets(id_usuario);
CREATE INDEX IF NOT EXISTS idx_soporte_tickets_email ON soporte_tickets(email);
