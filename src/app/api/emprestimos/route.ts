import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/emprestimos - Listar empréstimos ativos e histórico
export async function GET() {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      include: {
        patrimonio: {
          include: {
            local: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(emprestimos);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    return NextResponse.json({ error: 'Erro ao buscar empréstimos' }, { status: 500 });
  }
}

// POST /api/emprestimos - Registrar nova saída/empréstimo de patrimônio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { patrimonioCodigo, solicitante, cargo, previsaoDevolucao, observacao } = body;

    if (!patrimonioCodigo || !solicitante || !previsaoDevolucao) {
      return NextResponse.json(
        { error: 'Campos patrimônio, solicitante e previsão de devolução são obrigatórios.' },
        { status: 400 }
      );
    }

    patrimonioCodigo = String(patrimonioCodigo).trim().padStart(6, '0');

    // Verificar se o patrimônio existe e se não está baixado ou já emprestado
    const patrimonio = await prisma.patrimonio.findUnique({
      where: { codigo: patrimonioCodigo },
    });

    if (!patrimonio) {
      return NextResponse.json(
        { error: `Patrimônio ${patrimonioCodigo} não encontrado.` },
        { status: 404 }
      );
    }

    if (patrimonio.baixado) {
      return NextResponse.json(
        { error: `Este patrimônio está baixado (${patrimonio.motivoBaixa}) e não pode ser emprestado.` },
        { status: 400 }
      );
    }

    if (patrimonio.status === 'EMPRESTADO') {
      return NextResponse.json(
        { error: `O patrimônio ${patrimonioCodigo} já encontra-se emprestado no momento.` },
        { status: 400 }
      );
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    // Transação: Criar o empréstimo e atualizar o status do patrimônio para EMPRESTADO
    const [novoEmprestimo] = await prisma.$transaction([
      prisma.emprestimo.create({
        data: {
          patrimonioCodigo,
          solicitante: solicitante.trim(),
          cargo: cargo ? cargo.trim() : null,
          dataRetirada: dataHoje,
          previsaoDevolucao,
          status: 'ATIVO',
          observacao: observacao ? observacao.trim() : null,
        },
        include: {
          patrimonio: {
            include: { local: true },
          },
        },
      }),
      prisma.patrimonio.update({
        where: { codigo: patrimonioCodigo },
        data: { status: 'EMPRESTADO' },
      }),
    ]);

    return NextResponse.json(novoEmprestimo, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar empréstimo:', error);
    return NextResponse.json({ error: 'Erro ao registrar empréstimo' }, { status: 500 });
  }
}

// PUT /api/emprestimos - Devolver empréstimo
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, observacaoDevolucao } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do empréstimo é obrigatório.' }, { status: 400 });
    }

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id },
    });

    if (!emprestimo) {
      return NextResponse.json({ error: 'Empréstimo não encontrado.' }, { status: 404 });
    }

    const dataHoraAtual = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const [emprestimoAtualizado] = await prisma.$transaction([
      prisma.emprestimo.update({
        where: { id },
        data: {
          status: 'DEVOLVIDO',
          dataDevolucao: dataHoraAtual,
          observacao: observacaoDevolucao
            ? `${emprestimo.observacao ? emprestimo.observacao + ' | ' : ''}Devolução: ${observacaoDevolucao}`
            : emprestimo.observacao,
        },
        include: {
          patrimonio: true,
        },
      }),
      prisma.patrimonio.update({
        where: { codigo: emprestimo.patrimonioCodigo },
        data: { status: 'EM_USO' },
      }),
    ]);

    return NextResponse.json(emprestimoAtualizado);
  } catch (error) {
    console.error('Erro ao registrar devolução:', error);
    return NextResponse.json({ error: 'Erro ao registrar devolução' }, { status: 500 });
  }
}
