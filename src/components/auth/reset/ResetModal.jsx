import '../../../styles/auth/reset/ResetModal.css';

const ResetModal = ({ type, title, message, onClose, buttonText }) => {
  return (
    <div className="reset-modal-overlay">
      <div className="reset-modal">
        <h3 style={{ color: type === 'success' ? "#10b981" : "#ef4444", marginBottom: 15 }}>{title}</h3>
        <p className="reset-modal-text">{message}</p>
        <button 
          className={`reset-modal-button ${type}`} 
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ResetModal;