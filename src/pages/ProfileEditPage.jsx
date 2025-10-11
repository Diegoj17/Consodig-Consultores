// components/ProfileEdit.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaUniversity, FaLink } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import InputField from '../components/profile/InputField';
import SelectField from '../components/profile/SelectField';
import PasswordField from '../components/profile/PasswordField';
import '../styles/pages/ProfileEditPage.css';

const ProfileEdit = ({ user, onSave, onCancel, loading = false }) => {
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

  const [errors, setErrors] = useState({});
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la ruta de origen de manera segura
  const returnTo = location.state?.from || location.state?.returnTo || 
                    (location.key !== 'default' ? -1 : '/dashboard');

  const [passwordRules, setPasswordRules] = useState([
    { id: 1, text: 'Al menos 8 caracteres', valid: false },
    { id: 2, text: 'Al menos una letra mayúscula', valid: false },
    { id: 3, text: 'Al menos una letra minúscula', valid: false },
    { id: 4, text: 'Al menos un número', valid: false },
    { id: 5, text: 'Al menos un carácter especial', valid: false }
  ]);

  const educationOptions = [
    { value: 'Pregrado', label: 'Pregrado' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' },
    { value: 'Postdoctorado', label: 'Postdoctorado' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validación en tiempo real para el email
    if (name === 'email') {
      if (value && !value.includes('@')) {
        setErrors(prev => ({ ...prev, email: 'El correo debe contener el carácter @' }));
      } else {
        setErrors(prev => ({ ...prev, email: null }));
      }
    }

    // Validación para el nombre (solo letras y espacios)
    if (name === 'name') {
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (filteredValue !== value) {
        setFormData(prev => ({ ...prev, name: filteredValue }));
      }
    }

    // Validación para contraseña
    if (name === 'password') {
      validatePassword(value);
    }

    // Validación para confirmar contraseña
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const validatePassword = (password) => {
    const newRules = [...passwordRules];
    
    newRules[0].valid = password.length >= 8;
    newRules[1].valid = /[A-Z]/.test(password);
    newRules[2].valid = /[a-z]/.test(password);
    newRules[3].valid = /[0-9]/.test(password);
    newRules[4].valid = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    setPasswordRules(newRules);
    
    const allValid = newRules.every(rule => rule.valid);
    if (!allValid && password.length > 0) {
      setErrors(prev => ({ ...prev, password: 'La contraseña no cumple con los requisitos' }));
    } else {
      setErrors(prev => ({ ...prev, password: null }));
    }

    // Validar confirmación si ya se ha tocado
    if (confirmPasswordTouched) {
      if (password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordRules(true);
    setPasswordTouched(true);
  };

  const handlePasswordBlur = () => {
    if (formData.password.length === 0) {
      setShowPasswordRules(false);
    }
  };

  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordTouched(true);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    
    // Primero ejecutar el callback onCancel si existe
    if (onCancel) {
      onCancel();
    }
    
    // Lógica mejorada para navegar de regreso
    if (typeof returnTo === 'string') {
      // Si returnTo es una ruta específica
      navigate(returnTo);
    } else if (returnTo === -1) {
      // Si es -1, usar navigate(-1) para volver atrás
      navigate(-1);
    } else {
      // Fallback: intentar volver atrás, si no funciona ir al dashboard
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    let formErrors = {};

    if (!formData.name) formErrors.name = 'El nombre es obligatorio';
    if (!formData.email) formErrors.email = 'El correo es obligatorio';
    else if (!formData.email.includes('@')) formErrors.email = 'El correo debe contener @';
    if (!formData.affiliation) formErrors.affiliation = 'La afiliación es obligatoria';
    if (!formData.educationLevel) formErrors.educationLevel = 'El nivel de estudios es obligatorio';

    if (formData.password) {
      const allValid = passwordRules.every(rule => rule.valid);
      if (!allValid) {
        formErrors.password = 'La contraseña no cumple con los requisitos';
      }

      if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Preparar datos para enviar
    const submitData = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }

    if (onSave) {
      const result = onSave(submitData);
      // si onSave devuelve una promesa, esperar a que termine antes de navegar
      if (result && typeof result.then === 'function') {
        result.then(() => {
          navigateBackAfterSave();
        }).catch(() => {
          navigateBackAfterSave();
        });
      } else {
        navigateBackAfterSave();
      }
    } else {
      navigateBackAfterSave();
    }
  };

  const navigateBackAfterSave = () => {
    if (typeof returnTo === 'string') {
      navigate(returnTo);
    } else if (returnTo === -1) {
      navigate(-1);
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      }
    }
  };

  return (
    <div className="profile-edit-wrapper">
      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="profile-form-section">
          <h2 className="profile-section-title">Información Personal</h2>
          <div className="profile-form-row">
            <InputField
              label="Nombre Completo *"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre completo"
              required
              disabled={loading}
              icon={FaUser}
              error={errors.name}
            />
            <InputField
              label="Correo Electrónico *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              required
              disabled={loading}
              icon={FaEnvelope}
              error={errors.email}
            />
          </div>
        </div>

        <div className="profile-form-section">
          <h2 className="profile-section-title">Información Profesional</h2>
          <div className="profile-form-row">
            <InputField
              label="Afiliación Institucional *"
              type="text"
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              placeholder="Universidad o institución"
              required
              disabled={loading}
              icon={FaUniversity}
              error={errors.affiliation}
            />
            <InputField
              label="Enlace a CVLAC"
              type="url"
              name="cvlac"
              value={formData.cvlac}
              onChange={handleChange}
              placeholder="https://..."
              disabled={loading}
              icon={FaLink}
            />
          </div>

          <div className="profile-form-row">
            <InputField
              label="Enlace a Google Académico"
              type="url"
              name="googleScholar"
              value={formData.googleScholar}
              onChange={handleChange}
              placeholder="https://... (opcional)"
              disabled={loading}
              icon={FaLink}
            />
            <InputField
              label="Enlace a ORCID"
              type="url"
              name="orcid"
              value={formData.orcid}
              onChange={handleChange}
              placeholder="https://orcid.org/... (opcional)"
              disabled={loading}
              icon={FaLink}
            />
          </div>

          <div className="profile-form-row">
            <SelectField
              label="Nivel de Estudios *"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              required
              disabled={loading}
              icon={MdSchool}
              options={educationOptions}
              placeholder="Seleccionar nivel"
            />
            <InputField
              label="Líneas de Investigación"
              type="text"
              name="researchLines"
              value={formData.researchLines}
              onChange={handleChange}
              placeholder="Separa por comas"
              disabled={loading}
              icon={FaLink}
            />
          </div>
        </div>

        <div className="profile-form-section">
          <h2 className="profile-section-title">Cambiar Contraseña (Opcional)</h2>
          <div className="profile-form-row">
            <PasswordField
              label="Nueva Contraseña"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              placeholder="Dejar en blanco para no cambiar"
              disabled={loading}
              error={errors.password}
              showRules={showPasswordRules}
              rules={passwordRules}
              confirm={true}
              confirmValue={formData.confirmPassword}
              confirmError={errors.confirmPassword}
              onConfirmChange={handleChange}
              onConfirmFocus={handleConfirmPasswordFocus}
            />
          </div>
        </div>

        <div className="profile-actions">
          <button 
            type="button" 
            className="profile-cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="profile-save-btn"
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