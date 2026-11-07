export interface ActualiteFAQ {
  question: string;
  answer: string;
}

export interface ActualiteCTA {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface Actualite {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  dateModified?: string; // Date de modification optionnelle (format YYYY-MM-DD)
  category?: string;
  tags?: string[];
  faq?: ActualiteFAQ[];
  cta?: ActualiteCTA;
}

export interface ActualiteItem extends Actualite {
  type?: string;
  mediaType: 'actualite';
}




