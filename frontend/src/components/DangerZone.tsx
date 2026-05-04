import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $userStore, $clerkStore } from '@clerk/astro/client';

export default function DangerZone() {
    const user = useStore($userStore);
    const clerk = useStore($clerkStore);
    
    const [isRevoking, setIsRevoking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    useEffect(() => {
        if (isModalOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isModalOpen]);

    const handleSignOutOthers = async () => {
        if (!user || !clerk || !clerk.session) return;
        
        setIsRevoking(true);
        setToast(null);
        
        try {
            const sessions = await user.getSessions();
            const otherSessions = sessions.filter(s => s.id !== clerk.session?.id);
            
            if (otherSessions.length === 0) {
                setToast({ type: 'success', message: 'No tienes otras sesiones activas en este momento.' });
                setIsRevoking(false);
                return;
            }

            for (const session of otherSessions) {
                await session.revoke();
            }
            
            setToast({ type: 'success', message: 'Se han cerrado todas las otras sesiones exitosamente.' });
        } catch (error) {
            console.error("Error revoking sessions:", error);
            setToast({ type: 'error', message: 'Hubo un error al intentar cerrar las otras sesiones.' });
        } finally {
            setIsRevoking(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setConfirmationText('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setConfirmationText('');
    };

    const handleDeleteAccount = async () => {
        if (!user || confirmationText !== 'ELIMINAR') return;

        setIsDeleting(true);
        try {
            await user.delete();
            // Redirect to home after successful deletion
            window.location.href = '/';
        } catch (error) {
            console.error("Error deleting account:", error);
            setToast({ type: 'error', message: 'Ocurrió un error crítico al intentar eliminar la cuenta.' });
            setIsDeleting(false);
            closeModal();
        }
    };

    if (!user) return null;

    return (
        <div className="w-full">
            {toast && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            <div className="p-6 bg-destructive/5 border border-destructive/30 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-1 text-destructive">Zona de Peligro</h2>
                <p className="text-sm text-muted-foreground mb-6">Estas acciones son irreversibles y pueden afectar permanentemente tu acceso a la cuenta.</p>

                <div className="space-y-6">
                    {/* Row 1: Sign out other sessions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-destructive/20">
                        <div className="mb-4 sm:mb-0 pr-4">
                            <h3 className="font-medium text-foreground">Cerrar otras sesiones</h3>
                            <p className="text-sm text-muted-foreground mt-1">Cierra la sesión en todos los demás dispositivos y navegadores web. Mantendrás la sesión abierta aquí.</p>
                        </div>
                        <button
                            onClick={handleSignOutOthers}
                            disabled={isRevoking}
                            className="shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-muted h-10 px-4 py-2"
                        >
                            {isRevoking ? 'Cerrando...' : 'Cerrar otras sesiones'}
                        </button>
                    </div>

                    {/* Row 2: Delete Account */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
                        <div className="mb-4 sm:mb-0 pr-4">
                            <h3 className="font-medium text-foreground">Eliminar cuenta</h3>
                            <p className="text-sm text-muted-foreground mt-1">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.</p>
                        </div>
                        <button
                            onClick={openModal}
                            className="shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            </div>

            {/* Accessible Confirmation Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-lg border border-border">
                        <h2 id="modal-title" className="text-xl font-bold text-foreground mb-4">¿Estás absolutamente seguro?</h2>
                        
                        <div className="text-sm text-muted-foreground space-y-3 mb-6">
                            <p>
                                Esta acción <strong>no se puede deshacer</strong>. Esto eliminará permanentemente tu cuenta y removerá todos los datos asociados de nuestros servidores.
                            </p>
                            <p>
                                Por favor escribe <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-semibold">ELIMINAR</span> para confirmar.
                            </p>
                        </div>

                        <div className="mb-6">
                            <input
                                ref={inputRef}
                                type="text"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                placeholder="Escribe ELIMINAR"
                                aria-label="Confirmación de eliminación"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-muted h-10 px-4 py-2"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={confirmationText !== 'ELIMINAR' || isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                            >
                                {isDeleting ? 'Destruyendo...' : 'Destruir Cuenta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
