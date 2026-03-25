export interface Passageiro {
  id: string;
  nomeCompleto: string;
  cpfDocumento: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
}

export interface DadosVoo {
  data: string;
  partida: string;
  chegada: string;
}

export interface Pagamento {
  id: string;
  passageiros: Passageiro[];
  origem: string;
  destino: string;
  companhia: string;
  numeroVoo: string;
  classe: string;
  ida: DadosVoo;
  volta: DadosVoo;
  descricao: string;
  codigoReserva: string;
  valor: string;
  whatsapp: string;
  codigoPix: string;
  metodoPagamento: "pix" | "gateway";
  status: "pendente" | "confirmado" | "cancelado" | "pago";
  criadoEm: string;
  atribuidoA: string;
}

export interface Gateway {
  id: string;
  nome: string;
  url: string;
  ativo: boolean;
  secretKey?: string;
  publicKey?: string;
}

export interface Operador {
  id: string;
  nome: string;
  whatsapp: string;
  ativo: boolean;
}

export interface LinkCadastro {
  companhia: string;
  url: string;
  cor: string;
}
