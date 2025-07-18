-- Crear tabla de autos
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  images TEXT[], -- Array de URLs de imágenes
  description TEXT NOT NULL,
  sold BOOLEAN DEFAULT FALSE,
  mileage INTEGER,
  fuel VARCHAR(50),
  transmission VARCHAR(50),
  color VARCHAR(100),
  features TEXT[], -- Array de características
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos de ejemplo
INSERT INTO cars (brand, model, year, price, image, images, description, sold, mileage, fuel, transmission, color, features) VALUES
('BMW', 'X5', 2022, 85000, '/placeholder.svg?height=400&width=600', ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'], 'SUV premium con tecnología avanzada y sistema de tracción integral xDrive', false, 15000, 'Gasolina', 'Automática', 'Negro Metálico', ARRAY['Navegación GPS', 'Asientos de cuero', 'Techo panorámico', 'Sistema de sonido premium']),
('Mercedes-Benz', 'C-Class', 2023, 65000, '/placeholder.svg?height=400&width=600', ARRAY['/placeholder.svg?height=400&width=600'], 'Sedán ejecutivo de lujo con interior de cuero premium y tecnología MBUX', false, 8000, 'Gasolina', 'Automática', 'Blanco Polar', ARRAY['MBUX', 'Asientos ventilados', 'Cámara 360°', 'Piloto automático']),
('Audi', 'A4', 2021, 55000, '/placeholder.svg?height=400&width=600', NULL, 'Elegancia y performance en un diseño sofisticado con tecnología quattro', false, 25000, 'Gasolina', 'Automática', 'Plata Metálico', ARRAY['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen', 'Asientos deportivos']),
('Porsche', '911', 2023, 150000, '/placeholder.svg?height=400&width=600', NULL, 'Deportivo icónico con motor boxer y tracción trasera, pura emoción al volante', false, 5000, 'Gasolina', 'Manual', 'Rojo Carrera', ARRAY['Motor Boxer', 'Suspensión deportiva', 'Frenos Brembo', 'Interior Alcantara']),
('Tesla', 'Model S', 2022, 95000, '/placeholder.svg?height=400&width=600', NULL, 'Sedán eléctrico de lujo con autopilot avanzado y autonomía extendida', false, 12000, 'Eléctrico', 'Automática', 'Azul Metálico', ARRAY['Autopilot', 'Supercargador', 'Pantalla táctil 17''', 'Actualizaciones OTA']),
('Range Rover', 'Evoque', 2021, 70000, '/placeholder.svg?height=400&width=600', NULL, 'SUV compacto de lujo con diseño distintivo y capacidades off-road', false, 18000, 'Gasolina', 'Automática', 'Gris Oscuro', ARRAY['Terrain Response', 'Techo convertible', 'Meridian Audio', 'Cámara trasera']);

-- Insertar autos vendidos
INSERT INTO cars (brand, model, year, price, image, description, sold, mileage, fuel, transmission, color) VALUES
('BMW', 'X3', 2020, 65000, '/placeholder.svg?height=400&width=600', 'SUV premium con excelente mantenimiento, vendido a cliente satisfecho', true, 35000, 'Gasolina', 'Automática', 'Blanco Alpine'),
('Mercedes-Benz', 'E-Class', 2019, 75000, '/placeholder.svg?height=400&width=600', 'Sedán ejecutivo de lujo, único dueño, historial completo de mantenimiento', true, 42000, 'Gasolina', 'Automática', 'Negro Obsidiana'),
('Audi', 'Q5', 2021, 70000, '/placeholder.svg?height=400&width=600', 'SUV familiar con tecnología quattro, perfecto estado', true, 28000, 'Gasolina', 'Automática', 'Gris Daytona');
