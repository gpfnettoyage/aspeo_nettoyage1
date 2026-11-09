// Main components
export { default as ServiceEditor } from './ServiceEditor';
export { default as ServiceEditorLayout } from './ServiceEditorLayout';

// Form components
export { default as CollapsibleSection } from './form/CollapsibleSection';
export { SectionProgress, calculateSectionProgress, calculateContentProgress } from './form/SectionProgress';

// Form sections (ordered to EXACTLY match public page layout)
export { default as GeneralInfoSection } from './form/sections/GeneralInfoSection';
export { default as SEOSection } from './form/sections/SEOSection';
export { default as HeroSection } from './form/sections/HeroSection';
export { default as ContentSection } from './form/sections/ContentSection';
export { default as ExpertiseSection } from './form/sections/ExpertiseSection';
export { default as TargetSpacesSection } from './form/sections/TargetSpacesSection';
export { default as PrestationsSection } from './form/sections/PrestationsSection';
export { default as SubServicesSection } from './form/sections/SubServicesSection';
export { default as ProcessSection } from './form/sections/ProcessSection';
export { default as GuaranteesSection } from './form/sections/GuaranteesSection';
export { default as ApplicationSectorsSection } from './form/sections/ApplicationSectorsSection';
export { default as WhyChooseSection } from './form/sections/WhyChooseSection';
export { default as FAQSection } from './form/sections/FAQSection';
export { default as CTASection } from './form/sections/CTASection';

// Preview components
export { default as ServicePreview } from './preview/ServicePreview';
export { default as SERPPreview } from './preview/SERPPreview';
export { default as SEOScoreCard } from './preview/SEOScoreCard';
export { default as PreviewTabs } from './preview/PreviewTabs';

// Hooks
export { useAutoSave, formatAutoSaveStatus } from './hooks/useAutoSave';
