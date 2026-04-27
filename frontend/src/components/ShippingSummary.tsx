import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface BookingSummary {
    bookingCode?: string;
    roomName?: string;
    checkIn?: string;
    checkOut?: string;
    noOfRooms?: number;
    adults?: number;
    childrens?: number;
    totalPrice?: number;
}

export const ShippingSummary: React.FC = () => {
    const [summary, setSummary] = useState<BookingSummary | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("staylite_booking_summary");
        if (raw) {
            setSummary(JSON.parse(raw));
        }
    }, []);

    const fmtDate = (iso: string | undefined) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const fmtPrice = (val: number | undefined) => {
        if (val === undefined || val === null) return "—";
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(val);
    };

    if (!summary) return null;

    return (
        <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
            <h2 className="text-lg font-semibold mb-5 pb-4 border-b border-border">
                Tu Reserva
            </h2>

            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                    Código de Reserva
                </p>
                <p className="text-lg font-bold tracking-widest text-primary">
                    {summary.bookingCode || "—"}
                </p>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitación</span>
                    <span className="font-medium text-right max-w-[140px] truncate">
                        {summary.roomName || "—"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{fmtDate(summary.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{fmtDate(summary.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitaciones</span>
                    <span className="font-medium">{summary.noOfRooms || 1}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Huéspedes</span>
                    <span className="font-medium">
                        {summary.adults || 1} adultos{summary.childrens && summary.childrens > 0 ? `, ${summary.childrens} niños` : ""}
                    </span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-border flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">{fmtPrice(summary.totalPrice)}</span>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                Datos protegidos y encriptados
            </div>
        </div>
    );
};
