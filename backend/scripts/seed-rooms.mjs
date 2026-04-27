import fs from 'fs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
// Add your API Token here if your endpoints require authentication
const API_TOKEN = process.env.STRAPI_API_TOKEN || ''; 

const roomsData = [
  // --- DELUXE ROOMS ---
  {
    "name": "Deluxe Ocean View", "slug": "deluxe-ocean-view", "price": 15000, "discount": 0,
    "category": "deluxe-rooms",
    "description": "Despierta con la brisa del mar en nuestra habitación Deluxe con balcón privado.",
    "amenities": [{"icon": "wifi", "name": "Wi-Fi Alta Velocidad"}, {"icon": "coffee", "name": "Máquina Espresso"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "45 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Deluxe Cityscape", "slug": "deluxe-cityscape", "price": 14000, "discount": 10,
    "category": "deluxe-rooms",
    "description": "Vistas panorámicas a la ciudad con un diseño moderno y acogedor.",
    "amenities": [{"icon": "wifi", "name": "Wi-Fi Alta Velocidad"}, {"icon": "tv", "name": "Smart TV 55\""}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "40 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Deluxe Garden Retreat", "slug": "deluxe-garden-retreat", "price": 14500, "discount": 0,
    "category": "deluxe-rooms",
    "description": "Conexión directa con la naturaleza. Acceso exclusivo a los jardines del hotel.",
    "amenities": [{"icon": "wind", "name": "Climatización"}, {"icon": "coffee", "name": "Minibar"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "48 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos, 1 Niño"}]
  },
  {
    "name": "Deluxe Corner", "slug": "deluxe-corner", "price": 16000, "discount": 5,
    "category": "deluxe-rooms",
    "description": "Habitación en esquina con doble ventanal para máxima iluminación natural.",
    "amenities": [{"icon": "wifi", "name": "Wi-Fi Alta Velocidad"}, {"icon": "bath", "name": "Bañera Premium"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "50 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Deluxe Premium", "slug": "deluxe-premium", "price": 17000, "discount": 0,
    "category": "deluxe-rooms",
    "description": "La máxima expresión de la línea Deluxe, ubicada en los pisos superiores.",
    "amenities": [{"icon": "star", "name": "Servicio de cobertura"}, {"icon": "tv", "name": "Smart TV 65\""}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "55 m²"}, {"icon": "users", "name": "Capacidad", "value": "3 Adultos"}]
  },

  // --- EXECUTIVE ROOMS ---
  {
    "name": "Executive Studio", "slug": "executive-studio", "price": 22000, "discount": 15,
    "category": "executive-rooms",
    "description": "Diseñado para el viajero de negocios, con área de trabajo ergonómica.",
    "amenities": [{"icon": "briefcase", "name": "Escritorio Ejecutivo"}, {"icon": "wifi", "name": "Wi-Fi Dedicado"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "60 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Executive Loft", "slug": "executive-loft", "price": 25000, "discount": 0,
    "category": "executive-rooms",
    "description": "Espacio de doble altura que separa elegantemente el área de descanso del área de estar.",
    "amenities": [{"icon": "coffee", "name": "Lounge Access"}, {"icon": "tv", "name": "Home Theater"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "75 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Executive Business Suite", "slug": "executive-business-suite", "price": 28000, "discount": 10,
    "category": "executive-rooms",
    "description": "Incluye una pequeña sala de reuniones privada integrada a la habitación.",
    "amenities": [{"icon": "users", "name": "Sala de Reuniones (4p)"}, {"icon": "printer", "name": "Centro de Impresión"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "85 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Executive Panoramic", "slug": "executive-panoramic", "price": 26000, "discount": 0,
    "category": "executive-rooms",
    "description": "Vistas ininterrumpidas desde el piso ejecutivo con acceso al Club Lounge.",
    "amenities": [{"icon": "martini", "name": "Acceso al Club"}, {"icon": "shirt", "name": "Planchado Express"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "70 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Executive Club", "slug": "executive-club", "price": 30000, "discount": 20,
    "category": "executive-rooms",
    "description": "La joya corporativa. Servicios exclusivos, traslados y check-in privado.",
    "amenities": [{"icon": "car", "name": "Traslado Aeropuerto"}, {"icon": "concierge", "name": "Asistente Personal"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "90 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },

  // --- LUXURY ROOMS ---
  {
    "name": "Luxury Penthouse", "slug": "luxury-penthouse", "price": 50000, "discount": 0,
    "category": "luxury-rooms",
    "description": "El pináculo del lujo. Terraza privada, jacuzzi exterior y vistas 360 grados.",
    "amenities": [{"icon": "sun", "name": "Terraza Privada"}, {"icon": "droplet", "name": "Jacuzzi Exterior"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "150 m²"}, {"icon": "users", "name": "Capacidad", "value": "4 Adultos"}]
  },
  {
    "name": "Luxury Presidential", "slug": "luxury-presidential", "price": 65000, "discount": 0,
    "category": "luxury-rooms",
    "description": "Diseñada para dignatarios y celebridades. Privacidad absoluta y seguridad dedicada.",
    "amenities": [{"icon": "shield", "name": "Seguridad 24/7"}, {"icon": "utensils", "name": "Chef Privado"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "200 m²"}, {"icon": "users", "name": "Capacidad", "value": "6 Adultos"}]
  },
  {
    "name": "Luxury Royal Suite", "slug": "luxury-royal-suite", "price": 45000, "discount": 10,
    "category": "luxury-rooms",
    "description": "Decoración palaciega con antigüedades, piano de cola y comedor para 8 personas.",
    "amenities": [{"icon": "music", "name": "Piano de Cola"}, {"icon": "wine", "name": "Cava de Vinos"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "140 m²"}, {"icon": "users", "name": "Capacidad", "value": "4 Adultos"}]
  },
  {
    "name": "Luxury Oasis", "slug": "luxury-oasis", "price": 40000, "discount": 5,
    "category": "luxury-rooms",
    "description": "Un spa dentro de tu habitación. Sauna privado, cama de masajes y aromaterapia.",
    "amenities": [{"icon": "spa", "name": "Sauna Privado"}, {"icon": "leaf", "name": "Aromaterapia"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "120 m²"}, {"icon": "users", "name": "Capacidad", "value": "2 Adultos"}]
  },
  {
    "name": "Luxury Imperial", "slug": "luxury-imperial", "price": 55000, "discount": 0,
    "category": "luxury-rooms",
    "description": "Elegancia atemporal con detalles en oro, mármol importado y servicio de mayordomo.",
    "amenities": [{"icon": "bell", "name": "Mayordomo 24/7"}, {"icon": "bath", "name": "Baño de Mármol"}],
    "features": [{"icon": "maximize", "name": "Tamaño", "value": "160 m²"}, {"icon": "users", "name": "Capacidad", "value": "4 Adultos"}]
  }
];

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
  return headers;
};

// Strapi v5 uses documentId for relationships
async function fetchCategoryDocumentId(slug) {
  const res = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=${slug}`, {
    headers: getHeaders()
  });
  
  if (!res.ok) throw new Error(`Failed to fetch category ${slug}`);
  const { data } = await res.json();
  
  if (!data || data.length === 0) {
    throw new Error(`Category with slug '${slug}' not found in Strapi. Please ensure it exists.`);
  }
  
  return data[0].documentId;
}

async function createRoom(roomData, categoryDocumentId) {
  const payload = {
    data: {
      name: roomData.name,
      slug: roomData.slug,
      price: roomData.price,
      discount: roomData.discount,
      description: roomData.description,
      // In Strapi v5, setting a relation is done simply by providing its documentId
      category: categoryDocumentId,
      // Repeatable components can be passed as arrays of objects
      amenities: roomData.amenities,
      features: roomData.features
    },
    status: 'published' // Ensure they show up immediately
  };

  const res = await fetch(`${STRAPI_URL}/api/rooms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create room ${roomData.name}: ${errorBody}`);
  }
  return await res.json();
}

async function seed() {
  console.log('Starting room seed process...');
  const categoryMap = {}; // Cache documentIds

  for (const room of roomsData) {
    try {
      if (!categoryMap[room.category]) {
        console.log(`Fetching category documentId for: ${room.category}`);
        categoryMap[room.category] = await fetchCategoryDocumentId(room.category);
      }

      console.log(`Inserting room: ${room.name}...`);
      await createRoom(room, categoryMap[room.category]);
      console.log(`✅ Successfully inserted: ${room.name}`);
    } catch (error) {
      console.error(`❌ Error with ${room.name}:`, error.message);
    }
  }
  console.log('🎉 Seed process finished.');
}

seed();
