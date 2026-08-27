// Módulo de Armazenamento Persistente para Aplicação Web (GitHub Pages / Client-Side)

export interface Local {
  id: string;
  nome: string;
  bloco?: string | null;
  descricao?: string | null;
}

export interface Patrimonio {
  codigo: string;
  descricao: string;
  dataEntrada: string;
  origem: string;
  observacao?: string | null;
  localId: string;
  local?: Local;
  status: string; // EM_USO, EMPRESTADO, EM_MANUTENCAO, BAIXADO
  baixado: boolean;
  dataBaixa?: string | null;
  motivoBaixa?: string | null;
}

export interface Emprestimo {
  id: string;
  patrimonioCodigo: string;
  patrimonio?: Patrimonio;
  solicitante: string;
  cargo?: string | null;
  dataRetirada: string;
  previsaoDevolucao: string;
  dataDevolucao?: string | null;
  status: string; // ATIVO, DEVOLVIDO
  observacao?: string | null;
}

export interface Manutencao {
  id: string;
  patrimonioCodigo: string;
  patrimonio?: Patrimonio;
  solicitante: string;
  descricaoProblema: string;
  dataAbertura: string;
  status: string; // PENDENTE, EM_MANUTENCAO, CONCLUIDO
  custo?: number | null;
  solucao?: string | null;
}

export interface Consumivel {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidadeMinima: number;
  unidade: string;
  localId?: string | null;
  local?: Local | null;
}

const STORAGE_KEYS = {
  LOCAIS: 'cepr_locais_v1',
  PATRIMONIOS: 'cepr_patrimonios_v1',
  EMPRESTIMOS: 'cepr_emprestimos_v1',
  MANUTENCOES: 'cepr_manutencoes_v1',
  CONSUMIVEIS: 'cepr_consumiveis_v1',
};

// Dados Iniciais Escolares (Caso o armazenamento esteja vazio)
const LOCAIS_INICIAIS: Local[] = [
  { id: 'loc-1', nome: 'Laboratório de Informática', bloco: 'Bloco A', descricao: 'Computadores e tecnologia' },
  { id: 'loc-2', nome: 'Biblioteca Escola Pedro Rizzi', bloco: 'Bloco A', descricao: 'Acervo de livros e mesas de estudo' },
  { id: 'loc-3', nome: 'Secretaria e Direção', bloco: 'Bloco Adm', descricao: 'Atendimento administrativo' },
  { id: 'loc-4', nome: 'Sala dos Professores', bloco: 'Bloco Adm', descricao: 'Espaço dos docentes' },
  { id: 'loc-5', nome: 'Cozinha e Refeitório', bloco: 'Bloco B', descricao: 'Preparo de merenda' },
  { id: 'loc-6', nome: 'Sala 01 - Ensino Fundamental', bloco: 'Bloco A', descricao: 'Sala de aula' },
  { id: 'loc-7', nome: 'Sala 02 - Ensino Fundamental', bloco: 'Bloco A', descricao: 'Sala de aula' },
  { id: 'loc-8', nome: 'Laboratório de Ciências e Robótica', bloco: 'Bloco B', descricao: 'Kits de robótica e experimentos' },
  { id: 'loc-9', nome: 'Quadra Poliesportiva / Depósito Ed. Física', bloco: 'Bloco C', descricao: 'Materiais esportivos' },
];

const PATRIMONIOS_INICIAIS: Patrimonio[] = [
  {
    codigo: '000101',
    descricao: 'Computador Desktop Dell OptiPlex i5 16GB RAM 512GB SSD',
    dataEntrada: '2025-02-10',
    origem: 'Verba PDDE',
    observacao: 'Em uso no laboratório',
    localId: 'loc-1',
    status: 'EM_USO',
    baixado: false,
  },
  {
    codigo: '000102',
    descricao: 'Projetor Epson PowerLite 3300 Lumens HDMI',
    dataEntrada: '2025-03-15',
    origem: 'Prefeitura Municipal',
    observacao: 'Projetor móvel da secretaria',
    localId: 'loc-3',
    status: 'EM_USO',
    baixado: false,
  },
  {
    codigo: '000103',
    descricao: 'Ar Condicionado Split Inverter 24.000 BTUs Consul',
    dataEntrada: '2024-11-20',
    origem: 'Doação APMF',
    observacao: 'Instalado na biblioteca',
    localId: 'loc-2',
    status: 'EM_USO',
    baixado: false,
  },
  {
    codigo: '000104',
    descricao: 'Mesa de Reunião em Madeira MDF 8 Lugares',
    dataEntrada: '2024-08-05',
    origem: 'Compra Direta',
    observacao: 'Mesa principal da sala dos professores',
    localId: 'loc-4',
    status: 'EM_USO',
    baixado: false,
  },
  {
    codigo: '000105',
    descricao: 'Caixa de Som Amplificada Portátil 500W Bluetooth',
    dataEntrada: '2025-05-02',
    origem: 'Verba FDE',
    observacao: 'Utilizada na quadra',
    localId: 'loc-9',
    status: 'EM_USO',
    baixado: false,
  },
  {
    codigo: '000106',
    descricao: 'Geladeira Duplex Inox Brastemp 400L',
    dataEntrada: '2023-04-12',
    origem: 'Prefeitura Municipal',
    observacao: 'Em manutenção',
    localId: 'loc-5',
    status: 'EM_MANUTENCAO',
    baixado: false,
  },
  {
    codigo: '000107',
    descricao: 'Computador Antigo Positivo Celeron (Baixado)',
    dataEntrada: '2018-03-01',
    origem: 'Doação Antiga',
    observacao: 'Placa mãe queimada',
    localId: 'loc-1',
    status: 'BAIXADO',
    baixado: true,
    dataBaixa: '2026-01-15',
    motivoBaixa: 'Inservível / Queimado sem peça',
  },
];

