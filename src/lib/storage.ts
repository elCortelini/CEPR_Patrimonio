import { rtdb } from './firebase';
import { ref, onValue, set, remove, push } from 'firebase/database';

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

export interface UsuarioSistema {
  uid: string;
  email: string;
  nome: string;
  fotoUrl?: string | null;
  role: 'ADMIN' | 'USUARIO';
  ultimoAcesso: string;
}

export interface LogMovimentacao {
  id: string;
  dataHora: string;
  usuarioNome: string;
  usuarioEmail: string;
  usuarioFoto?: string | null;
  acao: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'BAIXA' | 'EMPRESTIMO' | 'MANUTENCAO' | 'DEVOLUCAO';
  entidade: 'PATRIMONIO' | 'LOCAL' | 'EMPRESTIMO' | 'MANUTENCAO' | 'USUARIO';
  detalhes: string;
}

const STORAGE_KEYS = {
  LOCAIS: 'cepr_locais_v1',
  PATRIMONIOS: 'cepr_patrimonios_v1',
  EMPRESTIMOS: 'cepr_emprestimos_v1',
  MANUTENCOES: 'cepr_manutencoes_v1',
  USUARIO_ATUAL: 'cepr_user_current_v1',
};

// Dados Iniciais
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

// ---------------- GESTÃO DE USUÁRIO LOGADO & PERMISSÕES ----------------

export function setUsuarioAtual(user: UsuarioSistema | null) {
  if (isBrowser()) {
    if (user) localStorage.setItem(STORAGE_KEYS.USUARIO_ATUAL, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USUARIO_ATUAL);
  }
}

export function getUsuarioAtual(): UsuarioSistema | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(STORAGE_KEYS.USUARIO_ATUAL);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function subscribeUsuarios(callback: (usuarios: UsuarioSistema[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const usersRef = ref(rtdb, 'usuarios');
    return onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
      } else {
        const list: UsuarioSistema[] = Object.values(val) as UsuarioSistema[];
        callback(list);
      }
    });
  } catch (e) {
    console.error('Erro ao ler usuários:', e);
    return () => {};
  }
}

export async function registrarOuAtualizarUsuario(user: {
  uid: string;
  email: string;
  nome: string;
  fotoUrl?: string | null;
}): Promise<UsuarioSistema> {
  const sanitizeKey = (str: string) => str.replace(/[.#$[\]]/g, '_');
  const userRef = ref(rtdb, `usuarios/${sanitizeKey(user.uid)}`);

  return new Promise((resolve) => {
    onValue(
      userRef,
      async (snapshot) => {
        const existing = snapshot.val();
        let role: 'ADMIN' | 'USUARIO' = 'USUARIO';

        if (existing && existing.role) {
          role = existing.role;
        } else {
          // O primeiro usuário a se registrar torna-se ADMIN automaticamente
          role = 'ADMIN';
        }

        const usuarioCompleto: UsuarioSistema = {
          uid: user.uid,
          email: user.email,
          nome: user.nome,
          fotoUrl: user.fotoUrl || null,
          role,
          ultimoAcesso: new Date().toISOString(),
        };

        set(userRef, usuarioCompleto);
        setUsuarioAtual(usuarioCompleto);
        resolve(usuarioCompleto);
      },
      { onlyOnce: true }
    );
  });
}

export async function alterarRoleUsuario(uid: string, novaRole: 'ADMIN' | 'USUARIO', adminExecutando: UsuarioSistema): Promise<void> {
  const sanitizeKey = (str: string) => str.replace(/[.#$[\]]/g, '_');
  const userRef = ref(rtdb, `usuarios/${sanitizeKey(uid)}/role`);
  await set(userRef, novaRole);

  await registrarLogMovimentacao({
    usuarioNome: adminExecutando.nome,
    usuarioEmail: adminExecutando.email,
    usuarioFoto: adminExecutando.fotoUrl,
    acao: 'EDITAR',
    entidade: 'USUARIO',
    detalhes: `Alterou a permissão do usuário UID ${uid} para ${novaRole}`,
  });
}

// ---------------- LOG DE AUDITORIA (MOVIMENTAÇÕES) ----------------

export function subscribeLogs(callback: (logs: LogMovimentacao[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const logsRef = ref(rtdb, 'logs');
    return onValue(logsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
      } else {
        const rawList = Object.values(val) as LogMovimentacao[];
        const list = rawList.reverse();
        callback(list);
      }
    });
  } catch (e) {
    console.error('Erro ao ler logs:', e);
    callback([]);
    return () => {};
  }
}

export async function registrarLogMovimentacao(logData: {
  usuarioNome: string;
  usuarioEmail: string;
  usuarioFoto?: string | null;
  acao: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'BAIXA' | 'EMPRESTIMO' | 'MANUTENCAO' | 'DEVOLUCAO';
  entidade: 'PATRIMONIO' | 'LOCAL' | 'EMPRESTIMO' | 'MANUTENCAO' | 'USUARIO';
  detalhes: string;
}) {
  try {
    const logsRef = ref(rtdb, 'logs');
    const newLogRef = push(logsRef);
    const logCompleto: LogMovimentacao = {
      id: newLogRef.key || `log-${Date.now()}`,
      dataHora: new Date().toISOString(),
      ...logData,
    };
    await set(newLogRef, logCompleto);
  } catch (e) {
    console.error('Erro ao gravar log de auditoria:', e);
  }
}

// ---------------- LISTENERS DE TEMPO REAL (FIREBASE REALTIME DATABASE) ----------------

export function subscribeLocais(callback: (locais: Local[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const locaisRef = ref(rtdb, 'locais');
    return onValue(
      locaisRef,
      (snapshot) => {
        const val = snapshot.val();
        if (!val) {
          const initialMap: Record<string, Local> = {};
          LOCAIS_INICIAIS.forEach((l) => (initialMap[l.id] = l));
          set(ref(rtdb, 'locais'), initialMap);
          callback(LOCAIS_INICIAIS);
        } else {
          const list: Local[] = Object.values(val) as Local[];
          localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(list));
          callback(list);
        }
      },
      (error) => {
        console.error('Erro ao ler locais:', error);
        callback(getLocaisStorage());
      }
    );
  } catch (e) {
    console.error('Erro de conexão Firebase:', e);
    callback(getLocaisStorage());
    return () => {};
  }
}

export function subscribePatrimonios(callback: (patrimonios: Patrimonio[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const patsRef = ref(rtdb, 'patrimonios');
    return onValue(
      patsRef,
      (snapshot) => {
        const val = snapshot.val();
        const locais = getLocaisStorage();

        if (!val) {
          const initialMap: Record<string, Patrimonio> = {};
          PATRIMONIOS_INICIAIS.forEach((p) => (initialMap[p.codigo] = p));
          set(ref(rtdb, 'patrimonios'), initialMap);
          const result = PATRIMONIOS_INICIAIS.map((p) => ({
            ...p,
            local: locais.find((l) => l.id === p.localId) || { id: p.localId, nome: 'Local Desconhecido' },
          }));
          callback(result);
        } else {
          const rawList: Patrimonio[] = Object.values(val) as Patrimonio[];
          const list = rawList.map((p) => ({
            ...p,
            local: locais.find((l) => l.id === p.localId) || { id: p.localId, nome: 'Local Desconhecido' },
          }));
          localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(rawList));
          callback(list);
        }
      },
      (error) => {
        console.error('Erro ao ler patrimônios:', error);
        callback(getPatrimoniosStorage());
      }
    );
  } catch (e) {
    console.error('Erro de conexão Firebase:', e);
    callback(getPatrimoniosStorage());
    return () => {};
  }
}

export function subscribeEmprestimos(callback: (emprestimos: Emprestimo[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const empRef = ref(rtdb, 'emprestimos');
    return onValue(
      empRef,
      (snapshot) => {
        const val = snapshot.val();
        const patrimonios = getPatrimoniosStorage();

        if (!val) {
          callback([]);
        } else {
          const rawList: Emprestimo[] = Object.values(val) as Emprestimo[];
          const list = rawList.map((emp) => ({
            ...emp,
            patrimonio: patrimonios.find((p) => p.codigo === emp.patrimonioCodigo),
          }));
          localStorage.setItem(STORAGE_KEYS.EMPRESTIMOS, JSON.stringify(rawList));
          callback(list);
        }
      },
      (error) => {
        console.error('Erro ao ler empréstimos:', error);
        callback(getEmprestimosStorage());
      }
    );
  } catch (e) {
    console.error('Erro de conexão Firebase:', e);
    callback(getEmprestimosStorage());
    return () => {};
  }
}

export function subscribeManutencoes(callback: (manutencoes: Manutencao[]) => void) {
  if (!isBrowser()) return () => {};

  try {
    const manRef = ref(rtdb, 'manutencoes');
    return onValue(
      manRef,
      (snapshot) => {
        const val = snapshot.val();
        const patrimonios = getPatrimoniosStorage();

        if (!val) {
          callback([]);
        } else {
          const rawList: Manutencao[] = Object.values(val) as Manutencao[];
          const list = rawList.map((m) => ({
            ...m,
            patrimonio: patrimonios.find((p) => p.codigo === m.patrimonioCodigo),
          }));
          localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(rawList));
          callback(list);
        }
      },
      (error) => {
        console.error('Erro ao ler manutenções:', error);
        callback(getManutencoesStorage());
      }
    );
  } catch (e) {
    console.error('Erro de conexão Firebase:', e);
    callback(getManutencoesStorage());
    return () => {};
  }
}

// ---------------- OPERAÇÕES DE ESCRITA COM REGISTRO DE AUDITORIA ----------------

export function getLocaisStorage(): Local[] {
  if (!isBrowser()) return LOCAIS_INICIAIS;
  const data = localStorage.getItem(STORAGE_KEYS.LOCAIS);
  if (!data) return LOCAIS_INICIAIS;
  try {
    return JSON.parse(data);
  } catch {
    return LOCAIS_INICIAIS;
  }
}

export async function saveLocalStorage(
  local: Omit<Local, 'id'> & { id?: string },
  usuarioLogado?: UsuarioSistema | null
): Promise<Local> {
  const isEdit = Boolean(local.id);
  const id = local.id || `loc-${Date.now()}`;
  const novoLocal: Local = { ...local, id };

  const locais = getLocaisStorage();
  const idx = locais.findIndex((l) => l.id === id);
  if (idx >= 0) locais[idx] = novoLocal;
  else locais.push(novoLocal);

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(locais));

  try {
    await set(ref(rtdb, `locais/${id}`), novoLocal);

    if (usuarioLogado) {
      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: isEdit ? 'EDITAR' : 'CRIAR',
        entidade: 'LOCAL',
        detalhes: `${isEdit ? 'Atualizou' : 'Cadastrou'} a sala/local "${novoLocal.nome}" (${novoLocal.bloco || 'Sem Bloco'})`,
      });
    }
  } catch (e) {
    console.error('Erro ao salvar local:', e);
  }

  return novoLocal;
}

export async function deleteLocalStorage(id: string, usuarioLogado?: UsuarioSistema | null): Promise<void> {
  const locais = getLocaisStorage();
  const localAlvo = locais.find((l) => l.id === id);
  const novocLocais = locais.filter((l) => l.id !== id);
  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.LOCAIS, JSON.stringify(novocLocais));

  try {
    await remove(ref(rtdb, `locais/${id}`));

    if (usuarioLogado && localAlvo) {
      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: 'EXCLUIR',
        entidade: 'LOCAL',
        detalhes: `Excluiu a sala/local "${localAlvo.nome}"`,
      });
    }
  } catch (e) {
    console.error('Erro ao deletar local:', e);
  }
}

export function getPatrimoniosStorage(): Patrimonio[] {
  if (!isBrowser()) return PATRIMONIOS_INICIAIS;
  const data = localStorage.getItem(STORAGE_KEYS.PATRIMONIOS);
  const locais = getLocaisStorage();

  let patrimonios: Patrimonio[] = [];
  if (!data) {
    patrimonios = PATRIMONIOS_INICIAIS;
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

export async function savePatrimonioStorage(
  patrimonio: Patrimonio,
  usuarioLogado?: UsuarioSistema | null
): Promise<Patrimonio> {
  const cleanPatrimonio = { ...patrimonio };
  delete cleanPatrimonio.local;

  const patrimonios = getPatrimoniosStorage().map(({ local, ...p }) => p);
  const index = patrimonios.findIndex((p) => p.codigo === patrimonio.codigo);
  const isEdit = index >= 0;

  if (isEdit) {
    patrimonios[index] = cleanPatrimonio;
  } else {
    patrimonios.push(cleanPatrimonio);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(patrimonios));

  try {
    await set(ref(rtdb, `patrimonios/${patrimonio.codigo}`), cleanPatrimonio);

    if (usuarioLogado) {
      let acaoLog: 'CRIAR' | 'EDITAR' | 'BAIXA' = isEdit ? 'EDITAR' : 'CRIAR';
      let acaoTexto = isEdit ? 'Atualizou' : 'Cadastrou';

      if (patrimonio.baixado) {
        acaoLog = 'BAIXA';
        acaoTexto = 'Efetuou a baixa do';
      }

      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: acaoLog,
        entidade: 'PATRIMONIO',
        detalhes: `${acaoTexto} patrimônio #${patrimonio.codigo} (${patrimonio.descricao})`,
      });
    }
  } catch (e) {
    console.error('Erro ao salvar patrimônio:', e);
  }

  return patrimonio;
}

