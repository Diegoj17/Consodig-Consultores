import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import PasswordField from '../components/profile/PasswordField';
import '../styles/pages/ChangePasswordPage.css';
import { authService } from '../services/authService';
import userService from '../services/userService';

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // El usuario actual se obtiene cuando es necesario desde authService

  // Estado del formulario
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para validación
  const [pwdInvalid, setPwdInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Reglas de contraseña (igual que en RegisterForm)
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

    // Validar nueva contraseña en tiempo real
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  // Validar contraseña (misma lógica que RegisterForm)
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

  // Manejar foco en campo de nueva contraseña
  const handlePasswordFocus = () => {
    setShowRules(true);
    setPwdTouched(true);
  };

  // Manejar blur en campo de nueva contraseña
  const handlePasswordBlur = () => {
    if (formData.newPassword.length === 0) {
      setShowRules(false);
    }
  };

  // Manejar foco en campo de confirmación
  const handleConfirmFocus = () => {
    setConfirmTouched(true);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.currentPassword) {
        throw new Error('La contraseña actual es obligatoria');
      }

      if (!formData.newPassword) {
        throw new Error('La nueva contraseña es obligatoria');
      }

      if (!formData.confirmPassword) {
        throw new Error('Debes confirmar la nueva contraseña');
      }

      // Validar reglas de contraseña
      const allValid = rules.every(rule => rule.valid);
      if (!allValid) {
        throw new Error('La nueva contraseña no cumple con los requisitos de seguridad');
      }

      // Validar que las contraseñas coincidan
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Validar que no sea la misma contraseña
      if (formData.currentPassword === formData.newPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }

      console.log('🟡 [ChangePasswordPage] Verificando contraseña actual...');

      // Verificamos la contraseña actual intentando login
      const current = authService.getCurrentUser();
      if (!current || !current.email) throw new Error('Usuario no autenticado');

      await authService.login(current.email, formData.currentPassword);

      // Si login fue exitoso, actualizamos la contraseña mediante el endpoint correspondiente según rol
      console.log('🟡 [ChangePasswordPage] Actualizando contraseña en backend...');
      // Normalizar nombre del campo de rol (soportar `role` y `rol`)
      const rawRole = current.role ?? current.rol ?? current.userType ?? current.tipo ?? '';
      const role = (typeof rawRole === 'string' ? rawRole : (rawRole?.name || '')).toString().toLowerCase();

      if (role.includes('admin')) {
        // Obtener entidad completa y hacer merge para evitar sobrescribir con nulls
        const existing = await userService.getAdminById(current.id);
        const payload = { ...existing, password: formData.newPassword };
        await userService.updateAdmin(current.id, payload);
      } else if (role.includes('evaluador')) {
        const existing = await userService.getEvaluadorById(current.id);
        const payload = { ...existing, password: formData.newPassword };
        await userService.updateEvaluador(current.id, payload);
      } else {
        const existing = await userService.getEvaluandoById(current.id);
        const payload = { ...existing, password: formData.newPassword };
        await userService.updateEvaluando(current.id, payload);
      }

      console.log('🟢 [ChangePasswordPage] Contraseña cambiada exitosamente');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ [ChangePasswordPage] Error al cambiar contraseña:', error);
      setErrorMessage(error.message || 'Error al cambiar la contraseña. Por favor, intente nuevamente.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navegar de regreso de manera segura
    const returnTo = location.state?.from || location.state?.returnTo || 
                     (location.key !== 'default' ? -1 : '/dashboard');
    
    if (typeof returnTo === 'string') {
      navigate(returnTo);
    } else if (returnTo === -1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    // Limpiar formulario
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    handleCancel(); // Volver después de cambiar exitosamente
  };


  return (
    <div className="change-password-page-content">
      <section className="change-password-form-section">
        <div className="change-password-content">

          <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
            {/* Contraseña Actual */}
            <PasswordField
              label="Contraseña Actual"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={onChange}
              placeholder="Ingresa tu contraseña actual"
              required={true}
              disabled={loading}
              error={!formData.currentPassword && pwdTouched ? 'La contraseña actual es obligatoria' : ''}
            />

            {/* Nueva Contraseña */}
            <PasswordField
              label="Nueva Contraseña"
              name="newPassword"
              value={formData.newPassword}
              onChange={onChange}
              placeholder="Ingresa tu nueva contraseña"
              required={true}
              disabled={loading}
              error={pwdInvalid ? 'La contraseña no cumple con los requisitos de seguridad' : ''}
              showRules={showRules}
              rules={rules}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              confirm={true}
              confirmValue={formData.confirmPassword}
              confirmError={confirmInvalid ? 'Las contraseñas no coinciden' : ''}
              onConfirmChange={onChange}
              onConfirmFocus={handleConfirmFocus}
            />

            {/* Botones de acción */}
            <div className="change-password-actions">
              <button 
                type="button" 
                className="change-password-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`change-password-submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? <div className="change-password-spinner" /> : "Cambiar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        type="success"
        title="¡Contraseña Cambiada!"
        message="Tu contraseña se ha actualizado correctamente. Serás redirigido al dashboard."
        confirmText="Aceptar"
        onConfirm={handleSuccessConfirm}
        showCancel={false}
      />

      {/* Modal de error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Error al Cambiar Contraseña"
        message={errorMessage}
        confirmText="Entendido"
        onConfirm={() => setShowErrorModal(false)}
        showCancel={false}
      />
    </div>
  );
};

export default ChangePasswordPage;