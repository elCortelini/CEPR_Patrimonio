import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/manutencoes
export async function GET() {
  try {
    const manutencoes = await prisma.manutencao.findMany({
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

    return NextResponse.json(manutencoes);
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error);
    return NextResponse.json({ error: 'Erro ao buscar manutenções' }, { status: 500 });
  }
}

// POST /api/manutencoes - Abrir chamado de manutenção
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { patrimonioCodigo, solicitante, descricaoProblema } = body;

    if (!patrimonioCodigo || !solicitante || !descricaoProblema) {
      return NextResponse.json(
        { error: 'Campos patrimônio, solicitante e descrição do problema são obrigatórios.' },
        { status: 400 }
      );
    }

    patrimonioCodigo = String(patrimonioCodigo).trim().padStart(6, '0');

    const patrimonio = await prisma.patrimonio.findUnique({
      where: { codigo: patrimonioCodigo },
    });

    if (!patrimonio) {
      return NextResponse.json(
        { error: `Patrimônio ${patrimonioCodigo} não encontrado.` },
        { status: 404 }
      );
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    const [novaManutencao] = await prisma.$transaction([
      prisma.manutencao.create({
        data: {
          patrimonioCodigo,
          solicitante: solicitante.trim(),
          descricaoProblema: descricaoProblema.trim(),
          dataAbertura: dataHoje,
          status: 'EM_MANUTENCAO',
        },
        include: {
          patrimonio: {
            include: { local: true },
          },
        },
      }),
      prisma.patrimonio.update({
        where: { codigo: patrimonioCodigo },
        data: { status: 'EM_MANUTENCAO' },
      }),
    ]);

    return NextResponse.json(novaManutencao, { status: 201 });
  } catch (error) {
    console.error('Erro ao abrir manutenção:', error);
    return NextResponse.json({ error: 'Erro ao abrir manutenção' }, { status: 500 });
  }
}

// PUT /api/manutencoes - Concluir ou atualizar chamado de manutenção
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, custo, solucao } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID da manutenção e status são obrigatórios.' }, { status: 400 });
    }

    const manutencao = await prisma.manutencao.findUnique({
      where: { id },
    });

    if (!manutencao) {
      return NextResponse.json({ error: 'Manutenção não encontrada.' }, { status: 404 });
    }

    const novoStatusPatrimonio = status === 'CONCLUIDO' ? 'EM_USO' : 'EM_MANUTENCAO';

    const [manutencaoAtualizada] = await prisma.$transaction([
      prisma.manutencao.update({
        where: { id },
        data: {
          status,
          custo: custo ? parseFloat(custo) : 0.0,
          solucao: solucao ? solucao.trim() : null,
        },
        include: {
          patrimonio: true,
        },
      }),
      prisma.patrimonio.update({
        where: { codigo: manutencao.patrimonioCodigo },
        data: { status: novoStatusPatrimonio },
      }),
    ]);

    return NextResponse.json(manutencaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    return NextResponse.json({ error: 'Erro ao atualizar manutenção' }, { status: 500 });
  }
}
