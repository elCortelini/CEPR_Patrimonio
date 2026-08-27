import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/consumiveis
export async function GET() {
  try {
    const consumiveis = await prisma.consumivel.findMany({
      include: {
        local: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(consumiveis);
  } catch (error) {
    console.error('Erro ao buscar consumíveis:', error);
    return NextResponse.json({ error: 'Erro ao buscar consumíveis' }, { status: 500 });
  }
}

// POST /api/consumiveis - Cadastrar novo item de consumo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, categoria, quantidade, quantidadeMinima, unidade, localId } = body;

    if (!nome || !categoria) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 });
    }

    const novoItem = await prisma.consumivel.create({
      data: {
        nome: nome.trim(),
        categoria: categoria.trim(),
        quantidade: quantidade ? parseInt(quantidade, 10) : 0,
        quantidadeMinima: quantidadeMinima ? parseInt(quantidadeMinima, 10) : 5,
        unidade: unidade ? unidade.trim() : 'Unidade',
        localId: localId || null,
      },
      include: {
        local: true,
      },
    });

    return NextResponse.json(novoItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar consumível:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar consumível' }, { status: 500 });
  }
}

// PUT /api/consumiveis - Atualizar estoque de item existente (Ajuste/Movimentação)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, deltaQuantidade, novaQuantidade, nome, categoria, quantidadeMinima, unidade, localId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório.' }, { status: 400 });
    }

    const item = await prisma.consumivel.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item de consumo não encontrado.' }, { status: 404 });
    }

    let qtdFinal = item.quantidade;
    if (novaQuantidade !== undefined) {
      qtdFinal = Math.max(0, parseInt(novaQuantidade, 10));
    } else if (deltaQuantidade !== undefined) {
      qtdFinal = Math.max(0, item.quantidade + parseInt(deltaQuantidade, 10));
    }

    const itemAtualizado = await prisma.consumivel.update({
      where: { id },
      data: {
        quantidade: qtdFinal,
        nome: nome ? nome.trim() : item.nome,
        categoria: categoria ? categoria.trim() : item.categoria,
        quantidadeMinima: quantidadeMinima !== undefined ? parseInt(quantidadeMinima, 10) : item.quantidadeMinima,
        unidade: unidade ? unidade.trim() : item.unidade,
        localId: localId !== undefined ? localId : item.localId,
      },
      include: {
        local: true,
      },
    });

    return NextResponse.json(itemAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar consumível:', error);
    return NextResponse.json({ error: 'Erro ao atualizar consumível' }, { status: 500 });
  }
}
