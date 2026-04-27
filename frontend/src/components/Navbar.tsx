import React, { useEffect, useState } from 'react'

const navigation = [
  { name: 'inicio', href: '/' },
  { name: 'habitaciones', href: '/rooms' },
  { name: 'nosotros', href: '#/about' },
  { name: 'contacto', href: '#/contact' },
];

interface NavbarProps {
  isClicked: boolean;
  toggleNavClick: () => void;
}

const Navbar = ({isClicked, toggleNavClick}: NavbarProps) => {
    const [active, setActive] = useState('');
    
    useEffect(() => {
        setActive(window.location.pathname);
    })
    const handleNavClick = (href: string) => {
        setActive(href);
        toggleNavClick();
    }

  return (
<>
{/* Mobile Navigation */}
<nav className= {`${isClicked ? 'transalte-x-0' : '-translate-x-760 '} fixed top-0 left-0 flex h-screen w-full items-center justify-start transition-all duration-500 lg:hidden`}>
    <ul className='h-full border-muted bg-background w-85 border-r pt-36 pl-4'>
        {navigation.map((item) => (
            <li key={item.name} className=' mb-4 capitalize '>
                <a href={item.href} className= {`${active === item.href ? 'text-primary' : ''} px-4 py-6 text-lg text-foreground hover:text-primary transition-colors duration-300 `}
                onClick={() => setActive(item.href)}>
                    {item.name}
                </a>
            </li>
        ))}
    </ul>
</nav>


{/* Desktop Navigation */}
<nav className='hidden lg:inline-block'> 
    <ul className='md:flex md:gap-6'>
        {navigation.map((item) => (
            <li key={item.name} className=' capitalize '>
                <a href ={item.href} className= {`${active === item.href ? 'bg-primary rounded-md px-2 py-1 text-white' : ''} text-lg hover:text-primary transition-colors duration-300 `}
                onClick={() => setActive(item.href)}>
                    {item.name} 
                </a>
            </li>
        ))}
    </ul>
</nav>
</>
)
}

export default Navbar