import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $userStore, $clerkStore } from '@clerk/astro/client';

export default function ProfileSettings() {
    const user = useStore($userStore);
    const clerk = useStore($clerkStore);
    const isLoaded = clerk !== undefined;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                birthDate: (user.unsafeMetadata?.birthDate as string) || (user.publicMetadata?.birthDate as string) || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isDirty =
        user &&
        (formData.firstName !== (user.firstName || '') ||
            formData.lastName !== (user.lastName || '') ||
            formData.birthDate !== ((user.unsafeMetadata?.birthDate as string) || (user.publicMetadata?.birthDate as string) || ''));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isDirty || !user) return;

        setIsSubmitting(true);
        setToast(null);

        try {
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName,
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    birthDate: formData.birthDate,
                },
            });

            setToast({ type: 'success', message: 'Perfil actualizado correctamente.' });

            // Auto-dismiss toast
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ type: 'error', message: 'Hubo un error al actualizar el perfil.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border animate-pulse">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-muted rounded"></div>
                        <div className="h-4 w-48 bg-muted rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-20 bg-muted rounded"></div>
                            <div className="h-10 w-full bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <p className="text-center text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
            </div>
        );
    }

    const primaryEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';

    return (
        <div className="w-full space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Configuración de Perfil</h2>

            {toast && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                    <div className="relative group cursor-pointer">
                        <img
                            src={user.imageUrl}
                            alt="Avatar del usuario"
                            className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white font-medium">Actualizar</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{user.fullName}</h3>
                        <p className="text-sm text-muted-foreground">Administra tu información personal</p>
                    </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Apellido
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Tu apellido"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="birthDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Fecha de Nacimiento
                        </label>
                        <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Correo Electrónico
                            </label>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Verificado por Clerk
                            </span>
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={primaryEmail}
                            disabled
                            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
