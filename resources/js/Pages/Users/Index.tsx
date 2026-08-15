import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Spinner from '@/Components/Spinner';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: string | null;
    created_at: string;
}

interface IndexProps {
    users: UserRow[];
    roles: string[];
    flash: {
        success?: string;
    };
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrador',
    tesorero: 'Tesorero',
    lectura: 'Solo Lectura',
};

const ROLE_STYLES: Record<string, string> = {
    admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tesorero: 'bg-sky-50 text-sky-700 border-sky-200',
    lectura: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Index({ users, roles, flash }: IndexProps) {
    const currentUserId = usePage().props.auth.user.id;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<UserRow | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: roles[0] || '',
    });

    useEffect(() => {
        if (editing) {
            setData({
                name: editing.name,
                email: editing.email,
                password: '',
                role: editing.role || roles[0] || '',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing]);

    const openCreate = () => {
        setEditing(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEdit = (user: UserRow) => {
        setEditing(user);
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        clearErrors();
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editing) {
            put(route('users.update', editing.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (user: UserRow) => {
        if (confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) {
            setDeletingId(user.id);
            router.delete(route('users.destroy', user.id), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Gestión de Usuarios
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            Cuentas de acceso al sistema financiero y sus roles
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition shrink-0"
                    >
                        <span>+</span>
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            }
        >
            <Head title="Usuarios - Gestión Financiera AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 space-y-6 sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-200">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-6">Usuario</th>
                                        <th className="py-3.5 px-6">Rol</th>
                                        <th className="py-3.5 px-6 text-center">Estado</th>
                                        <th className="py-3.5 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-xs">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {user.name}
                                                            {user.id === currentUserId && (
                                                                <span className="ml-2 text-[10px] font-bold text-emerald-600">(Tú)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs font-semibold text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${ROLE_STYLES[user.role || ''] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {ROLE_LABELS[user.role || ''] || 'Sin rol'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                        Verificado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                                                        title="Editar Usuario"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {user.id !== currentUserId && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            disabled={deletingId === user.id}
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                                                            title="Eliminar Usuario"
                                                        >
                                                            {deletingId === user.id ? (
                                                                <Spinner className="h-4 w-4" />
                                                            ) : (
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {editing ? `Editar Usuario: ${editing.name}` : 'Nuevo Usuario'}
                            </h2>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {editing ? 'Modifica los permisos y datos del usuario' : 'Ingresa la información para crear un nuevo usuario'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre Completo" />
                            <TextInput
                                id="name"
                                className="mt-1.5 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Correo Electrónico" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1.5 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="ejemplo@afc.cl"
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={editing ? 'Nueva Contraseña (opcional)' : 'Contraseña'} />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1.5 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={editing ? 'Dejar en blanco para no cambiar' : '••••••••'}
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Rol de Usuario" />
                            <div className="relative mt-1.5">
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer appearance-none pr-10"
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {ROLE_LABELS[role] || role}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <InputError message={errors.role} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 bg-slate-50/60 px-6 py-4 border-t border-slate-100 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-2xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {processing && <Spinner />}
                            {processing ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
