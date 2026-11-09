'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Upload,
  X,
  Check,
  Loader2,
  ImageIcon,
  AlertCircle,
  FileImage,
  Trash2,
  FolderOpen,
  ChevronDown,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImagePreview } from './hooks/useImagePreview';
import ImageComparisonSlider from './ImageComparisonSlider';
import { uploadImageAction, deleteImageAction, listImagesAction, type ImageInfo } from '@/actions/upload/upload.actions';
import { UPLOAD_LIMITS } from '@/actions/upload/schema';
import { formatFileSize } from '@/actions/upload/security';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================
interface ImageUploaderProps {
  /** Current image URL */
  value: string;
  /** Callback when image changes */
  onChange: (url: string) => void;
  /** Service slug for organizing images */
  serviceSlug: string;
  /** Label for the field */
  label?: string;
  /** Description text */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

type UploadStatus = 'idle' | 'previewing' | 'uploading' | 'success' | 'error';

// ============================================
// Helpers
// ============================================
function validateFile(file: File): string | null {
  // Check MIME type
  if (!UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as typeof UPLOAD_LIMITS.ALLOWED_MIME_TYPES[number])) {
    return `Type non autorisé. Acceptés: JPEG, PNG, WebP`;
  }

  // Check size
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    return `Fichier trop volumineux. Maximum: ${formatFileSize(UPLOAD_LIMITS.MAX_FILE_SIZE)}`;
  }

  return null;
}

/** Extract folder name from pathname (services/{folder}/{filename}) */
function extractFolderFromPathname(pathname: string): string {
  // pathname format: services/{folder}/{filename}.webp
  const parts = pathname.split('/');
  if (parts.length >= 2 && parts[0] === 'services') {
    return parts[1];
  }
  return 'autres';
}

