-- DDL para PostgreSQL (Sprint 1)

-- 1. Tabla divisas (antes moneda)
CREATE TABLE divisas (
  id_divisa SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla usuarios
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  divisa_base_id INT REFERENCES divisas(id_divisa) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla tipos_de_cambio (antes cotizacion)
CREATE TABLE tipos_de_cambio (
  id_tipo_cambio SERIAL PRIMARY KEY,
  id_divisa INT NOT NULL REFERENCES divisas(id_divisa) ON DELETE CASCADE ON UPDATE CASCADE,
  precio_compra DECIMAL(18,2) NOT NULL,
  precio_venta DECIMAL(18,2) NOT NULL,
  tipo_mercado VARCHAR(50) NOT NULL,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla favoritos
CREATE TABLE favoritos (
  id_favorito SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  id_divisa INT NOT NULL REFERENCES divisas(id_divisa) ON DELETE CASCADE ON UPDATE CASCADE,
  notificacion_activa BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_usuario, id_divisa)
);

-- 5. Tabla historial_de_consultas
CREATE TABLE historial_de_consultas (
  id_historial SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  par_consultado VARCHAR(100) NOT NULL,
  valor_momento DECIMAL(18,2) NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance (#21)
CREATE INDEX idx_tipos_de_cambio_divisa ON tipos_de_cambio(id_divisa);
CREATE INDEX idx_favoritos_usuario ON favoritos(id_usuario);
CREATE INDEX idx_favoritos_divisa ON favoritos(id_divisa);
CREATE INDEX idx_historial_usuario ON historial_de_consultas(id_usuario);
CREATE INDEX idx_historial_fecha ON historial_de_consultas(fecha);
