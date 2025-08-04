-- Primero, verificar si existe la tabla antigua y migrar datos si es necesario
DO $$
BEGIN
    -- Si existe la tabla antigua cotizaciones_pdf, migrar datos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cotizaciones_pdf') THEN
        -- Insertar datos de la tabla antigua a la nueva si no existen
        INSERT INTO cotizaciones (nombre_archivo, url, mes, anio, fecha_subida, estado)
        SELECT 
            COALESCE(archivo_url, 'archivo.pdf') as nombre_archivo,
            archivo_url as url,
            mes,
            anio,
            created_at as fecha_subida,
            'completado' as estado
        FROM cotizaciones_pdf
        WHERE NOT EXISTS (
            SELECT 1 FROM cotizaciones c 
            WHERE c.mes = cotizaciones_pdf.mes 
            AND c.anio = cotizaciones_pdf.anio
        );
        
        -- Opcional: eliminar tabla antigua después de migrar
        -- DROP TABLE cotizaciones_pdf;
    END IF;
END $$;

-- Asegurar que la tabla cotizaciones tenga la estructura correcta
ALTER TABLE cotizaciones 
ADD COLUMN IF NOT EXISTS mes INTEGER,
ADD COLUMN IF NOT EXISTS anio INTEGER;

-- Crear índice único para mes y año si no existe
CREATE UNIQUE INDEX IF NOT EXISTS idx_cotizaciones_mes_anio_unique 
ON cotizaciones(mes, anio);
