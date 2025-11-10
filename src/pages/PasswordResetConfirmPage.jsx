import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ResetConfirmWelcomePanel from '../components/auth/reset/ResetConfirmWelcomePanel';
import ResetConfirmForm from '../components/auth/reset/ResetConfirmForm';
import ResetConfirmModal from '../components/auth/reset/ResetConfirmModal';
import Footer from '../components/common/Footer';
import '../styles/pages/PasswordResetConfirmPage.css';

const PasswordResetConfirmPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const handleSubmit = () => {
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!newPassword || !confirmPassword) {
      setError('Por favor, completa ambos campos');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!token || !uid) {
      setError('Enlace de restablecimiento inválido o expirado');
      return;
    }
    
    setIsLoading(true);
    
    // Simulación de restablecimiento de contraseña
    setTimeout(() => {
      setIsLoading(false);
      setSuccessModal(true);
      setSuccess('Tu contraseña ha sido restablecida exitosamente');
    }, 1600);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleModalClose = () => {
    setSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className="auth-page-container">
      <div className="reset-confirm-main-container">
        <ResetConfirmWelcomePanel onLoginClick={handleLoginClick} />
        
        <ResetConfirmForm
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          error={error}
          success={success}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />

        {/* MODAL DE ÉXITO */}
        {successModal && (
          <ResetConfirmModal
            type="success"
            title="¡Contraseña Restablecida!"
            message="Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña."
            onClose={handleModalClose}
            buttonText="Iniciar Sesión"
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PasswordResetConfirmPage;