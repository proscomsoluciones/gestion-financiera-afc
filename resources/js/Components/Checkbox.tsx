import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-slate-300 text-emerald-600 shadow-xs focus:ring-emerald-500 ' +
                className
            }
        />
    );
}
