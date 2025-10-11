import React, { useState, useRef, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaUniversity, 
  FaLink, 
  FaEye, 
  FaEyeSlash,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import { MdSchool } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import '../../../styles/management/user/UserModal.css';

const UserModal = ({ show, onClose, onSubmit, userData, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    affiliation: '',
    cvlac: '',
    googleScholar: '',
    orcid: '',
    educationLevel: '',
    researchLines: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdInvalid, setPwdInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const pwdRef = useRef(null);
  const confirmRef = useRef(null);

  // Evitar scroll y movimiento del fondo cuando el modal está abierto
  useEffect(() => {
    if (show) {
      // calcular ancho del scrollbar para evitar salto horizontal
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [show]);

  // Reglas de validación de contraseña
  const [rules, setRules] = useState([
    { id: 1, text: "Al menos 8 caracteres", valid: false },
    { id: 2, text: "Una letra mayúscula", valid: false },
    { id: 3, text: "Una letra minúscula", valid: false },
    { id: 4, text: "Un número", valid: false },
    { id: 5, text: "Un carácter especial", valid: false }
  ]);

  // Cargar datos del usuario si está en modo edición
  useEffect(() => {
    if (isEditing && userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        affiliation: userData.institution || '',
        cvlac: userData.cvLink || '',
        googleScholar: userData.scholarLink || '',
        orcid: userData.orcid || '',
        educationLevel: userData.educationLevel || '',
        researchLines: userData.researchLines || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        affiliation: '',
        cvlac: '',
        googleScholar: '',
        orcid: '',
        educationLevel: '',
        researchLines: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isEditing, userData, show]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validaciones específicas
    if (name === 'password') {
      validatePassword(value);
    }
    if (name === 'confirmPassword') {
      validateConfirmPassword(value);
    }
  };

  const validatePassword = (password) => {
    const newRules = [
      { id: 1, text: "Al menos 8 caracteres", valid: password.length >= 8 },
      { id: 2, text: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
      { id: 3, text: "Una letra minúscula", valid: /[a-z]/.test(password) },
      { id: 4, text: "Un número", valid: /[0-9]/.test(password) },
      { id: 5, text: "Un carácter especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
    
    setRules(newRules);
    const isValid = newRules.every(rule => rule.valid);
    setPwdInvalid(!isValid && pwdTouched);
  };

  const validateConfirmPassword = (confirmPassword) => {
    const isValid = confirmPassword === formData.password;
    setConfirmInvalid(!isValid && confirmTouched);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    validatePassword(value);
  };

  const handlePasswordFocus = () => {
    setShowRules(true);
    setPwdTouched(true);
  };

  const handlePasswordBlur = () => {
    setTimeout(() => setShowRules(false), 200);
  };

  const togglePwd = () => setShowPwd(!showPwd);
  const toggleConfirm = () => setShowConfirmPwd(!showConfirmPwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones finales
    const isPasswordValid = rules.every(rule => rule.valid);
    const isConfirmValid = formData.confirmPassword === formData.password;

    if (!isEditing && (!isPasswordValid || !isConfirmValid)) {
      setPwdInvalid(!isPasswordValid);
      setConfirmInvalid(!isConfirmValid);
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para enviar
      const userDataToSubmit = {
        name: formData.name,
        email: formData.email,
        institution: formData.affiliation,
        cvLink: formData.cvlac,
        scholarLink: formData.googleScholar,
        orcid: formData.orcid,
        educationLevel: formData.educationLevel,
        researchLines: formData.researchLines,
        ...(isEditing && formData.password && { password: formData.password }),
        ...(!isEditing && { password: formData.password })
      };

      await onSubmit(userDataToSubmit);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal">
        <div className="user-modal-header">
          <h3>{isEditing ? 'Editar Evaluador' : 'Registrar Nuevo Evaluador'}</h3>
          <button className="user-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-modal-form">
          {/* Fila 1 */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="name">
                Nombre Completo *
              </label>
              <div className="register-input-wrapper">
                <FaUser className="register-input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="register-form-input"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.name}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setFormData(s => ({ ...s, name: value }));
                  }}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="email">
                Correo Electrónico *
              </label>
              <div className="register-input-wrapper">
                <FaEnvelope className="register-input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`register-form-input${formData.email && !formData.email.includes('@') ? ' register-input-error' : ''}`}
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
              </div>
              {formData.email && !formData.email.includes('@') && (
                <div className="register-error-text">El correo debe contener el carácter @</div>
              )}
            </div>
          </div>

          {/* Fila 2 */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="affiliation">
                Afiliación Institucional *
              </label>
              <div className="register-input-wrapper">
                <FaUniversity className="register-input-icon" />
                <input
                  id="affiliation" name="affiliation" type="text" className="register-form-input"
                  placeholder="Universidad o institución" value={formData.affiliation}
                  onChange={onChange} disabled={loading} required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="cvlac">
                Enlace a CVLAC
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <input
                  id="cvlac" name="cvlac" type="url" className="register-form-input"
                  placeholder="https://..." value={formData.cvlac}
                  onChange={onChange} disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Fila 3 */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="googleScholar">
                Enlace a Google Académico
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <input
                  id="googleScholar" name="googleScholar" type="url" className="register-form-input"
                  placeholder="https://... (opcional)" value={formData.googleScholar}
                  onChange={onChange} disabled={loading}
                />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="orcid">
                Enlace a ORCID
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <input
                  id="orcid" name="orcid" type="url" className="register-form-input"
                  placeholder="https://orcid.org/... (opcional)" value={formData.orcid}
                  onChange={onChange} disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Fila 4 */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="educationLevel">
                Nivel de Estudios *
              </label>
              <div className="register-input-wrapper">
                <MdSchool className="register-input-icon" />
                <select
                  id="educationLevel"
                  name="educationLevel"
                  className="register-form-input"
                  value={formData.educationLevel}
                  onChange={onChange}
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="Pregrado">Pregrado</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Doctorado">Doctorado</option>
                  <option value="Postdoctorado">Postdoctorado</option>
                </select>
              </div>
            </div>
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="researchLines">
                Líneas de Investigación
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <input
                  id="researchLines" name="researchLines" type="text" className="register-form-input"
                  placeholder="Separa por comas" value={formData.researchLines}
                  onChange={onChange} disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Solo mostrar campos de contraseña para nuevos usuarios o cuando se edita y se quiere cambiar */}
          {(!isEditing || (isEditing && formData.password)) && (
            <div className="register-form-row">
              <div className="register-form-group">
                <label className="register-form-label" htmlFor="password">
                  {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                </label>
                <div className="register-input-wrapper">
                  <RiLockPasswordFill className="register-input-icon" />
                  <input
                    ref={pwdRef}
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    className={`register-form-input ${pwdInvalid ? "register-input-error" : ""}`}
                    placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Crea una contraseña segura"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    disabled={loading}
                    autoComplete="new-password"
                    required={!isEditing}
                  />
                  {formData.password.length > 0 && (
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
                    value={formData.confirmPassword}
                    onChange={onChange} 
                    onFocus={() => setConfirmTouched(true)}
                    disabled={loading} 
                    autoComplete="new-password" 
                    required={!isEditing}
                  />
                  {formData.confirmPassword && (
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
          )}

          <div className="user-modal-actions">
            <button 
              type="button" 
              className="user-modal-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="user-modal-submit" 
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Registrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;