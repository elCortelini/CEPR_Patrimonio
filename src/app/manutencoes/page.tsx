'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, Plus, CheckCircle, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface ManutencaoItem {
  id: string;
  patrimonioCodigo: string;
  patrimonio: {
    codigo: string;
    descricao: string;
    local: { nome: string };
  };
  solicitante: string;
  descricaoProblema: string;
  dataAbertura: string;
  status: string; // PENDENTE, EM_MANUTENCAO, CONCLUIDO
  custo?: number | null;
  solucao?: string | null;
}

export default function ManutencoesPage() {
  const [manutencoes, setManutencoes] = useState<ManutencaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConcluirModalOpen, setIsConcluirModalOpen] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoItem | null>(null);

  const [formData, setFormData] = useState({
    patrimonioCodigo: '',
    solicitante: '',
    descricaoProblema: '',
  });

  const [concluirData, setConcluirData] = useState({
    custo: '0',
    solucao: 'Equipamento consertado e testado',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchManutencoes();
  }, []);

  async function fetchManutencoes() {
    setLoading(true);
    try {
      const res = await fetch('/api/manutencoes');
      if (res.ok) {
        const json = await res.json();
        setManutencoes(json);
      }
    } catch (err) {
      console.error('Erro ao buscar manutenções:', err);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalNovo() {
    setFormData({ patrimonioCodigo: '', solicitante: '', descricaoProblema: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalConcluir(m: ManutencaoItem) {
    setSelectedManutencao(m);
    setConcluirData({ custo: '0', solucao: 'Equipamento consertado e testado' });
    setErrorMsg('');
    setIsConcluirModalOpen(true);
  }

  async function handleSubmitNovo(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.patrimonioCodigo || !formData.solicitante || !formData.descricaoProblema) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch('/api/manutencoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao abrir chamado de manutenção.');
        return;
      }

      setSuccessMsg(`Chamado de manutenção aberto para o patrimônio #${data.patrimonioCodigo}!`);
      setIsModalOpen(false);
      fetchManutencoes();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Erro de conexão.');
    }
  }

  async function handleConfirmarConclusao(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedManutencao) return;

    try {
      const res = await fetch('/api/manutencoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedManutencao.id,
          status: 'CONCLUIDO',
          custo: concluirData.custo,
          solucao: concluirData.solucao,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Erro ao concluir manutenção.');
        return;
      }

      setSuccessMsg(`Manutenção do patrimônio #${selectedManutencao.patrimonioCodigo} concluída.`);
      setIsConcluirModalOpen(false);
      fetchManutencoes();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Erro ao concluir manutenção.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="h-7 w-7 text-rose-400" />
            Manutenção e Ocorrências Patrimoniais
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro e acompanhamento de reparos e chamados de defeitos em equipamentos da escola.
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Abrir Chamado de Manutenção
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabela de Manutenções */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-3"></div>
            Carregando manutenções...
          </div>
        ) : manutencoes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhuma manutenção registrada até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Patrimônio</th>
                  <th className="py-3.5 px-4">Defeito Relatado</th>
                  <th className="py-3.5 px-4">Relatado Por</th>
                  <th className="py-3.5 px-4">Data Abertura</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {manutencoes.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-400">#{m.patrimonioCodigo}</div>
                      <div className="text-xs text-white font-medium truncate max-w-xs">{m.patrimonio?.descricao}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs">
                      {m.descricaoProblema}
                      {m.solucao && (
                        <div className="text-xs text-emerald-400 mt-1">
                          Solução: {m.solucao} {m.custo ? `(Custo: R$ ${m.custo.toFixed(2)})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{m.solicitante}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatarDataBR(m.dataAbertura)}</td>
                    <td className="py-3.5 px-4">
                      {m.status === 'CONCLUIDO' ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          Concluído
                        </span>
                      ) : (
                        <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          Em Manutenção
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {m.status !== 'CONCLUIDO' && (
                        <button
                          onClick={() => abrirModalConcluir(m)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Concluir Reparacão
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Abrir Manutenção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="font-bold text-lg text-white">Abrir Chamado de Manutenção</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNovo} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Código do Patrimônio (6 dígitos) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Ex: 000106"
                  value={formData.patrimonioCodigo}
                  onChange={(e) => setFormData({ ...formData, patrimonioCodigo: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome de Quem Relatou o Defeito *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Carlos / TI Escola"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição do Defeito ou Ocorrência *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Ar-condicionado não resfria e está fazendo barulho na ventoinha..."
                  value={formData.descricaoProblema}
                  onChange={(e) => setFormData({ ...formData, descricaoProblema: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Concluir Manutenção */}
      {isConcluirModalOpen && selectedManutencao && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-emerald-950/40">
              <h3 className="font-bold text-lg text-emerald-200">
                Concluir Manutenção (#{selectedManutencao.patrimonioCodigo})
              </h3>
              <button onClick={() => setIsConcluirModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarConclusao} className="p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Equipamento: <strong className="text-white">{selectedManutencao.patrimonio?.descricao}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Solução / Laudo Técnico *
                </label>
                <input
                  type="text"
                  required
                  value={concluirData.solucao}
                  onChange={(e) => setConcluirData({ ...concluirData, solucao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Custo do Reparo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={concluirData.custo}
                  onChange={(e) => setConcluirData({ ...concluirData, custo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConcluirModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  Concluir e Retornar ao Uso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatarDataBR(dataIso?: string | null): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}
