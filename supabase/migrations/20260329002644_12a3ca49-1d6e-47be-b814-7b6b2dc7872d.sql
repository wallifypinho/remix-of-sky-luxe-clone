-- Add fixed short code for each operator and backfill existing rows
ALTER TABLE public.operadores
ADD COLUMN IF NOT EXISTS codigo_acesso text;

-- Backfill existing operators with a short deterministic code based on UUID
UPDATE public.operadores
SET codigo_acesso = lower(substr(replace(id::text, '-', ''), 1, 6))
WHERE codigo_acesso IS NULL OR btrim(codigo_acesso) = '';

-- Enforce uniqueness and required value for all future records
ALTER TABLE public.operadores
ALTER COLUMN codigo_acesso SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'operadores_codigo_acesso_unique'
  ) THEN
    ALTER TABLE public.operadores
    ADD CONSTRAINT operadores_codigo_acesso_unique UNIQUE (codigo_acesso);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_operadores_codigo_acesso
ON public.operadores (codigo_acesso);