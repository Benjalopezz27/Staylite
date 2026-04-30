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
    const [localStatus, setLocalStatus] = React.useState(booking.bookingStatus);

    // Modal states
    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
    const [isCancelling, setIsCancelling] = React.useState(false);
    const [isCancelSuccess, setIsCancelSuccess] = React.useState(false);
    const [cancelError, setCancelError] = React.useState<string | null>(null);

    const isPending = localStatus === 'pending';

    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    // Permitir ver el botón si estamos antes del check-in
    const isBeforeCheckIn = now < checkInDate;
    const canCancel = localStatus === 'confirmed' && isBeforeCheckIn;

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

    const handleCancelConfirm = async () => {
        setIsCancelling(true);
        setCancelError(null);
        try {
            const response = await fetch('/api/cancel-booking', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-User-Email': booking.customerEmail 
                },
                body: JSON.stringify({ documentId: booking.documentId }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al cancelar.');
            }

            setLocalStatus('cancelled');
            setIsCancelSuccess(true);
        } catch (error: any) {
            setCancelError(error.message);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <>
            <article className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full">
                {/* Room image strip */}
                <div className="relative h-36 overflow-hidden bg-muted shrink-0">
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
                        <StatusBadge status={localStatus} />
                    </div>
                    {/* Dark gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
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

                    {/* Spacer to push buttons to the bottom */}
                    <div className="mt-auto pt-4 space-y-2">
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

                        {/* CTA for confirmed bookings */}
                        {canCancel && (
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 text-red-700 bg-destructive/5 px-4 py-2 text-sm font-medium transition hover:bg-destructive hover:text-white active:scale-95"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancelar Reserva
                            </button>
                        )}
                    </div>
                </div>
            </article>

            {/* Cancel Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        {isCancelSuccess ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 mx-auto text-emerald-500">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-foreground">¡Reserva Cancelada!</h3>
                                <p className="text-muted-foreground text-sm mb-8 leading-relaxed px-2">
                                    Tu reserva para <strong className="text-foreground">{booking.room?.name}</strong> ha sido cancelada exitosamente. 
                                    El reembolso ha sido procesado a través de Stripe y debería verse reflejado en tu cuenta en los próximos días.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsCancelModalOpen(false);
                                        setIsCancelSuccess(false);
                                    }}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition active:scale-95"
                                >
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">Cancelar Reserva</h3>
                                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                                    Estás a punto de cancelar tu reserva para la habitación <strong className="text-foreground font-medium">{booking.room?.name ?? 'Habitación'}</strong>.
                                    Si faltan más de 48 horas para tu llegada, recibirás un reembolso completo. Esta acción no se puede deshacer.
                                </p>

                                {cancelError && (
                                    <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
                                        {cancelError}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsCancelModalOpen(false);
                                            setCancelError(null);
                                        }}
                                        disabled={isCancelling}
                                        className="px-4 py-2 rounded-xl font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        onClick={handleCancelConfirm}
                                        disabled={isCancelling}
                                        className="px-4 py-2 rounded-xl font-medium text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando reembolso...
                                            </>
                                        ) : (
                                            'Confirmar Cancelación'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default BookingCard;
