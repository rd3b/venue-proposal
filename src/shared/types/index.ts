// Shared types between client and server

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'consultant';
  provider: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: number;
  name: string;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: number;
  name: string;
  location?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  standardCommission: number;
  notes?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  timestamp: string;
}