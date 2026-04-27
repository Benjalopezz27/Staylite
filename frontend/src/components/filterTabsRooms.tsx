import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { RoomCard } from './RoomListing';
import API from '@/services/roomsData';
import { getCategories } from '@/services/categoryData';
import type { Room } from '@/lib/types';

interface CategoryTab {
    id: string;
    label: string;
}

const ITEMS_PER_PAGE = 6;

export default function FilterTabsRooms() {
    const [categories, setCategories] = useState<CategoryTab[]>([
        { id: 'all', label: 'Todas las Habitaciones' }
    ]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                const [catsData, roomsData] = await Promise.all([
                    getCategories(),
                    API.getRooms()
                ]);

                if (isMounted) {
                    // Strapi v5 returns flat objects — no attributes wrapper
                    const fetchedTabs = (catsData || []).map((c: any) => ({
                        id: c.slug,
                        label: c.name
                    }));

                    setCategories([
                        { id: 'all', label: 'Todas las Habitaciones' },
                        ...fetchedTabs
                    ]);

                    setRooms(roomsData);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Error al cargar los datos');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => { isMounted = false; };
    }, []);

    // Filtrar habitaciones
    const filteredRooms = rooms.filter(room =>
        activeCategory === 'all' || room.category?.slug === activeCategory
    );

    // Cálculos de paginación
    const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Handlers
    const handleCategoryChange = (categoryId: string) => {
        setActiveCategory(categoryId);
        setCurrentPage(1); // Volver a la página 1 al cambiar de categoría
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll suave con un retraso mínimo para asegurar que React actualice el DOM si cambia la altura
        setTimeout(() => {
            document.getElementById('listing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    if (loading) {
        return (
            <section className="bg-[#0A0F1C] py-20 px-8 flex justify-center items-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-[#0A0F1C] py-20 px-8 flex flex-col items-center justify-center min-h-[500px] text-destructive gap-4">
                <AlertCircle size={48} />
                <p className="text-lg font-medium">{error}</p>
            </section>
        );
    }

    return (
        <section id="listing" className="bg-[#0A0F1C] py-10 px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header and Tabs */}
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Nuestra Colección</h2>

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto w-full md:w-auto hide-scrollbar gap-2 p-2 relative">
                        {categories.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleCategoryChange(tab.id)}
                                className={`relative px-6 py-3 text-sm md:text-base font-medium transition-colors duration-300 outline-none whitespace-nowrap
                                    ${activeCategory === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-200"}
                                `}
                            >
                                {tab.label}

                                {/* Glowing Underline for Active Tab */}
                                {activeCategory === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rooms Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedRooms.map((room) => (
                            <motion.div
                                layout
                                key={room.slug}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ duration: 0.4, type: "spring" }}
                            >
                                <RoomCard room={room} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredRooms.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        No se encontraron habitaciones en esta categoría.
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-16 gap-2">
                        {/* Botón Anterior */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-300"
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Números de Página Circulares */}
                        <div className="flex gap-3 px-2">
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNumber = index + 1;
                                const isActive = currentPage === pageNumber;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 outline-none
                                            ${isActive
                                                ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                                : "bg-[#182138] text-slate-400 hover:bg-[#202c48] hover:text-white"
                                            }
                                        `}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Botón Siguiente */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-300"
                            aria-label="Página siguiente"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
