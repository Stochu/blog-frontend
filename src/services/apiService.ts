import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import {
  LoginRequest,
  AuthenticationResponse,
  TokenRefreshRequest,
  LogoutRequest,
  Category,
  CreateCategoryRequest,
  Tag,
  CreateTagsRequest,
  TagDTO,
  Post,
  CreatePostRequestDTO,
  UpdatePostRequestDTO,
  PostStatus,
  ApiError,
  PageRequest
} from '../types/types';

// Extend axios request config to include our custom "_retry" flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              
              // Update the authorization header and retry the request
              if (originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              }
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401) {
          this.clearTokens();
          window.location.href = '/login';
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError;
    }
    return {
      status: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred'
    };
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
  }

  // Auth endpoints
  public async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
    const response: AxiosResponse<AuthenticationResponse> = await this.api.post('/auth/login', credentials);
    
    // Store tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('tokenType', response.data.tokenType);
    localStorage.setItem('expiresIn', response.data.expiresIn.toString());
    
    return response.data;
  }

  public async refreshToken(refreshToken: string): Promise<AuthenticationResponse> {
    const request: TokenRefreshRequest = { refreshToken };
    const response: AxiosResponse<AuthenticationResponse> = await this.api.post('/auth/login/refresh-token', request);
    return response.data;
  }

  public async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const request: LogoutRequest = { refreshToken };
      try {
        await this.api.post('/auth/login/logout', request);
      } catch (error) {
        // Even if logout fails on server, clear local tokens
        console.error('Logout failed:', error);
      }
    }
    this.clearTokens();
  }

  // Posts endpoints
  public async getPosts(params?: {
    categoryId?: string;
    tagId?: string;
  }): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts', { params });
    return response.data;
  }

  public async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  public async createPost(post: CreatePostRequestDTO): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post('/posts', post);
    return response.data;
  }

  public async updatePost(id: string, post: UpdatePostRequestDTO): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.put(`/posts/${id}`, post);
    return response.data;
  }

  public async deletePost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  public async getDrafts(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts/drafts');
    return response.data;
  }

  // Categories endpoints
  public async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories');
    return response.data;
  }

  public async createCategory(name: string): Promise<Category> {
    const request: CreateCategoryRequest = { name };
    const response: AxiosResponse<Category> = await this.api.post('/categories', request);
    return response.data;
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Tags endpoints
  public async getTags(): Promise<TagDTO[]> {
    const response: AxiosResponse<TagDTO[]> = await this.api.get('/tags');
    return response.data;
  }

  public async createTags(names: string[]): Promise<TagDTO[]> {
    const request: CreateTagsRequest = { names };
    const response: AxiosResponse<TagDTO[]> = await this.api.post('/tags', request);
    return response.data;
  }

  public async deleteTag(id: string): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  // Utility method to check if user is authenticated
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const expiresIn = localStorage.getItem('expiresIn');
    
    if (!token || !expiresIn) {
      return false;
    }

    // Check if token is expired (simplified check)
    const expirationTime = parseInt(expiresIn);
    const currentTime = Date.now();
    
    return currentTime < expirationTime;
  }

  // Get current access token
  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance();