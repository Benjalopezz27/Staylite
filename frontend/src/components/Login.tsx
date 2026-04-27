import {SignedOut, SignInButton} from '@clerk/astro/react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';


const Login = () => {

    const [currentUrl, setCurrentUrl] = useState('');
    
    useEffect(() => {
      setCurrentUrl(window.location.href);
    }, []);

  return <SignedOut>
    <SignInButton signUpForceRedirectUrl={currentUrl} mode='modal'>
      <Button className='text-sm font-medium transition-colors translate-y-1 md:translate-y-0 hover:bg-primary/90'>
        Login
      </Button>
    </SignInButton>
  </SignedOut>
}

export default Login