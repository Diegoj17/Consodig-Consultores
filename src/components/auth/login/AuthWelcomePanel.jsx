import '../../../styles/auth/login/AuthWelcomePanel.css';

const WelcomePanel = ({ onRegisterClick }) => {
  return (
    <div className="welcome-panel-section">
      <div className="welcome-panel-circle">
        <div className="welcome-panel-content">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="welcome-panel-logo"
          />
          <h1 className="welcome-panel-title">¡Bienvenido!</h1>
          <p className="welcome-panel-text">
            Ingrese sus datos personales para poder ingresar al sistema.
          </p>
          <div className="welcome-panel-extra">
            ¿No tiene cuenta? <br />
            Ingrese al Banco de los Evaluadores para registrarse y formar parte de nuestra comunidad profesional.
          </div>
          <button
            className="welcome-panel-button"
            onClick={onRegisterClick}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;