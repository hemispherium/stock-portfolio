import { useState, useEffect } from 'react';
import { getUser, login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    getUser()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token } = await apiLogin({ email, password });
    localStorage.setItem('token', token);
    const u = await getUser();
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token } = await apiRegister({ name, email, password, password_confirmation: password });
    localStorage.setItem('token', token);
    const u = await getUser();
    setUser(u);
  };

  const logout = async () => {
    await apiLogout();
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
