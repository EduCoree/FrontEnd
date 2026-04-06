export interface Category {
  id: number;
  name: string;
  slug: string;
  centerId: number;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}