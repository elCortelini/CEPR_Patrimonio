import * as XLSX from 'xlsx';
import { PatrimonioReportItem } from './pdfGenerator';

export function exportarExcelPatrimonio(
  itens: PatrimonioReportItem[],
  nomeArquivo: string = 'patrimonio_pedro_rizzi.xlsx'
) {
  const dados = itens.map((item) => ({
    'Código Patrimônio': item.codigo,
    'Descrição': item.descricao,
    'Local / Sala': item.localNome,
    'Origem de Aquisição': item.origem,
    'Data de Entrada': formatarDataBR(item.dataEntrada),
    'Status Atual': item.baixado ? 'Baixado' : formatarStatus(item.status),
    'Baixado': item.baixado ? 'Sim' : 'Não',
    'Data da Baixa': item.dataBaixa ? formatarDataBR(item.dataBaixa) : '-',
    'Motivo da Baixa': item.motivoBaixa || '-',
    'Observações': item.observacao || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patrimônio Pedro Rizzi');

  // Ajustar larguras das colunas
  const colWidths = [
    { wch: 16 }, // Código
    { wch: 45 }, // Descrição
    { wch: 30 }, // Local
    { wch: 20 }, // Origem
    { wch: 15 }, // Data Entrada
    { wch: 15 }, // Status
    { wch: 10 }, // Baixado
    { wch: 15 }, // Data Baixa
    { wch: 30 }, // Motivo Baixa
    { wch: 35 }, // Obs
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, nomeArquivo);
}

function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

function formatarStatus(status: string): string {
  switch (status) {
    case 'EM_USO':
      return 'Em Uso';
    case 'EMPRESTADO':
      return 'Empréstimo';
    case 'EM_MANUTENCAO':
      return 'Manutenção';
    case 'BAIXADO':
      return 'Baixado';
    default:
      return status;
  }
}
