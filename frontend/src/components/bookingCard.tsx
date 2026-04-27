import React from 'react';
import { CalendarDays, Users, BedDouble, ArrowRight, Clock, CheckCircle2, XCircle, Hash } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface BookingRoom {
    name: string;
    slug: string;
    image: string | null;
    price: number;
}

export interface BookingSummary {
    documentId: string;
    bookingCode: string | null;
    checkIn: string;
    checkOut: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    noOfRooms: number;
    adults: number;
    childrens: number;
    bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string | null;
    createdAt: string;
    room: BookingRoom | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function getNights(checkIn: string, checkOut: string) {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
    string,
    { label: string; icon: React.ReactNode; classes: string }
> = {
    pending: {
        label: 'Pendiente',
        icon: <Clock className="w-3.5 h-3.5" />,
        classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    },
    confirmed: {
        label: 'Confirmada',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    },
    completed: {
        label: 'Completada',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    },
    cancelled: {
        label: 'Cancelada',
        icon: <XCircle className="w-3.5 h-3.5" />,
        classes: 'bg-red-500/15 text-red-400 border border-red-500/30',
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.classes}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BookingCard({ booking }: { booking: BookingSummary }) {
    const nights = getNights(booking.checkIn, booking.checkOut);
    const isPending = booking.bookingStatus === 'pending';

    const handleContinue = () => {
        // Restore summary to localStorage so checkout flow can resume
        localStorage.setItem('staylite_booking_summary', JSON.stringify({
            documentId: booking.documentId,
            bookingCode: booking.bookingCode,
            roomName: booking.room?.name,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            noOfRooms: booking.noOfRooms,
            adults: booking.adults,
            childrens: booking.childrens,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
        }));
        window.location.href = '/reservation-shipping';
    };

    return (
        <article className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            {/* Room image strip */}
            <div className="relative h-36 overflow-hidden bg-muted">
                {booking.room?.image ? (
                    <img
                        src={booking.room.image}
                        alt={booking.room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                )}
                {/* Status overlay */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={booking.bookingStatus} />
                </div>
                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="font-semibold text-base truncate">
                        {booking.room?.name ?? 'Habitación'}
                    </h3>
                    {booking.bookingCode && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono font-medium text-primary tracking-wider">
                                {booking.bookingCode}
                            </span>
                        </p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Check-in</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                            {fmtDate(booking.checkIn)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Check-out</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                            {fmtDate(booking.checkOut)}
                        </p>
                    </div>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        {booking.noOfRooms} hab.
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {booking.adults} adultos{booking.childrens > 0 ? `, ${booking.childrens} niños` : ''}
                    </span>
                    <span className="ml-auto font-medium">
                        {nights} {nights === 1 ? 'noche' : 'noches'}
                    </span>
                </div>

                {/* CTA for pending bookings */}
                {isPending && (
                    <button
                        onClick={handleContinue}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
                    >
                        Continuar al pago
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </article>
    );
}

export default BookingCard;
