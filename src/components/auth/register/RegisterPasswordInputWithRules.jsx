import { useRef, useState } from 'react';
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import '../../../styles/auth/register/RegisterPasswordInputWithRules.css';

const PasswordInputWithRules = ({ 
  password, 
  confirmPassword, 
  onPasswordChange, 
  onConfirmPasswordChange, 
  loading,
  showRules,
  onPasswordFocus,
  onPasswordBlur
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const pwdRef = useRef(null);
  const confirmRef = useRef(null);

  const rules = [
    { id: 1, text: "Mínimo 6 caracteres", valid: password.length >= 6 },
    { id: 2, text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
    { id: 3, text: "Al menos un número", valid: /\d/.test(password) },
    { id: 4, text: "Un carácter especial (@#$%^&*)", valid: /[@#$%^&*]/.test(password) },
  ];

  const isPasswordValid = (pwd) => {
    return pwd.length >= 6 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&*]/.test(pwd);
  };

  const togglePwd = () => {
    const el = pwdRef.current; 
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    setShowPwd((v) => !v);
    setTimeout(() => { 
      el.focus(); 
      el.setSelectionRange(s, e); 
    }, 10);
  };

  const toggleConfirm = () => {
    const el = confirmRef.current; 
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    setShowConfirmPwd((v) => !v);
    setTimeout(() => { 
      el.focus(); 
      el.setSelectionRange(s, e); 
    }, 10);
  };

  const pwdInvalid = pwdTouched && (!password || !isPasswordValid(password));
  const confirmInvalid = confirmTouched && (confirmPassword && confirmPassword !== password);

  return (
    <div className="register-form-row">
      <div className="register-form-group">
        <label className="register-form-label" htmlFor="password">
          Contraseña *
        </label>
        <div className="register-input-wrapper">
          <RiLockPasswordFill className="register-input-icon" />
          <input
            ref={pwdRef}
            id="password"
            name="password"
            type={showPwd ? "text" : "password"}
            className={`register-form-input ${pwdInvalid ? "register-input-error" : ""}`}
            placeholder="Crea una contraseña segura"
            value={password}
            onChange={onPasswordChange}
            onFocus={() => {
              setPwdTouched(true);
              onPasswordFocus();
            }}
            onBlur={onPasswordBlur}
            disabled={loading}
            autoComplete="new-password"
            required
          />
          {password.length > 0 && (
            <button
              type="button"
              className="register-toggle-visibility"
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
              onClick={togglePwd}
              tabIndex={-1}
            >
              {showPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          )}
          {pwdInvalid && <FaExclamationTriangle className="register-error-icon" />}
        </div>
        {pwdInvalid && <div className="register-error-text">La contraseña no cumple con los requisitos</div>}
        
        {/* Cuadro de restricciones */}
        {showRules && (
          <div className="register-password-rules-container">
            <div className="register-password-rules-box">
              <span className="register-rules-title">La contraseña debe tener:</span>
              <ul className="register-rules-list">
                {rules.map(rule => (
                  <li key={rule.id} className={`register-rule-item ${rule.valid ? 'valid' : ''}`}>
                    {rule.valid
                      ? <FaCheck className="register-rule-icon register-rule-valid" />
                      : <FaExclamationTriangle className="register-rule-icon" />}
                    <span className="register-rule-text">{rule.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="register-form-group">
        <label className="register-form-label" htmlFor="confirmPassword">
          Confirmar Contraseña *
        </label>
        <div className="register-input-wrapper">
          <RiLockPasswordFill className="register-input-icon" />
          <input
            ref={confirmRef}
            id="confirmPassword" 
            name="confirmPassword" 
            type={showConfirmPwd ? "text" : "password"}
            className={`register-form-input ${confirmInvalid ? "register-input-error" : ""}`}
            placeholder="Repite tu contraseña" 
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            onFocus={() => setConfirmTouched(true)}
            disabled={loading} 
            autoComplete="new-password" 
            required
          />
          {confirmPassword && (
            <button
              type="button"
              className="register-toggle-visibility"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={toggleConfirm}
            >
              {showConfirmPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          )}
          {confirmInvalid && <FaExclamationTriangle className="register-error-icon" />}
        </div>
        {confirmInvalid && <div className="register-error-text">Las contraseñas no coinciden</div>}
      </div>
    </div>
  );
};

export default PasswordInputWithRules;