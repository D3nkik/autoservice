import Cookies from 'js-cookie';
import { UserProfile } from './api';

export function setTokens(access_token: string, refresh_token: string) {
  Cookies.set('access_token', access_token, { expires: 1 });
  Cookies.set('refresh_token', refresh_token, { expires: 30 });
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function getAccessToken(): string | undefined {
  return Cookies.get('access_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function storeUser(user: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === 'admin';
}
