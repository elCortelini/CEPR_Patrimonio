'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Plus, CheckCircle, X, CheckCircle2 } from 'lucide-react';
import { getEmprestimosStorage, saveEmprestimoStorage, Emprestimo } from '@/lib/storage';

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDevolucaoModalOpen, setIsDevolucaoModalOpen] = useState(false);
  const [selectedEmprestimo, setSelectedEmprestimo] = useState<Emprestimo | null>(null);

  const [formData, setFormData] = useState({
    patrimonioCodigo: '',
    solicitante: '',
    cargo: 'Professor',
    previsaoDevolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacao: '',
  });

  const [devolucaoObs, setDevolucaoObs] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  async function fetchEmprestimos() {
    setLoading(true);
    try {
      const res = await fetch('/api/emprestimos');
      if (res.ok) {
        const json = await res.json();
        setEmprestimos(json);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    const list = getEmprestimosStorage();
    setEmprestimos(list);
    setLoading(false);
  }

  function abrirModalNovo() {
    setFormData({
      patrimonioCodigo: '',
      solicitante: '',
      cargo: 'Professor',
      previsaoDevolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observacao: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalDevolucao(emp: Emprestimo) {
    setSelectedEmprestimo(emp);
    setDevolucaoObs('Devolvido em perfeitas condições');
    setErrorMsg('');
    setIsDevolucaoModalOpen(true);
  }

  async function handleSubmitNovo(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.patrimonioCodigo || !formData.solicitante || !formData.previsaoDevolucao) {
      setErrorMsg('Preencha o código do patrimônio, nome do solicitante e previsão de devolução.');
      return;
    }

    const payload = {
      patrimonioCodigo: formData.patrimonioCodigo.padStart(6, '0'),
      solicitante: formData.solicitante.trim(),
      cargo: formData.cargo ? formData.cargo.trim() : null,
      dataRetirada: new Date().toISOString().split('T')[0],
      previsaoDevolucao: formData.previsaoDevolucao,
      status: 'ATIVO',
      observacao: formData.observacao ? formData.observacao.trim() : null,
    };

    try {
      const res = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(`Empréstimo do patrimônio #${payload.patrimonioCodigo} registrado com sucesso!`);
        setIsModalOpen(false);
        fetchEmprestimos();
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
    } catch {
      // Fallback
    }

    saveEmprestimoStorage(payload);
    setSuccessMsg(`Empréstimo do patrimônio #${payload.patrimonioCodigo} registrado com sucesso!`);
    setIsModalOpen(false);
    fetchEmprestimos();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleConfirmarDevolucao(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmprestimo) return;

    const payload = {
      ...selectedEmprestimo,
      status: 'DEVOLVIDO',
      dataDevolucao: new Date().toISOString().split('T')[0],
      observacao: devolucaoObs ? `${selectedEmprestimo.observacao || ''} | Devolução: ${devolucaoObs}` : selectedEmprestimo.observacao,
    };

    try {
      const res = await fetch('/api/emprestimos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEmprestimo.id, observacaoDevolucao: devolucaoObs }),
      });

      if (res.ok) {
        setSuccessMsg(`Devolução do patrimônio #${selectedEmprestimo.patrimonioCodigo} concluída.`);
        setIsDevolucaoModalOpen(false);
        fetchEmprestimos();
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
    } catch {
      // Fallback
    }

    saveEmprestimoStorage(payload);
    setSuccessMsg(`Devolução do patrimônio #${selectedEmprestimo.patrimonioCodigo} concluída.`);
    setIsDevolucaoModalOpen(false);
    fetchEmprestimos();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="h-7 w-7 text-amber-400" />
            Controle de Empréstimos Temporários
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro de uso de notebooks, projetores e equipamentos móveis por professores e funcionários.
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Novo Empréstimo
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

      {/* Tabela de Empréstimos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
            Carregando empréstimos...
          </div>
        ) : emprestimos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum empréstimo registrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Patrimônio</th>
                  <th className="py-3.5 px-4">Solicitante (Professor/Staff)</th>
                  <th className="py-3.5 px-4">Retirada</th>
                  <th className="py-3.5 px-4">Devolução Prevista</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {emprestimos.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-400">#{emp.patrimonioCodigo}</div>
                      <div className="text-xs text-white font-medium truncate max-w-xs">{emp.patrimonio?.descricao || 'Equipamento'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{emp.solicitante}</div>
                      {emp.cargo && <div className="text-xs text-slate-400">{emp.cargo}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatarDataBR(emp.dataRetirada)}</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-300">
                      {formatarDataBR(emp.previsaoDevolucao)}
                    </td>
                    <td className="py-3.5 px-4">
                      {emp.status === 'ATIVO' ? (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          Em Uso
                        </span>
                      ) : (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          Devolvido
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {emp.status === 'ATIVO' && (
                        <button
                          onClick={() => abrirModalDevolucao(emp)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Registrar Devolução
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

      {/* MODAL: Novo Empréstimo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="font-bold text-lg text-white">Registrar Empréstimo de Equipamento</h3>
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
                  placeholder="Ex: 000102"
                  value={formData.patrimonioCodigo}
                  onChange={(e) => setFormData({ ...formData, patrimonioCodigo: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome do Solicitante (Professor/Funcionário) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profª. Maria Silva"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Cargo / Disciplina
                </label>
                <input
                  type="text"
                  placeholder="Ex: Professor de História, Coordenador de TI..."
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Previsão de Devolução *
                </label>
                <input
                  type="date"
                  required
                  value={formData.previsaoDevolucao}
                  onChange={(e) => setFormData({ ...formData, previsaoDevolucao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
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
                  className="px-4 py-2 rounded-lg text-sm bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-sm"
                >
                  Registrar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Devolução */}
      {isDevolucaoModalOpen && selectedEmprestimo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-emerald-950/40">
              <h3 className="font-bold text-lg text-emerald-200">
                Confirmar Devolução (#{selectedEmprestimo.patrimonioCodigo})
              </h3>
              <button onClick={() => setIsDevolucaoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarDevolucao} className="p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Solicitante: <strong className="text-white">{selectedEmprestimo.solicitante}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Observações de Devolução
                </label>
                <input
                  type="text"
                  value={devolucaoObs}
                  onChange={(e) => setDevolucaoObs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDevolucaoModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  Devolvido com Sucesso
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
