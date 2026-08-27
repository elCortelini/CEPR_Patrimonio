import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patrimonios - Listar patrimônios com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const localId = searchParams.get('localId') || '';
    const status = searchParams.get('status') || '';
    const baixado = searchParams.get('baixado');

    const where: any = {};

    if (search) {
      where.OR = [
        { codigo: { contains: search } },
        { descricao: { contains: search } },
        { origem: { contains: search } },
        { observacao: { contains: search } },
      ];
    }

    if (localId && localId !== 'TODOS') {
      where.localId = localId;
    }

    if (status && status !== 'TODOS') {
      where.status = status;
    }

    if (baixado === 'true') {
      where.baixado = true;
    } else if (baixado === 'false') {
      where.baixado = false;
    }

    const patrimonios = await prisma.patrimonio.findMany({
      where,
      include: {
        local: true,
      },
      orderBy: {
        codigo: 'asc',
      },
    });

    return NextResponse.json(patrimonios);
  } catch (error) {
    console.error('Erro ao buscar patrimônios:', error);
    return NextResponse.json({ error: 'Erro ao buscar patrimônios' }, { status: 500 });
  }
}

// POST /api/patrimonios - Criar patrimônio com código numérico de 6 dígitos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { codigo, descricao, dataEntrada, origem, observacao, localId } = body;

    if (!codigo || !descricao || !dataEntrada || !origem || !localId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos: código, descrição, data de entrada, origem e local.' },
        { status: 400 }
      );
    }

    // Limpar e formatar código para 6 dígitos numéricos
    codigo = String(codigo).trim().padStart(6, '0');

    // Validação estrita de 6 dígitos numéricos
    if (!/^\d{6}$/.test(codigo)) {
      return NextResponse.json(
        { error: 'O código de patrimônio deve ser exatamente de 6 dígitos numéricos (ex: 000123).' },
        { status: 400 }
      );
    }

    // Verificar se já existe um patrimônio com este código
    const existente = await prisma.patrimonio.findUnique({
      where: { codigo },
    });

    if (existente) {
      return NextResponse.json(
        { error: `Já existe um patrimônio cadastrado com o número ${codigo}.` },
        { status: 400 }
      );
    }

    const novoPatrimonio = await prisma.patrimonio.create({
      data: {
        codigo,
        descricao: descricao.trim(),
        dataEntrada,
        origem: origem.trim(),
        observacao: observacao ? observacao.trim() : null,
        localId,
        status: 'EM_USO',
        baixado: false,
      },
      include: {
        local: true,
      },
    });

    return NextResponse.json(novoPatrimonio, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar patrimônio:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar patrimônio' }, { status: 500 });
  }
}
