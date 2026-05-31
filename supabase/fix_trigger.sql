-- Criar função que insere automaticamente o utilizador na tabela utilizadores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utilizadores (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'participante')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após inserção na tabela auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir utilizadores existentes que não estão na tabela utilizadores
INSERT INTO public.utilizadores (id, nome, email, tipo)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'nome', email),
  email,
  COALESCE(raw_user_meta_data->>'tipo', 'participante')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.utilizadores);
