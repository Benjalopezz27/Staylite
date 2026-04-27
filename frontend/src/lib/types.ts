interface Amenity {
    icon: string
    name: string
}

interface Feature {
    icon: string
    name: string
    value: string
}
export interface Room {
    id?: number
    documentId?: string
    name: string
    slug: string
    category: Category
    price: number
    image: ImageMetadata
    thumbnails: ImageMetadata[]
    description: string
    amenities: Amenity[]
    features: Feature[]
    discount: number
}

export interface Category {
    name: string
    slug: string
    image: ImageMetadata[]
}

export interface Review {
    user: string
    rating: number
    comment: string
    role: string
    date: string
}

export interface Booking {
    checkIn: Date
    checkOut: Date
    customerName: string
    customerPhone: string
    customerEmail: string
    room: Room
    noOfRooms: number
    adults: number
    childrens: number
    bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    bookingCode: string
    notes: string
    totalPrice: number
}