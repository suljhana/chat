'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignInModal } from './sign-in-modal';

export function SignedOutHeader() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsSignInModalOpen(true);
  };

  return (
    <header className="flex items-center justify-between w-full px-4 py-3 bg-background">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/pipedream.svg"
          alt="Pipedream"
          width={108}
          height={24}
          priority
          className="dark:invert"
        />
      </Link>
      <div>
        <Button onClick={handleGetStarted} variant="blue">
          Get started
        </Button>
      </div>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </header>
  );
}