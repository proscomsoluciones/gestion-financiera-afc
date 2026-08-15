import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import usePermissions from '@/hooks/usePermissions';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { can } = usePermissions();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
            {/* Top Bar Navigation */}
            <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-3 lg:gap-6">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('dashboard')}>
                                    <ApplicationLogo />
                                </Link>
                            </div>

                            {/* Desktop Links (1024px+) */}
                            <div className="hidden space-x-1 lg:flex lg:items-center lg:space-x-2">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    <span className="mr-1.5">🏠</span>
                                    <span>Panel Principal</span>
                                </NavLink>
                                {can('transactions.view') && (
                                    <NavLink
                                        href={route('transactions.index')}
                                        active={route().current('transactions.*')}
                                    >
                                        <span className="mr-1.5">💳</span>
                                        <span>Tesorería & Caja</span>
                                    </NavLink>
                                )}
                                {can('clubs.view') && (
                                    <NavLink
                                        href={route('clubs.index')}
                                        active={route().current('clubs.*')}
                                    >
                                        <span className="mr-1.5">🛡️</span>
                                        <span>Clubes</span>
                                    </NavLink>
                                )}
                                {can('reports.view') && (
                                    <NavLink
                                        href={route('reports.index')}
                                        active={route().current('reports.*')}
                                    >
                                        <span className="mr-1.5">📊</span>
                                        <span>Reportes & Libros</span>
                                    </NavLink>
                                )}
                                {can('settings.manage') && (
                                    <NavLink
                                        href={route('settings.index')}
                                        active={route().current('settings.*')}
                                    >
                                        <span className="mr-1.5">⚙️</span>
                                        <span>Tarifas & Valores</span>
                                    </NavLink>
                                )}
                                {can('users.manage') && (
                                    <NavLink
                                        href={route('users.index')}
                                        active={route().current('users.*')}
                                    >
                                        <span className="mr-1.5">👥</span>
                                        <span>Usuarios</span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* User Dropdown Profile (1024px+) */}
                        <div className="hidden lg:flex lg:items-center lg:ms-6">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                                            >
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.name}</span>

                                                <svg
                                                    className="ms-1 h-4 w-4 text-slate-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="56">
                                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Conectado como</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            👤 Mi Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50"
                                        >
                                            🚪 Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger Button for Mobile & Tablet (< 1024px) */}
                        <div className="-me-2 flex items-center lg:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile & Tablet Navigation Menu (< 1024px) */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' lg:hidden border-t border-slate-100 bg-white'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            🏠 Panel Principal
                        </ResponsiveNavLink>
                        {can('transactions.view') && (
                            <ResponsiveNavLink
                                href={route('transactions.index')}
                                active={route().current('transactions.*')}
                            >
                                💳 Tesorería & Caja
                            </ResponsiveNavLink>
                        )}
                        {can('clubs.view') && (
                            <ResponsiveNavLink
                                href={route('clubs.index')}
                                active={route().current('clubs.*')}
                            >
                                🛡️ Clubes
                            </ResponsiveNavLink>
                        )}
                        {can('reports.view') && (
                            <ResponsiveNavLink
                                href={route('reports.index')}
                                active={route().current('reports.*')}
                            >
                                📊 Reportes & Libros
                            </ResponsiveNavLink>
                        )}
                        {can('settings.manage') && (
                            <ResponsiveNavLink
                                href={route('settings.index')}
                                active={route().current('settings.*')}
                            >
                                ⚙️ Tarifas & Valores
                            </ResponsiveNavLink>
                        )}
                        {can('users.manage') && (
                            <ResponsiveNavLink
                                href={route('users.index')}
                                active={route().current('users.*')}
                            >
                                👥 Usuarios
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pb-3 pt-4">
                        <div className="px-4">
                            <div className="text-base font-bold text-slate-800">
                                {user.name}
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                👤 Mi Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                🚪 Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            {header && (
                <header className="border-b border-slate-200/60 bg-white shadow-2xs">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
