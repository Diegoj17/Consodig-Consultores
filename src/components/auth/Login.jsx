import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '/src/styles/auth/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const pwdRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login' && location.key !== 'default') {
      window.location.reload();
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría tu lógica real de autenticación
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    const el = pwdRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setShowPassword(v => !v);
    setTimeout(() => {
      if (pwdRef.current) {
        pwdRef.current.focus();
        pwdRef.current.setSelectionRange(start, end);
      }
    }, 10);
  };

  const handleRegisterClick = () => {
    navigate('/register'); // Quita { replace: true }
  };

  return (
    <div className="auth-portal-container">
      {/* Left Panel - Login Form */}
      <div className="auth-login-section">
        <div className="auth-login-form-container">
          <div className="auth-login-header">
            <h2 className="auth-login-title">Iniciar Sesión</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error-message">{error}</div>}

            <div className="auth-form-group">
              <label htmlFor="email" className="auth-form-label">
                Email
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

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-form-label">
                Password
              </label>
              <div className="auth-input-container">
                <FaLock className="auth-input-icon" />
                <input
                  ref={pwdRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="auth-form-input"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    className="auth-password-toggle"
                    tabIndex={-1}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                )}
              </div>
              <div className="auth-forgot-password">
                <a href="/reset-password">¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <button 
              type="submit" 
              className={`auth-login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="auth-spinner"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Right Panel - Welcome Section */}
      <div className="auth-welcome-section">
        <div className="auth-welcome-circle">
          <div className="auth-welcome-content">
            <img
              src="/img/logo.png"
              alt="Logo"
              className="auth-welcome-logo"
            />
            <h1 className="auth-welcome-title">¡Bienvenido!</h1>
            <p className="auth-welcome-text">
              Ingrese sus datos personales para poder ingresar al sistema.
            </p>
            <div className="auth-welcome-extra-info">
              ¿No tiene cuenta? <br />
              Ingrese al Banco de los Evaluadores para registrarse y formar parte de nuestra comunidad profesional.
            </div>
            <button
              className="auth-welcome-button"
              onClick={handleRegisterClick}
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
