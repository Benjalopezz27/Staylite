import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialization outside component lifecycle
// We use import.meta.env for Astro/Vite. Fallback for testing/safety.
const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_KEY || 'pk_test_placeholder');

interface PaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'generic';
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
}

interface BillingRecord {
    id: string;
    date: string;
    reservationId: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
}

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2026, isDefault: true },
    { id: 'pm_2', brand: 'mastercard', last4: '5555', expMonth: 8, expYear: 2027, isDefault: false },
];

const INITIAL_BILLING_HISTORY: BillingRecord[] = [
    { id: 'inv_1', date: '2026-05-01', reservationId: 'RES-001', amount: 450.00, status: 'paid' },
    { id: 'inv_2', date: '2026-04-15', reservationId: 'RES-002', amount: 320.50, status: 'paid' },
    { id: 'inv_3', date: '2026-03-10', reservationId: 'RES-003', amount: 150.00, status: 'paid' },
];

// Sub-component for the actual Add Card form
function AddCardForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: (pm: PaymentMethod) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeError, setStripeError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setStripeError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setIsProcessing(false);
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setStripeError(error.message || 'Hubo un error al procesar la tarjeta.');
            setIsProcessing(false);
        } else if (paymentMethod) {
            // Mock backend persistence and update local state
            const newMethod: PaymentMethod = {
                id: paymentMethod.id,
                brand: (paymentMethod.card?.brand as 'visa' | 'mastercard' | 'amex' | 'generic') || 'generic',
                last4: paymentMethod.card?.last4 || '0000',
                expMonth: paymentMethod.card?.exp_month || 12,
                expYear: paymentMethod.card?.exp_year || 2099,
                isDefault: false
            };
            onSuccess(newMethod);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-border rounded-lg bg-muted/20">
            <h3 className="text-sm font-medium mb-4">Detalles de la tarjeta</h3>
            <div className="p-3 bg-background border border-input rounded-md shadow-sm">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '14px',
                                color: '#1a1a1a', 
                                '::placeholder': {
                                    color: '#a1a1aa',
                                },
                                fontFamily: 'Inter, system-ui, sans-serif',
                            },
                            invalid: {
                                color: '#ef4444',
                                iconColor: '#ef4444',
                            },
                        },
                    }} 
                />
            </div>
            
            {stripeError && (
                <div className="mt-2 text-sm text-destructive font-medium">
                    {stripeError}
                </div>
            )}

            <div className="mt-4 flex justify-end space-x-2">
                <button 
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-muted disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        'Guardar Tarjeta'
                    )}
                </button>
            </div>
        </form>
    );
}

