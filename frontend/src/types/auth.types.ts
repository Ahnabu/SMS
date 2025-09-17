export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent' | 'accountant';
  schoolId?: string;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}