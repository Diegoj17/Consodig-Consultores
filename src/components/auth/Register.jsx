import { useState, useRef, useEffect } from 'react';
import { FaUser, FaEnvelope, FaUniversity, FaLink, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdSchool } from "react-icons/md";
import { Link } from 'react-router-dom';
import '/src/styles/auth/Register.css';

function isPasswordValid(password) {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@#$%^&*]/.test(password)
  );
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    affiliation: '',
    cvlac: '',
    googleScholar: '',
    orcid: '',
    educationLevel: '',
    researchLines: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para mostrar reglas y visibilidad
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para validación
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pwdRef = useRef(null);
  const confirmPwdRef = useRef(null);
  const rulesRef = useRef(null);
  const passwordLabelRef = useRef(null);
  const confirmPasswordLabelRef = useRef(null);

  // Reglas de contraseña con estado
  const passwordRules = [
    { id: 1, text: "Mínimo 6 caracteres", valid: formData.password.length >= 6 },
    { id: 2, text: "Al menos una mayúscula", valid: /[A-Z]/.test(formData.password) },
    { id: 3, text: "Al menos un número", valid: /\d/.test(formData.password) },
    { id: 4, text: "Un carácter especial (@#$%^&*)", valid: /[@#$%^&*]/.test(formData.password) }
  ];

  // Cerrar reglas al hacer clic fuera
   useEffect(() => {
    const handleClickOutside = (event) => {
      // Elementos que NO deben cerrar el cuadro
      const isPasswordInput = pwdRef.current?.contains(event.target);
      const isConfirmPasswordInput = confirmPwdRef.current?.contains(event.target);
      const isPasswordLabel = passwordLabelRef.current?.contains(event.target);
      const isConfirmPasswordLabel = confirmPasswordLabelRef.current?.contains(event.target);
      const isRulesBox = rulesRef.current?.contains(event.target);
      const isToggleButton = event.target.closest('.toggle-visibility');

      // Si el clic fue fuera de todos estos elementos, cerrar el cuadro
      if (!isPasswordInput && 
          !isConfirmPasswordInput && 
          !isPasswordLabel && 
          !isConfirmPasswordLabel && 
          !isRulesBox && 
          !isToggleButton) {
        setShowPasswordRules(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setIsLoading(true);
    
    // Simular registro (aquí iría tu llamada a la API)
    try {
      // await axios.post('/api/auth/register', formData);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.response?.data?.error || "Error al crear la cuenta");
      setShowErrorModal(true);
    }
  };

  // Validaciones visuales
  const isPasswordInvalid = passwordTouched && (!formData.password || !isPasswordValid(formData.password));
  const isConfirmPasswordInvalid = confirmPasswordTouched && 
    (formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password);

  // Toggle visibilidad contraseña
  const handleTogglePassword = () => {
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

  // Toggle visibilidad confirmar contraseña
  const handleToggleConfirmPassword = () => {
    const el = confirmPwdRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setShowConfirmPassword(v => !v);
    setTimeout(() => {
      if (confirmPwdRef.current) {
        confirmPwdRef.current.focus();
        confirmPwdRef.current.setSelectionRange(start, end);
      }
    }, 10);
  };

  // Manejo de focus/blur
  const handlePasswordFocus = () => {
    setShowPasswordRules(true);
    setPasswordTouched(true);
  };

  const handleConfirmPasswordFocus = () => {
    setShowPasswordRules(true);
    setConfirmPasswordTouched(true);
  };


  // Cerrar modales
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Redirigir al login
    window.location.href = '/login';
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };
  

  return (
    <div className="auth-main-container">
      <img src="/public/img/unnamed.png" alt="Fondo" className="background-image" />
      <div className="auth-background">
        <div className="auth-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-content">
        <div className="logo-container">
          <img
            src="/public/img/unnamed.png"
            alt="Logo"
            className="auth-logo"
          />
        </div>

        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-card-header">
            <h2>Crear Cuenta</h2>
            <p>Completa tus datos para registrarte</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* ... otros campos del formulario (se mantienen igual) ... */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FaUser className="label-icon" />
                Nombre Completo *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope className="label-icon" />
                Correo Electrónico *
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="affiliation" className="form-label">
                <FaUniversity className="label-icon" />
                Afiliación Institucional *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="affiliation"
                  name="affiliation"
                  className="form-input"
                  placeholder="Universidad o institución"
                  value={formData.affiliation}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cvlac" className="form-label">
                <FaLink className="label-icon" />
                Enlace a CVLAC
              </label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="cvlac"
                  name="cvlac"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.cvlac}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="googleScholar" className="form-label">
                <FaLink className="label-icon" />
                Enlace a Google Académico
              </label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="googleScholar"
                  name="googleScholar"
                  className="form-input"
                  placeholder="https://... (opcional)"
                  value={formData.googleScholar}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="orcid" className="form-label">
                <FaLink className="label-icon" />
                Enlace a ORCID
              </label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="orcid"
                  name="orcid"
                  className="form-input"
                  placeholder="https://orcid.org/... (opcional)"
                  value={formData.orcid}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="educationLevel" className="form-label">
                <MdSchool className="label-icon" />
                Nivel de Estudios *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="educationLevel"
                  name="educationLevel"
                  className="form-input"
                  placeholder="Ej: Doctorado, Maestría, Pregrado"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="researchLines" className="form-label">
                <FaLink className="label-icon" />
                Líneas de Investigación
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="researchLines"
                  name="researchLines"
                  className="form-input"
                  placeholder="Separa por comas"
                  value={formData.researchLines}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Campos de contraseña con reglas mejoradas */}
          <div className="form-row password-rules-row">
            {showPasswordRules && (
              <div ref={rulesRef} className="password-rules-container">
                <div className="password-rules-box">
                  <div className="rules-arrow"></div>
                  <span className="rules-title">La contraseña debe tener:</span>
                  <ul className="rules-list">
                    {passwordRules.map(rule => (
                      <li key={rule.id} className="rule-item">
                        <FaCheck className={`rule-icon ${rule.valid ? 'rule-valid' : ''}`} />
                        <span className="rule-text">{rule.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <RiLockPasswordFill className="label-icon" />
                Contraseña *
              </label>
              <div className="input-wrapper">
                <input
                  ref={pwdRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-input ${isPasswordInvalid ? 'input-error' : ''}`}
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {formData.password.length > 0 && (
                  <button
                    type="button"
                    className="toggle-visibility"
                    tabIndex={-1}
                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                )}
                {isPasswordInvalid && (
                  <FaExclamationTriangle
                    className="error-icon"
                  />
                )}
              </div>
              {isPasswordInvalid && (
                <div className="error-text">
                  La contraseña no cumple con los requisitos
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <RiLockPasswordFill className="label-icon" />
                Confirmar Contraseña *
              </label>
              <div className="input-wrapper">
                <input
                  ref={confirmPwdRef}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${isConfirmPasswordInvalid ? 'input-error' : ''}`}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleConfirmPasswordFocus}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {formData.confirmPassword.length > 0 && (
                  <button
                    type="button"
                    className="toggle-visibility"
                    tabIndex={-1}
                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={handleToggleConfirmPassword}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                )}
                {isConfirmPasswordInvalid && (
                  <FaExclamationTriangle
                    className="error-icon"
                  />
                )}
              </div>
              {isConfirmPasswordInvalid && (
                <div className="error-text">
                  Las contraseñas no coinciden
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <div className="auth-footer">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Modales (se mantienen igual) */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{color: '#2ecc71', marginBottom: '15px'}}>¡Cuenta Creada Exitosamente!</h3>
            <p className="modal-text">Tu cuenta ha sido creada correctamente.</p>
            <button className="modal-button success" onClick={closeSuccessModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{color: '#e74c3c', marginBottom: '15px'}}>¡Error!</h3>
            <p className="modal-text">{errorMessage}</p>
            <button className="modal-button error" onClick={closeErrorModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;