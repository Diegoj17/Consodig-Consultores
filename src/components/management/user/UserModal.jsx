import { useState, useRef, useEffect } from "react"
import {
  FaUser,
  FaEnvelope,
  FaUniversity,
  FaLink,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa"
import { MdSchool } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import { researchService } from "../../../services/researchService"
import "../../../styles/management/user/UserModal.css"

const UserModal = ({ show, onClose, onSubmit, userData, isEditing = false }) => {
  // Multi-select state for líneas de investigación (to match EvaluandoModal)
  const [selectedLineIds, setSelectedLineIds] = useState([]);
  const [researchOptions, setResearchOptions] = useState([]);
  const [showLinesDropdown, setShowLinesDropdown] = useState(false);
  const linesRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    afiliacionInstitucional: "",
    cvlac: "",
    googleScholar: "",
    orcid: "",
    nivelEducativo: "",
    lineasInvestigacion: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdInvalid, setPwdInvalid] = useState(false)
  const [confirmInvalid, setConfirmInvalid] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [pwdTouched, setPwdTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const pwdRef = useRef(null)
  const confirmRef = useRef(null)

  useEffect(() => {
    // Ajuste de scroll/overflow al abrir modal
    if (show) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`
      }
      document.body.style.overflow = "hidden"
    }

    // Carga las líneas de investigación desde el backend cuando se muestra el modal
    let mounted = true
    ;(async () => {
      try {
        const rows = await researchService.getAll()
        const opts = Array.isArray(rows) ? rows.map((r) => ({ id: Number(r.id), nombre: r.nombre })).filter(o => o.nombre) : []
        if (mounted) setResearchOptions(opts)
      } catch (e) {
        console.error("No se pudieron cargar las líneas de investigación:", e)
        if (mounted) setResearchOptions([])
      }
    })()

    return () => {
      mounted = false
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [show])

  const [rules, setRules] = useState([
    { id: 1, text: "Al menos 8 caracteres", valid: false },
    { id: 2, text: "Una letra mayúscula", valid: false },
    { id: 3, text: "Una letra minúscula", valid: false },
    { id: 4, text: "Un número", valid: false },
    { id: 5, text: "Un carácter especial", valid: false },
  ])

  // Efecto específico para cuando cambia userData
  useEffect(() => {
  console.log("🟡 USERMODAL - userData changed:", userData);
  console.log("🟡 USERMODAL - isEditing:", isEditing);
  console.log("🟡 USERMODAL - show:", show);
  console.log("🟡 USERMODAL - researchOptions:", researchOptions);
  
  if (isEditing && userData && show) {
    console.log("🟡 USERMODAL - Setting form data for editing");
    
    // Normalizar formData.lineasInvestigacion a string (legacy) y extraer ids si vienen como objetos
    const rawLines = userData.lineasInvestigacion ?? userData.researchLines ?? "";

    const lineasString = Array.isArray(rawLines)
      ? rawLines.map((l) => l?.nombre).filter(Boolean).join(', ')
      : typeof rawLines === 'string'
      ? rawLines
      : '';

    setFormData({
      nombre: userData.nombre || userData.name || "",
      apellido: userData.apellido || "",
      email: userData.email || "",
      afiliacionInstitucional: userData.afiliacionInstitucional || userData.institution || "",
      cvlac: userData.cvlac || userData.cvLink || "",
      googleScholar: userData.googleScholar || userData.scholarLink || "",
      orcid: userData.orcid || "",
      nivelEducativo: userData.nivelEducativo || userData.educationLevel || "",
      lineasInvestigacion: lineasString,
      password: "",
      confirmPassword: "",
    });

    // Inicializa selectedLineIds - IMPORTANTE: esperar a que researchOptions esté cargado
    if (researchOptions.length > 0) {
      let ids = [];
      
      if (Array.isArray(rawLines)) {
        // Si viene como array de objetos, extraer los IDs directamente
        ids = rawLines.map((l) => {
          const id = Number(l.id);
          console.log("🟡 Processing line:", l, "ID:", id);
          return id;
        }).filter(Boolean);
      } else {
        // Si viene como string, mapear nombres a IDs
        const names = (lineasString || "").split(',').map(s => s.trim()).filter(Boolean);
        console.log("🟡 Mapping names to IDs:", names);
        
        ids = researchOptions
          .filter(opt => names.some(n => n.toLowerCase() === (opt.nombre || '').toLowerCase()))
          .map(opt => {
            console.log("🟡 Matched:", opt.nombre, "ID:", opt.id);
            return opt.id;
          });
      }
      
      console.log("🟡 Final selectedLineIds to set:", ids);
      setSelectedLineIds(ids);
    }
  } else if (!isEditing && show) {
    console.log("🟡 USERMODAL - Resetting form for new user");
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      afiliacionInstitucional: "",
      cvlac: "",
      googleScholar: "",
      orcid: "",
      nivelEducativo: "",
      lineasInvestigacion: "",
      password: "",
      confirmPassword: "",
    });
    setSelectedLineIds([]);
  }
}, [isEditing, userData, show, researchOptions]);

  // actualizar formData.lineasInvestigacion cuando selectedLineIds cambie (mantener legacy string)
  useEffect(() => {
    const names = researchOptions
      .filter((o) => selectedLineIds.includes(o.id))
      .map((o) => o.nombre);
    setFormData((prev) => ({ ...prev, lineasInvestigacion: names.join(', ') }));
  }, [selectedLineIds, researchOptions]);

  const handleOptionToggle = (id) => {
  console.log("🟠 Toggle line ID:", id);
  setSelectedLineIds((prev) => {
    const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
    console.log("🟠 New selectedLineIds:", next);
    const names = researchOptions
      .filter((o) => next.includes(o.id))
      .map((o) => o.nombre);
    setFormData((prevForm) => ({ ...prevForm, lineasInvestigacion: names.join(', ') }));
    return next;
  });
};

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (linesRef.current && !linesRef.current.contains(e.target)) {
        setShowLinesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // selectedNames para mostrar chips (nombres correspondientes a los ids seleccionados)
  const selectedNames = researchOptions
    .filter((opt) => selectedLineIds.includes(opt.id))
    .map((opt) => opt.nombre);

  // Efecto para debug del formData actual
  useEffect(() => {
    if (show) {
      console.log("🟢 USERMODAL - Current formData:", formData);
    }
  }, [formData, show]);

  const onChange = (e) => {
    const { name, value } = e.target

    if (isEditing && name === "email") return;
    
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "password") {
      validatePassword(value)
    }
    if (name === "confirmPassword") {
      validateConfirmPassword(value)
    }
  }

  const validatePassword = (password) => {
    const newRules = [
      { id: 1, text: "Al menos 8 caracteres", valid: password.length >= 8 },
      { id: 2, text: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
      { id: 3, text: "Una letra minúscula", valid: /[a-z]/.test(password) },
      { id: 4, text: "Un número", valid: /[0-9]/.test(password) },
      { id: 5, text: "Un carácter especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ]

    setRules(newRules)
    const isValid = newRules.every((rule) => rule.valid)
    setPwdInvalid(!isValid && pwdTouched)
  }

  const validateConfirmPassword = (confirmPassword) => {
    const isValid = confirmPassword === formData.password
    setConfirmInvalid(!isValid && confirmTouched)
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, password: value }))
    validatePassword(value)
  }

  const handlePasswordFocus = () => {
    setShowRules(true)
    setPwdTouched(true)
  }

  const handlePasswordBlur = () => {
    setTimeout(() => setShowRules(false), 200)
  }

  const togglePwd = () => setShowPwd(!showPwd)
  const toggleConfirm = () => setShowConfirmPwd(!showConfirmPwd)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const isPasswordValid = rules.every((rule) => rule.valid)
    const isConfirmValid = formData.confirmPassword === formData.password

    if (!isEditing && (!isPasswordValid || !isConfirmValid)) {
      setPwdInvalid(!isPasswordValid)
      setConfirmInvalid(!isConfirmValid)
      setLoading(false)
      return
    }

    try {
      const userDataToSubmit = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        afiliacionInstitucional: formData.afiliacionInstitucional,
        cvlac: formData.cvlac,
        googleScholar: formData.googleScholar,
        orcid: formData.orcid,
        nivelEducativo: formData.nivelEducativo,
        lineasInvestigacion: formData.lineasInvestigacion,
        lineasInvestigacionIds: selectedLineIds,
        password: formData.password,
        estado: 'ACTIVO'
      }

      if (isEditing) {
      delete userDataToSubmit.email      // ⬅️ no actualizar email
      if (!formData.password) delete userDataToSubmit.password
    }

      await onSubmit(userDataToSubmit)
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="user-modal-overlay">
      <div className={`user-modal ${isEditing ? 'user-modal--edit' : 'user-modal--create'}`}>
        <div className="user-modal-header">
          <h3>{isEditing ? "Editar Evaluador" : "Registrar Nuevo Evaluador"}</h3>
          <button className="user-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-modal-form">
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="nombre">
                Nombre *
              </label>
              <div className="register-input-wrapper">
                <FaUser className="register-input-icon" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="register-form-input"
                  placeholder="Ingresa el nombre"
                  value={formData.nombre}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="apellido">
                Apellido *
              </label>
              <div className="register-input-wrapper">
                <FaUser className="register-input-icon" />
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  className="register-form-input"
                  placeholder="Ingresa el apellido"
                  value={formData.apellido}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
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
                  className={`register-form-input${formData.email && !formData.email.includes("@") ? " register-input-error" : ""}`}
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={onChange}
                  disabled={loading || isEditing}
                  readOnly={isEditing}    
                  required
                />
              </div>
              {formData.email && !formData.email.includes("@") && (
                <div className="register-error-text">El correo debe contener el carácter @</div>
              )}
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="afiliacionInstitucional">
                Afiliación Institucional *
              </label>
              <div className="register-input-wrapper">
                <FaUniversity className="register-input-icon" />
                <input
                  id="afiliacionInstitucional"
                  name="afiliacionInstitucional"
                  type="text"
                  className="register-form-input"
                  placeholder="Universidad o institución"
                  value={formData.afiliacionInstitucional}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
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
                  placeholder="https://scienti.minciencias.gov.co/cvlac/..."
                  value={formData.cvlac}
                  onChange={onChange}
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="https://scholar.google.com/..."
                  value={formData.googleScholar}
                  onChange={onChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="orcid">
                ORCID
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <input
                  id="orcid"
                  name="orcid"
                  type="text"
                  className="register-form-input"
                  placeholder="0000-0000-0000-0000"
                  value={formData.orcid}
                  onChange={onChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="nivelEducativo">
                Nivel de Estudios *
              </label>
              <div className="register-input-wrapper">
                <MdSchool className="register-input-icon" />
                <select
                  id="nivelEducativo"
                  name="nivelEducativo"
                  className="register-form-input"
                  value={formData.nivelEducativo}
                  onChange={onChange}
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="PREGRADO">PREGRADO</option>
                  <option value="TECNICO">TECNICO</option>
                  <option value="TECNOLOGO">TECNOLOGO</option>
                  <option value="PROFESIONAL">PROFESIONAL</option>
                  <option value="ESPECIALIZACION">ESPECIALIZACION</option>
                  <option value="MAESTRIA">MAESTRIA</option>
                  <option value="DOCTORADO">DOCTORADO</option>
                  <option value="POSTDOCTORADO">POSTDOCTORADO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="register-form-group full-width">
              <label className="register-form-label" htmlFor="lineasInvestigacion">
                Líneas de Investigación
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <div ref={linesRef} className="multi-select" aria-expanded={showLinesDropdown}>
                  <button
                    type="button"
                    className={`register-form-input multi-select__control ${selectedNames.length === 0 ? 'placeholder' : ''}`}
                    onClick={() => setShowLinesDropdown(s => !s)}
                    disabled={loading}
                    aria-haspopup="listbox"
                  >
                    {selectedNames.length === 0 ? (
                        <span className="multi-select__placeholder">Seleccionar líneas</span>
                      ) : (
                        <div className="multi-select__chips">
                          {selectedNames.map((n) => (
                            <span key={n} className="multi-select__chip">{n}</span>
                          ))}
                        </div>
                      )}
                  </button>

                  {showLinesDropdown && (
                    <div className="multi-select__dropdown" role="listbox">
                      {researchOptions.map((opt) => (
                        <label key={opt.id} className="multi-select__option">
                          <input
                            type="checkbox"
                            checked={selectedLineIds.includes(opt.id)}
                            onChange={() => handleOptionToggle(opt.id)}
                          />
                          <span className="multi-select__option-label">{opt.nombre}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(!isEditing || (isEditing && formData.password)) && (
            <div className="register-form-row">
              <div className="register-form-group">
                <label className="register-form-label" htmlFor="password">
                  {isEditing ? "Nueva Contraseña" : "Contraseña *"}
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
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
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
                        {rules.map((rule) => (
                          <li key={rule.id} className={`register-rule-item ${rule.valid ? "valid" : ""}`}>
                            {rule.valid ? (
                              <FaCheck className="register-rule-icon register-rule-valid" />
                            ) : (
                              <FaExclamationTriangle className="register-rule-icon" />
                            )}
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
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
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
            <button type="button" className="user-modal-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="user-modal-submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal