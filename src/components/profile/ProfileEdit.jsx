import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaUniversity, 
  FaLink, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationTriangle,
  FaCheck,
  FaPhone
} from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';
import { researchService } from '../../services/researchService';
import '../../styles/pages/ProfileEditPage.css';

const ProfileEdit = ({ user, onSave, onCancel, loading = false }) => {
  // Determinar tipo de usuario basado en el rol
  const userType = user?.role === 'EVALUADOR' ? 'evaluador' : 'evaluando';
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: user?.name || user?.nombre || '',
    email: user?.email || '',
    affiliation: user?.affiliation || user?.afiliacionInstitucional || '',
    cvlac: user?.cvlac || '',
    googleScholar: user?.googleScholar || '',
    orcid: user?.orcid || '',
    educationLevel: user?.educationLevel || user?.nivelEducativo || '',
    researchLines: user?.researchLines || user?.lineasInvestigacion || '',
    telefono: user?.telefono || '',
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
  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Multi-select para líneas de investigación
  const [selectedLineIds, setSelectedLineIds] = useState([]);
  const [researchOptions, setResearchOptions] = useState([]);
  const [showLinesDropdown, setShowLinesDropdown] = useState(false);
  const linesRef = useRef(null);

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

  // Campos requeridos según tipo de usuario
  const requiredFields = {
    evaluador: ['name', 'email', 'affiliation', 'educationLevel'],
    evaluando: ['name', 'email', 'affiliation', 'educationLevel', 'telefono']
  };

  // Manejar cambios en los campos
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación de email en tiempo real
    if (name === 'email') {
      setEmailError(value && !value.includes('@'));
    }
  };

  // Manejar cambio de nombre (solo letras y espacios)
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    setFormData(prev => ({ ...prev, name: value }));
  };

  // Manejar cambio de teléfono (solo números)
  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData(prev => ({ ...prev, telefono: value }));
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones finales de contraseña
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

    // Validar campos requeridos según tipo de usuario
    const currentRequiredFields = requiredFields[userType];
    const missingFields = currentRequiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Por favor completa todos los campos obligatorios: ${missingFields.join(', ')}`);
      return;
    }
    
    // Preparar datos para enviar
    const submitData = { 
      ...formData,
      role: user?.role,
      userType: userType
    };
    
    // Si no se proporcionó nueva contraseña, eliminar campos de contraseña
    if (!submitData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    // Incluir líneas de investigación seleccionadas
    submitData.researchLinesIds = selectedLineIds;
    
    // Para evaluadores, no incluir teléfono si no es necesario
    if (userType === 'evaluador') {
      delete submitData.telefono;
    }
    
    // Llamar función de guardado
    if (onSave) {
      await onSave(submitData);
    }
  };

  // Cargar líneas de investigación
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await researchService.getAll();
        const opts = Array.isArray(rows) ? rows.map((r) => ({ 
          id: Number(r.id), 
          nombre: r.nombre 
        })).filter(o => o.nombre) : [];
        if (mounted) setResearchOptions(opts);
      } catch (e) {
        console.error("No se pudieron cargar las líneas de investigación:", e);
        if (mounted) setResearchOptions([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Sincronizar líneas de investigación seleccionadas
  useEffect(() => {
    if (researchOptions.length > 0 && formData.researchLines) {
      const names = (formData.researchLines || "").split(',').map(s => s.trim()).filter(Boolean);
      const ids = researchOptions
        .filter(opt => names.some(n => n.toLowerCase() === (opt.nombre || '').toLowerCase()))
        .map(opt => opt.id);
      setSelectedLineIds(ids);
    }
  }, [researchOptions, formData.researchLines]);

  // Actualizar researchLines cuando cambian las selecciones
  useEffect(() => {
    const names = researchOptions
      .filter((o) => selectedLineIds.includes(o.id))
      .map((o) => o.nombre);
    setFormData(prev => ({ 
      ...prev, 
      researchLines: names.join(', ') 
    }));
  }, [selectedLineIds, researchOptions]);

  // Manejar selección/deselección de líneas
  const handleOptionToggle = (id) => {
    setSelectedLineIds((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
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

  // Efecto para validar confirmación cuando cambia la contraseña
  useEffect(() => {
    if (confirmTouched) {
      setConfirmInvalid(formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0);
    }
  }, [formData.password, formData.confirmPassword, confirmTouched]);

  return (
    <div className="profile-edit-wrapper">

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        {/* Información Personal */}
        <div className="profile-edit-section">
          <h3 className="profile-section-title">Información Personal</h3>
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
                  className={`register-form-input${emailError ? ' register-input-error' : ''}`}
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
              </div>
              {emailError && (
                <div className="register-error-text">El correo debe contener el carácter @</div>
              )}
            </div>
          </div>

          {/* Teléfono solo para evaluandos */}
          {userType === 'evaluando' && (
            <div className="register-form-row">
              <div className="register-form-group">
                <label className="register-form-label" htmlFor="telefono">
                  Teléfono *
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
                    onChange={handleTelefonoChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="register-form-group">
                {/* Espacio vacío para mantener el layout */}
              </div>
            </div>
          )}
        </div>

        {/* Información Profesional */}
        <div className="profile-edit-section">
          <h3 className="profile-section-title">Información Profesional</h3>
          
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
                    disabled={loading}
                    aria-haspopup="listbox"
                  >
                    {(!formData.researchLines || formData.researchLines.trim() === '') ? (
                      <span className="multi-select__placeholder">Seleccionar líneas</span>
                    ) : (
                      <div className="multi-select__chips">
                        {formData.researchLines.split(',').map((n) => (
                          <span key={n.trim()} className="multi-select__chip">{n.trim()}</span>
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
                            disabled={loading}
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
        </div>
    
      </form>
    </div>
  );
};

export default ProfileEdit;