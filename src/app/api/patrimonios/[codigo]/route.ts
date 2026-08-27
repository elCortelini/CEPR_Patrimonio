import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patrimonios/[codigo]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const patrimonio = await prisma.patrimonio.findUnique({
      where: { codigo },
      include: {
        local: true,
        emprestimos: { orderBy: { createdAt: 'desc' } },
        manutencoes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patrimonio) {
      return NextResponse.json({ error: 'Patrimônio não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(patrimonio);
  } catch (error) {
    console.error('Erro ao buscar patrimônio:', error);
    return NextResponse.json({ error: 'Erro ao buscar patrimônio' }, { status: 500 });
  }
}

// PUT /api/patrimonios/[codigo] - Atualizar dados do patrimônio
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const body = await request.json();
    const { descricao, dataEntrada, origem, observacao, localId, status, baixado, dataBaixa, motivoBaixa } = body;

    const patrimonioExistente = await prisma.patrimonio.findUnique({
      where: { codigo },
    });

    if (!patrimonioExistente) {
      return NextResponse.json({ error: 'Patrimônio não encontrado.' }, { status: 404 });
    }

    const dataAtualizada: any = {};
    if (descricao !== undefined) dataAtualizada.descricao = descricao.trim();
    if (dataEntrada !== undefined) dataAtualizada.dataEntrada = dataEntrada;
    if (origem !== undefined) dataAtualizada.origem = origem.trim();
    if (observacao !== undefined) dataAtualizada.observacao = observacao ? observacao.trim() : null;
    if (localId !== undefined) dataAtualizada.localId = localId;
    if (status !== undefined) dataAtualizada.status = status;

    // Se estiver dando baixa
    if (baixado !== undefined) {
      dataAtualizada.baixado = baixado;
      if (baixado) {
        dataAtualizada.status = 'BAIXADO';
        dataAtualizada.dataBaixa = dataBaixa || new Date().toISOString().split('T')[0];
        dataAtualizada.motivoBaixa = motivoBaixa || 'Inservível / Descarte';
      } else {
        dataAtualizada.status = 'EM_USO';
        dataAtualizada.dataBaixa = null;
        dataAtualizada.motivoBaixa = null;
      }
    }

    const patrimonioAtualizado = await prisma.patrimonio.update({
      where: { codigo },
      data: dataAtualizada,
      include: {
        local: true,
      },
    });

    return NextResponse.json(patrimonioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar patrimônio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar patrimônio' }, { status: 500 });
  }
}

// DELETE /api/patrimonios/[codigo] - Excluir patrimônio
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const patrimonio = await prisma.patrimonio.findUnique({
      where: { codigo },
    });

    if (!patrimonio) {
      return NextResponse.json({ error: 'Patrimônio não encontrado.' }, { status: 404 });
    }

    await prisma.patrimonio.delete({
      where: { codigo },
    });

    return NextResponse.json({ message: `Patrimônio ${codigo} excluído com sucesso.` });
  } catch (error) {
    console.error('Erro ao excluir patrimônio:', error);
    return NextResponse.json({ error: 'Erro ao excluir patrimônio' }, { status: 500 });
  }
}
