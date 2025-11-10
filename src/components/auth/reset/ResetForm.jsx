import { useState } from 'react';
import { FaEnvelope } from "react-icons/fa";
import '../../../styles/auth/reset/ResetForm.css';
import { authService } from '../../../services/authService';

const ResetForm = ({ 
  email, 
  setEmail, 
  error, 
  success, 
  isLoading, 
  onSubmit 
}) => {
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    console.group("🔧 ResetForm - handleSubmit");
    console.log("📝 Email ingresado:", email);

    // Validación básica del email
    if (!email) {
      console.warn("⚠️ Email vacío");
      setLocalError('Por favor, ingresa tu correo electrónico');
      console.groupEnd();
      return;
    }

    if (!email.includes('@')) {
      console.warn("⚠️ Email inválido:", email);
      setLocalError('Por favor, ingresa un correo electrónico válido');
      console.groupEnd();
      return;
    }

    console.log("✅ Email válido, procediendo con la petición...");

    // Si se pasa onSubmit como prop, usarlo
    if (onSubmit) {
      console.log("🔄 Usando onSubmit prop externo");
      console.groupEnd();
      return onSubmit();
    }

    try {
      setLocalLoading(true);
      console.log("🔄 Llamando a authService.resetPassword...");
      
      const res = await authService.resetPassword(email);
      
      console.log("✅ Respuesta de authService:", res);
      setLocalSuccess(res?.message || 'Se envió un enlace para restablecer la contraseña. Revisa tu correo.');
      console.log("🎉 Éxito - Mensaje mostrado al usuario");
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      console.log("🔍 Detalles del error:", {
        message: err.message,
        response: err.response,
        data: err.response?.data
      });
      
      const msg = err?.message || 
                 (err?.errors && Object.values(err.errors).flat().join(', ')) || 
                 (err.response?.data?.message) ||
                 'Error al solicitar restablecimiento';
      
      console.log("📢 Mensaje de error para usuario:", msg);
      setLocalError(msg);
    } finally {
      setLocalLoading(false);
      console.log("🏁 Finalizado - Loading desactivado");
      console.groupEnd();
    }
  };

  console.log("🔄 ResetForm render - Estado:", {
    email,
    localError,
    localSuccess, 
    localLoading,
    isLoading
  });

  return (
    <section className="reset-form-section">
      <div className="reset-content">
        <header style={{ width: "100%", marginBottom: "2rem" }}>
          <h2 className="reset-title">Restablecer Contraseña</h2>
          <p className="reset-subtitle">Ingresa tu correo electrónico para recibir instrucciones</p>
        </header>

        {(error || localError) && (
          <div className="reset-error-message">
            🔴 {error || localError}
          </div>
        )}
        {(success || localSuccess) && (
          <div className="reset-success-message">
            ✅ {success || localSuccess}
          </div>
        )}

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
                onChange={(e) => {
                  console.log("📝 Cambio en input email:", e.target.value);
                  setEmail(e.target.value);
                }}
                autoComplete="email"
                required
                disabled={isLoading || localLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`reset-btn ${ (isLoading || localLoading) ? 'loading' : ''}`}
            disabled={isLoading || localLoading}
          >
            {(isLoading || localLoading) ? (
              <>
                <div className="reset-spinner"></div>
                <span style={{ visibility: 'hidden' }}>Enviar Enlace</span>
              </>
            ) : (
              'Enviar Enlace'
            )}
          </button>
        </form>

  {/* Debug info - solo en desarrollo (Vite) */}
  {import.meta?.env?.DEV && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            <strong>🔧 Debug Info:</strong>
            <div>Email: {email || 'vacío'}</div>
            <div>Loading: {isLoading || localLoading ? 'Sí' : 'No'}</div>
            <div>Error: {localError || 'ninguno'}</div>
            <div>Success: {localSuccess || 'ninguno'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResetForm;