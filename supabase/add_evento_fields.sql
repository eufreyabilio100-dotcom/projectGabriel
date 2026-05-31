-- Adicionar campos de imagem e tipo ao eventos
ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS imagem_url TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'academico';

-- Criar bucket para imagens dos eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos-imagens', 'eventos-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para upload de imagens (qualquer utilizador autenticado)
CREATE POLICY "Utilizadores autenticados podem fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'eventos-imagens'
    AND auth.role() = 'authenticated'
  );

-- Policy para ver imagens (publico)
CREATE POLICY "Imagens sao publicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'eventos-imagens');

-- Policy para admins eliminarem imagens
CREATE POLICY "Admins podem eliminar imagens"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'eventos-imagens'
    AND EXISTS (
      SELECT 1 FROM public.utilizadores
      WHERE utilizadores.id = auth.uid()
      AND utilizadores.tipo = 'admin'
    )
  );

-- Tipos de evento disponiveis
COMMENT ON COLUMN public.eventos.tipo IS 'Tipos: academico, desporto, cultural, workshop, conferencia, palestra, outro';
