import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://consodigconsultores-be-production.up.railway.app/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido: limpiar almacenamiento y emitir un evento
      // para que la app maneje la navegación (por ejemplo, con react-router)
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch {
        // ignore storage errors
      }

      // Emitimos un evento global para que la app pueda suscribirse y redirigir
      // sin forzar una recarga completa de la página.
      try {
        const ev = new CustomEvent('app:unauthorized', { detail: { status: 401 } });
        window.dispatchEvent(ev);
      } catch {
        // Fallback: si CustomEvent no funciona, usar location (menos ideal)
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;