export async function deletePatrimonioStorage(codigo: string, usuarioLogado?: UsuarioSistema | null): Promise<void> {
  const patrimonios = getPatrimoniosStorage();
  const alvo = patrimonios.find((p) => p.codigo === codigo);
  const listaLimpa = patrimonios.filter((p) => p.codigo !== codigo).map(({ local, ...p }) => p);

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.PATRIMONIOS, JSON.stringify(listaLimpa));

  try {
    await remove(ref(rtdb, `patrimonios/${codigo}`));

    if (usuarioLogado && alvo) {
      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: 'EXCLUIR',
        entidade: 'PATRIMONIO',
        detalhes: `Excluiu o patrimônio #${codigo} (${alvo.descricao})`,
      });
    }
  } catch (e) {
    console.error('Erro ao deletar patrimônio:', e);
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

export async function saveEmprestimoStorage(
  empData: Omit<Emprestimo, 'id'> & { id?: string },
  usuarioLogado?: UsuarioSistema | null
): Promise<Emprestimo> {
  const id = empData.id || `emp-${Date.now()}`;
  const cleanEmp = { ...empData, id };
  delete cleanEmp.patrimonio;

  const emprestimos = getEmprestimosStorage().map(({ patrimonio, ...e }) => e);
  const idx = emprestimos.findIndex((e) => e.id === id);
  if (idx >= 0) emprestimos[idx] = cleanEmp;
  else emprestimos.push(cleanEmp);

  const patrimonios = getPatrimoniosStorage();
  const pat = patrimonios.find((p) => p.codigo === cleanEmp.patrimonioCodigo);
  if (pat) {
    pat.status = cleanEmp.status === 'ATIVO' ? 'EMPRESTADO' : 'EM_USO';
    await savePatrimonioStorage(pat);
  }

  if (isBrowser()) localStorage.setItem(STORAGE_KEYS.EMPRESTIMOS, JSON.stringify(emprestimos));

  try {
    await set(ref(rtdb, `emprestimos/${id}`), cleanEmp);

    if (usuarioLogado) {
      const isDevolucao = cleanEmp.status === 'DEVOLVIDO';
      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: isDevolucao ? 'DEVOLUCAO' : 'EMPRESTIMO',
        entidade: 'EMPRESTIMO',
        detalhes: `${isDevolucao ? 'Registrou devolução do' : 'Registrou empréstimo do'} patrimônio #${cleanEmp.patrimonioCodigo} para ${cleanEmp.solicitante}`,
      });
    }
  } catch (e) {
    console.error('Erro ao salvar empréstimo:', e);
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

export async function saveManutencaoStorage(
  matsData: Omit<Manutencao, 'id'> & { id?: string },
  usuarioLogado?: UsuarioSistema | null
): Promise<Manutencao> {
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

  try {
    await set(ref(rtdb, `manutencoes/${id}`), cleanMan);

    if (usuarioLogado) {
      const isConcluido = cleanMan.status === 'CONCLUIDO';
      await registrarLogMovimentacao({
        usuarioNome: usuarioLogado.nome,
        usuarioEmail: usuarioLogado.email,
        usuarioFoto: usuarioLogado.fotoUrl,
        acao: 'MANUTENCAO',
        entidade: 'MANUTENCAO',
        detalhes: `${isConcluido ? 'Concluiu a manutenção do' : 'Abriu chamado de manutenção para o'} patrimônio #${cleanMan.patrimonioCodigo}`,
      });
    }
  } catch (e) {
    console.error('Erro ao salvar manutenção:', e);
  }

  return cleanMan;
}
