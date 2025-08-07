-- Crear tabla de usuarios admin
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- En producción usar hash
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuario admin por defecto
INSERT INTO admin_users (name, username, password, email) VALUES
('Administrador', 'admin', 'rama2024', 'admin@ramaautomotores.com')
ON CONFLICT (username) DO NOTHING;

-- Insertar usuarios adicionales de ejemplo
INSERT INTO admin_users (name, username, password, email) VALUES
('Juan Pérez', 'juan', 'juan123', 'juan@ramaautomotores.com'),
('María García', 'maria', 'maria456', 'maria@ramaautomotores.com')
ON CONFLICT (username) DO NOTHING;
