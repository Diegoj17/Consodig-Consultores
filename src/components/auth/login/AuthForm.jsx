import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaUserShield, FaUserCheck, FaUserGraduate } from "react-icons/fa";
import PasswordInput from './AuthPasswordInput';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/auth/login/AuthForm.css';

const AuthForm = ({ onSubmit, isLoading: externalLoading, error: externalError, setError: setExternalError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar todos los errores
    setInternalError('');
    if (setExternalError) setExternalError('');
    
    if (!email || !password) {
      const errorMsg = 'Por favor, ingresa usuario y contraseña';
      setInternalError(errorMsg);
      if (setExternalError) setExternalError(errorMsg);
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Por favor, ingresa un correo electrónico válido';
      setInternalError(errorMsg);
      if (setExternalError) setExternalError(errorMsg);
      return;
    }

    setInternalLoading(true);

    try {
      console.group('📝 AuthForm - Proceso de Login');
      console.log('1. Email:', email);
      console.log('2. Llamando a login del contexto...');
      
      // El login del contexto debe retornar el usuario con su rol
      const userData = await login(email, password);
      
      console.log('3. ✅ Login exitoso, usuario:', userData);
      console.log('4. Rol detectado:', userData.rol || userData.role);
      console.log('5. Navegando al dashboard correspondiente...');
      console.groupEnd();
      
      // Llamar al callback del padre si existe
      if (onSubmit) {
        onSubmit(email, password);
      }
      
      // Navegar al dashboard correspondiente según el rol detectado
      const userRole = userData.rol || userData.role || '';
      let targetRoute = '/dashboard';
      
      // Mapeo de roles a rutas
      if (userRole.toUpperCase().includes('ADMIN')) {
        targetRoute = '/admin/dashboard';
      } else if (userRole.toUpperCase().includes('EVALUADOR')) {
        targetRoute = '/evaluador/dashboard';
      } else if (userRole.toUpperCase().includes('EVALUANDO')) {
        targetRoute = '/evaluando/dashboard';
      }
      
      console.log('🎯 Navegando a:', targetRoute);
      navigate(targetRoute, { replace: true });
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      console.groupEnd();
      
      let errorMsg = 'Error al iniciar sesión.';
      
      // Manejar diferentes tipos de errores
      if (err.message?.includes('Respuesta de login inválida')) {
        errorMsg = 'Credenciales incorrectas o usuario no existe.';
      } else if (err.status === 500) {
        errorMsg = 'Error del servidor. Por favor, contacta al administrador.';
      } else if (err.status === 401 || err.status === 400) {
        errorMsg = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
      } else if (err.message) {
        errorMsg = err.message;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setInternalError(errorMsg);
      if (setExternalError) setExternalError(errorMsg);
    } finally {
      setInternalLoading(false);
    }
  };

  // Combinar loading y error states (interno + externo)
  const isLoading = internalLoading || externalLoading;
  const error = internalError || externalError;

  return (
    <div className="auth-form-section">
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Iniciar Sesión</h2>
          <p className="auth-form-subtitle">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Campo de Email */}
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Correo Electrónico
            </label>
            <div className="auth-input-container">
              <FaEnvelope className="auth-input-icon" />
              <input
                type="email"
                id="email"
                className="auth-form-input"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <PasswordInput
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
          />

          <button
            type="submit"
            className={`auth-submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-live="polite"
          >
            <span className="auth-submit-inner">
              {isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </span>
            {isLoading && (
              <div className="auth-spinner" aria-hidden="false"></div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;