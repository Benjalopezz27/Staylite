import { Button } from "@/components/ui/button"
import { User, Calendar, LogOut } from "lucide-react"
import { useStore } from '@nanostores/react'
import { $userStore, $clerkStore } from '@clerk/astro/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPage,
} from "@/components/ui/material-ui-dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useState, useEffect } from "react"

const Dashboard = () => {

const user = useStore($userStore)
const clerk = useStore($clerkStore)
const [hasNewBooking, setHasNewBooking] = useState(false)

// Read notification flag from localStorage on mount
useEffect(() => {
  setHasNewBooking(localStorage.getItem('staylite_new_booking') === 'true')

  // Listen for new booking event (fired right after creation)
  const handleNew = () => setHasNewBooking(true)
  // Listen for "seen" event (fired when /bookings page loads)
  const handleSeen = () => setHasNewBooking(false)

  window.addEventListener('staylite:new-booking', handleNew)
  window.addEventListener('staylite:booking-seen', handleSeen)
  return () => {
    window.removeEventListener('staylite:new-booking', handleNew)
    window.removeEventListener('staylite:booking-seen', handleSeen)
  }
}, [])

if(!user) {
    return null
}

const getUserInitials = () => {
    if(user.firstName && user.lastName) {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }else if(user.firstName) {
    return user.firstName.charAt(0).toUpperCase()
  } else if(user.username) {
    return user.username.charAt(0).toUpperCase()
  } return
}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Avatar with optional notification dot */}
        <div className="relative cursor-pointer">
          <Avatar className='size-8 translate-y-1 md:translate-y-0'>
            <AvatarImage className="cursor-pointer" src={user.imageUrl} alt="Foto de avatar" />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          {hasNewBooking && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse"
              aria-label="Nueva reserva"
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-4 w-42.5" align="center">
        <DropdownMenuPage id="main">
          <DropdownMenuItem className="block w-full cursor-pointer focus:bg-primary" asChild>
            <a href="/account" className="flex items-center gap-2 w-full"><User className="h-4 w-4" /> Cuenta</a>
          </DropdownMenuItem>
          <DropdownMenuItem className="block w-full cursor-pointer focus:bg-primary" asChild>
            <a href="/bookings" className="flex items-center gap-2 w-full">
              <div className="relative">
                <Calendar className="h-4 w-4" />
                {hasNewBooking && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              Reservas
              {hasNewBooking && (
                <span className="ml-auto text-xs font-semibold text-red-400">Nueva</span>
              )}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:bg-destructive/10 cursor-pointer"
            onSelect={() => clerk?.signOut({ redirectUrl: '/' })}
          >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuPage>
      </DropdownMenuContent>
    </DropdownMenu>
    
  )
}

export default Dashboard