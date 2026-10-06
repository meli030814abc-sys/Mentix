-- ==========================================================================
-- 🔥 TE RETO - SCRIPT SQL SEGURO E IDEMPOTENTE PARA SUPABASE
-- Este script es seguro de ejecutar múltiples veces sin errores.
-- ==========================================================================

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'student',
  avatar TEXT DEFAULT '🦊',
  xp INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  level_name TEXT DEFAULT 'Principiante',
  challenges_played INTEGER DEFAULT 0,
  challenges_created INTEGER DEFAULT 0,
  victories INTEGER DEFAULT 0,
  medals TEXT[] DEFAULT '{}',
  country TEXT DEFAULT 'Colombia',
  institution TEXT DEFAULT 'Comunidad TE RETO',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE RETOS Y CUESTIONARIOS
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  category_name TEXT,
  author TEXT,
  author_avatar TEXT,
  plays INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'Medio',
  banner TEXT,
  time_per_question INTEGER DEFAULT 20,
  points_standard INTEGER DEFAULT 1000,
  is_public BOOLEAN DEFAULT true,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE SALAS EN VIVO (MULTIPLAYER)
CREATE TABLE IF NOT EXISTS public.rooms (
  pin TEXT PRIMARY KEY,
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE,
  challenge_title TEXT,
  host_name TEXT,
  status TEXT DEFAULT 'lobby',
  current_question_index INTEGER DEFAULT 0,
  time_limit INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE JUGADORES EN SALAS
CREATE TABLE IF NOT EXISTS public.room_players (
  id TEXT PRIMARY KEY,
  pin TEXT REFERENCES public.rooms(pin) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar TEXT DEFAULT '😎',
  score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  is_bot BOOLEAN DEFAULT false,
  connected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE RESPUESTAS EN TIEMPO REAL
CREATE TABLE IF NOT EXISTS public.room_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin TEXT REFERENCES public.rooms(pin) ON DELETE CASCADE,
  player_id TEXT REFERENCES public.room_players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_taken NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. HABILITAR SEGURIDAD (ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_responses ENABLE ROW LEVEL SECURITY;

-- 7. ELIMINAR POLÍTICAS PREVIAS PARA EVITAR CONFLICTOS
DROP POLICY IF EXISTS "Lectura pública de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Inserción y actualización pública de perfiles" ON public.profiles;

DROP POLICY IF EXISTS "Lectura pública de retos" ON public.challenges;
DROP POLICY IF EXISTS "Inserción y actualización pública de retos" ON public.challenges;

DROP POLICY IF EXISTS "Lectura pública de salas" ON public.rooms;
DROP POLICY IF EXISTS "Inserción y actualización pública de salas" ON public.rooms;

DROP POLICY IF EXISTS "Lectura pública de jugadores" ON public.room_players;
DROP POLICY IF EXISTS "Inserción y actualización de jugadores" ON public.room_players;

DROP POLICY IF EXISTS "Lectura pública de respuestas" ON public.room_responses;
DROP POLICY IF EXISTS "Inserción de respuestas" ON public.room_responses;

-- 8. RECREAR POLÍTICAS PERMISIVAS LIMPIAS
CREATE POLICY "Lectura pública de perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Inserción y actualización pública de perfiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Lectura pública de retos" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Inserción y actualización pública de retos" ON public.challenges FOR ALL USING (true);

CREATE POLICY "Lectura pública de salas" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Inserción y actualización pública de salas" ON public.rooms FOR ALL USING (true);

CREATE POLICY "Lectura pública de jugadores" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Inserción y actualización de jugadores" ON public.room_players FOR ALL USING (true);

CREATE POLICY "Lectura pública de respuestas" ON public.room_responses FOR SELECT USING (true);
CREATE POLICY "Inserción de respuestas" ON public.room_responses FOR ALL USING (true);

-- 9. ACTIVAR TABLAS EN REALTIME DE FORMA SEGURA (SIN DUPLICADOS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'room_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'room_responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_responses;
  END IF;
END $$;
