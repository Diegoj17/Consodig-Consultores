import React from 'react';
import '../../styles/pages/ProfileEditPage.css';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  icon: Icon,
  options,
  placeholder
}) => {
  return (
    <div className="profile-field-group">
      <label className="profile-field-label" htmlFor={name}>
        {label}
      </label>
      <div className="profile-input-container">
        {Icon && <Icon className="profile-input-icon" />}
        <select
          id={name}
          name={name}
          className="profile-field-input"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectField;