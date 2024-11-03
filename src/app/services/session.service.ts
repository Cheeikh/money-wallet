import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

interface StoredSession {
  user: User;
  token: string;
  lastActivity: number;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'user_session';
  private readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes

  saveSession(user: User, token: string) {
    const session: StoredSession = {
      user,
      token,
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  getStoredSession(): StoredSession | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) return null;

    const session: StoredSession = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return null;
    }

    return session;
  }

  updateLastActivity() {
    const session = this.getStoredSession();
    if (session) {
      session.lastActivity = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  isSessionValid(): boolean {
    const session = this.getStoredSession();
    return !!session && Date.now() < session.expiresAt;
  }
} 