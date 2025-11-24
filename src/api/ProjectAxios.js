// src/api/ProjectAxios.js
import axios from 'axios';

const PROJECT_API_BASE_URL = import.meta.env.VITE_PROJECT_API_BASE_URL || 'https://ccprojectmicroservice-production.up.railway.app/api';

// Crear instancia de axios específica para proyectos
const projectApi = axios.create({
  baseURL: PROJECT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
projectApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
projectApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch {
        // ignore storage errors
      }

      try {
        const ev = new CustomEvent('app:unauthorized', { detail: { status: 401 } });
        window.dispatchEvent(ev);
      } catch {
        // Fallback si CustomEvent no funciona
      }
    }
    return Promise.reject(error);
  }
);

export default projectApi;