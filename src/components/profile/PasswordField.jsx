import React, { useState, useRef } from 'react';
import { RiLockPasswordFill } from 'react-icons/ri';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import '../../styles/pages/ChangePasswordPage.css';

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  showRules = false,
  rules = [],
  onFocus,
  onBlur,
  confirm = false,
  confirmValue,
  confirmError,
  onConfirmChange,
  onConfirmFocus
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="change-password-field-group">
      <label className="change-password-field-label" htmlFor={name}>
        {label} {required && <span className="required-asterisk">*</span>}
      </label>
      
      {/* Campo de contraseña principal */}
      <div className="change-password-input-container">
        <RiLockPasswordFill className="change-password-input-icon" />
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`change-password-field-input${error ? ' change-password-input-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          autoComplete="new-password"
        />
        {value && (
          <button
            type="button"
            className="change-password-password-toggle"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
        {error && <FaExclamationTriangle className="change-password-error-icon" />}
      </div>
      {error && <div className="change-password-error-message">{error}</div>}

      {/* Reglas de contraseña */}
      {showRules && (
        <div className="change-password-password-rules">
          <div className="change-password-rules-box">
            <span className="change-password-rules-title">La contraseña debe tener:</span>
            <ul className="change-password-rules-list">
              {rules.map(rule => (
                <li key={rule.id} className={`change-password-rule-item ${rule.valid ? 'change-password-rule-valid' : ''}`}>
                  {rule.valid
                    ? <FaCheck className="change-password-rule-icon change-password-rule-check" />
                    : <FaExclamationTriangle className="change-password-rule-icon" />}
                  <span className="change-password-rule-text">{rule.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Campo de confirmación (si se solicita) */}
      {confirm && (
        <>
          <label className="change-password-field-label" htmlFor="confirmPassword" style={{ marginTop: '1rem' }}>
            Confirmar Nueva Contraseña <span className="required-asterisk">*</span>
          </label>
          <div className="change-password-input-container">
            <RiLockPasswordFill className="change-password-input-icon" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`change-password-field-input${confirmError ? ' change-password-input-error' : ''}`}
              placeholder="Confirma tu nueva contraseña"
              value={confirmValue}
              onChange={onConfirmChange}
              onFocus={onConfirmFocus}
              disabled={disabled}
              required={required}
              autoComplete="new-password"
            />
            {confirmValue && (
              <button
                type="button"
                className="change-password-password-toggle"
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                disabled={disabled}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            )}
            {confirmError && <FaExclamationTriangle className="change-password-error-icon" />}
          </div>
          {confirmError && <div className="change-password-error-message">{confirmError}</div>}
        </>
      )}
    </div>
  );
};

export default PasswordField;