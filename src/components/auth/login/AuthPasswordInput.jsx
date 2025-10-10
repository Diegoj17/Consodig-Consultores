import { useRef, useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '../../../styles/auth/login/AuthPasswordInput.css';

const PasswordInput = ({ password, setPassword, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const pwdRef = useRef(null);

  const togglePasswordVisibility = () => {
    const el = pwdRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setShowPassword(v => !v);
    setTimeout(() => {
      if (pwdRef.current) {
        pwdRef.current.focus();
        pwdRef.current.setSelectionRange(start, end);
      }
    }, 10);
  };

  return (
    <div className="password-input-group">
      <label htmlFor="password" className="password-input-label">
        Contraseña
      </label>
      <div className="password-input-container">
        <FaLock className="password-input-icon" />
        <input
          ref={pwdRef}
          type={showPassword ? "text" : "password"}
          id="password"
          className="password-input-field"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={isLoading}
        />
        {password.length > 0 && (
          <button
            type="button"
            className="password-toggle-btn"
            tabIndex={-1}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>
      <div className="password-forgot-link">
        <a href="/reset-password">¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  );
};

export default PasswordInput;