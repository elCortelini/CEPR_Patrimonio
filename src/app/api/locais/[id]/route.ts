import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/locais/[id] - Editar local
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, bloco, descricao } = body;

    const localExistente = await prisma.local.findUnique({
      where: { id },
    });

    if (!localExistente) {
      return NextResponse.json({ error: 'Local não encontrado.' }, { status: 404 });
    }

    const localAtualizado = await prisma.local.update({
      where: { id },
      data: {
        nome: nome ? nome.trim() : localExistente.nome,
        bloco: bloco !== undefined ? (bloco ? bloco.trim() : null) : localExistente.bloco,
        descricao: descricao !== undefined ? (descricao ? descricao.trim() : null) : localExistente.descricao,
      },
    });

    return NextResponse.json(localAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    return NextResponse.json({ error: 'Erro ao atualizar local' }, { status: 500 });
  }
}

// DELETE /api/locais/[id] - Excluir local
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se existem patrimônios vinculados
    const count = await prisma.patrimonio.count({
      where: { localId: id },
    });

    if (count > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir este local pois existem ${count} patrimônios vinculados a ele.` },
        { status: 400 }
      );
    }

    await prisma.local.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Local excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir local:', error);
    return NextResponse.json({ error: 'Erro ao excluir local' }, { status: 500 });
  }
}
