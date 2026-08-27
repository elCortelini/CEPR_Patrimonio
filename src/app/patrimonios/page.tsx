'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertOctagon,
  FileSpreadsheet,
  FileText,
  MapPin,
  CheckCircle2,
  X,
  Camera,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { gerarPDFPatrimonio } from '@/lib/pdfGenerator';
import { exportarExcelPatrimonio } from '@/lib/excelGenerator';
import {
  getPatrimoniosStorage,
  getLocaisStorage,
  savePatrimonioStorage,
  deletePatrimonioStorage,
  Patrimonio,
  Local,
} from '@/lib/storage';

function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function PatrimoniosContent() {
  const searchParams = useSearchParams();

  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterLocal, setFilterLocal] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterBaixado, setFilterBaixado] = useState('false');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [patrimonioSelecionado, setPatrimonioSelecionado] = useState<Patrimonio | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    origem: 'Verba PDDE',
    observacao: '',
    localId: '',
    fotoUrl: '' as string | null,
  });

  const [baixaFormData, setBaixaFormData] = useState({
    dataBaixa: new Date().toISOString().split('T')[0],
    motivoBaixa: 'Inservível / Danificado sem conserto',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchLocais();
    if (searchParams.get('novo') === 'true') {
      abrirModalNovo();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPatrimonios();
  }, [search, filterLocal, filterStatus, filterBaixado]);

  async function fetchLocais() {
    try {
      const res = await fetch('/api/locais');
      if (res.ok) {
        const json = await res.json();
        setLocais(json);
        if (json.length > 0 && !formData.localId) {
          setFormData((prev) => ({ ...prev, localId: json[0].id }));
        }
        return;
      }
    } catch {
      // Fallback
    }
    const locs = getLocaisStorage();
    setLocais(locs);
    if (locs.length > 0 && !formData.localId) {
      setFormData((prev) => ({ ...prev, localId: locs[0].id }));
    }
  }

  async function fetchPatrimonios() {
    setLoading(true);
    let list: Patrimonio[] = [];
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filterLocal !== 'TODOS') queryParams.set('localId', filterLocal);
      if (filterStatus !== 'TODOS') queryParams.set('status', filterStatus);
      if (filterBaixado !== 'TODOS') queryParams.set('baixado', filterBaixado);

      const res = await fetch(`/api/patrimonios?${queryParams.toString()}`);
      if (res.ok) {
        list = await res.json();
        setPatrimonios(list);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    let result = getPatrimoniosStorage();

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.codigo.includes(s) ||
          p.descricao.toLowerCase().includes(s) ||
          p.origem.toLowerCase().includes(s) ||
          (p.observacao && p.observacao.toLowerCase().includes(s))
      );
    }

    if (filterLocal !== 'TODOS') {
      result = result.filter((p) => p.localId === filterLocal);
    }

    if (filterStatus !== 'TODOS') {
      result = result.filter((p) => p.status === filterStatus);
    }

    if (filterBaixado === 'true') {
      result = result.filter((p) => p.baixado);
    } else if (filterBaixado === 'false') {
      result = result.filter((p) => !p.baixado);
    }

    setPatrimonios(result);
    setLoading(false);
  }

  function abrirModalNovo() {
    setIsEditMode(false);
    setPatrimonioSelecionado(null);
    setFormData({
      codigo: '',
      descricao: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      origem: 'Verba PDDE',
      observacao: '',
      localId: locais.length > 0 ? locais[0].id : '',
      fotoUrl: null,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalEditar(p: Patrimonio) {
    setIsEditMode(true);
    setPatrimonioSelecionado(p);
    setFormData({
      codigo: p.codigo,
      descricao: p.descricao,
      dataEntrada: p.dataEntrada,
      origem: p.origem,
      observacao: p.observacao || '',
      localId: p.localId,
      fotoUrl: p.fotoUrl || null,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  }

  function abrirModalBaixa(p: Patrimonio) {
    setPatrimonioSelecionado(p);
    setBaixaFormData({
      dataBaixa: new Date().toISOString().split('T')[0],
      motivoBaixa: 'Inservível / Danificado sem conserto',
    });
    setErrorMsg('');
    setIsBaixaModalOpen(true);
  }

  function verFoto(url: string, p: Patrimonio) {
    setSelectedPhotoUrl(url);
    setPatrimonioSelecionado(p);
    setIsPhotoViewerOpen(true);
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      setFormData((prev) => ({ ...prev, fotoUrl: compressedBase64 }));
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setErrorMsg('Não foi possível carregar esta imagem.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    const codigoFormatado = formData.codigo.trim().padStart(6, '0');

    if (!/^\d{6}$/.test(codigoFormatado)) {
      setErrorMsg('O número do patrimônio deve conter exatamente 6 dígitos numéricos (ex: 000123).');
      return;
    }

    if (!formData.descricao.trim()) {
      setErrorMsg('Informe a descrição do patrimônio.');
      return;
    }

    if (!formData.localId) {
      setErrorMsg('Selecione um local pré-cadastrado.');
      return;
    }

    const payload: Patrimonio = {
      codigo: codigoFormatado,
      descricao: formData.descricao.trim(),
      dataEntrada: formData.dataEntrada,
      origem: formData.origem,
      observacao: formData.observacao ? formData.observacao.trim() : null,
      localId: formData.localId,
      status: isEditMode && patrimonioSelecionado ? patrimonioSelecionado.status : 'EM_USO',
      baixado: isEditMode && patrimonioSelecionado ? patrimonioSelecionado.baixado : false,
      fotoUrl: formData.fotoUrl,
    };

    try {
      const url = isEditMode ? `/api/patrimonios/${codigoFormatado}` : '/api/patrimonios';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(isEditMode ? 'Patrimônio atualizado com sucesso!' : 'Patrimônio cadastrado com sucesso!');
        setIsModalOpen(false);
        fetchPatrimonios();
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
    } catch {
      // Fallback
    }

    savePatrimonioStorage(payload);
    setSuccessMsg(isEditMode ? 'Patrimônio atualizado com sucesso!' : 'Patrimônio cadastrado com sucesso!');
    setIsModalOpen(false);
    fetchPatrimonios();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleConfirmarBaixa(e: React.FormEvent) {
    e.preventDefault();
    if (!patrimonioSelecionado) return;

    const patrimonioBaixado: Patrimonio = {
      ...patrimonioSelecionado,
      baixado: true,
      status: 'BAIXADO',
      dataBaixa: baixaFormData.dataBaixa,
      motivoBaixa: baixaFormData.motivoBaixa,
    };

    try {
      const res = await fetch(`/api/patrimonios/${patrimonioSelecionado.codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patrimonioBaixado),
      });

      if (res.ok) {
        setSuccessMsg(`Baixa efetuada com sucesso no patrimônio ${patrimonioSelecionado.codigo}.`);
        setIsBaixaModalOpen(false);
        fetchPatrimonios();
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
    } catch {
      // Fallback
    }

    savePatrimonioStorage(patrimonioBaixado);
    setSuccessMsg(`Baixa efetuada com sucesso no patrimônio ${patrimonioSelecionado.codigo}.`);
    setIsBaixaModalOpen(false);
    fetchPatrimonios();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  async function handleExcluir(codigo: string) {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o patrimônio ${codigo}?`)) return;

    try {
      const res = await fetch(`/api/patrimonios/${codigo}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccessMsg(`Patrimônio ${codigo} excluído.`);
        fetchPatrimonios();
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
    } catch {
      // Fallback
    }

    deletePatrimonioStorage(codigo);
    setSuccessMsg(`Patrimônio ${codigo} excluído.`);
    fetchPatrimonios();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function handleExportarPDF() {
    const dadosRelatorio = patrimonios.map((p) => ({
      codigo: p.codigo,
      descricao: p.descricao,
      dataEntrada: p.dataEntrada,
      origem: p.origem,
      localNome: p.local?.nome || '-',
      status: p.status,
      observacao: p.observacao,
      baixado: p.baixado,
      dataBaixa: p.dataBaixa,
      motivoBaixa: p.motivoBaixa,
    }));
    gerarPDFPatrimonio(dadosRelatorio, 'Relatório de Patrimônio — Centro Educacional Pedro Rizzi');
  }

  function handleExportarExcel() {
    const dadosRelatorio = patrimonios.map((p) => ({
      codigo: p.codigo,
      descricao: p.descricao,
      dataEntrada: p.dataEntrada,
      origem: p.origem,
      localNome: p.local?.nome || '-',
      status: p.status,
      observacao: p.observacao,
      baixado: p.baixado,
      dataBaixa: p.dataBaixa,
      motivoBaixa: p.motivoBaixa,
    }));
    exportarExcelPatrimonio(dadosRelatorio, 'patrimonio_pedro_rizzi.xlsx');
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-400" />
            Controle de Patrimônio Escolar
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gerenciamento por código fixo de 6 dígitos numéricos, salas e foto opcional.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Adicionar Patrimônio
          </button>
          <button
            onClick={handleExportarPDF}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-lg text-sm border border-slate-700 transition-all"
          >
            <FileText className="h-4 w-4 text-rose-400" />
            PDF
          </button>
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-lg text-sm border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Excel
          </button>
        </div>
      </div>

      {/* Alertas */}
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

      {/* Barra de Filtros e Busca */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nº 6 dígitos, nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={filterLocal}
              onChange={(e) => setFilterLocal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Locais / Salas</option>
              {locais.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nome} {loc.bloco ? `(${loc.bloco})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EM_USO">Em Uso</option>
              <option value="EMPRESTADO">Empréstimo</option>
              <option value="EM_MANUTENCAO">Em Manutenção</option>
              <option value="BAIXADO">Baixado</option>
            </select>
          </div>

          <div>
            <select
              value={filterBaixado}
              onChange={(e) => setFilterBaixado(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="false">Somente Patrimônios Ativos</option>
              <option value="true">Somente Itens Baixados</option>
              <option value="TODOS">Exibir Todos (Ativos + Baixados)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Patrimônios */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            Carregando patrimônios...
          </div>
        ) : patrimonios.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum patrimônio encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Foto</th>
                  <th className="py-3.5 px-4">Patrimônio</th>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Local / Sala</th>
                  <th className="py-3.5 px-4">Data Entrada</th>
                  <th className="py-3.5 px-4">Origem</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {patrimonios.map((item) => (
                  <tr key={item.codigo} className="hover:bg-slate-800/40 transition-colors">
                    {/* Foto do Patrimônio */}
                    <td className="py-3.5 px-4">
                      {item.fotoUrl ? (
                        <button
                          onClick={() => verFoto(item.fotoUrl!, item)}
                          className="relative group block w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shadow-sm shrink-0"
                          title="Clique para ver a foto"
                        >
                          <img
                            src={item.fotoUrl}
                            alt={item.descricao}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-800/60 flex items-center justify-center text-slate-600 shrink-0">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 text-base">
                      {item.codigo}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                      <div>{item.descricao}</div>
                      {item.observacao && (
                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                          Obs: {item.observacao}
                        </div>
                      )}
                      {item.baixado && item.motivoBaixa && (
                        <div className="text-xs text-purple-400 mt-1 font-semibold">
                          Motivo Baixa: {item.motivoBaixa} ({formatarDataBR(item.dataBaixa)})
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded text-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {item.local?.nome || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatarDataBR(item.dataEntrada)}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">{item.origem}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} baixado={item.baixado} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {!item.baixado && (
                        <>
                          <button
                            onClick={() => abrirModalEditar(item)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                            title="Editar patrimônio"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => abrirModalBaixa(item)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-purple-400 rounded transition-colors"
                            title="Dar baixa no patrimônio"
                          >
                            <AlertOctagon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleExcluir(item.codigo)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                        title="Excluir do sistema"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Adicionar / Editar Patrimônio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="font-bold text-lg text-white">
                {isEditMode ? `Editar Patrimônio #${formData.codigo}` : 'Cadastrar Novo Patrimônio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Upload de Foto Opcional */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Foto do Patrimônio (Opcional - Câmera ou Arquivos)
                </label>
                <div className="flex items-center space-x-4">
                  {formData.fotoUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={formData.fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, fotoUrl: null })}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-500"
                        title="Remover foto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <Camera className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-[10px]">Sem foto</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-lg text-xs border border-slate-700 transition-all">
                      <Camera className="h-4 w-4 text-blue-400" />
                      <span>{formData.fotoUrl ? 'Alterar Foto' : 'Tirar Foto ou Escolher Arquivo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Em celulares, abre a câmera ou galeria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Número do Patrimônio (6 dígitos) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Número do Patrimônio (6 dígitos numéricos) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  disabled={isEditMode}
                  placeholder="Ex: 000123"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Códigos menores serão preenchidos com zeros à esquerda (ex: 42 vira 000042).
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Projetor Epson PowerLite 3300 Lumens HDMI"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Local / Sala */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Local / Sala da Escola *
                </label>
                <select
                  required
                  value={formData.localId}
                  onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Selecione um local cadastrado</option>
                  {locais.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nome} {loc.bloco ? `(${loc.bloco})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Entrada e Origem */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Data de Entrada *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dataEntrada}
                    onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Origem de Aquisição *
                  </label>
                  <select
                    required
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Verba PDDE">Verba PDDE</option>
                    <option value="Verba FDE">Verba FDE</option>
                    <option value="Prefeitura Municipal">Prefeitura Municipal</option>
                    <option value="Doação APMF">Doação APMF</option>
                    <option value="Doação Externa">Doação Externa</option>
                    <option value="Compra Direta">Compra Direta</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Observação */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Observações Adicionais
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, estado de conservação, acessórios..."
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Ações */}
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
                  className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                >
                  {isEditMode ? 'Salvar Alterações' : 'Cadastrar Patrimônio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dar Baixa Patrimonial */}
      {isBaixaModalOpen && patrimonioSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-purple-950/40">
              <h3 className="font-bold text-lg text-purple-200 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-purple-400" />
                Dar Baixa Patrimonial (#{patrimonioSelecionado.codigo})
              </h3>
              <button onClick={() => setIsBaixaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarBaixa} className="p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Item: <strong className="text-white">{patrimonioSelecionado.descricao}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Data da Baixa *
                </label>
                <input
                  type="date"
                  required
                  value={baixaFormData.dataBaixa}
                  onChange={(e) => setBaixaFormData({ ...baixaFormData, dataBaixa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Motivo da Baixa *
                </label>
                <select
                  required
                  value={baixaFormData.motivoBaixa}
                  onChange={(e) => setBaixaFormData({ ...baixaFormData, motivoBaixa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Inservível / Danificado sem conserto">Inservível / Danificado sem conserto</option>
                  <option value="Obsoleto / Substituído">Obsoleto / Substituído</option>
                  <option value="Furtado / Roubado">Furtado / Roubado</option>
                  <option value="Extraviado / Perda">Extraviado / Perda</option>
                  <option value="Doado">Doado</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBaixaModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / LIGHTBOX: Visualizador da Foto em Tamanho Maior */}
      {isPhotoViewerOpen && selectedPhotoUrl && patrimonioSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Patrimônio #{patrimonioSelecionado.codigo}
                </h4>
                <p className="text-xs text-slate-400">{patrimonioSelecionado.descricao}</p>
              </div>
              <button
                onClick={() => setIsPhotoViewerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950">
              <img
                src={selectedPhotoUrl}
                alt={patrimonioSelecionado.descricao}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatrimoniosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          Carregando módulo de patrimônio...
        </div>
      }
    >
      <PatrimoniosContent />
    </Suspense>
  );
}

function StatusBadge({ status, baixado }: { status: string; baixado: boolean }) {
  if (baixado || status === 'BAIXADO') {
    return <span className="bg-purple-950 text-purple-300 border border-purple-800 text-xs px-2.5 py-1 rounded-full font-medium">Baixado</span>;
  }
  switch (status) {
    case 'EM_USO':
      return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">Em Uso</span>;
    case 'EMPRESTADO':
      return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">Empréstimo</span>;
    case 'EM_MANUTENCAO':
      return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">Manutenção</span>;
    default:
      return <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">{status}</span>;
  }
}

function formatarDataBR(dataIso?: string | null): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}
