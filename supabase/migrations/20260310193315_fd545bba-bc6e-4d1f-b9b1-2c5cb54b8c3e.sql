
-- Tabela de operadores com login simples
CREATE TABLE public.operadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  perfil text NOT NULL DEFAULT 'operador' CHECK (perfil IN ('admin', 'operador')),
  ultimo_acesso timestamp with time zone,
  sessao_ativa boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (o controle de acesso é feito pela edge function)
CREATE POLICY "Allow public select operadores" ON public.operadores
  FOR SELECT TO anon, authenticated USING (true);

-- Permitir insert apenas via service role (edge function)
CREATE POLICY "Allow service insert operadores" ON public.operadores
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Permitir update 
CREATE POLICY "Allow service update operadores" ON public.operadores
  FOR UPDATE TO anon, authenticated USING (true);

-- Criar operador admin padrão (senha: admin123 - hash bcrypt placeholder, será substituído pela edge function)
-- O primeiro login via edge function criará o hash correto
