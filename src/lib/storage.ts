import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

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
  fotoUrl?: string | null;
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

const STORAGE_KEYS = {
  LOCAIS: 'cepr_locais_v1',
  PATRIMONIOS: 'cepr_patrimonios_v1',
  EMPRESTIMOS: 'cepr_emprestimos_v1',
  MANUTENCOES: 'cepr_manutencoes_v1',
};

// Dados Iniciais Escolares
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
    fotoUrl: null,
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
    fotoUrl: null,
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
    fotoUrl: null,
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
    fotoUrl: null,
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
    fotoUrl: null,
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
    fotoUrl: null,
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
    fotoUrl: null,
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function hasFirebaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

// ---------------- LISTENERS DE TEMPO REAL (FIREBASE) ----------------

export function subscribeLocais(callback: (locais: Local[]) => void) {
  if (hasFirebaseConfigured()) {
    try {
      return onSnapshot(collection(db, 'locais'), (snapshot) => {
        if (snapshot.empty) {
          // Se o banco online estiver vazio, popula com locais iniciais
          LOCAIS_INICIAIS.forEach((loc) => setDoc(doc(db, 'locais', loc.id), loc));
          callback(LOCAIS_INICIAIS);
        } else {
          const list: Local[] = snapshot.docs.map((docSnap) => docSnap.data() as Local);
          if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(list));
          callback(list);
        }
      });
    } catch (e) {
      console.error('Erro no listener do Firebase:', e);
    }
  }

  callback(getLocaisStorage());
  return () => {};
}

export function subscribePatrimonios(callback: (patrimonios: Patrimonio[]) => void) {
  if (hasFirebaseConfigured()) {
    try {
      return onSnapshot(collection(db, 'patrimonios'), (snapshot) => {
        const locais = getLocaisStorage();
        if (snapshot.empty) {
          PATRIMONIOS_INICIAIS.forEach((pat) => setDoc(doc(db, 'patrimonios', pat.codigo), pat));
          const result = PATRIMONIOS_INICIAIS.map((p) => ({
            ...p,
            local: locais.find((l) => l.id === p.localId) || { id: p.localId, nome: 'Local Desconhecido' },
          }));
          callback(result);
        } else {
          const list: Patrimonio[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Patrimonio;
            return {
              ...data,
              local: locais.find((l) => l.id === data.localId) || { id: data.localId, nome: 'Local Desconhecido' },
            };
          });
          if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(snapshot.docs.map(d => d.data())));
          callback(list);
        }
      });
    } catch (e) {
      console.error('Erro no listener do Firebase:', e);
    }
  }

  callback(getPatrimoniosStorage());
  return () => {};
}

export function subscribeEmprestimos(callback: (emprestimos: Emprestimo[]) => void) {
  if (hasFirebaseConfigured()) {
    try {
      return onSnapshot(collection(db, 'emprestimos'), (snapshot) => {
        const patrimonios = getPatrimoniosStorage();
        const list: Emprestimo[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Emprestimo;
          return {
            ...data,
            patrimonio: patrimonios.find((p) => p.codigo === data.patrimonioCodigo),
          };
        });
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.EMPRESTIMOS, JSON.stringify(snapshot.docs.map(d => d.data())));
        callback(list);
      });
    } catch (e) {
      console.error('Erro no listener do Firebase:', e);
    }
  }

  callback(getEmprestimosStorage());
  return () => {};
}

export function subscribeManutencoes(callback: (manutencoes: Manutencao[]) => void) {
  if (hasFirebaseConfigured()) {
    try {
      return onSnapshot(collection(db, 'manutencoes'), (snapshot) => {
        const patrimonios = getPatrimoniosStorage();
        const list: Manutencao[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Manutencao;
          return {
            ...data,
            patrimonio: patrimonios.find((p) => p.codigo === data.patrimonioCodigo),
          };
        });
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(snapshot.docs.map(d => d.data())));
        callback(list);
      });
    } catch (e) {
      console.error('Erro no listener do Firebase:', e);
    }
  }

  callback(getManutencoesStorage());
  return () => {};
}

// ---------------- OPERAÇÕES LOCAIS E FIREBASE ----------------

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

