import '../../../styles/auth/reset/ResetConfirmWelcomePanel.css';

const ResetConfirmWelcomePanel = ({ onLoginClick }) => {
  return (
    <section className="reset-confirm-welcome-section">
      <div className="reset-confirm-welcome-circle">
        <div className="reset-confirm-welcome-content">
          <img src="/img/logo.png" alt="Logotipo" className="reset-confirm-welcome-logo" />
          <h1 className="reset-confirm-welcome-title">¡Bienvenido!</h1>
          <p className="reset-confirm-welcome-text">
            Estás a un paso de recuperar el acceso a tu cuenta. Crea una nueva contraseña segura.
          </p>
          <p className="reset-confirm-welcome-extra-info">
            ¿Recuerdas tu contraseña? Inicia sesión con tus credenciales.
          </p>
          <button className="reset-confirm-welcome-btn" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResetConfirmWelcomePanel;