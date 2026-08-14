import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-emerald-600/20 transition duration-150 ease-in-out hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:from-emerald-700 active:to-teal-700 ${
                    disabled && 'opacity-30 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
