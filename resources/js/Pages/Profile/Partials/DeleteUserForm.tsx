import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-extrabold text-slate-900">
                    Eliminar Cuenta
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-500">
                    Una vez que tu cuenta sea eliminada, todos sus recursos y datos serán borrados permanentemente. Antes de borrar tu cuenta, por favor descarga cualquier dato o información que desees conservar.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Eliminar Cuenta
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                ¿Eliminar tu cuenta definitivamente?
                            </h2>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Esta acción es irreversible y eliminará todos tus datos
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
                        <p className="text-xs font-medium text-slate-600">
                            Por favor ingresa tu contraseña actual para confirmar que deseas eliminar tu cuenta de forma permanente.
                        </p>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Contraseña de Confirmación"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1.5 block w-full"
                                isFocused
                                placeholder="Ingresa tu contraseña"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 bg-slate-50/60 px-6 py-4 border-t border-slate-100 rounded-b-2xl">
                        <SecondaryButton onClick={closeModal}>
                            Cancelar
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Sí, Eliminar Cuenta
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
