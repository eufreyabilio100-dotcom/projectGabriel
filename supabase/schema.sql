-- =============================================
-- EVENTOS ACADÉMICOS ISPT - Base de Dados
-- =============================================

-- Criar tabela de utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'participante' CHECK (tipo IN ('participante', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  local TEXT NOT NULL,
  capacidade INTEGER NOT NULL,
  imagem_url TEXT,
  organizador_id UUID REFERENCES utilizadores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utilizador_id UUID REFERENCES utilizadores(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(utilizador_id, evento_id)
);

-- Criar tabela de bilhetes
CREATE TABLE IF NOT EXISTS bilhetes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscricao_id UUID REFERENCES inscricoes(id) ON DELETE CASCADE,
  codigo_unico TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activar Row Level Security
ALTER TABLE utilizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilhetes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS DE SEGURANÇA
-- =============================================

-- Políticas para utilizadores
CREATE POLICY "Utilizadores podem ver o próprio perfil"
  ON utilizadores FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilizadores podem actualizar o próprio perfil"
  ON utilizadores FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para eventos (qualquer pessoa pode ver)
CREATE POLICY "Qualquer pessoa pode ver eventos"
  ON eventos FOR SELECT
  USING (true);

CREATE POLICY "Admins podem criar eventos"
  ON eventos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem actualizar eventos"
  ON eventos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem eliminar eventos"
  ON eventos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

-- Políticas para inscrições
CREATE POLICY "Utilizadores podem ver as próprias inscrições"
  ON inscricoes FOR SELECT
  USING (auth.uid() = utilizador_id);

CREATE POLICY "Utilizadores podem inscrever-se em eventos"
  ON inscricoes FOR INSERT
  WITH CHECK (auth.uid() = utilizador_id);

CREATE POLICY "Admins podem ver todas as inscrições"
  ON inscricoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

-- Políticas para bilhetes
CREATE POLICY "Utilizadores podem ver os próprios bilhetes"
  ON bilhetes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inscricoes
      WHERE inscricoes.id = bilhetes.inscricao_id
      AND inscricoes.utilizador_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode criar bilhetes"
  ON bilhetes FOR INSERT
  WITH CHECK (true);
