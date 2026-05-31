-- Corrigir RLS policies para solicitacoes
-- Execute este SQL no Supabase Dashboard

-- Remover policies existentes
DROP POLICY IF EXISTS "Participantes podem criar solicitacoes" ON public.solicitacoes_eventos;
DROP POLICY IF EXISTS "Utilizadores veem as suas solicitacoes" ON public.solicitacoes_eventos;
DROP POLICY IF EXISTS "Admins veem todas as solicitacoes" ON public.solicitacoes_eventos;
DROP POLICY IF EXISTS "Admins podem actualizar solicitacoes" ON public.solicitacoes_eventos;

-- Policy simples: qualquer utilizador autenticado pode ver todas as solicitacoes
CREATE POLICY "Ver solicitacoes"
  ON public.solicitacoes_eventos FOR SELECT
  USING (true);

-- Policy para criar: utilizador autenticado pode criar
CREATE POLICY "Criar solicitacoes"
  ON public.solicitacoes_eventos FOR INSERT
  WITH CHECK (auth.uid() = utilizador_id);

-- Policy para actualizar: qualquer utilizador autenticado pode actualizar
CREATE POLICY "Actualizar solicitacoes"
  ON public.solicitacoes_eventos FOR UPDATE
  USING (true);

-- Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_solicitacoes FROM public.solicitacoes_eventos;
