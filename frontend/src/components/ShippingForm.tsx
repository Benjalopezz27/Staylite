import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, ChevronRight } from 'lucide-react';

interface BookingSummary {
    documentId?: string;
    customerName?: string;
    customerEmail?: string;
    phone?: string;
    notes?: string;
    country?: string;
    city?: string;
    [key: string]: any;
}

export const ShippingForm: React.FC = () => {
    const [summary, setSummary] = useState<BookingSummary | null>(null);
    const [formData, setFormData] = useState({
        phone: '',
        country: '',
        city: '',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("staylite_booking_summary");
        if (raw) {
            const data = JSON.parse(raw);
            setSummary(data);
            setFormData({
                phone: data.phone || '',
                country: data.country || '',
                city: data.city || '',
                notes: data.notes || ''
            });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.phone.trim()) {
            setError("El número de teléfono es obligatorio.");
            return;
        }

        const updatedSummary = {
            ...(summary || {}),
            ...formData
        };
        
        localStorage.setItem("staylite_booking_summary", JSON.stringify(updatedSummary));

        if (summary?.documentId) {
            setIsLoading(true);
            try {
                const res = await fetch("/api/booking-update", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        documentId: summary.documentId,
                        phone: parseInt(formData.phone.replace(/\D/g, ""), 10) || null,
                        notes: formData.notes,
                        country: formData.country,
                        city: formData.city,
                    }),
                });
                
                if (!res.ok) throw new Error("Error al guardar en el servidor");
                
                window.location.href = "/checkout-payment";
            } catch (err) {
                console.error("Update error:", err);
                setError("No se pudieron guardar los datos. Puedes continuar de todos modos.");
                // Still allow to proceed if the update fails but summary is in localStorage
                setTimeout(() => {
                    window.location.href = "/checkout-payment";
                }, 2000);
            } finally {
                setIsLoading(false);
            }
        } else {
            window.location.href = "/checkout-payment";
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            {/* Datos ya conocidos (de Clerk) */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Información Personal</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Nombre completo</label>
                        <input
                            type="text"
                            value={summary?.customerName || ''}
                            readOnly
                            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Correo electrónico</label>
                        <input
                            type="email"
                            value={summary?.customerEmail || ''}
                            readOnly
                            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70"
                        />
                    </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Estos datos se obtienen automáticamente de tu cuenta.
                </p>
            </div>

            <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Datos de Contacto</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
                            Número de Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="+54 11 1234-5678"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="country">País</label>
                            <input
                                id="country"
                                type="text"
                                placeholder="Argentina"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="city">Ciudad</label>
                            <input
                                id="city"
                                type="text"
                                placeholder="Buenos Aires"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <label className="block text-sm font-medium" htmlFor="notes">
                                Solicitudes Especiales <span className="text-muted-foreground font-normal">(opcional)</span>
                            </label>
                        </div>
                        <textarea
                            id="notes"
                            rows={4}
                            placeholder="Ej: Habitación en piso alto, cuna para bebé..."
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                        ></textarea>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? "Guardando..." : "Continuar al Pago"}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
