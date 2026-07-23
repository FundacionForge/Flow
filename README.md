# FLOW — Cuestionario de aprendizaje · Fundación Forge

App web para explorar hábitos de aprendizaje de estudiantes adolescentes, con panel docente y reporte grupal.

**Stack:** React 18 + Vite 5 · React Router v6 · Supabase (Postgres + Auth)

---

## Requisitos

- Node.js 18+
- npm 9+
- Proyecto en [Supabase](https://supabase.com) con las tablas configuradas (ver abajo)

## Instalación

```bash
git clone https://github.com/FundacionForge/Flow.git
cd Flow
npm install
```

Copiá el archivo de variables de entorno y completalo con tus credenciales de Supabase:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Luego:

```bash
npm run dev
```

Abre http://localhost:5173

## Build para producción

```bash
npm run build
npm run preview
```

---

## URLs de la app

| URL | Descripción |
|-----|-------------|
| `/` | Cuestionario alumno (modo on-demand con formulario) |
| `/?g=CODIGO` | Cuestionario alumno modo aula (sin formulario) |
| `/docente` | Panel docente — login con magic link |
| `/docente/reporte/:codigo` | Reporte grupal del docente |

---

## Base de datos (Supabase)

Ejecutar este SQL en el editor de Supabase para crear las tablas y políticas necesarias:

```sql
-- Tabla de respuestas de alumnos
create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  group_code text,
  answers jsonb,
  stars int,
  commitment text,
  country_code text,
  origin text,
  od_name text,
  od_lastname text,
  od_age text,
  od_email text,
  created_at timestamptz default now()
);

-- Tabla de docentes
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text,
  institution text,
  country_code text,
  email text,
  created_at timestamptz default now()
);

-- Tabla de grupos
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text,
  teacher_id uuid references teachers(id),
  created_at timestamptz default now()
);

-- RLS
alter table responses enable row level security;
alter table teachers  enable row level security;
alter table groups    enable row level security;

create policy "anon insert" on responses for insert to anon with check (true);
create policy "anon select" on responses for select to anon using (true);
create policy "anon update" on responses for update to anon using (true) with check (true);
create policy "teacher read responses" on responses for select to authenticated using (true);

create policy "teacher insert own" on teachers for insert to authenticated with check (auth.uid() = user_id);
create policy "teacher select own" on teachers for select to authenticated using (auth.uid() = user_id);

create policy "teacher insert group" on groups for insert to authenticated with check (true);
create policy "teacher select groups" on groups for select to authenticated using (true);
```

En **Authentication → URL Configuration** de Supabase configurar:
- Site URL: `http://localhost:5173` (o tu dominio de producción)
- Redirect URL: `http://localhost:5173/docente`

---

## Estructura del proyecto

```
app/
  public/
    logo-flow.png
    logo-forge.png
  src/
    main.jsx                  ← entry point y rutas
    App.jsx                   ← cuestionario alumno
    data/
      questions.js
      scoring.js
      reportContent.js
    components/
      QuestionScreen.jsx
      ReportView.jsx
      ZoneBar.jsx
      StarRating.jsx
      CommitmentScreen.jsx
      OndemandForm.jsx
      ProgressBar.jsx
    pages/
      TeacherPage.jsx          ← router auth docente
      TeacherLogin.jsx
      TeacherRegister.jsx
      TeacherDashboard.jsx
      TeacherReport.jsx        ← reporte grupal
    services/
      supabase.js
      geoip.js
      responses.js
      auth.js
      teachers.js
      groups.js
    styles/
      global.css
```
