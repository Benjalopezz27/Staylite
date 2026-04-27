import React, { useEffect, useState } from 'react';
import { getUserBookings } from '@/services/bookingData';
import { BookingCard } from './bookingCard';
import type { BookingSummary } from './bookingCard';
import { CalendarX2, Loader2 } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

export default function BookingsList() {
    const user = useStore($userStore);
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const email = user?.primaryEmailAddress?.emailAddress;
                const data = await getUserBookings(email);
                if (!cancelled) setBookings(data as BookingSummary[]);
            } catch (e: any) {
                if (!cancelled) setError('No pudimos cargar tus reservas. Intenta recargar la página.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [user]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Cargando tus reservas...</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <CalendarX2 className="w-12 h-12 text-destructive/60" />
                <p className="text-muted-foreground">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-primary underline underline-offset-4"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // ── Empty ────────────────────────────────────────────────────────────────
    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarX2 className="w-10 h-10 text-primary/60" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-lg mb-1">No tienes reservas aún</p>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Explora nuestras habitaciones y haz tu primera reserva.
                    </p>
                </div>
                <a
                    href="/rooms"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition active:scale-95"
                >
                    Ver Habitaciones
                </a>
            </div>
        );
    }

    // ── Partitioned list: pending first ──────────────────────────────────────
    const pending = bookings.filter(b => b.bookingStatus === 'pending');
    const others = bookings.filter(b => b.bookingStatus !== 'pending');

    return (
        <div className="space-y-10">
            {pending.length > 0 && (
                <section>
                    <h2 className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-5">
                        Pendientes de pago ({pending.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pending.map(b => (
                            <BookingCard key={b.documentId} booking={b} />
                        ))}
                    </div>
                </section>
            )}

            {others.length > 0 && (
                <section>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">
                        Historial de reservas ({others.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {others.map(b => (
                            <BookingCard key={b.documentId} booking={b} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
