-- Migración 011: Soporte para rol Administrador, fotos de perfil y auditoría de emails enviados

-- 1. Agregar columnas a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- 2. Asignar rol administrador a cuentas iniciales si existen
UPDATE usuarios 
SET es_admin = TRUE, rol = 'admin' 
WHERE email IN ('deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com') 
   OR email ILIKE '%tacconi%' 
   OR email ILIKE '%admin%';

-- 3. Tabla de auditoría de correos enviados
CREATE TABLE IF NOT EXISTS emails_enviados (
  id_email SERIAL PRIMARY KEY,
  destinatario VARCHAR(150) NOT NULL,
  asunto VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  codigo VARCHAR(20),
  estado VARCHAR(30) DEFAULT 'enviado',
  error_detalle TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_enviados_fecha ON emails_enviados(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_emails_enviados_destinatario ON emails_enviados(destinatario);
