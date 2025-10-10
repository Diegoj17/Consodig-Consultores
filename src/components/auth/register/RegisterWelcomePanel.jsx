import '../../../styles/auth/register/RegisterWelcomePanel.css';

const RegisterWelcomePanel = ({ onLoginClick }) => {
  return (
    <section className="register-welcome-section">
      <div className="register-welcome-circle">
        <div className="register-welcome-content">
          <img src="/img/logo.png" alt="Logotipo" className="register-welcome-logo" />
          <h1 className="register-welcome-title">¡Hola!</h1>
          <p className="register-welcome-text">
            Regístrate en el banco de evaluadores para acceder al sistema.
          </p>
          <p className="register-welcome-extra-info">
            ¿Ya tienes cuenta? Ingresa con tus credenciales.
          </p>
          <button className="register-welcome-btn" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegisterWelcomePanel;