export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: string;
} 