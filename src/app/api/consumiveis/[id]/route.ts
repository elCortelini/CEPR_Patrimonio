import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/consumiveis/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.consumivel.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Item excluído do estoque com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir consumível:', error);
    return NextResponse.json({ error: 'Erro ao excluir consumível' }, { status: 500 });
  }
}
