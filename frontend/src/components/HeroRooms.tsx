import React from 'react';
import HeroSection from '@/components/ui/hero-section-9';
import { BedDouble, Star, Award } from 'lucide-react';

const RoomsHero = () => {
    // Datos adaptados para StayLite - Premium Room Booking
    const heroData = {
        title: (
            <span className="text-white">
                Santuarios de <br />
                <span className="text-primary italic font-serif">Excelencia</span>
            </span>
        ),
        subtitle: 'Diseñados para el descanso absoluto, donde la elegancia contemporánea se encuentra con vistas que cautivan los sentidos y un confort inigualable.',
        actions: [
            {
                text: 'EXPLORAR SUITES',
                href: '#listing',
                variant: 'default' as const,
                className: "bg-primary hover:bg-primary/90 text-white font-bold tracking-widest px-8"
            },
            {
                text: 'RECORRIDO VIRTUAL',
                onClick: () => console.log('Virtual tour'),
                variant: 'outline' as const,
                className: "border-primary text-primary hover:bg-primary/10 font-bold tracking-widest px-8"
            },
        ],
        stats: [
            {
                value: '25+',
                label: 'Suites de Lujo',
                icon: <BedDouble className="h-5 w-5 text-primary" />,
            },
            {
                value: '4.9/5',
                label: 'Calificación VIP',
                icon: <Star className="h-5 w-5 text-primary" />,
            },
            {
                value: 'Elite',
                label: 'Servicio 24/7',
                icon: <Award className="h-5 w-5 text-primary" />,
            },
        ],
        images: [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop', // Principal
            'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2000&auto=format&fit=crop', // Detalle cama
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop', // Vista/Lobby
        ],
    };

    return (
        <div className="w-full bg-[#0A0F1C] min-h-screen flex items-center pt-20">
            <HeroSection
                title={heroData.title}
                subtitle={heroData.subtitle}
                actions={heroData.actions}
                stats={heroData.stats}
                images={heroData.images}
                className="bg-transparent"
            />
        </div>
    );
};

export default RoomsHero;
