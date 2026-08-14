import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-md shadow-emerald-500/20">
                <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-7.5l3-3 3 3m-6 6l3 3 3-3M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z"
                    />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                    Tesorería<span className="text-emerald-600">Deportiva</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Gestión Financiera & Arcas
                </span>
            </div>
        </div>
    );
}
