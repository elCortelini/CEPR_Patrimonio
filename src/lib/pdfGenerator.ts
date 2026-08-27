import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PatrimonioReportItem {
  codigo: string;
  descricao: string;
  dataEntrada: string;
  origem: string;
  localNome: string;
  status: string;
  observacao?: string | null;
  baixado: boolean;
  dataBaixa?: string | null;
  motivoBaixa?: string | null;
}

export function gerarPDFPatrimonio(
  itens: PatrimonioReportItem[],
  tituloFiltro: string = 'Relatório Geral de Patrimônio'
) {
  const doc = new jsPDF();

  // Cabeçalho da Escola
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Azul Marinho
  doc.text('CENTRO EDUCACIONAL PEDRO RIZZI', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sistema de Controle de Patrimônio e Almoxarifado', 14, 24);
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 29);

  // Linha divisória
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Título do Relatório
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(tituloFiltro, 14, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de itens listados: ${itens.length}`, 14, 46);

  // Tabela de Itens
  const tableData = itens.map((item) => [
    item.codigo,
    item.descricao,
    item.localNome,
    item.origem,
    formatarDataBR(item.dataEntrada),
    formatarStatus(item.status, item.baixado),
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Patrimônio', 'Descrição', 'Local', 'Origem', 'Data Entrada', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24 }, // Patrimônio 6 dígitos
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22 },
      5: { cellWidth: 20 },
    },
  });

  // Rodapé
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Centro Educacional Pedro Rizzi - Página ${i} de ${pageCount}`,
      105,
      288,
      { align: 'center' }
    );
  }

  // Nome do Arquivo
  const dataHoje = new Date().toISOString().split('T')[0];
  doc.save(`patrimonio_pedro_rizzi_${dataHoje}.pdf`);
}

function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

function formatarStatus(status: string, baixado: boolean): string {
  if (baixado || status === 'BAIXADO') return 'Baixado';
  switch (status) {
    case 'EM_USO':
      return 'Em Uso';
    case 'EMPRESTADO':
      return 'Empréstimo';
    case 'EM_MANUTENCAO':
      return 'Manutenção';
    default:
      return status;
  }
}
