'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Package,
  MapPin,
  Clock,
  Wrench,
  FileSpreadsheet,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Building2 },
    { name: 'Patrimônio (6 dígitos)', href: '/patrimonios', icon: Package },
    { name: 'Locais / Salas', href: '/locais', icon: MapPin },
    { name: 'Empréstimos', href: '/emprestimos', icon: Clock },
    { name: 'Manutenções', href: '/manutencoes', icon: Wrench },
    { name: 'Relatórios PDF/Excel', href: '/relatorios', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Botão Hambúrguer Mobile (fixo no topo em telas pequenas) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              CE Pedro Rizzi
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Controle Patrimonial
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Abrir menu lateral"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay Escuro Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Barra Lateral (Sidebar) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho da Sidebar / Branding */}
          <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-900/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white leading-tight">
                CE Pedro Rizzi
              </h2>
              <span className="text-xs text-slate-400 font-normal block mt-0.5">
                Controle Patrimonial
              </span>
            </div>
          </div>

          {/* Menu de Navegação Vertical */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Navegação Principal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/' || pathname === ''
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {isActive && <ChevronRight className="h-4 w-4 text-blue-200" />}
                </Link>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
            <p className="text-xs font-semibold text-slate-300">
              Centro Educacional Pedro Rizzi
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Gestão Patrimonial Escolar
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
