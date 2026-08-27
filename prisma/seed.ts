import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inclusão de dados de exemplo no banco...');

  // 1. Criar Locais Padrão
  const locaisData = [
    { nome: 'Laboratório de Informática', bloco: 'Bloco A', descricao: 'Sala com computadores e equipamentos de tecnologia' },
    { nome: 'Biblioteca Escola Pedro Rizzi', bloco: 'Bloco A', descricao: 'Acervo de livros e mesas de estudo' },
    { nome: 'Secretaria e Direção', bloco: 'Bloco Adm', descricao: 'Atendimento administrativo e gabinete da direção' },
    { nome: 'Sala dos Professores', bloco: 'Bloco Adm', descricao: 'Espaço de descanso e reuniões dos docentes' },
    { nome: 'Cozinha e Refeitório', bloco: 'Bloco B', descricao: 'Preparo de refeições e armazenamento de utensílios' },
    { nome: 'Sala 01 - Ensino Fundamental', bloco: 'Bloco A', descricao: 'Sala de aula das turmas da manhã/tarde' },
    { nome: 'Sala 02 - Ensino Fundamental', bloco: 'Bloco A', descricao: 'Sala de aula' },
    { nome: 'Sala 03 - Ensino Fundamental', bloco: 'Bloco A', descricao: 'Sala de aula' },
    { nome: 'Laboratório de Ciências e Robótica', bloco: 'Bloco B', descricao: 'Kits de experimentos e eletrônica' },
    { nome: 'Quadra Poliesportiva / Depósito Ed. Física', bloco: 'Bloco C', descricao: 'Materiais esportivos e equipamentos' },
  ];

  const locaisCriados: Record<string, string> = {};

  for (const l of locaisData) {
    const local = await prisma.local.upsert({
      where: { nome: l.nome },
      update: {},
      create: l,
    });
    locaisCriados[l.nome] = local.id;
  }

  console.log('Locais criados:', Object.keys(locaisCriados).length);

  // 2. Criar Patrimônios Iniciais com 6 dígitos
  const patrimoniosData = [
    {
      codigo: '000101',
      descricao: 'Computador Desktop Dell OptiPlex i5 16GB RAM 512GB SSD',
      dataEntrada: '2025-02-10',
      origem: 'Verba PDDE',
      observacao: 'Em perfeito estado de uso no laboratório',
      localId: locaisCriados['Laboratório de Informática'],
      status: 'EM_USO',
      baixado: false,
    },
    {
      codigo: '000102',
      descricao: 'Projetor Epson PowerLite 3300 Lumens HDMI',
      dataEntrada: '2025-03-15',
      origem: 'Prefeitura Municipal',
      observacao: 'Fica disponível para empréstimos entre as salas',
      localId: locaisCriados['Secretaria e Direção'],
      status: 'EM_USO',
      baixado: false,
    },
    {
      codigo: '000103',
      descricao: 'Ar Condicionado Split Inverter 24.000 BTUs Consul',
      dataEntrada: '2024-11-20',
      origem: 'Doação APMF',
      observacao: 'Instalado na biblioteca',
      localId: locaisCriados['Biblioteca Escola Pedro Rizzi'],
      status: 'EM_USO',
      baixado: false,
    },
    {
      codigo: '000104',
      descricao: 'Mesa de Reunião em Madeira MDF 8 Lugares',
      dataEntrada: '2024-08-05',
      origem: 'Compra Direta',
      observacao: 'Mesa principal da sala dos professores',
      localId: locaisCriados['Sala dos Professores'],
      status: 'EM_USO',
      baixado: false,
    },
    {
      codigo: '000105',
      descricao: 'Caixa de Som Amplificada Portátil 500W Bluetooth',
      dataEntrada: '2025-05-02',
      origem: 'Verba FDE',
      observacao: 'Utilizada em eventos e na quadra poliesportiva',
      localId: locaisCriados['Quadra Poliesportiva / Depósito Ed. Física'],
      status: 'EM_USO',
      baixado: false,
    },
    {
      codigo: '000106',
      descricao: 'Geladeira Duplex Inox Brastemp 400L',
      dataEntrada: '2023-04-12',
      origem: 'Prefeitura Municipal',
      observacao: 'Em manutenção para troca do termostato',
      localId: locaisCriados['Cozinha e Refeitório'],
      status: 'EM_MANUTENCAO',
      baixado: false,
    },
    {
      codigo: '000107',
      descricao: 'Computador Antigo Positivo Celeron (Baixado)',
      dataEntrada: '2018-03-01',
      origem: 'Doação Antiga',
      observacao: 'Placa mãe queimada sem possibilidade de conserto',
      localId: locaisCriados['Laboratório de Informática'],
      status: 'BAIXADO',
      baixado: true,
      dataBaixa: '2026-01-15',
      motivoBaixa: 'Inservível / Queimado sem peça de reposição',
    },
  ];

  for (const p of patrimoniosData) {
    await prisma.patrimonio.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
  }

  console.log('Patrimônios iniciais criados com sucesso.');

  // 3. Criar Itens do Almoxarifado (Consumíveis)
  const consumiveisData = [
    { nome: 'Papel A4 Chamex 75g (Caixa com 10 ream)', categoria: 'Papelaria', quantidade: 15, quantidadeMinima: 5, unidade: 'Caixa', localId: locaisCriados['Secretaria e Direção'] },
    { nome: 'Canetão Quadro Branco Azul (Faber-Castell)', categoria: 'Didático', quantidade: 40, quantidadeMinima: 10, unidade: 'Unidade', localId: locaisCriados['Secretaria e Direção'] },
    { nome: 'Sabão Líquido Galão 5 Litros', categoria: 'Limpeza', quantidade: 3, quantidadeMinima: 4, unidade: 'Galão', localId: locaisCriados['Cozinha e Refeitório'] },
    { nome: 'Copo Descartável 200ml (Pacote c/ 100)', categoria: 'Cozinha', quantidade: 25, quantidadeMinima: 8, unidade: 'Pacote', localId: locaisCriados['Cozinha e Refeitório'] },
    { nome: 'Cabo HDMI 2.0 de 5 Metros', categoria: 'TI', quantidade: 6, quantidadeMinima: 2, unidade: 'Unidade', localId: locaisCriados['Laboratório de Informática'] },
  ];

  for (const c of consumiveisData) {
    const existe = await prisma.consumivel.findFirst({ where: { nome: c.nome } });
    if (!existe) {
      await prisma.consumivel.create({ data: c });
    }
  }

  console.log('Consumíveis iniciais criados.');

  // 4. Criar Usuário Inicial
  await prisma.usuario.upsert({
    where: { email: 'admin@pedrorizzi.edu.br' },
    update: {},
    create: {
      nome: 'Administrador Pedro Rizzi',
      email: 'admin@pedrorizzi.edu.br',
      senha: 'admin', // Em produção deve-se usar hash bcrypt
      perfil: 'ADMIN',
    },
  });

  console.log('Usuário admin criado com sucesso (admin@pedrorizzi.edu.br).');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
