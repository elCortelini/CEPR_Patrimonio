'use client';

import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, FileText, Filter, Download } from 'lucide-react';
import { gerarPDFPatrimonio } from '@/lib/pdfGenerator';
import { exportarExcelPatrimonio } from '@/lib/excelGenerator';
import { getPatrimoniosStorage, getLocaisStorage, Patrimonio, Local } from '@/lib/storage';

export default function RelatoriosPage() {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros de Relatório
  const [filterLocal, setFilterLocal] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterOrigem, setFilterOrigem] = useState('TODOS');
  const [filterBaixado, setFilterBaixado] = useState('false');

  useEffect(() => {
    fetchLocais();
    fetchDadosRelatorio();
  }, []);

  useEffect(() => {
    fetchDadosRelatorio();
  }, [filterLocal, filterStatus, filterOrigem, filterBaixado]);

  async function fetchLocais() {
    try {
      const res = await fetch('/api/locais');
      if (res.ok) {
        const json = await res.json();
        setLocais(json);
        return;
      }
    } catch {
      // Fallback
    }

    setLocais(getLocaisStorage());
  }

  async function fetchDadosRelatorio() {
    setLoading(true);
    let list: Patrimonio[] = [];
    try {
      const params = new URLSearchParams();
      if (filterLocal !== 'TODOS') params.set('localId', filterLocal);
      if (filterStatus !== 'TODOS') params.set('status', filterStatus);
      if (filterBaixado !== 'TODOS') params.set('baixado', filterBaixado);

      const res = await fetch(`/api/patrimonios?${params.toString()}`);
      if (res.ok) {
        list = await res.json();
        if (filterOrigem !== 'TODOS') {
          list = list.filter((item) => item.origem === filterOrigem);
        }
        setPatrimonios(list);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    let result = getPatrimoniosStorage();

    if (filterLocal !== 'TODOS') {
      result = result.filter((p) => p.localId === filterLocal);
    }
    if (filterStatus !== 'TODOS') {
      result = result.filter((p) => p.status === filterStatus);
    }
    if (filterOrigem !== 'TODOS') {
      result = result.filter((p) => p.origem === filterOrigem);
    }
    if (filterBaixado === 'true') {
      result = result.filter((p) => p.baixado);
    } else if (filterBaixado === 'false') {
      result = result.filter((p) => !p.baixado);
    }

    setPatrimonios(result);
    setLoading(false);
  }

  function handleGerarPDF() {
    const dados = patrimonios.map((p) => ({
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

    let titulo = 'Relatório Geral de Patrimônio Escolar';
    if (filterLocal !== 'TODOS') {
      const loc = locais.find((l) => l.id === filterLocal);
      if (loc) titulo = `Relatório de Patrimônio — ${loc.nome}`;
    } else if (filterBaixado === 'true') {
      titulo = 'Relatório de Baixas Patrimoniais';
    }

    gerarPDFPatrimonio(dados, titulo);
  }

  function handleGerarExcel() {
    const dados = patrimonios.map((p) => ({
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

    exportarExcelPatrimonio(dados, 'relatorio_patrimonio_pedro_rizzi.xlsx');
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-blue-400" />
            Emissão de Relatórios Fiscais e Gerenciais
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Exporte listagens completas do acervo escolar com cabeçalho oficial do Centro Educacional Pedro Rizzi.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGerarPDF}
            disabled={patrimonios.length === 0}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Baixar Relatório PDF
          </button>
          <button
            onClick={handleGerarExcel}
            disabled={patrimonios.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            Baixar Planilha Excel
          </button>
        </div>
      </div>

      {/* Card de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-400" />
          Filtros de Exportação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Local / Sala
            </label>
            <select
              value={filterLocal}
              onChange={(e) => setFilterLocal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Locais / Salas</option>
              {locais.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Status do Bem
            </label>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Origem da Verba / Aquisição
            </label>
            <select
              value={filterOrigem}
              onChange={(e) => setFilterOrigem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas as Origens</option>
              <option value="Verba PDDE">Verba PDDE</option>
              <option value="Verba FDE">Verba FDE</option>
              <option value="Prefeitura Municipal">Prefeitura Municipal</option>
              <option value="Doação APMF">Doação APMF</option>
              <option value="Doação Externa">Doação Externa</option>
              <option value="Compra Direta">Compra Direta</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Situação Patrimonial
            </label>
            <select
              value={filterBaixado}
              onChange={(e) => setFilterBaixado(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="false">Somente Itens Ativos</option>
              <option value="true">Somente Itens Baixados</option>
              <option value="TODOS">Todos os Itens (Ativos + Baixados)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
          <span>
            Resultado filtrado: <strong className="text-blue-400 text-sm">{patrimonios.length}</strong> patrimônios localizados.
          </span>
        </div>
      </div>

      {/* Pré-visualização da Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <h4 className="font-bold text-white text-sm">Pré-visualização do Relatório</h4>
          <span className="text-xs text-slate-400">Total: {patrimonios.length} registros</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            Atualizando pré-visualização...
          </div>
        ) : patrimonios.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum patrimônio corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-300 uppercase text-xs sticky top-0">
                <tr>
                  <th className="py-3 px-4">Patrimônio</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Local / Sala</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Data Entrada</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {patrimonios.map((p) => (
                  <tr key={p.codigo} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{p.codigo}</td>
                    <td className="py-3 px-4 font-medium text-white">{p.descricao}</td>
                    <td className="py-3 px-4 text-slate-400">{p.local?.nome || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{p.origem}</td>
                    <td className="py-3 px-4 text-slate-400">{formatarDataBR(p.dataEntrada)}</td>
                    <td className="py-3 px-4 font-semibold text-xs">{p.baixado ? 'Baixado' : p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
