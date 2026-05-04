import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $userStore, $clerkStore } from '@clerk/astro/client';

const OAUTH_PROVIDERS = [
    { strategy: 'oauth_google', name: 'Google', icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
    ) },
    { strategy: 'oauth_apple', name: 'Apple', icon: (
        <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.59.7 3.36.7.74 0 2.22-.84 3.86-.71 1.54.12 2.89.69 3.77 1.88-3.14 1.76-2.63 5.86.35 7.21-.73 1.83-1.74 3.35-3.34 3.89zm-2.83-14.4c.5-1.49-.39-3.26-2.05-3.88-.47 1.63.49 3.33 2.05 3.88z"/></svg>
    ) }
];

export default function SecuritySettings() {
    const user = useStore($userStore);
    const clerk = useStore($clerkStore);
    const isLoaded = clerk !== undefined;

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setToast(null);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setToast({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' });
            return;
        }

        if (passwords.newPassword.length < 8) {
            setToast({ type: 'error', message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
            return;
        }

        setIsSubmitting(true);

        try {
            await user.updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setToast({ type: 'success', message: 'Contraseña actualizada exitosamente.' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error("Error updating password:", error);
            const msg = error.errors?.[0]?.message || 'Ocurrió un error al actualizar la contraseña. Verifica tu contraseña actual.';
            setToast({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setToast(null), 5000);
        }
    };

    const linkAccount = async (strategy: string) => {
        if (!user) return;
        try {
            const account = await user.createExternalAccount({ strategy: strategy as any, redirectUrl: window.location.href });
            if (account.verification?.status === 'unverified' && account.verification.externalVerificationRedirectURL) {
               window.location.href = account.verification.externalVerificationRedirectURL.href;
            }
        } catch (error: any) {
            console.error("Error linking account:", error);
            setToast({ type: 'error', message: 'No se pudo vincular la cuenta.' });
        }
    };

    const unlinkAccount = async (accountId: string) => {
         if (!user) return;
         try {
             const account = user.externalAccounts.find(a => a.id === accountId);
             if (account) {
                 await account.destroy();
                 setToast({ type: 'success', message: 'Cuenta desvinculada exitosamente.' });
             }
         } catch (error) {
            console.error("Error unlinking account:", error);
            setToast({ type: 'error', message: 'No se pudo desvincular la cuenta.' });
         }
    };

    if (!isLoaded) {
        return (
            <div className="w-full p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border animate-pulse">
                <div className="h-8 w-48 bg-muted rounded mb-6"></div>
                <div className="space-y-4">
                    <div className="h-10 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; 
    }

    return (
        <div className="w-full space-y-8">
            
            {toast && (
                <div className={`p-4 rounded-md text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            {/* Password Card */}
            <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-1">Contraseña</h2>
                <p className="text-sm text-muted-foreground mb-6">Actualiza tu contraseña para mantener tu cuenta segura.</p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Nueva Contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Confirmar Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>

            {/* OAuth Connections Card */}
            <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-1">Cuentas Vinculadas</h2>
                <p className="text-sm text-muted-foreground mb-6">Conecta otras cuentas para iniciar sesión más rápido.</p>

                <div className="space-y-4">
                    {OAUTH_PROVIDERS.map((provider) => {
                        const connectedAccount = user.externalAccounts.find(
                            (acc) => acc.verification?.strategy === provider.strategy
                        );

                        return (
                            <div key={provider.strategy} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-muted rounded-full">
                                        {provider.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium">{provider.name}</p>
                                        {connectedAccount ? (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Conectado
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No conectado</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {connectedAccount ? (
                                        <button
                                            onClick={() => unlinkAccount(connectedAccount.id)}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground text-destructive h-9 px-4"
                                        >
                                            Desvincular
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => linkAccount(provider.strategy)}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
                                        >
                                            Conectar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
