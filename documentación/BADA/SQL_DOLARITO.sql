-- Eliminamos las tablas si ya existen
DROP TABLE IF EXISTS historial_consulta;
DROP TABLE IF EXISTS favorito;
DROP TABLE IF EXISTS cotizacion;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS moneda;

-- Tabla MONEDA
CREATE TABLE moneda (
  id_moneda INT PRIMARY KEY,
  codigo VARCHAR(50),
  nombre VARCHAR(100),
  tipo VARCHAR(50)
);

-- Tabla USUARIOS
CREATE TABLE usuarios (
  id_usuario INT PRIMARY KEY,
  nombre VARCHAR(50),
  email VARCHAR(100),
  password_hash VARCHAR(50),
  moneda_base_id INT,
  FOREIGN KEY (moneda_base_id) REFERENCES moneda(id_moneda)
);

-- Tabla COTIZACION
CREATE TABLE cotizacion (
  id_cotizacion INT PRIMARY KEY,
  id_moneda INT,
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  tipo_mercado VARCHAR(50),
  fecha_actualizacion TIMESTAMP,
  FOREIGN KEY (id_moneda) REFERENCES moneda(id_moneda)
);

-- Tabla FAVORITO
CREATE TABLE favorito (
  id_favorito INT PRIMARY KEY,
  id_usuario INT,
  id_moneda INT,
  notificacion_activa BOOLEAN,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_moneda) REFERENCES moneda(id_moneda)
);

-- Tabla HISTORIAL_CONSULTA
CREATE TABLE historial_consulta (
  id_historial INT PRIMARY KEY,
  id_usuario INT,
  par_consultado VARCHAR(100),
  valor_momento DECIMAL(10,2),
  fecha TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Datos de MONEDA
INSERT INTO moneda (id_moneda, codigo, nombre, tipo)
VALUES
(1, 'USD', 'Dólar estadounidense', 'Fiat'),
(2, 'EUR', 'Euro', 'Fiat'),
(3, 'BRL', 'Real brasileño', 'Fiat'),
(4, 'BTC', 'Bitcoin', 'Cripto');

-- Datos de USUARIOS
INSERT INTO usuarios (id_usuario, nombre, email, password_hash, moneda_base_id)
VALUES
(1, 'Lorenzo Sanchez', 'lorenzo@email.com', 'lorenzo2019', 1),
(2, 'Martina Gomez', 'martina@email.com', 'martina2020', 2);

-- Datos de COTIZACION
INSERT INTO cotizacion 
(id_cotizacion, id_moneda, precio_compra, precio_venta, tipo_mercado, fecha_actualizacion)
VALUES
(1, 1, 1100.00, 1130.00, 'Blue', '2026-06-06 10:00:00'),
(2, 1, 1080.00, 1110.00, 'Oficial', '2026-06-06 10:00:00'),
(3, 2, 1200.00, 1250.00, 'Oficial', '2026-06-06 10:00:00'),
(4, 3, 190.00, 210.00, 'Oficial', '2026-06-06 10:00:00'),
(5, 4, 65000000.00, 66000000.00, 'Cripto', '2026-06-06 10:00:00');

-- Datos de FAVORITO
INSERT INTO favorito (id_favorito, id_usuario, id_moneda, notificacion_activa)
VALUES
(1, 1, 1, TRUE),
(2, 1, 2, FALSE),
(3, 2, 4, TRUE);

-- Datos de HISTORIAL_CONSULTA
INSERT INTO historial_consulta 
(id_historial, id_usuario, par_consultado, valor_momento, fecha)
VALUES
(1, 1, 'USD/ARS', 1130.00, '2026-06-06 10:15:00'),
(2, 1, 'EUR/ARS', 1250.00, '2026-06-06 10:20:00'),
(3, 2, 'BTC/ARS', 66000000.00, '2026-06-06 10:30:00');

-- Consultas para verificar los datos
SELECT * FROM moneda;
SELECT * FROM usuarios;
SELECT * FROM cotizacion;
SELECT * FROM favorito;
SELECT * FROM historial_consulta;