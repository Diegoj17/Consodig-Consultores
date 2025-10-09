
import { useState, useRef, useEffect } from "react";
import {
  FaUser, FaEnvelope, FaUniversity, FaLink, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck
} from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdSchool } from "react-icons/md";
import "/src/styles/auth/Register.css";

function isPasswordValid(pwd) {
  return pwd.length >= 6 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&*]/.test(pwd);
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    affiliation: "", cvlac: "", googleScholar: "", orcid: "",
    educationLevel: "", researchLines: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const [okModal, setOkModal] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const pwdRef = useRef(null);
  const confirmRef = useRef(null);

  const [showRules, setShowRules] = useState(false);
  const [rulesTimeout, setRulesTimeout] = useState(null);

  const rules = [
    { id: 1, text: "Mínimo 6 caracteres", valid: formData.password.length >= 6 },
    { id: 2, text: "Al menos una mayúscula", valid: /[A-Z]/.test(formData.password) },
    { id: 3, text: "Al menos un número", valid: /\d/.test(formData.password) },
    { id: 4, text: "Un carácter especial (@#$%^&*)", valid: /[@#$%^&*]/.test(formData.password) },
  ];

  // Mostrar reglas cuando el campo de contraseña está activo
  useEffect(() => {
    return () => {
      if (rulesTimeout) clearTimeout(rulesTimeout);
    };
  }, [rulesTimeout]);

  const handlePasswordFocus = () => {
    setShowRules(true);
    setPwdTouched(true);
    if (rulesTimeout) clearTimeout(rulesTimeout);
  };

  const handlePasswordBlur = () => {
    // Esperar un poco antes de ocultar las reglas para permitir hacer clic en el botón de visibilidad
    const timeout = setTimeout(() => {
      setShowRules(false);
    }, 200);
    setRulesTimeout(timeout);
  };

  const handlePasswordChange = (e) => {
    setFormData((s) => ({ ...s, password: e.target.value }));
    setShowRules(true);
    if (rulesTimeout) clearTimeout(rulesTimeout);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    
    // Si es el campo de contraseña, mantener las reglas visibles
    if (name === 'password') {
      setShowRules(true);
      if (rulesTimeout) clearTimeout(rulesTimeout);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, completa todos los campos obligatorios");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!isPasswordValid(formData.password)) {
      setError("La contraseña no cumple con los requisitos de seguridad");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOkModal(true);
    }, 1600);
  };

  const pwdInvalid = pwdTouched && (!formData.password || !isPasswordValid(formData.password));
  const confirmInvalid = confirmTouched && (formData.confirmPassword && formData.confirmPassword !== formData.password);

  const togglePwd = () => {
    const el = pwdRef.current; 
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    setShowPwd((v) => !v);
    // Mantener las reglas visibles cuando se hace toggle
    setShowRules(true);
    if (rulesTimeout) clearTimeout(rulesTimeout);
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

  return (
    <div className="register-portal-container">
      {/* IZQUIERDA: Bienvenida */}
      <section className="register-welcome-section">
        <div className="register-welcome-circle">
          <div className="register-welcome-content">
            <img src="/img/logo.png" alt="Logotipo" className="register-welcome-logo" />
            <h1 className="register-welcome-title">¡Hola!</h1>
            <p className="register-welcome-text">
              Regístrate en el banco de evaluadores para acceder al sistema.
            </p>
            <p className="register-welcome-extra-info">
              ¿Ya tienes cuenta? Ingresa con tus credenciales.
            </p>
            <button className="register-welcome-btn" onClick={() => (window.location.href = "/login")}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* DERECHA: Formulario */}
      <section className="register-form-section">
        <div className="register-content">
          <header style={{ width: "100%", marginBottom: "2rem" }}>
            <h2 className="register-title">Crear Cuenta</h2>
            <p className="register-subtitle">Completa tus datos para registrarte</p>
          </header>

          {error && <div className="register-error-message">{error}</div>}

          <form onSubmit={onSubmit} noValidate style={{ width: "100%" }}>
            {/* Fila 1 */}
            <div className="register-form-row">
              <div className="register-form-group">
                <label className="register-form-label" htmlFor="name">
                  Nombre Completo *
                </label>
                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" />
                  <input
                    id="name" name="name" type="text" className="register-form-input"
                    placeholder="Ingresa tu nombre completo" value={formData.name}
                    onChange={onChange} disabled={loading} required
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
                    id="email" name="email" type="email" className="register-form-input"
                    placeholder="Ingresa tu correo electrónico" value={formData.email}
                    onChange={onChange} disabled={loading} required
                  />
                </div>
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
                  <input
                    id="educationLevel" name="educationLevel" type="text" className="register-form-input"
                    placeholder="Ej: Doctorado, Maestría, Pregrado" value={formData.educationLevel}
                    onChange={onChange} disabled={loading} required
                  />
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

            {/* Fila 5: Contraseñas */}
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
                    value={formData.password}
                    onChange={handlePasswordChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    disabled={loading}
                    autoComplete="new-password"
                    required
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
                    value={formData.confirmPassword}
                    onChange={onChange} 
                    onFocus={() => setConfirmTouched(true)}
                    disabled={loading} 
                    autoComplete="new-password" 
                    required
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

            {/* Botón de registro */}
            <button className={`register-btn ${loading ? "loading" : ""}`} type="submit" disabled={loading}>
              {loading ? <div className="register-spinner" /> : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </section>

      {/* MODALES */}
      {okModal && (
        <div className="register-modal-overlay">
          <div className="register-modal">
            <h3 style={{ color: "#10b981", marginBottom: 15 }}>¡Cuenta creada!</h3>
            <p className="register-modal-text">Tu cuenta se ha creado correctamente.</p>
            <button className="register-modal-button success" onClick={() => { setOkModal(false); window.location.href = "/login"; }}>
              Aceptar
            </button>
          </div>
        </div>
      )}
      {errModal && (
        <div className="register-modal-overlay">
          <div className="register-modal">
            <h3 style={{ color: "#ef4444", marginBottom: 15 }}>¡Error!</h3>
            <p className="register-modal-text">{errMsg}</p>
            <button className="register-modal-button error" onClick={() => { setErrModal(false); setErrMsg(""); }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}