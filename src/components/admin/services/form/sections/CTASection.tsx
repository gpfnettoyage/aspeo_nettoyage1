'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateServiceInput } from '@/actions/services/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, CheckCircle, ShieldCheck, Zap, Clock, Star, Award, Users, MapPin, Heart, Sparkles } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import { DEFAULT_CTA_SECTION } from '@/types/services';

interface CTASectionProps {
  form: UseFormReturn<CreateServiceInput>;
}

// Available icons for CTA section badges
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

export default function CTASection({ form }: CTASectionProps) {
  const { watch, setValue } = form;

  const content = watch('content');
  const ctaSection = content?.ctaSection;

  // Get badges with defaults
  const badges = ctaSection?.badges || DEFAULT_CTA_SECTION.badges;

  const progress = ctaSection?.title || (badges && badges.length > 0) ? 100 : 0;

  const updateBadge = (index: number, field: 'icon' | 'text', value: string) => {
    const newBadges = [...badges];
    if (!newBadges[index]) {
      newBadges[index] = { icon: 'CheckCircle', text: '' };
    }
    newBadges[index] = { ...newBadges[index], [field]: value };
    setValue('content.ctaSection.badges', newBadges);
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = BADGE_ICONS.find(i => i.value === iconName);
    return iconConfig?.icon || CheckCircle;
  };

  return (
    <CollapsibleSection
      title="Section CTA"
      icon={Megaphone}
      progress={progress}
      defaultOpen={false}
      description="Section d'appel à l'action (bas de page)"
    >
      <div className="space-y-4 pt-4">
        {/* CTA Section Title */}
        <div className="space-y-2">
          <Label htmlFor="ctaSection.title">Titre de la section</Label>
          <Input
            id="ctaSection.title"
            defaultValue={ctaSection?.title || DEFAULT_CTA_SECTION.title}
            onChange={(e) => setValue('content.ctaSection.title', e.target.value)}
            placeholder={DEFAULT_CTA_SECTION.title}
          />
        </div>

        {/* CTA Section Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="ctaSection.subtitle">Sous-titre</Label>
          <Textarea
            id="ctaSection.subtitle"
            rows={2}
            defaultValue={ctaSection?.subtitle || DEFAULT_CTA_SECTION.subtitle}
            onChange={(e) => setValue('content.ctaSection.subtitle', e.target.value)}
            placeholder={DEFAULT_CTA_SECTION.subtitle}
          />
        </div>

        {/* CTA Section Badges */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Badges</Label>
            <p className="text-xs text-muted-foreground mt-1">
              3 badges affichés sous les boutons
            </p>
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((index) => {
              const badge = badges[index] || DEFAULT_CTA_SECTION.badges[index];
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
                      placeholder={DEFAULT_CTA_SECTION.badges[index]?.text || `Badge ${index + 1}`}
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
