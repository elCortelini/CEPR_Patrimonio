'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Package,
  Calculator,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  subscribePatrimonios,
  subscribeEmprestimos,
  subscribeManutencoes,
  getUsuarioAtual,
  Patrimonio,
  Emprestimo,
  Manutencao,
  UsuarioSistema,
} from '@/lib/storage';

export default function PortalHomePage() {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userCurr = getUsuarioAtual();
    setUsuario(userCurr);

    const unsubPats = subscribePatrimonios((pats) => {
      setPatrimonios(pats);
      setLoading(false);
    });

    const unsubEmps = subscribeEmprestimos((emps) => setEmprestimos(emps));
    const unsubMans = subscribeManutencoes((mans) => setManutencoes(mans));

    return () => {
      unsubPats();
      unsubEmps();
      unsubMans();
    };
  }, []);

  const totalPatrimonios = patrimonios.length;
  const emUso = patrimonios.filter((p) => p.status === 'EM_USO' && !p.baixado).length;
  const emprestimosAtivos = emprestimos.filter((e) => e.status === 'ATIVO').length;
  const manutencoesAbertas = manutencoes.filter((m) => m.status !== 'CONCLUIDO').length;

  const sistemas = [
    {
      id: 'patrimonio',
      titulo: 'Controle de Patrimônio Escolar',
      subtitulo: 'Tombamento de 6 dígitos, Salas, Fotos e Baixas',
      descricao:
        'Gestão completa do acervo de bens da escola. Cadastre equipamentos com fotos, controle salas/blocos, movimentações, empréstimos para professores, chamados de manutenção e emita relatórios oficiais em PDF e Excel.',
      icone: Package,
      corIcone: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      corBotao: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30',
      link: '/patrimonios',
      externo: false,
      badge: 'Tempo Real Ativo',
      recursos: [
        'Código de 6 dígitos numéricos',
        'Foto opcional via Câmera/Arquivos',
        'Empréstimos & Chamados de Manutenção',
        'Relatórios em PDF e Excel com timbre escolar',
      ],
    },
    {
      id: 'contabil',
      titulo: 'Gestão Contábil & Financeira',
      subtitulo: 'CEPR-Contábil — Caixa, Entradas e Saídas',
      descricao:
        'Sistema de controle financeiro escolar para prestação de contas, verbas (PDDE, FDE, APMF), receitas de eventos, controle de caixa por categorias e demonstrativos em tempo real.',
      icone: Calculator,
      corIcone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      corBotao: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30',
      link: 'https://elcortelini.github.io/contabilCEPR/',
      externo: true,
      badge: 'Sincronizado na Nuvem',
      recursos: [
        'Entradas e Saídas por carteira',
        'Prestação de contas e categorias',
        'Acesso seguro via Login do Google',
        'Relatórios financeiros consolidados',
      ],
    },
    {
      id: 'agendamento',
      titulo: 'Agenda de Recursos & Salas',
      subtitulo: 'Agenda CEPR — Chromebooks, Lousas e Ambientes',
      descricao:
        'Agendamento online de espaços pedagógicos (Laboratório de Informática, Sala de Vídeo, Biblioteca) e recursos móveis (Carrinhos de Chromebooks, Lousas Digitais e Projetores).',
      icone: CalendarDays,
      corIcone: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      corBotao: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30',
      link: 'https://elcortelini.github.io/agendamento-cepr/',
      externo: true,
      badge: 'Reserva Online',
      recursos: [
        'Agenda por períodos de aula',
        'Reserva de Chromebooks e Lousas Digitais',
        'Bloqueio pré-conselho e eventos',
        'Painel para docentes e coordenação',
      ],
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Banner de Boas-Vindas do Centro Educacional */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Unificado da Gestão Escolar</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Centro Educacional Pedro Rizzi
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bem-vindo ao portal integrado de sistemas da escola. Selecione abaixo a plataforma que deseja acessar para gerenciar o patrimônio, as contas ou o agendamento de salas e recursos.
          </p>

          {usuario && (
            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Usuário Conectado: <strong className="text-white">{usuario.nome}</strong> ({usuario.role})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cartões dos 3 Sistemas Escolares */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-400" />
            Sistemas Disponíveis
          </h2>
          <span className="text-xs text-slate-400">3 Plataformas Conectadas</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sistemas.map((sis) => {
            const IconeComp = sis.icone;
            return (
              <div
                key={sis.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-2xl border ${sis.corIcone}`}>
                      <IconeComp className="h-7 w-7" />
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                      {sis.badge}
                    </span>
                  </div>

                  {/* Títulos e Descrição */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {sis.titulo}
                    </h3>
                    <p className="text-xs text-blue-400 font-medium mt-0.5">{sis.subtitulo}</p>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">{sis.descricao}</p>
                  </div>

                  {/* Lista de Recursos */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    {sis.recursos.map((rec, i) => (
                      <div key={i} className="flex items-center text-[11px] text-slate-300 space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="pt-6 mt-4 border-t border-slate-800">
                  {sis.externo ? (
                    <a
                      href={sis.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${sis.corBotao}`}
                    >
                      <span>Acessar {sis.titulo.split(' ')[0]}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={sis.link}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${sis.corBotao}`}
                    >
                      <span>Acessar {sis.titulo.split(' ')[0]}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Indicadores do Patrimônio Escolar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-400" />
            Resumo Rápido — Patrimônio Escolar
          </h3>
          <Link href="/patrimonios" className="text-xs font-semibold text-blue-400 hover:underline">
            Gerenciar Acervo Completo →
          </Link>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 text-center py-4">Carregando indicadores...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total de Bens</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{totalPatrimonios}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Em Uso nas Salas</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{emUso}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Empréstimos Ativos
              </span>
              <span className="text-xl font-extrabold text-amber-400 mt-1 block">{emprestimosAtivos}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-rose-400" /> Em Manutenção
              </span>
              <span className="text-xl font-extrabold text-rose-400 mt-1 block">{manutencoesAbertas}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
