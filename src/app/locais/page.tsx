'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Package, X, CheckCircle2, Building } from 'lucide-react';
import {
  saveLocalStorage,
  deleteLocalStorage,
  subscribeLocais,
  subscribePatrimonios,
  getUsuarioAtual,
  Local,
  Patrimonio,
} from '@/lib/storage';

interface LocalItem extends Local {
  _count?: {
    patrimonios: number;
  };
}

export default function LocaisPage() {
  const [locais, setLocais] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    bloco: 'Bloco A',
    descricao: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let rawLocais: Local[] = [];
    let rawPatrimonios: Patrimonio[] = [];

    const unsubLocais = subscribeLocais((locs) => {
      rawLocais = locs;
      atualizarLista(rawLocais, rawPatrimonios);
      setLoading(false);
    });

    const unsubPats = subscribePatrimonios((pats) => {
      rawPatrimonios = pats;
      atualizarLista(rawLocais, rawPatrimonios);
      setLoading(false);
    });

    return () => {
      unsubLocais();
      unsubPats();
    };
  }, []);

  function atualizarLista(locs: Local[], pats: Patrimonio[]) {
    const list = locs.map((l) => ({
      ...l,
      _count: {
        patrimonios: pats.filter((p) => p.localId === l.id).length,
      },
    }));
    setLocais(list);
  }

  function abrirModalNovo() {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ nome: '', bloco: 'Bloco A', descricao: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalEditar(loc: LocalItem) {
    setIsEditMode(true);
    setSelectedId(loc.id);
    setFormData({
      nome: loc.nome,
      bloco: loc.bloco || 'Bloco A',
      descricao: loc.descricao || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nome.trim()) {
      setErrorMsg('Informe o nome da sala ou setor.');
      return;
    }

    const usuarioAtual = getUsuarioAtual();

    const payload = {
      id: selectedId || undefined,
      nome: formData.nome.trim(),
      bloco: formData.bloco,
      descricao: formData.descricao.trim(),
    };

    await saveLocalStorage(payload, usuarioAtual);
    setSuccessMsg(isEditMode ? 'Local atualizado!' : 'Novo local cadastrado!');
    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir a sala "${nome}"?`)) return;

    const usuarioAtual = getUsuarioAtual();
    await deleteLocalStorage(id, usuarioAtual);
    setSuccessMsg(`Local "${nome}" excluído.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-7 w-7 text-emerald-400" />
            Salas e Setores da Escola
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Cadastre as salas, laboratórios, auditórios e blocos para organizar o patrimônio.
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Nova Sala / Local
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

      {/* Grid de Salas */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          Carregando salas...
        </div>
      ) : locais.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          Nenhuma sala cadastrada. Clique acima para cadastrar a primeira sala!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locais.map((loc) => (
            <div
              key={loc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{loc.nome}</h3>
                    {loc.bloco && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
                        <Building className="h-3 w-3" />
                        {loc.bloco}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => abrirModalEditar(loc)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                      title="Editar sala"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleExcluir(loc.id, loc.nome)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Excluir sala"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {loc.descricao && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{loc.descricao}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-blue-400" />
                  Patrimônio: <strong className="text-white">{loc._count?.patrimonios || 0}</strong> bens
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Adicionar / Editar Local */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="font-bold text-lg text-white">
                {isEditMode ? 'Editar Sala / Local' : 'Cadastrar Nova Sala'}
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
                  Nome da Sala / Local *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laboratório de Informática 02, Sala 05..."
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Bloco / Pavilhão
                </label>
                <select
                  value={formData.bloco}
                  onChange={(e) => setFormData({ ...formData, bloco: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bloco A">Bloco A</option>
                  <option value="Bloco B">Bloco B</option>
                  <option value="Bloco C">Bloco C</option>
                  <option value="Bloco Adm">Bloco Administrativo</option>
                  <option value="Área Externa">Área Externa / Quadra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição / Finalidade
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Sala equipada com 30 carteiras e ar-condicionado..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                >
                  {isEditMode ? 'Salvar Alterações' : 'Salvar Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
