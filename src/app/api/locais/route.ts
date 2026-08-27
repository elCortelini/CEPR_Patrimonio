import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/locais - Listar todos os locais com contagem de patrimônios
export async function GET() {
  try {
    const locais = await prisma.local.findMany({
      include: {
        _count: {
          select: {
            patrimonios: true,
            consumiveis: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(locais);
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    return NextResponse.json({ error: 'Erro ao buscar locais' }, { status: 500 });
  }
}

// POST /api/locais - Cadastrar novo local / sala
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, bloco, descricao } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'O nome do local é obrigatório.' }, { status: 400 });
    }

    const nomeFormatado = nome.trim();

    const existente = await prisma.local.findUnique({
      where: { nome: nomeFormatado },
    });

    if (existente) {
      return NextResponse.json(
        { error: `Já existe um local cadastrado com o nome "${nomeFormatado}".` },
        { status: 400 }
      );
    }

    const novoLocal = await prisma.local.create({
      data: {
        nome: nomeFormatado,
        bloco: bloco ? bloco.trim() : null,
        descricao: descricao ? descricao.trim() : null,
      },
    });

    return NextResponse.json(novoLocal, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar local:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar local' }, { status: 500 });
  }
}
