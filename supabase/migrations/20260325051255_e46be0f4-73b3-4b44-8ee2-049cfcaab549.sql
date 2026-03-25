
-- Add operador_id to pagamentos and reservas for data isolation
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS operador_id uuid;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS operador_id uuid;

-- Make email have a default so it's not required for operator creation
ALTER TABLE public.operadores ALTER COLUMN email SET DEFAULT '';

-- Allow delete on operadores for admin
CREATE POLICY "Allow delete operadores"
ON public.operadores
FOR DELETE
TO anon, authenticated
USING (true);
