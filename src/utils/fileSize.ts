import fs from 'fs';
import path from 'path';

/**
 * Formate la taille d'un fichier en octets en une chaîne lisible (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Obtient la taille d'un fichier à partir de son chemin relatif au dossier public
 * @param filePath - Chemin relatif depuis /public (ex: "/documents/presse/file.pdf")
 * @returns La taille formatée ou null si le fichier n'existe pas
 */
export function getFileSize(filePath: string): string | null {
  try {
    // Construire le chemin absolu vers le fichier dans le dossier public
    const publicPath = path.join(process.cwd(), 'public', filePath);

    // Vérifier si le fichier existe
    if (!fs.existsSync(publicPath)) {
      return null;
    }

    // Obtenir les stats du fichier
    const stats = fs.statSync(publicPath);

    // Retourner la taille formatée
    return formatFileSize(stats.size);
  } catch (error) {
    console.error(`Erreur lors de la lecture de la taille du fichier ${filePath}:`, error);
    return null;
  }
}
