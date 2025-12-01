import { useState, useEffect, useRef } from 'react';
import {
  FaUser, FaEnvelope, FaUniversity, FaLink
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import { researchService } from '../../../services/researchService';
import RegisterPasswordInputWithRules from './RegisterPasswordInputWithRules';
import { userService } from '../../../services/userService';
import '../../../styles/auth/register/RegisterForm.css';

const RegisterForm = ({ 
  formData, 
  loading, 
  error, 
  onChange, 
  onSubmit,
  onPasswordFocus,
  onPasswordBlur,
  showPasswordRules 
}) => {
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Multi-select para líneas de investigación (paralelo a UserModal)
  const [selectedLineIds, setSelectedLineIds] = useState([]);
  const [researchOptions, setResearchOptions] = useState([]);
  const [showLinesDropdown, setShowLinesDropdown] = useState(false);
  const linesRef = useRef(null);
  const isAnySubmitting = isSubmitting || loading;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successTimeoutRef = useRef(null);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setEmailError(value && !value.includes('@'));
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    const syntheticEvent = {
      target: {
        name: 'name',
        value: value
      }
    };
    onChange(syntheticEvent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validar contraseñas
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Preparar datos para el backend
      const userDataToSubmit = {
        nombre: formData.name || "",
        apellido: "",
        email: formData.email,
        afiliacionInstitucional: formData.affiliation,
        cvlac: formData.cvlac,
        googleScholar: formData.googleScholar,
        orcid: formData.orcid,
        nivelEducativo: formData.educationLevel,
        lineasInvestigacion: formData.researchLines,
        lineasInvestigacionIds: selectedLineIds,
        password: formData.password,
        estado: 'ACTIVO'
      };

      // Llamar al servicio de usuarios para crear evaluador
      await userService.createEvaluador(userDataToSubmit);
      
      // Si hay callback del padre, ejecutarlo
      if (onSubmit) {
        onSubmit(userDataToSubmit);
      }
      
      // Mostrar modal de éxito y programar redirect
      setShowSuccessModal(true);
      // Auto-redirect a login en 3s
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (err) {
      if (onSubmit) {
        // Pasar el error al componente padre
        const syntheticEvent = {
          target: {
            name: 'error',
            value: err.message || 'Error en el registro'
          }
        };
        onChange(syntheticEvent);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar líneas de investigación desde backend al montar
  useEffect(() => {
    let mounted = true;
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

    return () => { mounted = false }
  }, [])

  // Sincronizar selectedLineIds cuando cambia researchOptions o formData.researchLines (por si viene prellenado)
  useEffect(() => {
    if (researchOptions.length > 0 && formData.researchLines) {
      const names = Array.isArray(formData.researchLines)
        ? formData.researchLines.map(s => String(s).trim()).filter(Boolean)
        : (formData.researchLines || "").split(',').map(s => s.trim()).filter(Boolean);
      const ids = researchOptions
        .filter(opt => names.some(n => n.toLowerCase() === (opt.nombre || '').toLowerCase()))
        .map(opt => opt.id)
      setSelectedLineIds(ids)
    }
  }, [researchOptions, formData.researchLines])

  // Mantener formData.researchLines en sincronía cuando cambian los ids seleccionados
  useEffect(() => {
    const names = researchOptions
      .filter((o) => selectedLineIds.includes(o.id))
      .map((o) => o.nombre)
    onChange({ target: { name: 'researchLines', value: names.join(', ') } })
  }, [selectedLineIds, researchOptions, onChange])

  const handleOptionToggle = (id) => {
    setSelectedLineIds((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      return next
    })
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (linesRef.current && !linesRef.current.contains(e.target)) {
        setShowLinesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Limpiar timeout de success al desmontar
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    }
  }, [])

  return (
    <section className="register-form-section">
      <div className="register-content">
        <header style={{ width: "100%", marginBottom: "2rem" }}>
          <h2 className="register-title">Crear Cuenta</h2>
          <p className="register-subtitle">Completa tus datos para registrarte</p>
        </header>

        {error && <div className="register-error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
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
                  disabled={isSubmitting}
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
                  className={`register-form-input${emailError ? ' register-input-error' : ''}`}
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {emailError && (
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
                  onChange={onChange} disabled={isSubmitting} required
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
                  onChange={onChange} disabled={isSubmitting}
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
                  onChange={onChange} disabled={isSubmitting}
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
                  onChange={onChange} disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="PREGRADO">Pregrado</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="TECNOLOGO">Tecnólogo</option>
                  <option value="PROFESIONAL">Profesional</option>
                  <option value="ESPECIALIZACION">Especialización</option>
                  <option value="MAESTRIA">Maestría</option>
                  <option value="DOCTORADO">Doctorado</option>
                  <option value="POSTDOCTORADO">Postdoctorado</option>
                </select>
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="researchLines">
                Líneas de Investigación
              </label>
              <div className="register-input-wrapper">
                <FaLink className="register-input-icon" />
                <div ref={linesRef} className="multi-select" aria-expanded={showLinesDropdown}>
                  <button
                    type="button"
                    className={`register-form-input multi-select__control ${formData.researchLines ? '' : 'placeholder'}`}
                      onClick={() => setShowLinesDropdown(s => !s)}
                      disabled={isAnySubmitting}
                    aria-haspopup="listbox"
                  >
                    {(
                      !formData.researchLines ||
                      (typeof formData.researchLines === 'string' && formData.researchLines.trim() === '') ||
                      (Array.isArray(formData.researchLines) && formData.researchLines.length === 0)
                    ) ? (
                      <span className="multi-select__placeholder">Seleccionar líneas</span>
                    ) : (
                      <div className="multi-select__chips">
                          {selectedLineIds && selectedLineIds.length > 0 ? (
                            researchOptions
                              .filter(o => selectedLineIds.includes(o.id))
                              .map(o => (
                                <span key={o.id} className="multi-select__chip">{o.nombre}</span>
                              ))
                          ) : (
                            (() => {
                              const names = Array.isArray(formData.researchLines)
                                ? formData.researchLines.map(i => (typeof i === 'string' ? i : (i?.nombre || i?.name || '')))
                                : (formData.researchLines || '').split(',');
                              return names.map((n) => (
                                <span key={String(n).trim()} className="multi-select__chip">{String(n).trim()}</span>
                              ));
                            })()
                          )}
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

          {/* Contraseñas */}
          <RegisterPasswordInputWithRules
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onPasswordChange={onChange}
            onConfirmPasswordChange={onChange}
            loading={isSubmitting}
            showRules={showPasswordRules}
            onPasswordFocus={onPasswordFocus}
            onPasswordBlur={onPasswordBlur}
          />

          {/* Botón de registro */}
          <button className={`register-btn ${isSubmitting ? "loading" : ""}`} type="submit" disabled={isSubmitting}>
            {isSubmitting ? <div className="register-spinner" /> : "Crear Cuenta"}
          </button>
        </form>

        {showSuccessModal && (
          <div className="register-success-overlay">
            <div className="register-success-modal">
              <h3>Cuenta creada</h3>
              <p>¡Registro exitoso! Serás redirigido a iniciar sesión en breve.</p>
              <div className="register-success-actions">
                <button
                  type="button"
                  className="register-success-btn"
                  onClick={() => {
                    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
                    window.location.href = '/login'
                  }}
                >
                  Ir a iniciar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RegisterForm;