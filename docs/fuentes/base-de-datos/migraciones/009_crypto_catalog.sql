-- Categoria unica para filtros de criptomonedas e IDs de la API CoinGecko.
ALTER TABLE public.divisas ADD COLUMN IF NOT EXISTS coingecko_id VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS divisas_coingecko_id_key
  ON public.divisas (coingecko_id) WHERE coingecko_id IS NOT NULL;

INSERT INTO public.divisas (codigo,nombre,tipo,coingecko_id)
VALUES ('BTC','Bitcoin','crypto','bitcoin'),
       ('ETH','Ethereum','crypto','ethereum'),
       ('USDT','Tether','crypto','tether'),
       ('BNB','BNB','crypto','binancecoin'),
       ('DOGE','Dogecoin','crypto','dogecoin')
ON CONFLICT (codigo) DO UPDATE
SET tipo=EXCLUDED.tipo,coingecko_id=EXCLUDED.coingecko_id;
