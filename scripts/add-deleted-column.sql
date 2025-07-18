-- Añadir la columna 'deleted' a la tabla 'cars'
ALTER TABLE cars
ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

-- Opcional: Actualizar los autos existentes para asegurar que 'deleted' sea FALSE
UPDATE cars
SET deleted = FALSE
WHERE deleted IS NULL;
