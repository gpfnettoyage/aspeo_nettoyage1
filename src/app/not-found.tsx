import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const NotFoundPage = () => {
  return (
    <div className="grid h-screen place-content-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary">404</h1>
        <div className="flex justify-center animate-sweep">
          <Image
            src="/img/not-found/equipement-nettoyage-balai.webp"
            alt="Balai"
            priority={true}
            draggable="false"
            width={128}
            height={128}
          />
        </div>
        <p className="text-2xl font-bold tracking-tight text-primary/75 sm:text-4xl">
          Oups !
        </p>
        <p className="my-2">Nous ne pouvons pas trouver cette page.</p>

        <Button className="bg-primary" asChild>
          <Link href="/" className="text-xl">
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
