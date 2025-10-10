import '../../../styles/auth/reset/ResetWelcomePanel.css';

const ResetWelcomePanel = ({ onLoginClick }) => {
  return (
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
          <button className="reset-welcome-btn" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResetWelcomePanel;