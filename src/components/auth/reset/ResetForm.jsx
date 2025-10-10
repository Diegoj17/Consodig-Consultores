import { FaEnvelope } from "react-icons/fa";
import '../../../styles/auth/reset/ResetForm.css';

const ResetForm = ({ 
  email, 
  setEmail, 
  error, 
  success, 
  isLoading, 
  onSubmit 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
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
  );
};

export default ResetForm;