
CREATE TABLE public.reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_reserva text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 7)),
  adultos int NOT NULL DEFAULT 1,
  criancas int NOT NULL DEFAULT 0,
  bebes int NOT NULL DEFAULT 0,
  passageiros jsonb NOT NULL DEFAULT '[]'::jsonb,
  assentos jsonb DEFAULT '[]'::jsonb,
  metodo_pagamento text NOT NULL DEFAULT 'pix',
  status text NOT NULL DEFAULT 'pendente',
  whatsapp_operador text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on reservas"
ON public.reservas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public select own reserva by code"
ON public.reservas
FOR SELECT
TO anon, authenticated
USING (true);
