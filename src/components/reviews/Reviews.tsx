import { cn } from '@/lib/utils';
import { Marquee } from '@/components/magicui/marquee';
import Link from 'next/link';
import { getInitials } from '@/utils/initials';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getReviewsForMarquee } from '@/services/reviewsService';

const { firstRow, secondRow } = getReviewsForMarquee();

const ReviewCard = ({
  nom,
  date,
  commentaire,
}: {
  nom: string;
  date: string;
  commentaire: string;
}) => {
  const initials = getInitials(nom);

  return (
    <figure
      className={cn(
        'relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4',
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Avatar className="size-10 shadow-md border-2 border-primary">
          <AvatarFallback className="font-bold bg-primary/10 text-primary leading-none">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {nom}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{date}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm line-clamp-3">
        {commentaire}
      </blockquote>
    </figure>
  );
};

export function Reviews() {
  return (
    <div className="container py-12">
      <h2 className="text-3xl text-center font-bold">
        CE QUE DISENT NOS CLIENTS
      </h2>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background py-6">
        <Link href="/avis">
          <Marquee pauseOnHover >
            {firstRow.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover>
            {secondRow.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </Link>
      </div>
    </div>
  );
}
