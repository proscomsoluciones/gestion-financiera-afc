import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Crear Cuenta - Gestión Financiera AFC" />

            <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Crear Cuenta
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Regístrate para acceder al panel de gestión financiera
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nombre Completo" className="text-slate-700 font-semibold" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1.5 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Juan Pérez"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" className="text-slate-700 font-semibold" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="usuario@afcfinanzas.com"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Contraseña" className="text-slate-700 font-semibold" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                        className="text-slate-700 font-semibold"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1.5 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5 text-xs text-rose-500"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Registrando...' : 'Registrar Cuenta'}
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center text-xs text-slate-500">
                    ¿Ya tienes una cuenta registrada?{' '}
                    <Link
                        href={route('login')}
                        className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
