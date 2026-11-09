import reviewsData from '@/data/reviews.json';

export interface Review {
  id: number;
  nom: string;
  date: string;
  commentaire: string;
}

export const getReviews = (): Review[] => {
  return reviewsData.reviews;
};

export const getReviewsForMarquee = () => {
  const reviews = getReviews();
  const halfLength = Math.ceil(reviews.length / 2);
  
  return {
    firstRow: reviews.slice(0, halfLength),
    secondRow: reviews.slice(halfLength)
  };
};

