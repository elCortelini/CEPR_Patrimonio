import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard - Estatísticas gerais da escola
export async function GET() {
  try {
    const totalPatrimonios = await prisma.patrimonio.count();
    const emUso = await prisma.patrimonio.count({ where: { status: 'EM_USO', baixado: false } });
    const emprestados = await prisma.patrimonio.count({ where: { status: 'EMPRESTADO', baixado: false } });
    const emManutencao = await prisma.patrimonio.count({ where: { status: 'EM_MANUTENCAO', baixado: false } });
    const baixados = await prisma.patrimonio.count({ where: { baixado: true } });

    const totalLocais = await prisma.local.count();

    // Consumíveis com estoque crítico
    const consumiveisCriticos = await prisma.consumivel.findMany({
      where: {
        quantidade: {
          lte: prisma.consumivel.fields.quantidadeMinima,
        },
      },
      include: {
        local: true,
      },
      take: 5,
    });

    // Últimos patrimônios cadastrados
    const ultimosPatrimonios = await prisma.patrimonio.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { local: true },
    });

    // Empréstimos ativos pendentes
    const emprestimosAtivos = await prisma.emprestimo.findMany({
      where: { status: 'ATIVO' },
      include: {
        patrimonio: { include: { local: true } },
      },
      orderBy: { previsaoDevolucao: 'asc' },
    });

    // Distribuição por Local
    const locaisComPatrimonio = await prisma.local.findMany({
      select: {
        id: true,
        nome: true,
        bloco: true,
        _count: {
          select: { patrimonios: true },
        },
      },
      orderBy: {
        patrimonios: { _count: 'desc' },
      },
      take: 6,
    });

    return NextResponse.json({
      resumo: {
        totalPatrimonios,
        emUso,
        emprestados,
        emManutencao,
        baixados,
        totalLocais,
        itensBaixoEstoqueCount: consumiveisCriticos.length,
      },
      consumiveisCriticos,
      ultimosPatrimonios,
      emprestimosAtivos,
      locaisComPatrimonio,
    });
  } catch (error) {
    console.error('Erro ao carregar estatísticas do dashboard:', error);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 });
  }
}
