import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl bg-rose-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 transition-all ${
                    disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.98]'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
