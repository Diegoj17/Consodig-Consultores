import '../../../styles/auth/register/RegisterModal.css';

const RegisterModal = ({ type, title, message, onClose, buttonText }) => {
  return (
    <div className="register-modal-overlay">
      <div className="register-modal">
        <h3 style={{ color: type === 'success' ? "#10b981" : "#ef4444", marginBottom: 15 }}>{title}</h3>
        <p className="register-modal-text">{message}</p>
        <button 
          className={`register-modal-button ${type}`} 
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;