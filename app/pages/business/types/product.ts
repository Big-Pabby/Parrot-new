export interface ProductCategory {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  metrics: string[];
  slug: string;
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSubCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  categoryIds: string[];
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  subCategory: ProductSubCategory | null;
  description: string;
  price: number;
  currency: string;
  media: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, unknown>;
  stockQuantity: number | null;
  reviews: unknown[];
  averageRating: number;
  totalReviews: number;
  totalRatingSum: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  sku: string;
  __v: number;
  id: string;
  business: string;
}

export interface ProductPaginatedResponse {
  docs: Product[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}