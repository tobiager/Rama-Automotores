-- Crear tabla para almacenar las cotizaciones PDF
CREATE TABLE IF NOT EXISTS cotizaciones_pdf (
  id SERIAL PRIMARY KEY,
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  archivo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice único para mes/año para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_cotizaciones_mes_anio ON cotizaciones_pdf(mes, anio);

-- Habilitar RLS
ALTER TABLE cotizaciones_pdf ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Cotizaciones are publicly readable" ON cotizaciones_pdf
  FOR SELECT USING (true);

-- Política para inserción/actualización (solo admin)
CREATE POLICY "Admin can insert/update cotizaciones" ON cotizaciones_pdf
  FOR ALL USING (true);

-- Crear bucket de storage para cotizaciones si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('cotizaciones', 'cotizaciones', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para lectura pública
CREATE POLICY "Cotizaciones storage publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'cotizaciones');

-- Política de storage para subida (admin)
CREATE POLICY "Admin can upload cotizaciones" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cotizaciones');

-- Política de storage para actualización (admin)
CREATE POLICY "Admin can update cotizaciones" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cotizaciones');
