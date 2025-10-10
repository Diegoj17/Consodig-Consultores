// src/components/auth/AuthForm.jsx
import { useState } from 'react';
import { FaEnvelope } from "react-icons/fa";
import PasswordInput from './AuthPasswordInput';
import '../../../styles/auth/login/AuthForm.css';

const AuthForm = ({ onSubmit, isLoading, error, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }
    onSubmit(email, password);
  };

  return (
    <div className="auth-form-section">
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Iniciar Sesión</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error-message">{error}</div>}

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

          <PasswordInput
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
          />

          <button 
            type="submit" 
            className={`auth-submit-button ${isLoading ? 'loading' : ''}`}
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
  );
};

export default AuthForm;