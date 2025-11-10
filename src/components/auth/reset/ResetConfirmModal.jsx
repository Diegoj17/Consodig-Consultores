import '../../../styles/auth/reset/ResetConfirmModal.css';

const ResetConfirmModal = ({ type, title, message, onClose, buttonText }) => {
  return (
    <div className="reset-confirm-modal-overlay">
      <div className="reset-confirm-modal">
        <div className={`reset-confirm-modal-icon ${type}`}>
          {type === 'success' ? '✓' : '✗'}
        </div>
        <h3 className="reset-confirm-modal-title">{title}</h3>
        <p className="reset-confirm-modal-text">{message}</p>
        <button 
          className={`reset-confirm-modal-button ${type}`} 
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ResetConfirmModal;