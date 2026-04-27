'use client'
import { formatPrice } from '@/lib/helper'
import type { Room, Category, Booking } from '@/lib/types'
import { useState, type ChangeEvent, useEffect } from 'react'
import { useAuth } from '@clerk/astro/react'
import { useStore } from '@nanostores/react'
import { $clerkStore, $userStore } from '@clerk/astro/client'
import { getCategories } from '@/services/categoryData'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { CalendarIcon, Info, LogIn, CheckCircle2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from './ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { createBooking } from '@/services/bookingData'

interface ReservationProps {
  room: Room
}

const initialBookingState: Partial<Booking> = {
  checkIn: undefined,
  checkOut: undefined,
  noOfRooms: 1,
  adults: 1,
  childrens: 0,
}

const Reservation = ({ room }: ReservationProps) => {
  const { isSignedIn } = useAuth()
  const clerk = useStore($clerkStore)
  const user = useStore($userStore)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ checkIn?: string; checkOut?: string; session?: string; api?: string }>({})

  const [selectedCategory, setSelectedCategory] = useState<string>(room.category?.name || '')
  const [bookingData, setBookingData] = useState<Partial<Booking>>(initialBookingState)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        const categoriesArray = data?.data || data || []
        const formattedCategories = categoriesArray.map((item: any) => {
          const attributes = item.attributes || item
          return { name: attributes.name, slug: attributes.slug, image: [] }
        })
        setCategories(formattedCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleCheckInChange = (date: Date | undefined) => {
    setErrors((prev) => ({ ...prev, checkIn: undefined }))
    setBookingData((prev) => ({ ...prev, checkIn: date }))
  }

  const handleCheckOutChange = (date: Date | undefined) => {
    setErrors((prev) => ({ ...prev, checkOut: undefined }))
    setBookingData((prev) => ({ ...prev, checkOut: date }))
  }

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = parseInt(value, 10)
    if (isNaN(numericValue)) return
    setBookingData((prev) => ({ ...prev, [name]: numericValue }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // --- Validación visual de fechas ---
    const newErrors: typeof errors = {}
    if (!bookingData.checkIn) newErrors.checkIn = 'La fecha de Check-in es obligatoria.'
    if (!bookingData.checkOut) newErrors.checkOut = 'La fecha de Check-out es obligatoria.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // --- Auth: si no está logueado, guardar estado y abrir Clerk ---
    if (!isSignedIn) {
      const pendingBooking = { ...bookingData, roomId: room.id || room.slug }
      localStorage.setItem('staylite_pending_booking', JSON.stringify(pendingBooking))
      if (clerk) clerk.openSignIn({ redirectUrl: window.location.href })
      return
    }

    // --- Obtener token de sesión ---
    let jwt = null
    try {
      jwt = await clerk?.session?.getToken()
    } catch (error) {
      console.error('Error obteniendo el token de sesión:', error)
    }

    if (!jwt) {
      setErrors({ session: 'Tu sesión parece haber expirado. Por favor, vuelve a iniciar sesión.' })
      return
    }

    setIsLoading(true)
    setErrors({})

    // --- Cálculo de precio ---
    const nights = getNumberOfNights()
    const basePrice = nights * room.price * (bookingData.noOfRooms || 1)
    const discountAmount = basePrice * (room.discount / 100)
    const finalPrice = basePrice - discountAmount

    const payload: Partial<Booking> = {
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      customerName: user?.fullName || 'Usuario',
      customerPhone: undefined,
      customerEmail: user?.primaryEmailAddress?.emailAddress || '',
      room: room,
      noOfRooms: bookingData.noOfRooms || 1,
      adults: bookingData.adults || 1,
      childrens: bookingData.childrens || 0,
      bookingStatus: 'pending',
      totalPrice: finalPrice,
    }

    try {
      const result = await createBooking(payload)
      const generatedCode = result?.data?.bookingCode || result?.bookingCode || ''
      const documentId = result?.data?.documentId || result?.documentId || ''

      // Guardar el resumen en localStorage para la página de shipping
      localStorage.removeItem('staylite_pending_booking')
      localStorage.setItem('staylite_booking_summary', JSON.stringify({
        bookingCode: generatedCode,
        documentId,
        roomName: room.name,
        checkIn: payload.checkIn?.toISOString(),
        checkOut: payload.checkOut?.toISOString(),
        noOfRooms: payload.noOfRooms,
        adults: payload.adults,
        childrens: payload.childrens,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        totalPrice: payload.totalPrice,
      }))
      // Activate notification badge in Dashboard
      localStorage.setItem('staylite_new_booking', 'true')
      window.dispatchEvent(new CustomEvent('staylite:new-booking'))

      setBookingCode(generatedCode)
      setBookingData(initialBookingState)

      // Redirigir a /reservation-shipping tras 4 segundos
      setTimeout(() => {
        window.location.href = '/reservation-shipping'
      }, 4000)
    } catch (error) {
      console.error('Error procesando la reserva:', error)
      setErrors({ api: 'No se pudo procesar la reserva. Por favor intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getNumberOfNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = Math.abs(bookingData.checkOut.getTime() - bookingData.checkIn.getTime())
      return Math.ceil(diffTime / (1000 * 3600 * 24))
    }
    return 0
  }

  const numberOfNights = getNumberOfNights()
  const totalPrice = numberOfNights * room.price * (bookingData.noOfRooms || 1)
  const discountedPrice = totalPrice * (room.discount / 100)
  const totalPriceWithDiscount = totalPrice - discountedPrice

  // --- Estado de éxito ---
  if (bookingCode !== null) {
    return (
      <section className='mt-10 md:mt-0'>
        <div className='bg-card-foreground text-background rounded-lg px-6 pt-8 pb-6 flex flex-col items-center text-center gap-4'>
          <div className='flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 animate-in zoom-in-50 duration-500'>
            <CheckCircle2 className='w-9 h-9 text-primary' strokeWidth={1.5} />
          </div>
          <div>
            <h5 className='font-bold text-2xl mb-1'>¡Reserva Confirmada!</h5>
            <p className='text-sm text-muted-foreground'>Tu reserva en <span className='font-semibold text-background'>{room.name}</span> fue creada exitosamente.</p>
          </div>
          <div className='bg-primary/10 rounded-xl px-6 py-4 w-full'>
            <p className='text-xs text-muted-foreground uppercase tracking-widest mb-1'>Código de Reserva</p>
            <p className='text-2xl font-bold tracking-widest text-primary'>{bookingCode || '—'}</p>
          </div>
          <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
            <Loader2 className='w-3 h-3 animate-spin' />
            Redirigiendo al proceso de pago...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='mt-10 md:mt-0'>
      <form onSubmit={handleSubmit} className='bg-card-foreground text-background rounded-lg px-6 pt-8 pb-6'>
        <div className="relative mb-4 flex items-center justify-between after:bg-primary after:absolute after:bottom-0.5 after:h-0.75 after:w-full after:content-[' ']">
          <h5 className='font-medium text-2xl mb-1'>Reservar:</h5>
          <p className='text-lg font-bold'>{formatPrice(room.price)}</p>
        </div>
        <p className='mb-6 bg-primary/10 p-2 rounded-md'>
          <Info className='inline-block mr-2 text-secondary' />
          El check-in es a las 3PM y el check-out a las 11AM. Si ocurre algún inconveniente, por favor contacta al anfitrión.
        </p>
        <div className="space-x-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">

          {/* Check In */}
          <div>
            <Label className='mb-2 mt-2 lg:mt-0'>Check In</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start overflow-hidden text-left font-normal',
                    !bookingData.checkIn && 'text-background',
                    errors.checkIn && 'border-red-500'
                  )}
                >
                  <CalendarIcon />
                  {bookingData.checkIn ? format(bookingData.checkIn, 'PPP') : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode='single' selected={bookingData.checkIn} onSelect={handleCheckInChange} initialFocus disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }} />
              </PopoverContent>
            </Popover>
            {errors.checkIn && <p className='mt-1.5 text-xs text-red-500'>{errors.checkIn}</p>}
          </div>

          {/* Check Out */}
          <div>
            <Label className='mb-2 mt-2 lg:mt-0'>Check Out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start overflow-hidden text-left font-normal',
                    !bookingData.checkOut && 'text-background',
                    errors.checkOut && 'border-red-500'
                  )}
                >
                  <CalendarIcon />
                  {bookingData.checkOut ? format(bookingData.checkOut, 'PPP') : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode='single' selected={bookingData.checkOut} onSelect={handleCheckOutChange} disabled={(date) => date < new Date() || (bookingData.checkIn ? date <= bookingData.checkIn : false)} />
              </PopoverContent>
            </Popover>
            {errors.checkOut && <p className='mt-1.5 text-xs text-red-500'>{errors.checkOut}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='mt-2 lg:mt-0'>Habitaciones</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className='data-placeholder:text-background w-full dark:bg-transparent dark:hover:bg-transparent'>
                <SelectValue className='capitalize' placeholder={room.category?.name || 'Categoría'} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.name}>{cat.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value={room.category?.name || 'room'}>{room.category?.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='mt-2 lg:mt-0'>Numero de Habitaciones</Label>
            <Input type='number' onChange={handleNumberChange} name='noOfRooms' value={bookingData.noOfRooms} className='dark:bg-transparent dark:hover:bg-transparent' max={4} min={1} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='mt-2 lg:mt-0'>Adultos</Label>
            <Input type='number' onChange={handleNumberChange} name='adults' value={bookingData.adults} className='dark:bg-transparent dark:hover:bg-transparent' max={4} min={1} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='mt-2 lg:mt-0'>Niños</Label>
            <Input type='number' name='childrens' onChange={handleNumberChange} value={bookingData.childrens} className='dark:bg-transparent dark:hover:bg-transparent' max={4} min={0} />
          </div>
        </div>

        <div className='mt-8 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {room.discount > 0 && totalPrice > 0 ? (
              <div className='flex flex-col'>
                <p className='font-semibold text-lg line-through text-muted-foreground'>{formatPrice(totalPrice)}</p>
                <p className='font-semibold text-lg'>{formatPrice(totalPriceWithDiscount)}</p>
              </div>
            ) : (
              <p className='font-semibold text-lg'>{formatPrice(totalPrice)}</p>
            )}
          </div>
          {room.discount > 0 && (
            <p className='font-normal text-primary'>Aplica un {room.discount}% de descuento</p>
          )}
        </div>

        {/* Error de sesión expirada */}
        {errors.session && (
          <p className='mt-4 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md'>{errors.session}</p>
        )}

        {/* Error de API */}
        {errors.api && (
          <p className='mt-4 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md'>{errors.api}</p>
        )}

        {!isSignedIn && (
          <div className='mt-6 flex items-start gap-3 rounded-md bg-primary/10 px-4 py-3 text-sm'>
            <LogIn className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
            <span>
              Debes <strong>iniciar sesión</strong> para completar tu reserva. Al hacer clic en "Reservar Ahora" se abrirá el inicio de sesión.
            </span>
          </div>
        )}

        <Button className='w-full mt-4' type='submit' disabled={isLoading}>
          {isLoading
            ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Procesando Reserva...</>
            : 'Reservar Ahora'
          }
        </Button>
      </form>
    </section>
  )
}

export default Reservation