const CONSUMIVEIS_INICIAIS: Consumivel[] = [
  { id: 'c-1', nome: 'Papel A4 Chamex 75g (Caixa c/ 10)', categoria: 'Papelaria', quantidade: 15, quantidadeMinima: 5, unidade: 'Caixa', localId: 'loc-3' },
  { id: 'c-2', nome: 'Canetão Quadro Branco Azul (Faber-Castell)', categoria: 'Didático', quantidade: 40, quantidadeMinima: 10, unidade: 'Unidade', localId: 'loc-3' },
  { id: 'c-3', nome: 'Sabão Líquido Galão 5 Litros', categoria: 'Limpeza', quantidade: 3, quantidadeMinima: 4, unidade: 'Galão', localId: 'loc-5' },
  { id: 'c-4', nome: 'Copo Descartável 200ml (Pacote c/ 100)', categoria: 'Cozinha', quantidade: 25, quantidadeMinima: 8, unidade: 'Pacote', localId: 'loc-5' },
  { id: 'c-5', nome: 'Cabo HDMI 2.0 de 5 Metros', categoria: 'TI', quantidade: 6, quantidadeMinima: 2, unidade: 'Unidade', localId: 'loc-1' },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ---------------- GESTÃO DE LOCAIS ----------------
export function getLocaisStorage(): Local[] {
  if (!isBrowser()) return LOCAIS_INICIAIS;
  const data = localStorage.getItem(STORAGE_KEYS.LOCAIS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(LOCAIS_INICIAIS));
    return LOCAIS_INICIAIS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return LOCAIS_INICIAIS;
  }
}

export function saveLocalStorage(local: Omit<Local, 'id'> & { id?: string }): Local {
  const locais = getLocaisStorage();
  let novoLocal: Local;

  if (local.id) {
    locais.map((l, index) => {
      if (l.id === local.id) {
        locais[index] = { ...l, ...local };
      }
    });
    novoLocal = local as Local;
  } else {
    novoLocal = { ...local, id: `loc-${Date.now()}` };
    locais.push(novoLocal);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(locais));
  return novoLocal;
}

export function deleteLocalStorage(id: string): void {
  const locais = getLocaisStorage().filter((l) => l.id !== id);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(locais));
}

// ---------------- GESTÃO DE PATRIMÔNIOS ----------------
export function getPatrimoniosStorage(): Patrimonio[] {
  if (!isBrowser()) return PATRIMONIOS_INICIAIS;
  const data = localStorage.getItem(STORAGE_KEYS.PATRIMONIOS);
  const locais = getLocaisStorage();

  let patrimonios: Patrimonio[] = [];
  if (!data) {
    patrimonios = PATRIMONIOS_INICIAIS;
    localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));
  } else {
    try {
      patrimonios = JSON.parse(data);
    } catch {
      patrimonios = PATRIMONIOS_INICIAIS;
    }
  }

  // Vincular objetos de local
  return patrimonios.map((p) => ({
    ...p,
    local: locais.find((l) => l.id === p.localId) || { id: p.localId, nome: 'Local Desconhecido' },
  }));
}

export function savePatrimonioStorage(patrimonio: Patrimonio): Patrimonio {
  const patrimonios = getPatrimoniosStorage().map(({ local, ...p }) => p);
  const index = patrimonios.findIndex((p) => p.codigo === patrimonio.codigo);

  const cleanPatrimonio = { ...patrimonio };
  delete cleanPatrimonio.local;

  if (index >= 0) {
    patrimonios[index] = cleanPatrimonio;
  } else {
    patrimonios.push(cleanPatrimonio);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));
  return patrimonio;
}

export function deletePatrimonioStorage(codigo: string): void {
  const patrimonios = getPatrimoniosStorage()
    .filter((p) => p.codigo !== codigo)
    .map(({ local, ...p }) => p);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));
}

