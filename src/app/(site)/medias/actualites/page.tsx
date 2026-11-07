import { permanentRedirect } from 'next/navigation';

/** L'ancienne liste /medias/actualites est fusionnée dans /medias (redirection 301, pas de contenu dupliqué). */
export default function ActualitesIndex() {
  permanentRedirect('/medias');
}
