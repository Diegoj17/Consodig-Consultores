import { useState, useRef } from 'react';
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import '/src/styles/auth/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const pwdRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    
  };

  const togglePasswordVisibility = () => {
    const el = pwdRef.current;
    
    if (!el) return;
    
    // Guardar posición actual del cursor
    const start = el.selectionStart;
    const end = el.selectionEnd;
    
    // Cambiar visibilidad
    setShowPassword(v => !v);
    
    // Usar setTimeout para asegurar que el re-render haya ocurrido
    setTimeout(() => {
      if (pwdRef.current) {
        pwdRef.current.focus();
        // Restaurar posición del cursor
        pwdRef.current.setSelectionRange(start, end);
      }
    }, 10);
  };

  return (
    <div className="login-main-container">
      <div className="login-background">
        <div className="login-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-content">
        {/* Logo */}
        <div className="logo-container">
          <img
            src="/public/img/logo.png"
            alt="Logo"
            className="login-logo"
          />
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="login-card">
          <div className="login-card-header">
            <h2>Iniciar Sesión</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input-login"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-wrapper">
              <RiLockPasswordFill className="input-icon" />
              <input
                ref={pwdRef}
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input-login"
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
                  className="toggle-visibility"
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              )}
            </div>
            <div className="reset-password">
              <a href="/reset-password">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;