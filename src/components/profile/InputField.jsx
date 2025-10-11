import React from 'react';
import '../../styles/pages/ProfileEditPage.css';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  error,
  onBlur,
  onFocus
}) => {
  return (
    <div className="profile-field-group">
      <label className="profile-field-label" htmlFor={name}>
        {label}
      </label>
      <div className="profile-input-container">
        {Icon && <Icon className="profile-input-icon" />}
        <input
          id={name}
          name={name}
          type={type}
          className={`profile-field-input${error ? ' profile-input-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
        />
        {error && <div className="profile-error-message">{error}</div>}
      </div>
    </div>
  );
};

export default InputField;