// User Types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Response Types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Group Types
export interface Group {
  _id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMember {
  _id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user?: User;
}

// Food Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Unit {
  _id: string;
  name: string;
  abbreviation: string;
  type: 'weight' | 'volume' | 'piece';
}

export interface Food {
  _id: string;
  name: string;
  categoryId: string;
  description?: string;
  defaultUnit?: string;
  imageUrl?: string;
  createdAt: string;
  category?: Category;
}

// Fridge Types
export interface FridgeItem {
  _id: string;
  groupId: string;
  foodId: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  purchaseDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  food?: Food;
}

// Shopping List Types
export interface ShoppingList {
  _id: string;
  groupId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShoppingItem {
  _id: string;
  shoppingListId: string;
  foodId?: string;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  purchasedBy?: string;
  purchasedAt?: string;
  notes?: string;
  createdAt: string;
  food?: Food;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'expiry' | 'shopping' | 'group' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// Recipe Types
export interface Recipe {
  _id: string;
  name: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  instructions?: string[];
  createdBy: string;
  createdAt: string;
}

export interface Ingredient {
  _id: string;
  recipeId: string;
  foodId: string;
  quantity: number;
  unit: string;
  notes?: string;
  food?: Food;
}
