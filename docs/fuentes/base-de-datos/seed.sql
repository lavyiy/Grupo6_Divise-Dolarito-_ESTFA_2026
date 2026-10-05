-- Seed con divisas base y usuario de prueba (#22)

-- Insertar divisas base (ARS, USD, EUR, BTC, ETH)
INSERT INTO divisas (codigo, nombre, tipo) VALUES 
('ARS', 'Peso Argentino', 'Fiat'),
('USD', 'Dólar Estadounidense', 'Fiat'),
('EUR', 'Euro', 'Fiat'),
('BTC', 'Bitcoin', 'Cripto'),
('ETH', 'Ethereum', 'Cripto');

-- Insertar usuario de prueba (contraseña '123456' hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, divisa_base_id) VALUES 
('Usuario de Prueba', 'prueba@email.com', '$2b$10$wT.f/8QOof1oV3uU3WdF6OfzGqf7OOMvYgM4xI5xN2yQOa5vQvF2m', 1);

-- Insertar tipos de cambio iniciales
INSERT INTO tipos_de_cambio (id_divisa, precio_compra, precio_venta, tipo_mercado) VALUES 
(2, 1100.00, 1130.00, 'Blue'),
(2, 1080.00, 1110.00, 'Oficial'),
(3, 1200.00, 1250.00, 'Oficial'),
(4, 65000000.00, 66000000.00, 'Cripto'),
(5, 3500000.00, 3600000.00, 'Cripto');
