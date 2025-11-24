import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProfileEdit from '../components/profile/ProfileEdit';
import Modal from '../components/common/Modal';
import '../styles/pages/ProfileEditPage.css';

const ProfileEditPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Datos de ejemplo del usuario (deberías obtenerlos de tu contexto/auth)
  const currentUser = {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    affiliation: "Universidad Nacional de Colombia",
    cvlac: "https://scienti.minciencias.gov.co/cvlac/example",
    googleScholar: "https://scholar.google.com/citations?user=example123",
    orcid: "https://orcid.org/0000-0000-0000-0000",
    educationLevel: "DOCTORADO",
    researchLines: "Inteligencia Artificial, Machine Learning, Data Science",
    role: "INVESTIGADOR",
    estado: "ACTIVO"
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      console.log('🟡 [ProfileEditPage] Guardando perfil:', formData);
      
      // Aquí iría la llamada real a tu API para actualizar el perfil
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular éxito
      console.log('🟢 [ProfileEditPage] Perfil actualizado exitosamente');
      
      // Mostrar modal de éxito
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
    handleCancel(); // Volver después de guardar exitosamente
  };

  // Determinar userType para el Sidebar según el rol del usuario
  const mapRoleToUserType = (role) => {
    if (!role) return 'evaluando';
    const r = role.toLowerCase();
    if (r.includes('admin') || r.includes('administrador')) return 'admin';
    if (r.includes('evaluador')) return 'evaluador';
    return 'evaluando';
  };

  return (
    <div className={`dashboard-app ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <Header onToggleSidebar={() => setSidebarOpen(s => !s)} pageTitle="Editar Perfil" />
      <Sidebar isOpen={sidebarOpen} userType={mapRoleToUserType(currentUser.role)} />

      <div className="dashboard-main">
        <main className="profile-edit-main-content">
          <div className="profile-edit-container">

            <ProfileEdit 
              user={currentUser}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </main>
      </div>

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