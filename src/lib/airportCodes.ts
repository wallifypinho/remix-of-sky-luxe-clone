// Mapa de siglas IATA → nome completo do aeroporto/cidade
export const AIRPORT_NAMES: Record<string, string> = {
  // Brasil - Principais
  GRU: "São Paulo (Guarulhos)",
  CGH: "São Paulo (Congonhas)",
  VCP: "Campinas (Viracopos)",
  GIG: "Rio de Janeiro (Galeão)",
  SDU: "Rio de Janeiro (Santos Dumont)",
  BSB: "Brasília",
  CNF: "Belo Horizonte (Confins)",
  PLU: "Belo Horizonte (Pampulha)",
  SSA: "Salvador",
  REC: "Recife",
  FOR: "Fortaleza",
  MAO: "Manaus",
  BEL: "Belém",
  CWB: "Curitiba",
  POA: "Porto Alegre",
  FLN: "Florianópolis",
  NAT: "Natal",
  MCZ: "Maceió",
  AJU: "Aracaju",
  SLZ: "São Luís",
  THE: "Teresina",
  CGB: "Cuiabá",
  CGR: "Campo Grande",
  GYN: "Goiânia",
  VIX: "Vitória",
  JPA: "João Pessoa",
  PMW: "Palmas",
  PVH: "Porto Velho",
  MCP: "Macapá",
  RBR: "Rio Branco",
  BVB: "Boa Vista",
  IGU: "Foz do Iguaçu",
  NVT: "Navegantes",
  JOI: "Joinville",
  LDB: "Londrina",
  MGF: "Maringá",
  UDI: "Uberlândia",
  RAO: "Ribeirão Preto",
  SJP: "São José do Rio Preto",
  BAU: "Bauru",
  PPB: "Presidente Prudente",
  IOS: "Ilhéus",
  BPS: "Porto Seguro",
  VDC: "Vitória da Conquista",
  CPV: "Campina Grande",
  PNZ: "Petrolina",
  JDO: "Juazeiro do Norte",
  IMP: "Imperatriz",
  STM: "Santarém",
  CKS: "Carajás",
  MOC: "Montes Claros",
  CFB: "Cabo Frio",
  // Internacional - Principais
  MIA: "Miami",
  JFK: "Nova York (JFK)",
  EWR: "Nova York (Newark)",
  LAX: "Los Angeles",
  ORD: "Chicago",
  MCO: "Orlando",
  FLL: "Fort Lauderdale",
  ATL: "Atlanta",
  DFW: "Dallas",
  IAH: "Houston",
  SFO: "São Francisco",
  LAS: "Las Vegas",
  BOS: "Boston",
  DCA: "Washington",
  SEA: "Seattle",
  LHR: "Londres (Heathrow)",
  CDG: "Paris (Charles de Gaulle)",
  FCO: "Roma (Fiumicino)",
  MAD: "Madrid",
  BCN: "Barcelona",
  LIS: "Lisboa",
  OPO: "Porto",
  AMS: "Amsterdã",
  FRA: "Frankfurt",
  MUC: "Munique",
  ZRH: "Zurique",
  DXB: "Dubai",
  DOH: "Doha",
  IST: "Istambul",
  NRT: "Tóquio (Narita)",
  HND: "Tóquio (Haneda)",
  MEX: "Cidade do México",
  SCL: "Santiago",
  EZE: "Buenos Aires (Ezeiza)",
  AEP: "Buenos Aires (Aeroparque)",
  BOG: "Bogotá",
  LIM: "Lima",
  MVD: "Montevidéu",
  ASU: "Assunção",
  PTY: "Cidade do Panamá",
  CUN: "Cancún",
  HAV: "Havana",
  JNB: "Joanesburgo",
  CPT: "Cidade do Cabo",
  SYD: "Sydney",
  SIN: "Singapura",
  HKG: "Hong Kong",
  ICN: "Seul (Incheon)",
  PEK: "Pequim",
};

/**
 * Retorna o nome completo do aeroporto/cidade a partir da sigla IATA.
 * Se não encontrar, retorna a própria sigla.
 */
export const getAirportName = (code: string): string => {
  if (!code) return "—";
  const upper = code.trim().toUpperCase();
  return AIRPORT_NAMES[upper] || upper;
};

/**
 * Retorna somente o nome da cidade (sem o nome do aeroporto entre parênteses).
 * Ex: "São Paulo (Guarulhos)" → "São Paulo"
 */
export const getCityName = (code: string): string => {
  if (!code) return "—";
  const full = getAirportName(code);
  return full.replace(/\s*\(.*\)$/, "");
};
