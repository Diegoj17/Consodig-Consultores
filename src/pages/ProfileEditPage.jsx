import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileEdit from '../components/profile/ProfileEdit';
import Modal from '../components/common/Modal';
import '../styles/pages/ProfileEditPage.css';
import { authService } from '../services/authService';
import userService from '../services/userService';

const ProfileEditPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar datos reales según el rol del usuario
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const current = authService.getCurrentUser();
        if (!current || !current.id) {
          throw new Error('Usuario no autenticado');
        }

        // Normalizar posible nombre del campo de rol: `role`, `rol`, `userType`
        const rawRole = current.role ?? current.rol ?? current.userType ?? current.tipo ?? '';
        const role = (typeof rawRole === 'string' ? rawRole : (rawRole?.name || '')).toString().toLowerCase();
        let data = null;

        if (role.includes('admin')) {
          data = await userService.getAdminById(current.id);
        } else if (role.includes('evaluador')) {
          data = await userService.getEvaluadorById(current.id);
        } else {
          data = await userService.getEvaluandoById(current.id);
        }

        if (mounted) setUser(data);
      } catch (error) {
        console.error('Error cargando perfil:', error);
        setErrorMessage(error.message || 'No se pudo cargar el perfil');
        setShowErrorModal(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      const current = authService.getCurrentUser();
      if (!current || !current.id) throw new Error('Usuario no autenticado');

      console.log('🟡 [ProfileEditPage] Guardando perfil (API):', formData);
      const rawRole = current.role ?? current.rol ?? current.userType ?? current.tipo ?? '';
      const role = (typeof rawRole === 'string' ? rawRole : (rawRole?.name || '')).toString().toLowerCase();
      let updated = null;

      if (role.includes('admin')) {
        updated = await userService.updateAdmin(current.id, formData);
      } else if (role.includes('evaluador')) {
        updated = await userService.updateEvaluador(current.id, formData);
      } else {
        updated = await userService.updateEvaluando(current.id, formData);
      }

      // Actualizar usuario en localStorage si la respuesta incluye datos
      try { authService.updateUser(updated); } catch (e) { console.warn('No se actualizó localStorage:', e); }

      console.log('🟢 [ProfileEditPage] Perfil actualizado:', updated);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ [ProfileEditPage] Error al actualizar perfil:', error);
      setErrorMessage(error.message || 'Error al actualizar el perfil. Por favor, intente nuevamente.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const returnTo = location.state?.from || '/admin/dashboard';
    navigate(returnTo);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    handleCancel();
  };

  return (
    <div className="profile-edit-page-content">
      {user ? (
        <ProfileEdit 
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <div>Cargando perfil...</div>
      )}

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        type="success"
        title="¡Perfil Actualizado!"
        message="Tu información se ha guardado correctamente."
        confirmText="Aceptar"
        onConfirm={handleSuccessConfirm}
        showCancel={false}
      />

      {/* Modal de error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Error al Guardar"
        message={errorMessage}
        confirmText="Entendido"
        onConfirm={() => setShowErrorModal(false)}
        showCancel={false}
      />
    </div>
  );
};

export default ProfileEditPage;