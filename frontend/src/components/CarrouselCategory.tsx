import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/constants';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CarrouselCategory = () => {
    const [activeIndex, setActiveIndex] = useState(1);

    const next = () => {
        setActiveIndex((prev) => (prev + 1) % categories.length);
    };

    const prev = () => {
        setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
    };

    // Calculamos el desplazamiento para que el activo siempre esté al centro
    // Si el activo es el 0 (65%): centro está en 32.5%. Desplazamos para que 32.5% esté en el 50% del viewport.
    const getTranslateX = () => {
        if (activeIndex === 0) return '17.5%';
        if (activeIndex === 1) return '0%';
        if (activeIndex === 2) return '-17.5%';
        return '0%';
    };

    return (
        <div className="relative w-full overflow-hidden py-10">
            {/* Desktop/Tablet Carousel */}
            <div className="hidden md:block relative min-h-[400px] lg:min-h-[550px]">
                {/* Navigation Buttons (Fijos en la pantalla) */}
                <div className="absolute inset-0 flex items-center justify-between px-10 lg:px-20 z-40 pointer-events-none">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prev}
                        className="pointer-events-auto bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-14 h-14 border border-white/30 shadow-2xl transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={next}
                        className="pointer-events-auto bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-14 h-14 border border-white/30 shadow-2xl transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </Button>
                </div>

                {/* Sliding Track */}
                <motion.div 
                    animate={{ x: getTranslateX() }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="flex items-center justify-center w-full h-full"
                >
                    {categories.map((category, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <motion.div
                                key={category.name}
                                animate={{ 
                                    width: isActive ? "65%" : "17.5%",
                                    opacity: isActive ? 1 : 0.4,
                                    scale: isActive ? 1 : 0.9,
                                }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className={cn(
                                    "relative cursor-pointer overflow-hidden rounded-[2.5rem] shrink-0 mx-2",
                                    isActive ? "z-30 shadow-2xl shadow-black/40" : "z-10 blur-[1px]"
                                )}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className="aspect-[16/10] lg:aspect-[16/9] relative group">
                                    <img
                                        src={category.image.src}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />

                                    {/* Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
                                        isActive ? "bg-black/20 group-hover:bg-black/50" : "bg-black/40"
                                    )}>
                                        <div className={cn(
                                            "transition-all duration-500 flex flex-col items-center justify-center",
                                            isActive ? "group-hover:-translate-y-4" : ""
                                        )}>
                                            <h3 className={cn(
                                                "text-white font-bold text-center px-4 drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] transition-all duration-700",
                                                isActive ? "text-4xl lg:text-6xl uppercase tracking-tighter" : "text-xl opacity-0"
                                            )}>
                                                {category.name}
                                            </h3>

                                            {isActive && (
                                                <div className="mt-6 transform translate-y-8 opacity-0 group-hover:translate-y-2 group-hover:opacity-100 transition-all duration-500 ease-out delay-75">
                                                    <Button
                                                        asChild
                                                        variant="secondary"
                                                        size="lg"
                                                        className="rounded-full px-12 h-14 bg-white text-black hover:bg-white/90 font-bold shadow-2xl border-none"
                                                    >
                                                        <a href={category.url}>Más Info</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Mobile Carousel (Scroll Horizontal Snap) */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 no-scrollbar scroll-smooth">
                {categories.map((category) => (
                    <div
                        key={`mobile-${category.name}`}
                        className="min-w-[90%] snap-center relative rounded-3xl overflow-hidden aspect-[4/5] shadow-xl"
                    >
                        <img
                            src={category.image.src}
                            alt={category.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-8 text-center">
                            <h3 className="text-white font-semibold text-3xl mb-6 uppercase ">{category.name}</h3>
                            <Button
                                asChild
                                variant="secondary"
                                className="rounded-full w-full bg-white text-black font-semibold h-12"
                            >
                                <a href={category.url}>Más Info</a>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default CarrouselCategory;