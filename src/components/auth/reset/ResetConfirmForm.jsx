import { useState } from 'react';
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
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    console.log("🔧 ResetConfirmForm - handleSubmit");
    
    // Validaciones locales adicionales
    if (!newPassword || newPassword.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    // ✅ USAR EL onSubmit DEL PADRE que hace la petición REAL
    if (onSubmit) {
      console.log("🔄 Usando onSubmit del padre");
      return onSubmit();
    }

    console.warn("⚠️ No se proporcionó onSubmit prop");
  };

  return (
    <section className="reset-confirm-form-section">
      <div className="reset-confirm-content">
        <header style={{ width: "100%", marginBottom: "2rem" }}>
          <h2 className="reset-confirm-title">Nueva Contraseña</h2>
          <p className="reset-confirm-subtitle">Crea una nueva contraseña para tu cuenta</p>
        </header>

        {(error || localError) && <div className="reset-confirm-error-message">{error || localError}</div>}
        {(success || localSuccess) && <div className="reset-confirm-success-message">{success || localSuccess}</div>}

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