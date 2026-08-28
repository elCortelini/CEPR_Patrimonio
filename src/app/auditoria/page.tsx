'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  History,
  Search,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Package,
  MapPin,
  Wrench,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import {
  subscribeLogs,
  subscribeUsuarios,
  alterarRoleUsuario,
  getUsuarioAtual,
  LogMovimentacao,
  UsuarioSistema,
} from '@/lib/storage';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogMovimentacao[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [usuarioAtual, setUsuarioAtualState] = useState<UsuarioSistema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'USUARIOS'>('LOGS');

  // Filtros de Log
  const [searchLog, setSearchLog] = useState('');
  const [filterAcao, setFilterAcao] = useState('TODAS');

  useEffect(() => {
    const curr = getUsuarioAtual();
    setUsuarioAtualState(curr);

    const unsubLogs = subscribeLogs((list) => {
      setLogs(list);
      setLoading(false);
    });

    const unsubUsers = subscribeUsuarios((list) => {
      setUsuarios(list);
      setLoading(false);
    });

    return () => {
      unsubLogs();
      unsubUsers();
    };
  }, []);

  async function handleToggleRole(user: UsuarioSistema) {
    if (!usuarioAtual || usuarioAtual.role !== 'ADMIN') {
      alert('Somente Administradores podem alterar permissões.');
      return;
    }

    const novaRole = user.role === 'ADMIN' ? 'USUARIO' : 'ADMIN';
    if (confirm(`Deseja alterar a permissão do usuário "${user.nome}" para ${novaRole}?`)) {
      await alterarRoleUsuario(user.uid, novaRole, usuarioAtual);
    }
  }

  const logsFiltrados = logs.filter((log) => {
    const matchSearch =
      log.usuarioNome.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.usuarioEmail.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(searchLog.toLowerCase());

    const matchAcao = filterAcao === 'TODAS' || log.acao === filterAcao;

    return matchSearch && matchAcao;
  });

  if (usuarioAtual && usuarioAtual.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center text-slate-400">
        <ShieldCheck className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
        <p className="text-sm text-slate-500 mt-1">
          Esta página de Auditoria e Controle de Acessos é restrita aos Administradores do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
            Auditoria & Controle de Acessos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro de todas as movimentações de patrimônio e gestão de permissões dos usuários.
          </p>
        </div>

        {/* Abas */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'LOGS'
                ? 'bg-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            Histórico de Movimentações ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('USUARIOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'USUARIOS'
                ? 'bg-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Gestão de Usuários ({usuarios.length})
          </button>
        </div>
      </div>

      {/* CONTEÚDO DA ABA: HISTÓRICO DE LOGS DE AUDITORIA */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome do usuário, e-mail ou detalhes da ação..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <select
                value={filterAcao}
                onChange={(e) => setFilterAcao(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="TODAS">Todas as Ações</option>
                <option value="CRIAR">Criações</option>
                <option value="EDITAR">Edições</option>
                <option value="EXCLUIR">Exclusões</option>
                <option value="BAIXA">Baixas Patrimoniais</option>
                <option value="EMPRESTIMO">Empréstimos</option>
                <option value="DEVOLUCAO">Devoluções</option>
                <option value="MANUTENCAO">Manutenções</option>
              </select>
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
                Carregando histórico de auditoria...
              </div>
            ) : logsFiltrados.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Nenhuma movimentação registrada no histórico.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Data e Hora</th>
                      <th className="py-3.5 px-4">Usuário Responsável</th>
                      <th className="py-3.5 px-4">Tipo de Ação</th>
                      <th className="py-3.5 px-4">Detalhamento da Movimentação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logsFiltrados.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                          {formatarDataHora(log.dataHora)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            {log.usuarioFoto ? (
                              <img
                                src={log.usuarioFoto}
                                alt={log.usuarioNome}
                                className="w-7 h-7 rounded-full border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {log.usuarioNome.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-white text-xs block">{log.usuarioNome}</span>
                              <span className="text-[10px] text-slate-400 block">{log.usuarioEmail}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <AcaoBadge acao={log.acao} />
                        </td>

                        <td className="py-3.5 px-4 text-slate-200 font-medium text-xs max-w-md">
                          {log.detalhes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: GESTÃO DE USUÁRIOS E PERMISSÕES */}
      {activeTab === 'USUARIOS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              Usuários Autenticados com Google
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Como <strong>Administrador</strong>, você pode alterar a função dos usuários entre <strong>ADMIN</strong> (acesso total e controle de usuários) e <strong>USUÁRIO</strong> (lançamentos, edições e exclusões normais).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {usuarios.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Nenhum usuário registrado até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Usuário</th>
                      <th className="py-3.5 px-4">E-mail do Google</th>
                      <th className="py-3.5 px-4">Último Acesso</th>
                      <th className="py-3.5 px-4">Permissão Atual</th>
                      <th className="py-3.5 px-4 text-right">Ação do Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usuarios.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            {u.fotoUrl ? (
                              <img src={u.fotoUrl} alt={u.nome} className="w-9 h-9 rounded-full border border-slate-700 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {u.nome.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-white">{u.nome}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">{u.email}</td>

                        <td className="py-3.5 px-4 text-slate-400 text-xs">
                          {formatarDataHora(u.ultimoAcesso)}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.role === 'ADMIN' ? (
                            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              ADMINISTRADOR
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
                              Usuário / Docente
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleRole(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                              u.role === 'ADMIN'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
                            }`}
                          >
                            {u.role === 'ADMIN' ? (
                              <>
                                <UserX className="h-3.5 w-3.5 text-rose-400" />
                                Rebaixar para Usuário
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-slate-950" />
                                Promover a ADMIN
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AcaoBadge({ acao }: { acao: string }) {
  switch (acao) {
    case 'CRIAR':
      return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Criação</span>;
    case 'EDITAR':
      return <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Edição</span>;
    case 'EXCLUIR':
      return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Exclusão</span>;
    case 'BAIXA':
      return <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Baixa Patrimonial</span>;
    case 'EMPRESTIMO':
      return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Empréstimo</span>;
    case 'DEVOLUCAO':
      return <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Devolução</span>;
    case 'MANUTENCAO':
      return <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Manutenção</span>;
    default:
      return <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-full">{acao}</span>;
  }
}

function formatarDataHora(isoStr: string): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR');
  } catch {
    return isoStr;
  }
}
