import { useState, useRef } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '/src/styles/auth/Login.css';
import Button from "../common/Button"; 

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

  return (
    <div className="auth-portal-container">
      {/* Left Panel - Login Form */}
      <div className="login-section">
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="login-title">Iniciar Sesión</h2>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-container">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
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
                Password
              </label>
              <div className="input-container">
                <FaLock className="input-icon" />
                <input
                  ref={pwdRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
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
                    className="password-toggle"
                    tabIndex={-1}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                )}
              </div>
              <div className="forgot-password">
                <a href="/reset-password">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              variant="primary"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
      
      {/* Right Panel - Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-circle">
          <div className="welcome-content">
            <img
              src="/img/logo.png"
              alt="Logo"
              className="welcome-logo"
            />
            <h1 className="welcome-title">¡Bienvenido!</h1>
            <p className="welcome-text">
              Ingrese sus datos personales para poder ingresar al sistema.
            </p>
            <div className="welcome-extra-info">
              ¿No tiene cuenta? <br />
              Ingrese al Banco de los Evaluadores para registrarse y formar parte de nuestra comunidad profesional.
            </div>
            <Button
              variant="outline"
              className="welcome-register-btn-custom"
              onClick={() => window.location.href = "/register"}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
