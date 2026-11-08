-- Ajout du statut « Devis envoyé » (additif, aucune donnée modifiée)
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'QUOTED' BEFORE 'DONE';
