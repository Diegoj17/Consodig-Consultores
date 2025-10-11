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
import { MdSchool } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';

const ProfileEdit = ({ user, onSave, onCancel, loading = false }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    affiliation: user?.affiliation || '',
    cvlac: user?.cvlac || '',
    googleScholar: user?.googleScholar || '',
    orcid: user?.orcid || '',
    educationLevel: user?.educationLevel || '',
    researchLines: user?.researchLines || '',
    password: '',
    confirmPassword: ''
  });

  // Estados para visibilidad de contraseñas
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  // Estados para validación
  const [pwdInvalid, setPwdInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [ setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Referencias
  const pwdRef = useRef(null);
  const confirmRef = useRef(null);

  // Reglas de contraseña
  const [rules, setRules] = useState([
    { id: 1, text: 'Al menos 8 caracteres', valid: false },
    { id: 2, text: 'Al menos una letra mayúscula', valid: false },
    { id: 3, text: 'Al menos una letra minúscula', valid: false },
    { id: 4, text: 'Al menos un número', valid: false },
    { id: 5, text: 'Al menos un carácter especial', valid: false }
  ]);

  // Manejar cambios en los campos
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de nombre (solo letras y espacios)
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    setFormData(prev => ({ ...prev, name: value }));
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    validatePassword(value);
  };

  // Validar contraseña
  const validatePassword = (password) => {
    const newRules = [...rules];
    
    // Al menos 8 caracteres
    newRules[0].valid = password.length >= 8;
    // Al menos una mayúscula
    newRules[1].valid = /[A-Z]/.test(password);
    // Al menos una minúscula
    newRules[2].valid = /[a-z]/.test(password);
    // Al menos un número
    newRules[3].valid = /[0-9]/.test(password);
    // Al menos un carácter especial
    newRules[4].valid = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    setRules(newRules);
    
    // Verificar si todas las reglas se cumplen
    const allValid = newRules.every(rule => rule.valid);
    setPwdInvalid(!allValid && password.length > 0);
    
    // Validar confirmación si ya se ha tocado
    if (confirmTouched) {
      setConfirmInvalid(password !== formData.confirmPassword && formData.confirmPassword.length > 0);
    }
  };

  // Manejar foco en campo de contraseña
  const handlePasswordFocus = () => {
    setShowRules(true);
    setPwdTouched(true);
  };

  // Manejar blur en campo de contraseña
  const handlePasswordBlur = () => {
    if (formData.password.length === 0) {
      setShowRules(false);
    }
  };

  // Alternar visibilidad de contraseña
  const togglePwd = () => {
    setShowPwd(!showPwd);
  };

  // Alternar visibilidad de confirmación de contraseña
  const toggleConfirm = () => {
    setShowConfirmPwd(!showConfirmPwd);
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones finales
    if (formData.password) {
      const allValid = rules.every(rule => rule.valid);
      if (!allValid) {
        setPwdInvalid(true);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setConfirmInvalid(true);
        return;
      }
    }
    
    // Preparar datos para enviar
    const submitData = { ...formData };
    
    // Si no se proporcionó nueva contraseña, eliminar campos de contraseña
    if (!submitData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    // Llamar función de guardado
    if (onSave) {
      onSave(submitData);
    }
  };

  // Efecto para validar confirmación cuando cambia la contraseña
  useEffect(() => {
    if (confirmTouched) {
      setConfirmInvalid(formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0);
    }
  }, [formData.password, formData.confirmPassword, confirmTouched]);

  return (
    <div className="profile-edit-container">
      <form className="profile-edit-form" onSubmit={handleSubmit}>
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
                onChange={handleNameChange}
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
                id="affiliation" 
                name="affiliation" 
                type="text" 
                className="register-form-input"
                placeholder="Universidad o institución" 
                value={formData.affiliation}
                onChange={onChange} 
                disabled={loading} 
                required
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
                id="cvlac" 
                name="cvlac" 
                type="url" 
                className="register-form-input"
                placeholder="https://..." 
                value={formData.cvlac}
                onChange={onChange} 
                disabled={loading}
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
                id="googleScholar" 
                name="googleScholar" 
                type="url" 
                className="register-form-input"
                placeholder="https://... (opcional)" 
                value={formData.googleScholar}
                onChange={onChange} 
                disabled={loading}
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
                id="orcid" 
                name="orcid" 
                type="url" 
                className="register-form-input"
                placeholder="https://orcid.org/... (opcional)" 
                value={formData.orcid}
                onChange={onChange} 
                disabled={loading}
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
                id="researchLines" 
                name="researchLines" 
                type="text" 
                className="register-form-input"
                placeholder="Separa por comas" 
                value={formData.researchLines}
                onChange={onChange} 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Campos de contraseña (opcionales para edición) */}
        <div className="password-section">
          <h3 className="password-section-title">Cambiar Contraseña (Opcional)</h3>
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="password">
                Nueva Contraseña
              </label>
              <div className="register-input-wrapper">
                <RiLockPasswordFill className="register-input-icon" />
                <input
                  ref={pwdRef}
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  className={`register-form-input ${pwdInvalid ? "register-input-error" : ""}`}
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  disabled={loading}
                  autoComplete="new-password"
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
                Confirmar Contraseña
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
        </div>

        {/* Botones de acción */}
        <div className="profile-edit-actions">
          <button 
            type="button" 
            className="profile-edit-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="profile-edit-save-btn"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;