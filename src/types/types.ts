// API Types - Matching your backend DTOs exactly

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// User Types (matching backend User entity)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthorDTO {
  id: string;
  name: string;
}

// Category Types (matching backend DTOs)
export interface Category {
  id: string;
  name: string;
  postCount: number;
}

export interface CreateCategoryRequest {
  name: string;
}

// Tag Types (matching backend DTOs)
export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface CreateTagsRequest {
  names: string[];
}

export interface TagDTO {
  id: string;
  name: string;
  postCount?: number;
}

// Post Types (matching backend DTOs)
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: AuthorDTO;
  category: Category;
  tags: TagDTO[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  status: PostStatus;
}

export interface CreatePostRequestDTO {
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
}

export interface UpdatePostRequestDTO {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
}

// API Error Types (matching backend)
export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination Types (for future use)
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}