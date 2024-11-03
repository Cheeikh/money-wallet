export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  solde: number;
  roles: string[];
  isTelephoneVerifie: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: string;
} 