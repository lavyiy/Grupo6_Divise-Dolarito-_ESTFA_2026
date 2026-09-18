-- Consulta para la API /cotizaciones: cinco criptos del catalogo.
-- Retorna tambien las divisas sin cotizacion (precio NULL).
-- tipo es la categoria del activo; tipo_mercado conserva la etiqueta del mercado.
-- No cambia datos. La moneda en que se expresa el precio aun no es una columna
-- del esquema: el backend debe documentarla antes de convertir importes.
SELECT
  d.id_divisa,
  d.codigo,
  d.nombre,
  d.tipo,
  d.coingecko_id,
  c.id_tipo_cambio,
  c.precio_compra,
  c.precio_venta,
  c.precio_compra AS compra,
  c.precio_venta AS venta,
  c.tipo_mercado,
  c.fecha_actualizacion AS updated_at
FROM public.divisas d
LEFT JOIN LATERAL (
  SELECT tc.id_tipo_cambio, tc.precio_compra, tc.precio_venta,
         tc.tipo_mercado, tc.fecha_actualizacion
  FROM public.tipos_de_cambio tc
  WHERE tc.id_divisa = d.id_divisa
  ORDER BY tc.fecha_actualizacion DESC, tc.id_tipo_cambio DESC
  LIMIT 1
) c ON true
WHERE d.tipo = 'crypto'
ORDER BY d.codigo;
