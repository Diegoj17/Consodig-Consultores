import { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import '/src/styles/auth/PasswordReset.css';
import Footer from '../common/Footer';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [okModal, setOkModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    setIsLoading(true);
    
    // Simulación de envío de correo
    setTimeout(() => {
      setIsLoading(false);
      setOkModal(true);
      setSuccess('Se ha enviado un enlace de restablecimiento a tu correo electrónico');
    }, 1600);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="auth-page-container">
      <div className="reset-main-container">
        {/* IZQUIERDA: Bienvenida */}
        <section className="reset-welcome-section">
          <div className="reset-welcome-circle">
            <div className="reset-welcome-content">
              <img src="/img/logo.png" alt="Logotipo" className="reset-welcome-logo" />
              <h1 className="reset-welcome-title">¡Hola!</h1>
              <p className="reset-welcome-text">
                ¿Olvidaste tu contraseña? No te preocupes, te ayudamos a recuperarla.
              </p>
              <p className="reset-welcome-extra-info">
                ¿Recuerdas tu contraseña? Inicia sesión con tus credenciales.
              </p>
              <button className="reset-welcome-btn" onClick={handleLoginClick}>
                Iniciar Sesión
              </button>
            </div>
          </div>
        </section>

        {/* DERECHA: Formulario */}
        <section className="reset-form-section">
          <div className="reset-content">
            <header style={{ width: "100%", marginBottom: "2rem" }}>
              <h2 className="reset-title">Restablecer Contraseña</h2>
              <p className="reset-subtitle">Ingresa tu correo electrónico para recibir instrucciones</p>
            </header>

            {error && <div className="reset-error-message">{error}</div>}
            {success && <div className="reset-success-message">{success}</div>}

            <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
              <div className="reset-form-group">
                <label htmlFor="email" className="reset-form-label">
                  Correo Electrónico
                </label>
                <div className="reset-input-wrapper">
                  <FaEnvelope className="reset-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="reset-form-input"
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
                className={`reset-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="reset-spinner"></div>
                ) : (
                  'Enviar Enlace'
                )}
              </button>
            </form>
          </div>
        </section>

        {/* MODAL DE ÉXITO */}
        {okModal && (
          <div className="reset-modal-overlay">
            <div className="reset-modal">
              <h3 style={{ color: "#10b981", marginBottom: 15 }}>¡Correo enviado!</h3>
              <p className="reset-modal-text">
                Se ha enviado un enlace de restablecimiento a tu correo electrónico. 
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <button 
                className="reset-modal-button success" 
                onClick={() => { 
                  setOkModal(false); 
                  navigate('/login');
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PasswordReset;