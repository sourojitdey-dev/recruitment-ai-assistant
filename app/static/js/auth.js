/* ==========================================================================
   Recruitment AI Assistant - Auth State & Operations
   ========================================================================== */

import { api } from './api.js';

class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token') || null;
    this.user = this.loadStoredUser();
    this.listeners = [];
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.user, this.token));
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getUser() {
    return this.user;
  }

  getRole() {
    return this.user ? (this.user.role || 'candidate').toLowerCase() : null;
  }

  getToken() {
    return this.token;
  }

  async verifySession() {
    if (!this.token) {
      this.user = null;
      this.notify();
      return null;
    }

    try {
      const user = await api.get('/auth/me');
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      this.notify();
      return user;
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      this.logout();
      return null;
    }
  }

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const tokenRes = await api.post('/auth/login', formData, true);
    const accessToken = tokenRes.access_token;

    this.token = accessToken;
    localStorage.setItem('token', accessToken);

    // Fetch user profile immediately
    const userRes = await api.get('/auth/me');
    this.user = userRes;
    localStorage.setItem('user', JSON.stringify(userRes));

    this.notify();
    return userRes;
  }

  async registerCandidate(data) {
    return await api.post('/auth/register', data);
  }

  async registerRecruiter(data) {
    return await api.post('/auth/register/recruiter', data);
  }

  async registerInterviewer(data) {
    return await api.post('/auth/register/interviewer', data);
  }

  async registerCompany(data) {
    return await api.post('/companies/', data);
  }

  async getCompanies() {
    return await api.get('/companies/');
  }

  async forgotPassword(data) {
    return await api.post('/auth/forgot-password', data);
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.notify();
  }
}

export const auth = new AuthManager();
export default auth;
