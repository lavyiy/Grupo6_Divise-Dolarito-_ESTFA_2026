-- ============================================================
-- Migration: 003_verificacion_whatsapp.sql
-- Descripción: Verificación de email por código de 6 dígitos
--              + configuración de WhatsApp (CallMeBot) para alertas
-- ============================================================

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verif_codigo VARCHAR(6),
ADD COLUMN IF NOT EXISTS verif_expira TIMESTAMP,
ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_api_key VARCHAR(100);

-- Los usuarios existentes quedan verificados para no perder acceso
UPDATE usuarios SET email_verificado = TRUE WHERE email_verificado = FALSE;
