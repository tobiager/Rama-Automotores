-- Crear tabla para tasas de financiación (opcional)
-- Si no existe esta tabla, el sistema usará valores fallback

CREATE TABLE IF NOT EXISTS public.tasas_financiacion (
    id SERIAL PRIMARY KEY,
    meses INTEGER NOT NULL UNIQUE,
    tasa_anual NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insertar tasas por defecto
INSERT INTO public.tasas_financiacion (meses, tasa_anual) VALUES
(12, 35.00),
(18, 40.00),
(24, 45.00),
(36, 55.00),
(48, 62.00),
(60, 68.00)
ON CONFLICT (meses) DO UPDATE SET
    tasa_anual = EXCLUDED.tasa_anual,
    updated_at = TIMEZONE('utc'::text, NOW());

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.tasas_financiacion ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados y anónimos
CREATE POLICY "Allow read access to tasas_financiacion" ON public.tasas_financiacion
    FOR SELECT USING (true);

-- Comentarios
COMMENT ON TABLE public.tasas_financiacion IS 'Tabla para almacenar las tasas de financiación por plazo';
COMMENT ON COLUMN public.tasas_financiacion.meses IS 'Plazo en meses (12, 18, 24, 36, 48, 60)';
COMMENT ON COLUMN public.tasas_financiacion.tasa_anual IS 'Tasa Nominal Anual (TNA) en porcentaje';
