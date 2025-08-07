-- Crear tabla para las cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_archivo TEXT NOT NULL,
  url TEXT NOT NULL,
  fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  estado TEXT DEFAULT 'procesando' CHECK (estado IN ('procesando', 'completado', 'error')),
  total_modelos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para los modelos extraídos
CREATE TABLE IF NOT EXISTS modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_modelo TEXT NOT NULL,
  version TEXT,
  precio NUMERIC(12,2),
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha ON cotizaciones(fecha_subida DESC);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_mes_anio ON cotizaciones(mes, anio);
CREATE INDEX IF NOT EXISTS idx_modelos_cotizacion ON modelos(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_modelos_nombre ON modelos USING gin(to_tsvector('spanish', nombre_modelo));
CREATE INDEX IF NOT EXISTS idx_modelos_version ON modelos USING gin(to_tsvector('spanish', version));

-- Habilitar RLS
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;

-- Políticas para cotizaciones
CREATE POLICY "Cotizaciones are publicly readable" ON cotizaciones
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage cotizaciones" ON cotizaciones
  FOR ALL USING (true);

-- Políticas para modelos
CREATE POLICY "Modelos are publicly readable" ON modelos
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage modelos" ON modelos
  FOR ALL USING (true);

-- Crear bucket de storage si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('cotizaciones-pdf', 'cotizaciones-pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "PDF storage publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'cotizaciones-pdf');

CREATE POLICY "Admin can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cotizaciones-pdf');

CREATE POLICY "Admin can update PDFs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cotizaciones-pdf');
