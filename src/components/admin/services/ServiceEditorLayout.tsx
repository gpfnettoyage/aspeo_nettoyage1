'use client';

import { useSyncExternalStore } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, Eye } from 'lucide-react';

const DESKTOP_BREAKPOINT = 1280;

interface ServiceEditorLayoutProps {
  formContent: React.ReactNode;
  previewContent: React.ReactNode;
}

export default function ServiceEditorLayout({
  formContent,
  previewContent,
}: ServiceEditorLayoutProps) {
  // undefined côté serveur (rien n'est rendu avant l'hydratation), puis largeur réelle de la fenêtre.
  const isDesktop = useSyncExternalStore<boolean | undefined>(
    (onChange) => {
      const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches,
    () => undefined,
  );

  // SSR / Loading - avoid hydration mismatch
  if (isDesktop === undefined) {
    return null;
  }

  // Mobile/Tablet: Tabs with ScrollArea
  if (!isDesktop) {
    return (
      <Tabs defaultValue="edit" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <PenLine className="size-4" />
            Édition
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="size-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full rounded-lg border bg-background">
            <div className="p-4">{formContent}</div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full rounded-lg border bg-gray-50">
            {previewContent}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop: Resizable panels with ScrollArea
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full rounded-lg border"
    >
      <ResizablePanel
        defaultSize="60%"
        minSize="40%"
        maxSize="75%"
        className="bg-background"
      >
        <ScrollArea className="h-full">
          <div className="p-4 xl:p-6">{formContent}</div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize="40%"
        minSize="25%"
        maxSize="60%"
        className="bg-gray-50"
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 bg-gray-100 border-b px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="size-4" />
              <span>Prévisualisation</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3">{previewContent}</div>
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
