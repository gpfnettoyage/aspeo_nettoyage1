'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SEOScoreCardProps {
  title: string;
  seoTitle: string;
  seoDesc: string;
  slug: string;
  content: {
    descriptions?: string[];
    introText?: string;
    faq?: Array<{ question: string; answer: string }>;
  };
}

interface ScoreItem {
  label: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'error';
  message: string;
}

/**
 * Calculate SEO score based on various factors
 */
function calculateSEOScore(props: SEOScoreCardProps): {
  overall: number;
  items: ScoreItem[];
} {
  const { title, seoTitle, seoDesc, slug, content } = props;
  const items: ScoreItem[] = [];

  // 1. Title check (20 points)
  const effectiveTitle = seoTitle || title;
  const titleLength = effectiveTitle.length;
  let titleScore = 0;
  let titleStatus: 'good' | 'warning' | 'error' = 'error';
  let titleMessage = '';

  if (titleLength === 0) {
    titleMessage = 'Titre manquant';
  } else if (titleLength < 30) {
    titleScore = 10;
    titleStatus = 'warning';
    titleMessage = 'Titre trop court (< 30 caractères)';
  } else if (titleLength <= 60) {
    titleScore = 20;
    titleStatus = 'good';
    titleMessage = 'Longueur optimale';
  } else {
    titleScore = 12;
    titleStatus = 'warning';
    titleMessage = 'Titre trop long (> 60 caractères)';
  }

  items.push({
    label: 'Titre SEO',
    score: titleScore,
    maxScore: 20,
    status: titleStatus,
    message: titleMessage,
  });

  // 2. Description check (25 points)
  const descLength = seoDesc.length;
  let descScore = 0;
  let descStatus: 'good' | 'warning' | 'error' = 'error';
  let descMessage = '';

  if (descLength === 0) {
    descMessage = 'Description manquante';
  } else if (descLength < 70) {
    descScore = 12;
    descStatus = 'warning';
    descMessage = 'Description trop courte (< 70 caractères)';
  } else if (descLength <= 160) {
    descScore = 25;
    descStatus = 'good';
    descMessage = 'Longueur optimale';
  } else {
    descScore = 15;
    descStatus = 'warning';
    descMessage = 'Description trop longue (> 160 caractères)';
  }

  items.push({
    label: 'Description SEO',
    score: descScore,
    maxScore: 25,
    status: descStatus,
    message: descMessage,
  });

  // 3. Slug check (15 points)
  let slugScore = 0;
  let slugStatus: 'good' | 'warning' | 'error' = 'error';
  let slugMessage = '';

  if (!slug) {
    slugMessage = 'Slug manquant';
  } else if (slug.length > 50) {
    slugScore = 8;
    slugStatus = 'warning';
    slugMessage = 'Slug trop long';
  } else if (/^[a-z0-9-]+$/.test(slug)) {
    slugScore = 15;
    slugStatus = 'good';
    slugMessage = 'Format optimal';
  } else {
    slugScore = 5;
    slugStatus = 'error';
    slugMessage = 'Caractères non valides';
  }

  items.push({
    label: 'URL (Slug)',
    score: slugScore,
    maxScore: 15,
    status: slugStatus,
    message: slugMessage,
  });

  // 4. Content check (25 points)
  const hasDescriptions =
    content.descriptions && content.descriptions.length > 0;
  const hasIntro = content.introText && content.introText.length > 50;
  const contentLength =
    (content.descriptions?.join(' ').length || 0) +
    (content.introText?.length || 0);

  let contentScore = 0;
  let contentStatus: 'good' | 'warning' | 'error' = 'error';
  let contentMessage = '';

  if (!hasDescriptions && !hasIntro) {
    contentMessage = 'Contenu manquant';
  } else if (contentLength < 200) {
    contentScore = 10;
    contentStatus = 'warning';
    contentMessage = 'Contenu trop court';
  } else if (contentLength < 500) {
    contentScore = 18;
    contentStatus = 'warning';
    contentMessage = 'Contenu correct mais peut être enrichi';
  } else {
    contentScore = 25;
    contentStatus = 'good';
    contentMessage = 'Contenu riche et détaillé';
  }

  items.push({
    label: 'Contenu',
    score: contentScore,
    maxScore: 25,
    status: contentStatus,
    message: contentMessage,
  });

  // 5. FAQ check (15 points)
  const faqCount = content.faq?.length || 0;
  let faqScore = 0;
  let faqStatus: 'good' | 'warning' | 'error' = 'error';
  let faqMessage = '';

  if (faqCount === 0) {
    faqMessage = 'Pas de FAQ (recommandé pour le SEO)';
  } else if (faqCount < 3) {
    faqScore = 8;
    faqStatus = 'warning';
    faqMessage = `${faqCount} question(s) - ajoutez-en plus`;
  } else {
    faqScore = 15;
    faqStatus = 'good';
    faqMessage = `${faqCount} questions - excellent pour le SEO`;
  }

  items.push({
    label: 'FAQ',
    score: faqScore,
    maxScore: 15,
    status: faqStatus,
    message: faqMessage,
  });

  // Calculate overall score
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  const maxTotal = items.reduce((sum, item) => sum + item.maxScore, 0);
  const overall = Math.round((totalScore / maxTotal) * 100);

  return { overall, items };
}

export default function SEOScoreCard(props: SEOScoreCardProps) {
  const { overall, items } = useMemo(() => calculateSEOScore(props), [props]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Score SEO</h3>
        </div>
        <div
          className={cn(
            'text-2xl font-bold',
            getScoreColor(overall)
          )}
        >
          {overall}/100
        </div>
      </div>

      <Progress value={overall} className={cn('h-2 mb-4', getScoreBgColor(overall))} />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {getStatusIcon(item.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {overall < 60 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-700">
            <strong>Attention :</strong> Le score SEO est faible. Améliorez les
            éléments en rouge pour optimiser le référencement.
          </p>
        </div>
      )}

      {overall >= 80 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs text-green-700">
            <strong>Excellent !</strong> Votre page est bien optimisée pour le
            référencement.
          </p>
        </div>
      )}
    </div>
  );
}