export default function BillingSettings() {
    const [savedCards, setSavedCards] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
    const [billingHistory] = useState<BillingRecord[]>(INITIAL_BILLING_HISTORY);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleDeleteMethod = async (id: string) => {
        // Mock API call to remove payment method
        console.log("Removing payment method via API:", id);
        setSavedCards(prev => prev.filter(pm => pm.id !== id));
        setActiveMenu(null);
    };

    const handleSetDefault = async (id: string) => {
        // Mock API call to set default payment method
        console.log("Setting default payment method via API:", id);
        setSavedCards(prev => prev.map(pm => ({
            ...pm,
            isDefault: pm.id === id
        })));
        setActiveMenu(null);
    };

    const handleAddSuccess = (newMethod: PaymentMethod) => {
        // Automatically make it default if it's the first card
        if (savedCards.length === 0) {
            newMethod.isDefault = true;
        }
        setSavedCards(prev => [...prev, newMethod]);
        setIsAddingCard(false);
    };

    const getBrandIcon = (brand: string) => {
        switch(brand) {
            case 'visa':
                return <svg className="h-8 w-12 text-primary" viewBox="0 0 48 32" fill="currentColor"><path d="M16.9 21.4l3.1-13.6h4.9L21.7 21.4h-4.8zM29.8 13.9c0-3.3 4.9-3.4 4.9-5 .0-.6-.5-1.1-1.6-1.3-1.1-.2-2.8.2-4 1V4.8c1.3-.4 3.1-.7 5.2-.7 5.1 0 8.6 2.5 8.6 6.3.0 4.6-6.4 4.8-6.4 6.7.0.7.7 1.4 2 1.6 1.3.2 2.7-.2 4-.8v4c-1.3.6-3 .9-4.8.9-5.3-.1-8.9-2.5-8.9-6.9zM15.4 7.9c-1-.5-2.2-.8-3.4-.8-3.9 0-6.6 2.1-6.6 5 0 2.2 2 3.4 3.5 4.1 1.6.7 2.1 1.2 2.1 1.9.0 1.1-1.3 1.6-2.5 1.6-1.7 0-2.8-.3-4-.8v4.2c1.3.6 3 .9 4.8.9 4 0 6.6-2 6.6-5.1.0-2.5-2.5-3.6-3.7-4.2-1.3-.6-2.1-1-2.1-1.7.0-.9 1-1.6 2.3-1.6 1.3 0 2.4.3 3.5.8L15.4 7.9zm-2.7 0L10.3 18.2c-.3 1.1-1.4 2.8-3.4 3.2L1 21.4c-.2 0-.3-.1-.2-.3l1.9-4.9c0 0 3.3-8.4 3.6-9.1.2-.6.7-1 1.3-1h5.1z"/></svg>;
            case 'mastercard':
                return <svg className="h-8 w-12" viewBox="0 0 48 32"><circle cx="17.5" cy="16" r="10.5" fill="#EB001B" /><circle cx="30.5" cy="16" r="10.5" fill="#F79E1B" /><path d="M24 23.4c-1.9-2-3-4.5-3-7.4s1.1-5.4 3-7.4c1.9 2 3 4.5 3 7.4s-1.1 5.4-3 7.4z" fill="#FF5F00" /></svg>;
            default:
                return <svg className="h-8 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* Payment Methods Card */}
            <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-1">Métodos de Pago</h2>
                <p className="text-sm text-muted-foreground mb-6">Administra las tarjetas que usas para tus reservas.</p>

                <div className="space-y-4">
                    {savedCards.map((pm) => (
                        <div key={pm.id} className="relative flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-muted rounded flex items-center justify-center">
                                    {getBrandIcon(pm.brand)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Termina en •••• {pm.last4}</p>
                                    <p className="text-xs text-muted-foreground">Expira {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}</p>
                                </div>
                                {pm.isDefault && (
                                    <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                        Principal
                                    </span>
                                )}
                            </div>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setActiveMenu(activeMenu === pm.id ? null : pm.id)}
                                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>

                                {activeMenu === pm.id && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border ring-1 ring-black ring-opacity-5 z-10">
                                        <div className="py-1">
                                            {!pm.isDefault && (
                                                <button 
                                                    onClick={() => handleSetDefault(pm.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                                                >
                                                    Marcar principal
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteMethod(pm.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isAddingCard ? (
                        <Elements stripe={stripePromise}>
                            <AddCardForm 
                                onCancel={() => setIsAddingCard(false)} 
                                onSuccess={handleAddSuccess} 
                            />
                        </Elements>
                    ) : (
                        <button 
                            onClick={() => setIsAddingCard(true)}
                            className="w-full py-4 flex items-center justify-center border border-border border-dashed rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Añadir nueva tarjeta
                        </button>
                    )}
                </div>
            </div>

            {/* Billing History Card */}
            <div className="p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-1">Historial de Facturación</h2>
                <p className="text-sm text-muted-foreground mb-6">Descarga tus recibos y revisa tus pagos anteriores.</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">ID de Reserva</th>
                                <th className="px-4 py-3 font-medium">Monto</th>
                                <th className="px-4 py-3 font-medium text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingHistory.map((record) => (
                                <tr key={record.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        {new Date(record.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{record.reservationId}</td>
                                    <td className="px-4 py-3 font-medium">
                                        ${record.amount.toFixed(2)} USD
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex" title="Descargar PDF">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {billingHistory.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            No hay historial de facturación disponible.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
