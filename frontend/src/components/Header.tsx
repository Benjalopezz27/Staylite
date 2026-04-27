import Navbar from './Navbar';
import { ModeToggle } from './ModeToggle';
import { AlignLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SignedIn, SignInButton } from '@clerk/astro/react';
import Login from './Login';
import Dashboard from './Dashboard';
const Header = () => {
    const [isClicked, setIsClicked] =  useState(false);
    const [scrolling, setScrolling] = useState(false);


    const toggleNavClick = () => {
        setIsClicked(!isClicked);
    }
    useEffect(() => {
        const handleScroll = ()=>{
            const scroll = window.scrollY

            if(scroll > 100){
                setScrolling (true)
            } else {
                setScrolling (false)
            }
        }
        window.addEventListener('scroll', handleScroll)

        return ()=> {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const getTextColor = () => {
        return scrolling ? 'text-foreground' : 'text-white';
    }

  return (
    <header className={`${scrolling ? " bg-background animate-in duration-500" : "animate-out duration-500"} fixed top-0 py-5 z-500 w-full ${getTextColor()} `}>
        <div className="container flex items-center justify-between">
            <a href="/" className={`${isClicked? "text-foreground" : ""} text-2xl font-bold z-10`}>Hotel <span className="text-primary">StayLite</span></a>
            <Navbar isClicked={isClicked} toggleNavClick={toggleNavClick} />
            <div className="flex items1-center justify-start gap-4">
                <Login />
                <SignedIn>
                    <Dashboard></Dashboard>
                </SignedIn>
                <ModeToggle />
                <div className='inline-block lg:hidden' onClick={toggleNavClick}>
                    {        
                        isClicked ? ( <X name='close menu' cursor={'pointer'} size={26} className='translate-y-1 md:translate-y-0'/>): (
                                
                        <AlignLeft name='open menu' cursor={'pointer'} size={26} className='translate-y-1 md:translate-y-0'/>

                        )
                    }
                    
                </div>
            </div>
        </div>
    </header>
  );
};

export default Header;