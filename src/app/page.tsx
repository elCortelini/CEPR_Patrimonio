'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Clock,
  Wrench,
  MapPin,
  PlusCircle,
  FileText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  subscribePatrimonios,
  subscribeLocais,
  subscribeEmprestimos,
  Patrimonio,
  Local,
  Emprestimo,
} from '@/lib/storage';

export default function DashboardPage() {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubLocais = subscribeLocais((locs) => setLocais(locs));
    const unsubEmprestimos = subscribeEmprestimos((emps) => setEmprestimos(emps));
    const unsubPatrimonios = subscribePatrimonios((pats) => {
      setPatrimonios(pats);
      setLoading(false);
    });

    return () => {
      unsubLocais();
      unsubEmprestimos();
      unsubPatrimonios();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const emUso = patrimonios.filter((p) => p.status === 'EM_USO' && !p.baixado).length;
  const emprestados = patrimonios.filter((p) => p.status === 'EMPRESTADO' && !p.baixado).length;
  const emManutencao = patrimonios.filter((p) => p.status === 'EM_MANUTENCAO' && !p.baixado).length;
  const baixados = patrimonios.filter((p) => p.baixado).length;

  const emprestimosAtivos = emprestimos.filter((e) => e.status === 'ATIVO');

  const locaisComPatrimonio = locais.map((loc) => ({
    ...loc,
    _count: {
      patrimonios: patrimonios.filter((p) => p.localId === loc.id).length,
    },
  })).sort((a, b) => b._count.patrimonios - a._count.patrimonios).slice(0, 6);

  const ultimosPatrimonios = [...patrimonios].slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Painel Geral de Patrimônio
          </h1>
          <p className="text-slate-400 mt-1">
            Centro Educacional Pedro Rizzi — Resumo gerencial e controle em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/patrimonios?novo=true"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Patrimônio (6 Dígitos)</span>
          </Link>
          <Link
            href="/relatorios"
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-700 transition-all"
          >
            <FileText className="h-4 w-4" />
            <span>Emitir Relatórios</span>
          </Link>
        </div>
      </div>

      {/* Cartões de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total de Bens</span>
            <div className="bg-blue-900/50 text-blue-400 p-2.5 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{patrimonios.length}</p>
          <p className="text-xs text-slate-500 mt-1">Patrimônios cadastrados na escola</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Em Uso nas Salas</span>
            <div className="bg-emerald-900/50 text-emerald-400 p-2.5 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3">{emUso}</p>
          <p className="text-xs text-slate-500 mt-1">Ativos alocados em locais</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Empréstimos Ativos</span>
            <div className="bg-amber-900/50 text-amber-400 p-2.5 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-3">{emprestados}</p>
          <p className="text-xs text-slate-500 mt-1">Uso temporário por docentes/staff</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Em Manutenção</span>
            <div className="bg-rose-900/50 text-rose-400 p-2.5 rounded-lg">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-3">{emManutencao}</p>
          <p className="text-xs text-slate-500 mt-1">Aguardando ou em reparo</p>
        </div>
      </div>

      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Útimos Patrimônios & Empréstimos */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-400" />
                Últimos Patrimônios Cadastrados
              </h2>
              <Link href="/patrimonios" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Código</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Local</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ultimosPatrimonios.map((item) => (
                    <tr key={item.codigo} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{item.codigo}</td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">{item.descricao}</td>
                      <td className="py-3 px-4 text-slate-400">{item.local?.nome || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.origem}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} baixado={item.baixado} />
                      </td>
                    </tr>
                  ))}
                  {ultimosPatrimonios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhum patrimônio cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Empréstimos Ativos em Andamento
              </h2>
              <Link href="/emprestimos" className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Gerenciar Empréstimos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {emprestimosAtivos.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded">
                        #{emp.patrimonioCodigo}
                      </span>
                      <h4 className="font-semibold text-white text-sm">{emp.patrimonio?.descricao}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Retirado por: <strong className="text-slate-200">{emp.solicitante}</strong> {emp.cargo ? `(${emp.cargo})` : ''}
                    </p>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-400 block">Devolução Prevista:</span>
                    <span className="text-sm font-bold text-amber-300">{emp.previsaoDevolucao}</span>
                  </div>
                </div>
              ))}
              {emprestimosAtivos.length === 0 && (
                <p className="text-center py-6 text-slate-500 text-sm">
                  Nenhum equipamento emprestado no momento.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Resumo por Salas */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                Patrimônio por Local
              </h2>
              <Link href="/locais" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Ver todos ({locais.length})
              </Link>
            </div>

            <div className="space-y-3">
              {locaisComPatrimonio.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 text-sm block">{loc.nome}</span>
                    {loc.bloco && <span className="text-xs text-slate-500">{loc.bloco}</span>}
                  </div>
                  <span className="bg-slate-800 text-blue-400 font-bold text-xs px-3 py-1.5 rounded-full border border-slate-700">
                    {loc._count?.patrimonios || 0} itens
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Resumo de Baixas Patrimoniais
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Itens descartados ou inservíveis que saíram do acervo ativo.
            </p>
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400">Total de Bens Baixados</span>
              <span className="text-xl font-extrabold text-purple-400">{baixados}</span>
            </div>
            <Link
              href="/patrimonios?status=BAIXADO"
              className="mt-4 block text-center text-xs font-semibold text-purple-400 hover:underline"
            >
              Consultar Histórico de Baixas →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, baixado }: { status: string; baixado: boolean }) {
  if (baixado || status === 'BAIXADO') {
    return <span className="bg-purple-950 text-purple-300 border border-purple-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Baixado</span>;
  }
  switch (status) {
    case 'EM_USO':
      return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Em Uso</span>;
    case 'EMPRESTADO':
      return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Empréstimo</span>;
    case 'EM_MANUTENCAO':
      return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Manutenção</span>;
    default:
      return <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">{status}</span>;
  }
}
