import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '../../../styles/auth/reset/ResetConfirmForm.css';

const ResetConfirmForm = ({ 
  newPassword, 
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  error, 
  success, 
  isLoading, 
  onSubmit 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <section className="reset-confirm-form-section">
      <div className="reset-confirm-content">
        <header style={{ width: "100%", marginBottom: "2rem" }}>
          <h2 className="reset-confirm-title">Nueva Contraseña</h2>
          <p className="reset-confirm-subtitle">Crea una nueva contraseña para tu cuenta</p>
        </header>

        {error && <div className="reset-confirm-error-message">{error}</div>}
        {success && <div className="reset-confirm-success-message">{success}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
          <div className="reset-confirm-form-group">
            <label htmlFor="newPassword" className="reset-confirm-form-label">
              Nueva Contraseña
            </label>
            <div className="reset-confirm-input-wrapper">
              <FaLock className="reset-confirm-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="reset-confirm-form-input"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="reset-confirm-password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="reset-confirm-form-group">
            <label htmlFor="confirmPassword" className="reset-confirm-form-label">
              Confirmar Contraseña
            </label>
            <div className="reset-confirm-input-wrapper">
              <FaLock className="reset-confirm-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="reset-confirm-form-input"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="reset-confirm-password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`reset-confirm-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="reset-confirm-spinner"></div>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetConfirmForm;