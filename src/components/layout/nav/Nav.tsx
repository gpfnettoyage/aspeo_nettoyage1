'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  InfoIcon,
  MenuIcon,
  ServerIcon,
  StarIcon,
  ChevronDown,
  Newspaper,
  LucideIcon,
} from 'lucide-react';
import Logo from '../../Logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { NavCategory } from '@/lib/services';

type NavItemConfig = {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  type: 'link' | 'dropdown-services' | 'dropdown-medias';
};

const MENU_ITEMS: NavItemConfig[] = [
  { id: 'accueil', label: 'Accueil', href: '/', icon: HomeIcon, type: 'link' },
  { id: 'a-propos', label: 'À propos', href: '/a-propos', icon: InfoIcon, type: 'link' },
  { id: 'services', label: 'Propreté & Services', icon: ServerIcon, type: 'dropdown-services' },
  { id: 'medias', label: 'Médias', icon: Newspaper, type: 'dropdown-medias' },
  { id: 'avis', label: 'Avis', href: '/avis', icon: StarIcon, type: 'link' },
];

interface NavbarProps {
  categories: NavCategory[];
}

export default function Navbar({ categories }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMediasOpen, setIsMediasOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const mediasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (mediasRef.current && !mediasRef.current.contains(event.target as Node)) {
        setIsMediasOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- DESKTOP RENDERERS ---

  const renderDesktopLink = (item: NavItemConfig) => {
    const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href || '');
    return (
      <Link
        key={item.id}
        href={item.href!}
        className={`flex items-center gap-2 text-sm md:text-base lg:text-lg font-medium transition-colors px-1 ${
          isActive ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
        }`}
      >
        {item.label}
      </Link>
    );
  };

  const renderDesktopServices = (item: NavItemConfig) => {
    const isActive = pathname.startsWith('/proprete-services') || pathname.startsWith('/services');
    return (
      <div key={item.id} ref={servicesRef} className="relative">
        <button
          onClick={() => setIsServicesOpen(!isServicesOpen)}
          className={`flex items-center gap-1 md:gap-2 text-sm md:text-base lg:text-lg font-medium transition-colors px-1 ${
            isActive ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
          }`}
        >
          <span className="hidden lg:inline">{item.label}</span>
          <span className="lg:hidden">Services</span>
          <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
        </button>
        {isServicesOpen && (
          <div 
            className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-1rem)] md:max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className="p-2 border-b border-border flex-shrink-0">
              <Link
                href="/proprete-services"
                onClick={() => setIsServicesOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ${
                  pathname === '/proprete-services' ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground hover:bg-accent hover:text-accent-foreground bg-muted/50'
                }`}
              >
                Vue d&apos;ensemble des services
              </Link>
            </div>
            <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollbar-visible">
              <div className="p-2">
                {categories.map((category, categoryIndex) => (
                  <div key={category.id} className={categoryIndex > 0 ? 'mt-3 pt-3 border-t border-border' : ''}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3 tracking-wider">
                      {category.name}
                    </div>
                    <div className="space-y-0.5">
                      {category.services.map((service) => {
                        const href = `/proprete-services/${service.slug}`;
                        return (
                          <Link
                            key={service.id}
                            href={href}
                            onClick={() => setIsServicesOpen(false)}
                            className={`block px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                              pathname === href ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {service.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDesktopMedias = (item: NavItemConfig) => {
    const isActive = pathname.startsWith('/medias');
    return (
      <div key={item.id} ref={mediasRef} className="relative">
        <button
          onClick={() => setIsMediasOpen(!isMediasOpen)}
          className={`flex items-center gap-1 md:gap-2 text-sm md:text-base lg:text-lg font-medium transition-colors px-1 ${
            isActive ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
          }`}
        >
          {item.label}
          <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${isMediasOpen ? 'rotate-180' : ''}`} />
        </button>
        {isMediasOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 max-w-[calc(100vw-1rem)] md:max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
            <div className="p-2">
              <div className="mb-2 pb-2 border-b border-border">
                <Link
                  href="/medias"
                  onClick={() => setIsMediasOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ${
                    pathname === '/medias' ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground hover:bg-accent hover:text-accent-foreground bg-muted/50'
                  }`}
                >
                  Tous les médias
                </Link>
              </div>
              <Link
                href="/medias/actualites"
                onClick={() => setIsMediasOpen(false)}
                className={`block px-3 py-2.5 text-sm rounded-md transition-all duration-150 ${
                  pathname.startsWith('/medias/actualites') ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Actualités
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- MOBILE RENDERERS ---

  const renderMobileLink = (item: NavItemConfig) => {
    const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href || '');
    const Icon = item.icon;
    return (
      <SheetClose asChild key={item.id}>
        <Link
          href={item.href!}
          className={`flex items-center gap-2 text-base sm:text-lg font-medium transition-colors px-3 py-2 rounded-md ${
            isActive ? 'text-primary font-semibold bg-primary/10' : 'text-foreground hover:text-primary hover:bg-accent'
          }`}
          aria-hidden={!isOpen}
        >
          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
          {item.label}
        </Link>
      </SheetClose>
    );
  };

  const renderMobileServices = (item: NavItemConfig) => {
    const Icon = item.icon;
    return (
      <Accordion type="single" collapsible className="w-full" key={item.id}>
        <AccordionItem value="services" className="border-none">
          <AccordionTrigger className={`py-2 px-3 rounded-md hover:no-underline ${
            pathname.startsWith('/proprete-services') || pathname.startsWith('/services') ? 'text-primary font-semibold bg-primary/10' : 'text-foreground hover:bg-accent'
          }`}>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              <span className="text-base sm:text-lg font-medium">{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0">
            <div className="pl-4 space-y-2 border-l-2 border-border ml-2">
              <div className="mb-2 pb-2 border-b border-border/50">
                <SheetClose asChild>
                  <Link
                    href="/proprete-services"
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ${
                      pathname === '/proprete-services' ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground hover:bg-accent bg-muted/50'
                    }`}
                  >
                    Vue d&apos;ensemble des services
                  </Link>
                </SheetClose>
              </div>
              {categories.map((category, categoryIndex) => (
                <div key={category.id} className={categoryIndex > 0 ? 'pt-3 mt-3 border-t border-border/50' : ''}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2 tracking-wider">
                    {category.name}
                  </div>
                  <div className="space-y-0.5">
                    {category.services.map((service) => (
                      <SheetClose key={service.id} asChild>
                        <Link
                          href={`/proprete-services/${service.slug}`}
                          className={`block px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                            pathname === `/proprete-services/${service.slug}` ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-foreground hover:bg-accent'
                          }`}
                        >
                          {service.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderMobileMedias = (item: NavItemConfig) => {
    const Icon = item.icon;
    return (
      <Accordion type="single" collapsible className="w-full" key={item.id}>
        <AccordionItem value="medias" className="border-none">
          <AccordionTrigger className={`py-2 px-3 rounded-md hover:no-underline ${
            pathname.startsWith('/medias') ? 'text-primary font-semibold bg-primary/10' : 'text-foreground hover:bg-accent'
          }`}>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              <span className="text-base sm:text-lg font-medium">{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0">
            <div className="pl-4 space-y-2 border-l-2 border-border ml-2">
              <div className="mb-2 pb-2 border-b border-border/50">
                <SheetClose asChild>
                  <Link
                    href="/medias"
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ${
                      pathname === '/medias' ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground hover:bg-accent bg-muted/50'
                    }`}
                  >
                    Tous les médias
                  </Link>
                </SheetClose>
              </div>
              <SheetClose asChild>
                <Link
                  href="/medias/actualites"
                  className={`block px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                    pathname.startsWith('/medias/actualites') ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  Actualités
                </Link>
              </SheetClose>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <div className="flex fixed z-50 h-14 sm:h-16 w-full items-center justify-between bg-background px-3 sm:px-4 md:px-6 shadow-md">
      <Logo />
      <nav className="hidden items-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 xl:flex">
        {MENU_ITEMS.map((item) => {
          if (item.type === 'link') return renderDesktopLink(item);
          if (item.type === 'dropdown-services') return renderDesktopServices(item);
          if (item.type === 'dropdown-medias') return renderDesktopMedias(item);
          return null;
        })}
        <Button
          aria-label="Demander un devis"
          className="bg-primary text-white text-sm md:text-base lg:text-lg px-3 md:px-4 lg:px-6 py-2 flex items-center justify-center whitespace-nowrap"
          asChild
        >
          <Link href="/contact#contact-form" className="flex items-center justify-center">
            <span className="hidden xl:inline">Demander un devis</span>
            <span className="xl:hidden">Devis</span>
          </Link>
        </Button>
      </nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="xl:hidden">
            <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Ouvrir le menu de navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] sm:w-[320px] md:w-[380px]">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <div className="mb-6">
            <Logo />
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <nav className="grid gap-2 sm:gap-3 px-2 sm:px-4 pr-2 sm:pr-4">
              {MENU_ITEMS.map((item) => {
                if (item.type === 'link') return renderMobileLink(item);
                if (item.type === 'dropdown-services') return renderMobileServices(item);
                if (item.type === 'dropdown-medias') return renderMobileMedias(item);
                return null;
              })}
              <SheetClose asChild>
                <Button
                  aria-label="Demander un devis"
                  className="bg-primary text-white text-base sm:text-lg px-4 sm:px-6 py-2.5 sm:py-2 flex items-center justify-center w-full mt-2"
                  asChild
                >
                  <Link href="/contact#contact-form" className="flex items-center justify-center">
                    Demander un devis
                  </Link>
                </Button>
              </SheetClose>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}