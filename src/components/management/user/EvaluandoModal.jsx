"use client"

import { useState, useEffect, useRef } from "react"
import { FaUser, FaEnvelope, FaPhone, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck, FaLink } from "react-icons/fa"
import { MdSchool } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import { researchService } from "../../../services/researchService";
import "../../../styles/management/user/UserModal.css"


const EvaluandoModal = ({ show, onClose, onSubmit, userData, isEditing = false }) => {
  // researchOptions ahora será array de objetos { id, nombre }
  const [researchOptions, setResearchOptions] = useState([]);
  const [selectedLineIds, setSelectedLineIds] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
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
    if (!show) return;
    (async () => {
      try {
        // Usamos el servicio centralizado que devuelve un array de objetos { id, nombre }
        const rows = await researchService.getAll();
        const opts = Array.isArray(rows) ? rows.map((r) => ({ id: Number(r.id), nombre: r.nombre })).filter(o => o.nombre) : [];
        setResearchOptions(opts);
      } catch (e) {
        console.error("No se pudieron cargar las líneas de investigación:", e);
        setResearchOptions([]);
      }
    })();
  }, [show]);

  const [rules, setRules] = useState([
    { id: 1, text: "Al menos 8 caracteres", valid: false },
    { id: 2, text: "Una letra mayúscula", valid: false },
    { id: 3, text: "Una letra minúscula", valid: false },
    { id: 4, text: "Un número", valid: false },
    { id: 5, text: "Un carácter especial", valid: false },
  ])

  // Soportar tanto legacy (string) como nueva forma (array de objetos {id,nombre})
  useEffect(() => {
    if (isEditing && userData && show) {
      // legacy string para chips/visual
      const legacyStr = Array.isArray(userData.lineasInvestigacion)
        ? userData.lineasInvestigacion.map((l) => l?.nombre).filter(Boolean).join(", ")
        : (userData.lineasInvestigacion || userData.researchLines || "");

      // setear el formData completo (manteniendo compatibilidad con anteriores campos)
      setFormData({
        nombre: userData.nombre || userData.name || "",
        apellido: userData.apellido || "",
        telefono: userData.telefono || "",
        email: userData.email || "",
        afiliacionInstitucional: userData.afiliacionInstitucional || userData.institution || "",
        cvlac: userData.cvlac || userData.cvLink || "",
        googleScholar: userData.googleScholar || userData.scholarLink || "",
        orcid: userData.orcid || "",
        nivelEducativo: userData.nivelEducativo || userData.educationLevel || "",
        lineasInvestigacion: legacyStr,
        password: "",
        confirmPassword: "",
      });

      // ids para la tabla puente: si viene array de objetos, tomar ids; si viene string, intentar mapear por nombre
      if (Array.isArray(userData.lineasInvestigacion)) {
        const ids = userData.lineasInvestigacion.map((l) => Number(l.id)).filter(Boolean);
        setSelectedLineIds(ids);
      } else {
        // userData.lineasInvestigacion es string (legacy) -> intentamos matchear con researchOptions por nombre
        const names = (legacyStr || "").split(",").map(s => s.trim()).filter(Boolean);
        const matchedIds = researchOptions
          .filter((opt) => names.some(n => n.toLowerCase() === (opt.nombre || "").toLowerCase()))
          .map(opt => opt.id);
        setSelectedLineIds(matchedIds);
      }
    } else if (!isEditing && show) {
      setFormData({
        nombre: "",
        apellido: "",
        telefono: "",
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

  // Multi-select personalizado: abrir/cerrar y seleccionar opciones
  const [showLinesDropdown, setShowLinesDropdown] = useState(false);
  const linesRef = useRef(null);

  // Toggle por id y mantener cadena legacy para visual
  const handleOptionToggle = (id) => {
    setSelectedLineIds((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
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
    const isValid = newRules.every((r) => r.valid)
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

  const handleConfirmFocus = () => {
    setConfirmTouched(true)
  }

  const togglePwd = () => setShowPwd(!showPwd)
  const toggleConfirm = () => setShowConfirmPwd(!showConfirmPwd)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const isPasswordValid = rules.every((r) => r.valid)
    const isConfirmValid = formData.confirmPassword === formData.password

    if (!isEditing && (!isPasswordValid || !isConfirmValid)) {
      setPwdInvalid(!isPasswordValid)
      setConfirmInvalid(!isConfirmValid)
      setLoading(false)
      return
    }

    try {
      const payload = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        nivelEducativo: formData.nivelEducativo,
        password: formData.password,
        lineasInvestigacion: formData.lineasInvestigacion, // legacy (visual)
        lineaInvestigacionIds: selectedLineIds, // ids para la tabla puente
        estado: 'ACTIVO'
      }

      // Si es edición y no se cambió la contraseña, no enviarla
      if (isEditing) {
        delete payload.email              // ⬅️ no actualizar email
        if (!formData.password) delete payload.password
      }

      await onSubmit(payload)
      onClose()
    } catch (err) {
      console.error("Error creating evaluando", err)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="evaluando-modal-overlay">
      <div className="evaluando-modal">
        <div className="user-modal-header">
          <h3>{isEditing ? "Editar Evaluando" : "Registrar Nuevo Evaluando"}</h3>
          <button className="user-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-modal-form">
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="nombre">
                Nombre Completo *
              </label>
              <div className="register-input-wrapper">
                <FaUser className="register-input-icon" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="register-form-input"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.nombre}
                  onChange={onChange}
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
          </div>

          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="telefono">
                Teléfono
              </label>
              <div className="register-input-wrapper">
                <FaPhone className="register-input-icon" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  className="register-form-input"
                  placeholder="Número de teléfono"
                  value={formData.telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                    setFormData((prev) => ({ ...prev, telefono: value }))
                  }}
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
  <div className="register-form-group">
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
                  {isEditing ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña *"}
                </label>
                <div className="register-input-wrapper">
                  <RiLockPasswordFill className="register-input-icon" />
                  <input
                    ref={confirmRef}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPwd ? "text" : "password"}
                    className={`register-form-input ${confirmInvalid ? "register-input-error" : ""}`}
                    placeholder={isEditing ? "Repite la nueva contraseña" : "Repite tu contraseña"}
                    value={formData.confirmPassword}
                    onChange={onChange}
                    onFocus={handleConfirmFocus}
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

export default EvaluandoModal