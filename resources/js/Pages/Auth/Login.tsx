import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión - Gestión Financiera" />

            <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Iniciar Sesión
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Ingresa tus credenciales para acceder al sistema financiero
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" className="text-slate-700 font-semibold" />

                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="ejemplo@tesoreriadeportiva.cl"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>

                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Contraseña" className="text-slate-700 font-semibold" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.97 8.97 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2.5 text-xs font-medium text-slate-600">
                            Recordarme en este equipo
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Accediendo...' : 'Iniciar Sesión'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
