'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, AlertTriangle, CheckCircle2, X, Trash2, Edit } from 'lucide-react';

interface Local {
  id: string;
  nome: string;
}

interface ConsumivelItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidadeMinima: number;
  unidade: string;
  localId?: string | null;
  local?: Local | null;
}

export default function ConsumiveisPage() {
  const [consumiveis, setConsumiveis] = useState<ConsumivelItem[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Papelaria',
    quantidade: '10',
    quantidadeMinima: '5',
    unidade: 'Unidade',
    localId: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConsumiveis();
    fetchLocais();
  }, []);

  async function fetchConsumiveis() {
    setLoading(true);
    try {
      const res = await fetch('/api/consumiveis');
      if (res.ok) {
        const json = await res.json();
        setConsumiveis(json);
      }
    } catch (err) {
      console.error('Erro ao carregar almoxarifado:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocais() {
    try {
      const res = await fetch('/api/locais');
      if (res.ok) {
        const json = await res.json();
        setLocais(json);
      }
    } catch (err) {
      console.error('Erro ao carregar locais:', err);
    }
  }

  function abrirModalNovo() {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      nome: '',
      categoria: 'Papelaria',
      quantidade: '10',
      quantidadeMinima: '5',
      unidade: 'Unidade',
      localId: locais.length > 0 ? locais[0].id : '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalEditar(item: ConsumivelItem) {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nome: item.nome,
      categoria: item.categoria,
      quantidade: String(item.quantidade),
      quantidadeMinima: String(item.quantidadeMinima),
      unidade: item.unidade,
      localId: item.localId || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  async function handleAjustarEstoque(id: string, delta: number) {
    try {
      const res = await fetch('/api/consumiveis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, deltaQuantidade: delta }),
      });

      if (res.ok) {
        fetchConsumiveis();
      }
    } catch (err) {
      console.error('Erro ao alterar estoque:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nome.trim()) {
      setErrorMsg('Informe o nome do produto.');
      return;
    }

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const payload = isEditMode ? { ...formData, id: selectedId } : formData;

      const res = await fetch('/api/consumiveis', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao salvar item.');
        return;
      }

      setSuccessMsg(isEditMode ? 'Estoque atualizado!' : 'Novo item adicionado ao almoxarifado!');
      setIsModalOpen(false);
      fetchConsumiveis();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Erro ao conectar com o servidor.');
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}" do estoque?`)) return;

    try {
      const res = await fetch(`/api/consumiveis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg(`Item "${nome}" removido.`);
        fetchConsumiveis();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Erro ao excluir item.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Boxes className="h-7 w-7 text-indigo-400" />
            Almoxarifado & Materiais de Consumo
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Controle de papéis, pincéis, produtos de limpeza e insumos com alerta de estoque mínimo.
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Novo Item no Estoque
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

      {/* Tabela de Consumíveis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
            Carregando almoxarifado...
          </div>
        ) : consumiveis.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum item cadastrado no almoxarifado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Item de Consumo</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Local de Armazenamento</th>
                  <th className="py-3.5 px-4 text-center">Quantidade Atual</th>
                  <th className="py-3.5 px-4 text-center">Estoque Mínimo</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {consumiveis.map((item) => {
                  const isCritico = item.quantidade <= item.quantidadeMinima;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {item.nome}
                          {isCritico && (
                            <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                              <AlertTriangle className="h-3 w-3" /> Baixo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{item.local?.nome || 'Almoxarifado Geral'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                          <button
                            onClick={() => handleAjustarEstoque(item.id, -1)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            title="Dar saída (Reduzir 1)"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className={`font-mono font-bold ${isCritico ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.quantidade} <span className="text-xs font-normal text-slate-400">{item.unidade}</span>
                          </span>
                          <button
                            onClick={() => handleAjustarEstoque(item.id, 1)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            title="Entrada de estoque (Adicionar 1)"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {item.quantidadeMinima} {item.unidade}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                          title="Editar item"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(item.id, item.nome)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Excluir item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Adicionar / Editar Item de Consumo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="font-bold text-lg text-white">
                {isEditMode ? 'Editar Item de Consumo' : 'Novo Item no Almoxarifado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Papel A4 Chamex 75g (Caixa c/ 10)"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Papelaria">Papelaria</option>
                    <option value="Didático">Didático</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="TI">TI / Informática</option>
                    <option value="Manutenção">Manutenção Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Unidade">Unidade</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Pacote">Pacote</option>
                    <option value="Galão">Galão</option>
                    <option value="Litro">Litro</option>
                    <option value="Resma">Resma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Quantidade Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidadeMinima}
                    onChange={(e) => setFormData({ ...formData, quantidadeMinima: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Local de Armazenamento
                </label>
                <select
                  value={formData.localId}
                  onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Almoxarifado Geral (Padrão)</option>
                  {locais.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nome}
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
                >
                  Salvar no Almoxarifado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
