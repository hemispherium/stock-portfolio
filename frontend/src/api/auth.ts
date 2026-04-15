import client from './client';
import type { AuthResponse, User } from '../types';

export const register = (data: { name: string; email: string; password: string; password_confirmation: string }) =>
  client.post<AuthResponse>('/api/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  client.post<AuthResponse>('/api/login', data).then((r) => r.data);

export const logout = () =>
  client.post('/api/logout');

export const getUser = () =>
  client.get<User>('/api/user').then((r) => r.data);
