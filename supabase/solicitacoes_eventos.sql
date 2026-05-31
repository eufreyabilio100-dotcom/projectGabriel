-- Tabela para solicitacoes de eventos dos participantes
CREATE TABLE IF NOT EXISTS public.solicitacoes_eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utilizador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  local TEXT NOT NULL,
  capacidade INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  motivo_rejeicao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.solicitacoes_eventos ENABLE ROW LEVEL SECURITY;

-- Participantes podem criar solicitacoes
CREATE POLICY "Participantes podem criar solicitacoes"
  ON public.solicitacoes_eventos FOR INSERT
  WITH CHECK (auth.uid() = utilizador_id);

-- Participantes podem ver as suas proprias solicitacoes
CREATE POLICY "Utilizadores veem as suas solicitacoes"
  ON public.solicitacoes_eventos FOR SELECT
  USING (auth.uid() = utilizador_id);

-- Admins podem ver todas as solicitacoes
CREATE POLICY "Admins veem todas as solicitacoes"
  ON public.solicitacoes_eventos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

-- Admins podem actualizar solicitacoes (aprovar/rejeitar)
CREATE POLICY "Admins podem actualizar solicitacoes"
  ON public.solicitacoes_eventos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_solicitacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solicitacoes_updated_at
  BEFORE UPDATE ON public.solicitacoes_eventos
  FOR EACH ROW EXECUTE FUNCTION update_solicitacoes_updated_at();
