import React, { useState, useRef } from 'react';
import { RiLockPasswordFill } from 'react-icons/ri';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import '../../styles/pages/ProfileEditPage.css';

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
    <div className="profile-field-group">
      <label className="profile-field-label" htmlFor={name}>
        {label}
      </label>
      <div className="profile-input-container">
        <RiLockPasswordFill className="profile-input-icon" />
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`profile-field-input${error ? ' profile-input-error' : ''}`}
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
            className="profile-password-toggle"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
        {error && <FaExclamationTriangle className="profile-error-icon" />}
      </div>
      {error && <div className="profile-error-message">{error}</div>}

      {showRules && (
        <div className="profile-password-rules">
          <div className="profile-rules-box">
            <span className="profile-rules-title">La contraseña debe tener:</span>
            <ul className="profile-rules-list">
              {rules.map(rule => (
                <li key={rule.id} className={`profile-rule-item ${rule.valid ? 'profile-rule-valid' : ''}`}>
                  {rule.valid
                    ? <FaCheck className="profile-rule-icon profile-rule-check" />
                    : <FaExclamationTriangle className="profile-rule-icon" />}
                  <span className="profile-rule-text">{rule.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {confirm && (
        <>
          <div className="profile-input-container" style={{ marginTop: '0.5rem' }}>
            <RiLockPasswordFill className="profile-input-icon" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`profile-field-input${confirmError ? ' profile-input-error' : ''}`}
              placeholder="Repite tu contraseña"
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
                className="profile-password-toggle"
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            )}
            {confirmError && <FaExclamationTriangle className="profile-error-icon" />}
          </div>
          {confirmError && <div className="profile-error-message">{confirmError}</div>}
        </>
      )}
    </div>
  );
};

export default PasswordField;