/** Group images by folder */
function groupImagesByFolder(images: ImageInfo[]): Map<string, ImageInfo[]> {
  const groups = new Map<string, ImageInfo[]>();

  for (const img of images) {
    const folder = extractFolderFromPathname(img.pathname);
    if (!groups.has(folder)) {
      groups.set(folder, []);
    }
    groups.get(folder)!.push(img);
  }

  // Sort groups alphabetically, but put current service first (handled in component)
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

// ============================================
// Component
// ============================================
export default function ImageUploader({
  value,
  onChange,
  serviceSlug,
  label = 'Image',
  description,
  className,
  disabled = false,
}: ImageUploaderProps) {
  // State
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(UPLOAD_LIMITS.DEFAULT_QUALITY);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>(serviceSlug);

  // Gallery state
  const [existingImages, setExistingImages] = useState<ImageInfo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set([serviceSlug]));

  // Group images by folder
  const groupedImages = useMemo(() => groupImagesByFolder(existingImages), [existingImages]);

  // Get unique folders from existing images + current service
  const availableFolders = useMemo(() => {
    const folders = new Set<string>([serviceSlug]);
    existingImages.forEach(img => {
      folders.add(extractFolderFromPathname(img.pathname));
    });
    return [...folders].sort((a, b) => {
      // Put current service first
      if (a === serviceSlug) return -1;
      if (b === serviceSlug) return 1;
      return a.localeCompare(b);
    });
  }, [existingImages, serviceSlug]);

  // Sort grouped images to put current service first
  const sortedGroupedImages = useMemo(() => {
    const sorted = new Map<string, ImageInfo[]>();
    // Add current service first if it exists
    if (groupedImages.has(serviceSlug)) {
      sorted.set(serviceSlug, groupedImages.get(serviceSlug)!);
    }
    // Add rest
    groupedImages.forEach((imgs, folder) => {
      if (folder !== serviceSlug) {
        sorted.set(folder, imgs);
      }
    });
    return sorted;
  }, [groupedImages, serviceSlug]);

  // Preview hook
  const {
    originalPreview,
    webpPreview,
    originalSize,
    estimatedWebPSize,
    dimensions,
    isLoading: previewLoading,
    error: previewError,
    generateWebPPreview,
    reset: resetPreview,
  } = useImagePreview(file);

  // Generate WebP preview when quality changes
  useEffect(() => {
    if (originalPreview && status === 'previewing') {
      const debounce = setTimeout(() => {
        generateWebPPreview(quality);
      }, 150);
      return () => clearTimeout(debounce);
    }
  }, [quality, originalPreview, status, generateWebPPreview]);

  // Load existing images when dialog opens (not just gallery tab)
  useEffect(() => {
    if (open && existingImages.length === 0) {
      loadExistingImages();
    }
  }, [open, existingImages.length]);

  const loadExistingImages = async () => {
    setLoadingGallery(true);
    try {
      // Load images from all services (no filter)
      const result = await listImagesAction({});
      if (result.success) {
        setExistingImages(result.data);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSelectExistingImage = () => {
    if (selectedImage) {
      onChange(selectedImage);
      toast.success('Image sélectionnée');
      setOpen(false);
      resetForm();
    }
  };

  // Handlers
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setStatus('previewing');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = async () => {
    if (!file || !originalPreview) return;

    setStatus('uploading');
    setError(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const result = await uploadImageAction({
        fileData: base64,
        fileName: file.name,
        mimeType: file.type as typeof UPLOAD_LIMITS.ALLOWED_MIME_TYPES[number],
        fileSize: file.size,
        quality,
        serviceSlug: uploadFolder,
      });

      if (result.success) {
        setStatus('success');
        onChange(result.data.url);
        toast.success('Image uploadée avec succès', {
          description: `Compression: ${result.data.compressionRatio}`,
        });

        // Close after short delay
        setTimeout(() => {
          setOpen(false);
          resetForm();
        }, 1000);
      } else {
        setStatus('error');
        setError(result.error);
        toast.error(result.error);
      }
    } catch {
      setStatus('error');
      setError('Une erreur inattendue est survenue');
      toast.error("Erreur lors de l'upload");
    }
  };

  const handleDelete = async () => {
    if (!value || !value.includes('blob.vercel-storage.com')) {
      // Just clear the value for non-blob images
      onChange('');
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteImageAction({ url: value, serviceSlug });

      if (result.success) {
        onChange('');
        toast.success('Image supprimée');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
    setQuality(UPLOAD_LIMITS.DEFAULT_QUALITY);
    setUploadFolder(serviceSlug);
    setSelectedImage(null);
    setActiveTab('upload');
    resetPreview();
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  };

  const handleClear = () => {
    onChange('');
  };

  // Compression ratio calculation
  // Quand quality = 100%, on affiche la taille originale (pas de compression)
  const displayedWebPSize = quality === 100 ? originalSize : estimatedWebPSize;

  const compressionInfo = useMemo(() => {
    if (!originalSize || !displayedWebPSize) return null;

    // Si qualité 100%, pas de compression, ratio = 0
    if (quality === 100) {
      return {
        percentage: '0',
        isSmaller: false,
        warning: 'Qualité 100% = pas de compression',
      };
    }

    const ratio = ((1 - displayedWebPSize / originalSize) * 100);
    const isSmaller = displayedWebPSize < originalSize;

    return {
      percentage: Math.abs(ratio).toFixed(1),
      isSmaller,
      // Si le fichier grossit, c'est probablement déjà un WebP ou très compressé
      warning: !isSmaller ? 'Image déjà optimisée - la compression serveur sera meilleure' : null,
    };
  }, [originalSize, displayedWebPSize, quality]);

  // Check if current value is a blob URL
  const isBlobUrl = value.includes('blob.vercel-storage.com');

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <div className="flex gap-2">
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!disabled) {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="flex-1 justify-start text-left font-normal h-auto min-h-10 py-2"
            >
              {value ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={value}
                      alt="Selected"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="truncate text-sm text-muted-foreground">
                    {isBlobUrl ? 'Image Blob' : value}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  <span>Uploader une image...</span>
                </div>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Sélectionner une image</DialogTitle>
              <DialogDescription>
                Uploadez une nouvelle image ou sélectionnez parmi les images existantes
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'gallery')} className="flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Uploader
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Galerie {loadingGallery ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `(${existingImages.length})`
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Upload Tab */}
              <TabsContent value="upload" className="mt-4 flex-1 min-h-0">
                <ScrollArea className="h-[55vh]">
                  <div className="space-y-4 pr-4">
                    {/* Drop Zone / File Selection */}
                    {status === 'idle' && (
                      <div
                        className={cn(
                          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Glissez une image ici ou cliquez pour sélectionner
                        </p>
                        <input
                          id="file-input"
                          type="file"
                          accept={UPLOAD_LIMITS.ALLOWED_MIME_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileSelect(f);
                            e.target.value = ''; // Reset input
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-4">
                          JPEG, PNG, WebP - Max {formatFileSize(UPLOAD_LIMITS.MAX_FILE_SIZE)}
                        </p>
                      </div>
                    )}

                    {/* Error Display */}
                    {(error || previewError) && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm">{error || previewError}</p>
                      </div>
                    )}

                    {/* Preview and Compression */}
                    {(status === 'previewing' || status === 'uploading' || status === 'success') && (
                      <div className="space-y-4">
                        {/* Folder Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="upload-folder">Dossier de destination</Label>
                          <Select
                            value={uploadFolder}
                            onValueChange={setUploadFolder}
                            disabled={status === 'uploading'}
                          >
                            <SelectTrigger id="upload-folder">
                              <SelectValue placeholder="Sélectionner un dossier" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="max-h-[200px]">
                                {availableFolders.map((folder) => (
                                  <SelectItem key={folder} value={folder}>
                                    <div className="flex items-center gap-2">
                                      <Folder className="w-4 h-4" />
                                      <span>{folder}</span>
                                      {folder === serviceSlug && (
                                        <span className="text-xs text-muted-foreground">(actuel)</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Squoosh-style comparison slider */}
                        {previewLoading ? (
                          <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-muted rounded-lg overflow-hidden border flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : originalPreview && webpPreview ? (
                          <ImageComparisonSlider
                            originalSrc={originalPreview}
                            compressedSrc={webpPreview}
                            alt={file?.name || 'Image'}
                            compressedLabel="WebP (aperçu)"
                          />
                        ) : originalPreview ? (
                          <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-muted rounded-lg overflow-hidden border">
                            <Image
                              src={originalPreview}
                              alt="Original"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : null}

                        {/* Note about preview accuracy */}
                        <p className="text-xs text-muted-foreground text-center italic">
                          Aperçu navigateur peu fiable. Le serveur compressera mieux (taille finale ~30-60% de l&apos;original).
                        </p>

                        {/* Size comparison info - just above quality slider */}
                        <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">Original</span>
                            <span className="text-muted-foreground">{formatFileSize(originalSize)}</span>
                            {dimensions && (
                              <span className="text-xs text-muted-foreground">
                                {dimensions.width} x {dimensions.height} px
                              </span>
                            )}
                          </div>
                          <div className="text-center">
                            <span className="text-2xl">→</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">WebP</span>
                            <span className="text-muted-foreground">
                              ~{formatFileSize(displayedWebPSize)}
                              {compressionInfo && (
                                <span className={cn('ml-1', compressionInfo.isSmaller ? 'text-green-600' : 'text-amber-600')}>
                                  ({compressionInfo.isSmaller ? '-' : '+'}{compressionInfo.percentage}%)
                                </span>
                              )}
                            </span>
                            {compressionInfo?.warning && (
                              <span className="text-xs text-amber-600">{compressionInfo.warning}</span>
                            )}
                          </div>
                        </div>

                        {/* Quality Slider */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="quality-slider">Qualité de compression</Label>
                            <span className="text-sm font-medium tabular-nums">{quality}%</span>
                          </div>
                          <input
                            id="quality-slider"
                            type="range"
                            min={UPLOAD_LIMITS.MIN_QUALITY}
                            max={UPLOAD_LIMITS.MAX_QUALITY}
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            disabled={status === 'uploading'}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Compression forte</span>
                            <span>Qualité maximale</span>
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {status === 'uploading' && (
                          <div className="space-y-2">
                            <Progress value={undefined} className="h-2" />
                            <p className="text-sm text-center text-muted-foreground">
                              Upload en cours...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Upload Footer Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  {status === 'idle' && (
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                      Annuler
                    </Button>
                  )}

                  {status === 'previewing' && (
                    <>
                      <Button type="button" variant="ghost" onClick={resetForm}>
                        Changer d'image
                      </Button>
                      <Button type="button" onClick={handleUpload} disabled={previewLoading}>
                        <Upload className="w-4 h-4 mr-2" />
                        Uploader
                      </Button>
                    </>
                  )}

                  {status === 'uploading' && (
                    <Button disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Upload en cours...
                    </Button>
                  )}

                  {status === 'success' && (
                    <Button variant="outline" className="text-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      Upload réussi!
                    </Button>
                  )}

                  {status === 'error' && (
                    <Button type="button" variant="ghost" onClick={resetForm}>
                      Réessayer
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="mt-4 flex-1 min-h-0">
                {loadingGallery ? (
                  <div className="flex items-center justify-center h-[55vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : existingImages.length === 0 ? (
                  <div className="text-center h-[55vh] flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                    <p>Aucune image dans la galerie</p>
                    <p className="text-sm">Uploadez une image pour commencer</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[55vh]">
                    <div className="space-y-3 pr-4 pb-2">
                      {[...sortedGroupedImages.entries()].map(([folder, images]) => (
                        <Collapsible
                          key={folder}
                          open={openFolders.has(folder)}
                          onOpenChange={() => toggleFolder(folder)}
                        >
                          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 transition-transform',
                                openFolders.has(folder) ? '' : '-rotate-90'
                              )}
                            />
                            <Folder className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{folder}</span>
                            <span className="text-xs text-muted-foreground">
                              ({images.length})
                            </span>
                            {folder === serviceSlug && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                actuel
                              </span>
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 pl-6">
                              {images.map((img) => (
                                <button
                                  key={img.url}
                                  type="button"
                                  onClick={() => setSelectedImage(img.url)}
                                  className={cn(
                                    'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                                    selectedImage === img.url
                                      ? 'border-primary ring-2 ring-primary/20'
                                      : 'border-transparent hover:border-muted-foreground/50'
                                  )}
                                >
                                  <Image
                                    src={img.url}
                                    alt={img.pathname}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, 33vw"
                                  />
                                  {selectedImage === img.url && (
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                      <Check className="w-6 h-6 text-primary" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">
                                    {formatFileSize(img.size)}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Gallery Footer Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSelectExistingImage}
                    disabled={!selectedImage}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Sélectionner
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Clear/Delete Button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isBlobUrl ? handleDelete : handleClear}
            disabled={disabled || isDeleting}
            className="flex-shrink-0"
            title={isBlobUrl ? 'Supprimer' : 'Retirer'}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBlobUrl ? (
              <Trash2 className="w-4 h-4 text-destructive" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* Current Image Preview */}
      {value && (
        <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden bg-muted border mt-2">
          <Image
            src={value}
            alt="Current image"
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
