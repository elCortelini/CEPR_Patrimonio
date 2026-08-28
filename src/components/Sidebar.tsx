'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Lock,
  Globe,
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '@/lib/firebase';
import { registrarOuAtualizarUsuario, getUsuarioAtual, setUsuarioAtual, UsuarioSistema } from '@/lib/storage';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const cached = getUsuarioAtual();
    if (cached) setUsuario(cached);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fullUser = await registrarOuAtualizarUsuario({
          uid: user.uid,
          email: user.email || 'usuario@escola.gov.br',
          nome: user.displayName || 'Usuário Escola',
          fotoUrl: user.photoURL,
        });
        setUsuario(fullUser);
      } else {
        setUsuario(null);
        setUsuarioAtual(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLoginGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Erro ao fazer login com Google:', e);
      alert('Não foi possível realizar o login com o Google.');
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setUsuario(null);
      setUsuarioAtual(null);
    } catch (e) {
      console.error('Erro ao sair:', e);
    }
  }

  const baseNavItems = [
    { name: 'Portal de Sistemas', href: '/', icon: Globe },
    { name: 'Patrimônio (6 dígitos)', href: '/patrimonios', icon: Package },
    { name: 'Locais / Salas', href: '/locais', icon: MapPin },
    { name: 'Empréstimos', href: '/emprestimos', icon: Clock },
    { name: 'Manutenções', href: '/manutencoes', icon: Wrench },
    { name: 'Relatórios PDF/Excel', href: '/relatorios', icon: FileSpreadsheet },
  ];

  const adminNavItems = [
    { name: 'Auditoria & Acessos', href: '/auditoria', icon: ShieldCheck },
  ];

  const navItems = usuario?.role === 'ADMIN' ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <>
      {/* Botão Hambúrguer Mobile (fixo no topo) */}
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
              Portal de Sistemas
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
                Portal de Sistemas
              </span>
            </div>
          </div>

          {/* Cartão de Perfil do Usuário Logado */}
          <div className="p-3 mx-3 mt-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            {loadingAuth ? (
              <div className="text-xs text-slate-500 text-center py-2">Carregando perfil...</div>
            ) : usuario ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  {usuario.fotoUrl ? (
                    <img src={usuario.fotoUrl} alt={usuario.nome} className="w-8 h-8 rounded-full shrink-0 border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {usuario.nome.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{usuario.nome}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                      usuario.role === 'ADMIN' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {usuario.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginGoogle}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all shadow-sm"
              >
                <UserIcon className="h-4 w-4" />
                <span>Entrar com Google</span>
              </button>
            )}
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
              Portal Unificado de Gestão
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay Bloqueador de Tela se não estiver logado */}
      {!loadingAuth && !usuario && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl space-y-6">
            <div className="bg-blue-600/20 text-blue-400 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border border-blue-500/30">
              <Lock className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Acesso Restrito ao Sistema</h2>
              <p className="text-sm text-slate-400 mt-2">
                Centro Educacional Pedro Rizzi
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Por favor, faça login com sua conta do Google para acessar o Portal de Sistemas.
              </p>
            </div>

            <button
              onClick={handleLoginGoogle}
              className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.58 3.474-3.528 5.926-6.887 5.926-4.12 0-7.462-3.342-7.462-7.462s3.342-7.462 7.462-7.462c1.862 0 3.555.69 4.858 1.832l2.427-2.427C17.65 2.378 15.116 1.5 12.24 1.5 6.467 1.5 1.782 6.185 1.782 11.96s4.685 10.46 10.458 10.46c6.14 0 10.222-4.316 10.222-10.4 0-.712-.075-1.232-.17-1.735H12.24z" />
              </svg>
              <span>Entrar com Conta do Google</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
