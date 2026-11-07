'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, CheckCircle, ShieldCheck, Zap, Clock, Star, Award, Users, MapPin, Heart, Sparkles } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { calculateSectionProgress } from '../SectionProgress';
import ImageUploader from '@/components/admin/upload/ImageUploader';
import { DEFAULT_HERO_BADGES } from '@/types/services';

interface HeroSectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

// Available icons for hero badges
const BADGE_ICONS = [
  { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
  { value: 'ShieldCheck', label: 'Bouclier', icon: ShieldCheck },
  { value: 'Zap', label: 'Éclair', icon: Zap },
  { value: 'Clock', label: 'Horloge', icon: Clock },
  { value: 'Star', label: 'Étoile', icon: Star },
  { value: 'Award', label: 'Récompense', icon: Award },
  { value: 'Users', label: 'Utilisateurs', icon: Users },
  { value: 'MapPin', label: 'Localisation', icon: MapPin },
  { value: 'Heart', label: 'Cœur', icon: Heart },
  { value: 'Sparkles', label: 'Étincelles', icon: Sparkles },
] as const;

type BadgeIconValue = typeof BADGE_ICONS[number]['value'];

export default function HeroSection({ form }: HeroSectionProps) {
  const { watch, setValue } = form;

  const slug = watch('slug') || 'nouveau-service';
  const content = watch('content');
  const images = content?.images || [];
  const heroBadges = content?.heroBadges || DEFAULT_HERO_BADGES;

  const progress = calculateSectionProgress(
    {
      introText: content?.introText,
      heroImage: images[0],
      heroBadges: heroBadges.length > 0,
    },
    ['introText']
  );

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    // Keep array structure up to the highest non-empty index
    const lastNonEmpty = newImages.reduce((acc, img, i) => (img ? i : acc), -1);
    setValue('content.images', newImages.slice(0, lastNonEmpty + 1));
  };

  const updateBadge = (index: number, field: 'icon' | 'text', value: string) => {
    const newBadges = [...heroBadges];
    if (!newBadges[index]) {
      newBadges[index] = { icon: 'CheckCircle', text: '' };
    }
    newBadges[index] = { ...newBadges[index], [field]: value };
    setValue('content.heroBadges', newBadges);
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = BADGE_ICONS.find(i => i.value === iconName);
    return iconConfig?.icon || CheckCircle;
  };

  return (
    <CollapsibleSection
      title="Hero"
      icon={ImageIcon}
      progress={progress}
      defaultOpen={false}
      description="Texte d'accroche, image et badges"
    >
      <div className="space-y-6 pt-4">
        {/* Intro Text */}
        <div className="space-y-2">
          <Label htmlFor="introText">Texte d&apos;introduction</Label>
          <Textarea
            id="introText"
            rows={4}
            defaultValue={content?.introText || ''}
            onChange={(e) => setValue('content.introText', e.target.value)}
            placeholder="Texte d'accroche affiché sous le titre dans le hero..."
          />
          <p className="text-xs text-muted-foreground">
            Si vide, la première description sera utilisée.
          </p>
        </div>

        {/* Hero Image */}
        <ImageUploader
          value={images[0] || ''}
          onChange={(url) => updateImage(0, url)}
          serviceSlug={slug}
          label="Image de fond (Hero)"
          description="Image affichée en arrière-plan du hero. Sera convertie en WebP."
        />

        {/* Hero Badges */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Badges du Hero</Label>
            <p className="text-xs text-muted-foreground mt-1">
              3 badges affichés sous le texte d&apos;introduction
            </p>
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((index) => {
              const badge = heroBadges[index] || DEFAULT_HERO_BADGES[index];
              const IconComponent = getIconComponent(badge?.icon || 'CheckCircle');

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 grid grid-cols-[120px_1fr] gap-2">
                    <Select
                      value={badge?.icon || 'CheckCircle'}
                      onValueChange={(value) => updateBadge(index, 'icon', value as BadgeIconValue)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Icône" />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_ICONS.map((iconOption) => {
                          const Icon = iconOption.icon;
                          return (
                            <SelectItem key={iconOption.value} value={iconOption.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{iconOption.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <Input
                      value={badge?.text || ''}
                      onChange={(e) => updateBadge(index, 'text', e.target.value)}
                      placeholder={DEFAULT_HERO_BADGES[index]?.text || `Badge ${index + 1}`}
                      className="h-9"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
