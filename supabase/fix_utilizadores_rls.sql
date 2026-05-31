-- Corrigir RLS policies para utilizadores
-- Execute este SQL no Supabase Dashboard

-- Verificar se RLS esta ativo
ALTER TABLE public.utilizadores ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS "Ver utilizadores" ON public.utilizadores;
DROP POLICY IF EXISTS "Criar utilizadores" ON public.utilizadores;
DROP POLICY IF EXISTS "Actualizar utilizadores" ON public.utilizadores;
DROP POLICY IF EXISTS "Utilizadores veem o seu perfil" ON public.utilizadores;
DROP POLICY IF EXISTS "Admins veem todos" ON public.utilizadores;
DROP POLICY IF EXISTS "Admins podem actualizar" ON public.utilizadores;

-- Policy para qualquer utilizador autenticado ver todos os utilizadores
CREATE POLICY "Ver utilizadores"
  ON public.utilizadores FOR SELECT
  USING (true);

-- Policy para criar utilizadores (trigger faz isso)
CREATE POLICY "Criar utilizadores"
  ON public.utilizadores FOR INSERT
  WITH CHECK (true);

-- Policy para actualizar utilizadores (qualquer autenticado)
CREATE POLICY "Actualizar utilizadores"
  ON public.utilizadores FOR UPDATE
  USING (true);

-- Verificar dados
SELECT id, nome, email, tipo FROM public.utilizadores LIMIT 10;
