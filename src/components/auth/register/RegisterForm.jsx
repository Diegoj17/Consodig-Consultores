import { useState } from 'react';
import {
  FaUser, FaEnvelope, FaUniversity, FaLink
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import RegisterPasswordInputWithRules from './RegisterPasswordInputWithRules';
import { authService } from '../../../services/authService';
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
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        affiliation: formData.affiliation,
        cvlac: formData.cvlac,
        google_scholar: formData.googleScholar,
        orcid: formData.orcid,
        education_level: formData.educationLevel,
        research_lines: formData.researchLines
      };

      // Llamar al servicio de registro real
      const result = await authService.register(userData);
      
      // Si hay callback del padre, ejecutarlo
      if (onSubmit) {
        onSubmit(userData);
      }
      
      // Mostrar mensaje de éxito y redirigir
      alert('¡Registro exitoso! Por favor inicia sesión.');
      window.location.href = '/login';
      
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
                  onChange={onChange} disabled={isSubmitting}
                />
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
      </div>
    </section>
  );
};

export default RegisterForm;