// ---------------- GESTÃO DE EMPRÉSTIMOS ----------------
export function getEmprestimosStorage(): Emprestimo[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.EMPRESTIMOS);
  const patrimonios = getPatrimoniosStorage();

  if (!data) return [];
  try {
    const list: Emprestimo[] = JSON.parse(data);
    return list.map((emp) => ({
      ...emp,
      patrimonio: patrimonios.find((p) => p.codigo === emp.patrimonioCodigo),
    }));
  } catch {
    return [];
  }
}

export function saveEmprestimoStorage(empData: Omit<Emprestimo, 'id'> & { id?: string }): Emprestimo {
  const emprestimos = getEmprestimosStorage().map(({ patrimonio, ...e }) => e);
  let novoEmprestimo: Emprestimo;

  if (empData.id) {
    const idx = emprestimos.findIndex((e) => e.id === empData.id);
    if (idx >= 0) emprestimos[idx] = empData as Emprestimo;
    novoEmprestimo = empData as Emprestimo;
  } else {
    novoEmprestimo = { ...empData, id: `emp-${Date.now()}` };
    emprestimos.push(novoEmprestimo);
  }

  // Atualizar status do patrimônio correspondente
  const patrimonios = getPatrimoniosStorage();
  const pat = patrimonios.find((p) => p.codigo === novoEmprestimo.patrimonioCodigo);
  if (pat) {
    pat.status = novoEmprestimo.status === 'ATIVO' ? 'EMPRESTADO' : 'EM_USO';
    savePatrimonioStorage(pat);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.EMPRESTIMOS, JSON.stringify(emprestimos));
  return novoEmprestimo;
}

// ---------------- GESTÃO DE MANUTENÇÕES ----------------
export function getManutencoesStorage(): Manutencao[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.MANUTENCOES);
  const patrimonios = getPatrimoniosStorage();

  if (!data) return [];
  try {
    const list: Manutencao[] = JSON.parse(data);
    return list.map((m) => ({
      ...m,
      patrimonio: patrimonios.find((p) => p.codigo === m.patrimonioCodigo),
    }));
  } catch {
    return [];
  }
}

export function saveManutencaoStorage(matsData: Omit<Manutencao, 'id'> & { id?: string }): Manutencao {
  const manutencoes = getManutencoesStorage().map(({ patrimonio, ...m }) => m);
  let novaManutencao: Manutencao;

  if (matsData.id) {
    const idx = manutencoes.findIndex((m) => m.id === matsData.id);
    if (idx >= 0) manutencoes[idx] = matsData as Manutencao;
    novaManutencao = matsData as Manutencao;
  } else {
    novaManutencao = { ...matsData, id: `man-${Date.now()}` };
    manutencoes.push(novaManutencao);
  }

  // Atualizar status do patrimônio correspondente
  const patrimonios = getPatrimoniosStorage();
  const pat = patrimonios.find((p) => p.codigo === novaManutencao.patrimonioCodigo);
  if (pat) {
    pat.status = novaManutencao.status === 'CONCLUIDO' ? 'EM_USO' : 'EM_MANUTENCAO';
    savePatrimonioStorage(pat);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(manutencoes));
  return novaManutencao;
}

// ---------------- GESTÃO DE CONSUMÍVEIS (ALMOXARIFADO) ----------------
export function getConsumiveisStorage(): Consumivel[] {
  if (!isBrowser()) return CONSUMIVEIS_INICIAIS;
  const data = localStorage.getItem(STORAGE_KEYS.CONSUMIVEIS);
  const locais = getLocaisStorage();

  let list: Consumivel[] = [];
  if (!data) {
    list = CONSUMIVEIS_INICIAIS;
    localStorage.setItem(STORAGE_KEYS.CONSUMIVEIS, JSON.stringify(list));
  } else {
    try {
      list = JSON.parse(data);
    } catch {
      list = CONSUMIVEIS_INICIAIS;
    }
  }

  return list.map((c) => ({
    ...c,
    local: locais.find((l) => l.id === c.localId) || null,
  }));
}

export function saveConsumivelStorage(consumivel: Omit<Consumivel, 'id'> & { id?: string }): Consumivel {
  const list = getConsumiveisStorage().map(({ local, ...c }) => c);
  let novo: Consumivel;

  if (consumivel.id) {
    const idx = list.findIndex((c) => c.id === consumivel.id);
    if (idx >= 0) list[idx] = consumivel as Consumivel;
    novo = consumivel as Consumivel;
  } else {
    novo = { ...consumivel, id: `cons-${Date.now()}` };
    list.push(novo);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.CONSUMIVEIS, JSON.stringify(list));
  return novo;
}

export function deleteConsumivelStorage(id: string): void {
  const list = getConsumiveisStorage()
    .filter((c) => c.id !== id)
    .map(({ local, ...c }) => c);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.CONSUMIVEIS, JSON.stringify(list));
}
