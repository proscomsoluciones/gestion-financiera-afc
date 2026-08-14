import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center border-l-4 py-2.5 pe-4 ps-4 text-sm font-bold transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-extrabold'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
