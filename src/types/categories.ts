// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithCount extends Category {
  _count: {
    services: number;
  };
}

export interface CategoryOption {
  value: string;
  label: string;
}
