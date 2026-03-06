CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  passageiros JSONB NOT NULL DEFAULT '[]'::jsonb,
  origem TEXT NOT NULL DEFAULT '',
  destino TEXT NOT NULL DEFAULT '',
  companhia TEXT NOT NULL DEFAULT '',
  numero_voo TEXT NOT NULL DEFAULT '',
  classe TEXT NOT NULL DEFAULT 'economica',
  ida_data TEXT NOT NULL DEFAULT '',
  ida_partida TEXT NOT NULL DEFAULT '',
  ida_chegada TEXT NOT NULL DEFAULT '',
  volta_data TEXT,
  volta_partida TEXT,
  volta_chegada TEXT,
  descricao TEXT,
  codigo_reserva TEXT NOT NULL DEFAULT '',
  valor TEXT NOT NULL DEFAULT '0',
  whatsapp_cliente TEXT,
  codigo_pix TEXT,
  metodo_pagamento TEXT NOT NULL DEFAULT 'pix',
  status TEXT NOT NULL DEFAULT 'pendente',
  whatsapp_operador TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read by token" ON public.pagamentos
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert" ON public.pagamentos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update" ON public.pagamentos
  FOR UPDATE TO anon, authenticated
  USING (true);