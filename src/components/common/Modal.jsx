import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import '../../styles/common/Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  onConfirm, 
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = true,
  children 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="modal-icon modal-icon-success" />;
      case 'error':
        return <FaExclamationTriangle className="modal-icon modal-icon-error" />;
      case 'warning':
        return <FaExclamationTriangle className="modal-icon modal-icon-warning" />;
      default:
        return <FaInfoCircle className="modal-icon modal-icon-info" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'modal-title-success';
      case 'error':
        return 'modal-title-error';
      case 'warning':
        return 'modal-title-warning';
      default:
        return 'modal-title-info';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            {getIcon()}
            <h2 className={`modal-title ${getTitleColor()}`}>{title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {message && <p className="modal-message">{message}</p>}
          {children}
        </div>

        <div className="modal-actions">
          {showCancel && (
            <button 
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn modal-btn-${type}`}
            onClick={onConfirm || onClose}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;