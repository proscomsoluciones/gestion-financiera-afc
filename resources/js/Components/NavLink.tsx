import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-3.5 py-2 text-sm font-extrabold transition-all rounded-xl ' +
                (active
                    ? 'bg-emerald-50 text-emerald-900 border-2 border-emerald-600/30 shadow-2xs font-black'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
