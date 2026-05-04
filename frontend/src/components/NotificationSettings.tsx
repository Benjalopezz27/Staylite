import React, { useState } from 'react';

interface ToggleRowProps {
    id: string;
    title: string;
    description?: React.ReactNode;
    initialChecked: boolean;
}

function ToggleRow({ id, title, description, initialChecked }: ToggleRowProps) {
    const [isChecked, setIsChecked] = useState(initialChecked);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        // Simulate a background API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setIsChecked(!isChecked);
        setIsUpdating(false);
    };

    return (
        <div className="flex items-start justify-between py-5 border-b border-border last:border-0">
            <div className="flex-1 pr-6">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                {description && (
                    <div className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </div>
                )}
            </div>
            
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                disabled={isUpdating}
                onClick={handleToggle}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isChecked ? 'bg-primary' : 'bg-muted'}
                `}
            >
                <span className="sr-only">Toggle {title}</span>
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 
                        transition duration-200 ease-in-out flex items-center justify-center
                        ${isChecked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                >
                    {isUpdating && (
                        <svg className="animate-spin h-3 w-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                </span>
            </button>
        </div>
    );
}

export default function NotificationSettings() {
    return (
        <div className="w-full">
            <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-1">Preferencias de Comunicación</h2>
                <p className="text-sm text-muted-foreground mb-6">Elige qué tipo de notificaciones deseas recibir en tu correo electrónico.</p>

                <div className="flex flex-col">
                    <ToggleRow 
                        id="promotions"
                        title="Promociones y ofertas"
                        description="Recibe noticias sobre ofertas exclusivas y paquetes de temporada."
                        initialChecked={true}
                    />
                    
                    <ToggleRow 
                        id="reminders"
                        title="Recordatorios de reserva"
                        description={
                            <div className="space-y-1">
                                <p>Alertas y recordatorios importantes sobre tus próximas estadías.</p>
                                <a href="/bookings" className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors">
                                    Ir a mis reservas
                                    <svg className="ml-1 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        }
                        initialChecked={true}
                    />

                    <ToggleRow 
                        id="new_rooms"
                        title="Nuevas habitaciones o suites añadidas"
                        description="Entérate primero cuando abrimos nuevos espacios o remodelamos nuestras instalaciones."
                        initialChecked={false}
                    />
                </div>
            </div>
        </div>
    );
}
