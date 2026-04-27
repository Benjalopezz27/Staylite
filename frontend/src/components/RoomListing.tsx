import React, { useEffect, useState } from "react";
import type { Room } from "@/lib/types";
import { Users, Maximize, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import API, { getRoomsByCategory } from "@/services/roomsData";

export const RoomCard = ({ room }: { room: Room }) => {
  // Obtenemos los features específicos
  const capacity = room.features?.find(f => f.name === 'Capacidad')?.value || '2 Personas';
  const size = room.features?.find(f => f.name === 'Tamaño')?.value || '45 m²';

  // Helper para extraer la URL de la imagen (Strapi vs import estático)
  const getImageUrl = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return img.startsWith('http') ? img : `http://127.0.0.1:1337${img}`;
    if (img.url) return img.url.startsWith('http') ? img.url : `http://127.0.0.1:1337${img.url}`;
    if (img.src) return img.src; // Fallback for old static imports
    return '';
  };

  const baseImage = getImageUrl(room.image);
  const hoverImage = room.thumbnails && room.thumbnails.length > 1
    ? getImageUrl(room.thumbnails[1])
    : baseImage;

  return (
    <div className="group relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-muted shadow-2xl transition-all duration-500 hover:shadow-black/30 hover:-translate-y-1">
      {/* Base Image */}
      {baseImage ? (
        <img
          src={baseImage}
          alt={room.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center text-white/50">
          Sin Imagen
        </div>
      )}

      {/* Hover Image (Transition) */}
      <div
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out z-10 bg-cover bg-center"
        style={{ backgroundImage: hoverImage ? `url(${hoverImage})` : 'none' }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-20" />

      {/* Content Container */}
      <div className="relative h-full w-full z-30 p-8 flex flex-col justify-between text-white">

        {/* Top Section */}
        <div className="flex justify-between items-start w-full">

          {/* Room Name */}
          <h2 className="text-2xl md:text-3xl font-bold  max-w-[50%] leading-tight tracking-tight drop-shadow-lg">
            {room.name}
          </h2>
          {/* Attributes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <Users size={16} className="text-white/80" />
              <span>{capacity}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <Maximize size={16} className="text-white/80" />
              <span>{size}</span>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-6">
          <Button
            asChild
            className="w-full h-14 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 backdrop-blur-md transition-all duration-300 font-bold text-lg cursor-pointer pointer-events-auto"
          >
            <a href={`/room/${room.slug}`} className="flex items-center justify-center gap-2">
              Reservar Ahora
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

const RoomListing = ({ categorySlug }: { categorySlug?: string }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRooms() {
      try {
        setLoading(true);
        setError(null);
        const data = categorySlug
          ? await getRoomsByCategory(categorySlug)
          : await API.getRooms();
        if (isMounted) {
          setRooms(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Error al cargar las habitaciones");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRooms();

    // Cleanup function to prevent state updates on unmounted components
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 w-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px] text-destructive gap-4">
        <AlertCircle size={48} />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px] text-muted-foreground">
        <p className="text-lg">No hay habitaciones disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {rooms.map((room) => (
        <RoomCard key={room.slug} room={room} />
      ))}
    </div>
  );
};

export default RoomListing;