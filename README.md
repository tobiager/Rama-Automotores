
<h1 align="center">Rama Automotores </h1>

<p align="center">
  <img src="https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
  <img src="https://img.shields.io/badge/-Finalizado-greenlight?style=for-the-badge" alt="Estado"/>
</p>

**Rama Automotores** es una plataforma web desarrollada con **Next.js 15 y Supabase** que busca digitalizar la compra y cotización de autos en Argentina.  
Permite a los usuarios ver publicaciones de vehículos, calcular cotizaciones basadas en InfoAuto y simular planes de financiación con tasas reales.

---

## 🗂️ Información general

| Atributo               | Detalle                                           |
|------------------------|----------------------------------------------------|
| Nombre del Proyecto    | Rama Automotores                                   |
| Tipo                   | Plataforma Web / Ecommerce Automotriz              |
| Tecnologías            | Next.js, Supabase, PostgreSQL, TailwindCSS         |
| Lenguaje               | TypeScript                                         |
| Base de Datos          | PostgreSQL (Supabase)                             |
| Hosting                | Vercel                                             |
| Licencia               | MIT                                                |
| Estado del proyecto    | En desarrollo                                      |
| Última actualización   | Agosto 2025                                        |
| Autor                  | Tobias Orban - tobiasorban00@gmail.com            |

---

## 🧩 Descripción funcional

Rama Automotores ofrece:

- **Publicaciones de autos**: catálogo dinámico con detalles de cada vehículo.
- **Cotización de modelos**: buscador en base a InfoAuto.
- **Simulación de financiación**: cálculo de cuotas y tasas reales.
- **Formulario de contacto** para consultas.
- **Sección “Quiénes somos”** para dar transparencia al servicio.

---

## 🧠 Funcionalidades clave

### Catálogo de Autos
- Visualización de autos disponibles.
- Filtros por marca, modelo y precio.
- Vista detallada con fotos y características.

### Cotización
- Ingreso del modelo → búsqueda en InfoAuto.
- Devuelve precios y rangos de mercado.
- Cotización actualizada según período cargado.

### Financiación
- Simulación de crédito con tasas reales.
- Comparación de planes de pago.
- Calculadora de cuotas.

---

## 🛠️ Backend y Base de Datos

**Supabase + PostgreSQL** como backend principal.  
Se gestionan tablas para:

- `autos` → publicaciones de vehículos  
- `cotizaciones` → datos de InfoAuto cargados en PDF  
- `financiacion` → tasas y planes disponibles  
- `usuarios` → clientes interesados  

---

## 🧱 Estructura del Proyecto

```bash
/app
├── page.tsx
├── autos/
│   ├── catalogo/
│   └── detalle/[id]/
├── cotizacion/
├── financiacion/
├── contacto/
├── quienes-somos/

/components
├── AutoCard.tsx
├── CotizacionForm.tsx
├── FinanciacionCalc.tsx
├── Navbar.tsx
├── Footer.tsx

/lib
├── supabase.ts
└── database-service.ts

/public
└── assets/
```

---

## 🚀 Instalación
```
# Clonar repositorio
git clone https://github.com/tu-usuario/rama-automotores.git
cd rama-automotores

# Instalar dependencias
npm install

# Configurar entorno
NEXT_PUBLIC_SUPABASE_URL=https://<your-url>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

# Ejecutar en desarrollo
npm run dev
```

---

## 👤 Autor

**Tobias Orban**  
📧 tobiasorban00@gmail.com  

🐦 [@tobiager](https://twitter.com/tobiager)  

🎓 Estudiante de Licenciatura en Sistemas - UNNE  

<p align="center"><b>❤️🐔 Hecho con pasión y dedicación por Tobias</b></p>