export async function saveLocalStorage(local: Omit<Local, 'id'> & { id?: string }): Promise<Local> {
  const id = local.id || `loc-${Date.now()}`;
  const novoLocal: Local = { ...local, id };

  const locais = getLocaisStorage();
  const idx = locais.findIndex((l) => l.id === id);
  if (idx >= 0) locais[idx] = novoLocal;
  else locais.push(novoLocal);

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(locais));

  if (hasFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'locais', id), novoLocal);
    } catch (e) {
      console.error('Erro ao salvar local no Firebase:', e);
    }
  }

  return novoLocal;
}

export async function deleteLocalStorage(id: string): Promise<void> {
  const locais = getLocaisStorage().filter((l) => l.id !== id);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(locais));

  if (hasFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'locais', id));
    } catch (e) {
      console.error('Erro ao deletar local no Firebase:', e);
    }
  }
}

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

  return patrimonios.map((p) => ({
    ...p,
    local: locais.find((l) => l.id === p.localId) || { id: p.localId, nome: 'Local Desconhecido' },
  }));
}

export async function savePatrimonioStorage(patrimonio: Patrimonio): Promise<Patrimonio> {
  const cleanPatrimonio = { ...patrimonio };
  delete cleanPatrimonio.local;

  const patrimonios = getPatrimoniosStorage().map(({ local, ...p }) => p);
  const index = patrimonios.findIndex((p) => p.codigo === patrimonio.codigo);

  if (index >= 0) {
    patrimonios[index] = cleanPatrimonio;
  } else {
    patrimonios.push(cleanPatrimonio);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));

  if (hasFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'patrimonios', patrimonio.codigo), cleanPatrimonio);
    } catch (e) {
      console.error('Erro ao salvar patrimônio no Firebase:', e);
    }
  }

  return patrimonio;
}

export async function deletePatrimonioStorage(codigo: string): Promise<void> {
  const patrimonios = getPatrimoniosStorage()
    .filter((p) => p.codigo !== codigo)
    .map(({ local, ...p }) => p);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));

  if (hasFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'patrimonios', codigo));
    } catch (e) {
      console.error('Erro ao deletar patrimônio no Firebase:', e);
    }
  }
}

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

export async function saveEmprestimoStorage(empData: Omit<Emprestimo, 'id'> & { id?: string }): Promise<Emprestimo> {
  const id = empData.id || `emp-${Date.now()}`;
  const cleanEmp = { ...empData, id };
  delete cleanEmp.patrimonio;

  const emprestimos = getEmprestimosStorage().map(({ patrimonio, ...e }) => e);
  const idx = emprestimos.findIndex((e) => e.id === id);
  if (idx >= 0) emprestimos[idx] = cleanEmp;
  else emprestimos.push(cleanEmp);

  // Atualizar status do patrimônio correspondente
  const patrimonios = getPatrimoniosStorage();
  const pat = patrimonios.find((p) => p.codigo === cleanEmp.patrimonioCodigo);
  if (pat) {
    pat.status = cleanEmp.status === 'ATIVO' ? 'EMPRESTADO' : 'EM_USO';
    await savePatrimonioStorage(pat);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.EMPRESTIMOS, JSON.stringify(emprestimos));

  if (hasFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'emprestimos', id), cleanEmp);
    } catch (e) {
      console.error('Erro ao salvar empréstimo no Firebase:', e);
    }
  }

  return cleanEmp;
}

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

export async function saveManutencaoStorage(matsData: Omit<Manutencao, 'id'> & { id?: string }): Promise<Manutencao> {
  const id = matsData.id || `man-${Date.now()}`;
  const cleanMan = { ...matsData, id };
  delete cleanMan.patrimonio;

  const manutencoes = getManutencoesStorage().map(({ patrimonio, ...m }) => m);
  const idx = manutencoes.findIndex((m) => m.id === id);
  if (idx >= 0) manutencoes[idx] = cleanMan;
  else manutencoes.push(cleanMan);

  const patrimonios = getPatrimoniosStorage();
  const pat = patrimonios.find((p) => p.codigo === cleanMan.patrimonioCodigo);
  if (pat) {
    pat.status = cleanMan.status === 'CONCLUIDO' ? 'EM_USO' : 'EM_MANUTENCAO';
    await savePatrimonioStorage(pat);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(manutencoes));

  if (hasFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'manutencoes', id), cleanMan);
    } catch (e) {
      console.error('Erro ao salvar manutenção no Firebase:', e);
    }
  }

  return cleanMan;
}
