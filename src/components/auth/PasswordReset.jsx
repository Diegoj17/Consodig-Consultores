import { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import '/src/styles/auth/Register.css';


const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    setIsLoading(true);
    
  };

  return (
    <div className="auth-main-container">
      <div className="auth-background">
        <div className="auth-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-content">
        <div className="logo-container">
          <img
            src="/public/img/logo.png"
            alt="Logo"
            className="auth-logo"
          />
        </div>

        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-card-header">
            <h2>Restablecer Contraseña</h2>
            <p>Ingresa tu correo electrónico para recibir instrucciones</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input-login"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Enviar Enlace'
            )}
          </button>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <FaArrowLeft className="back-icon" />
              Volver al Inicio de Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;