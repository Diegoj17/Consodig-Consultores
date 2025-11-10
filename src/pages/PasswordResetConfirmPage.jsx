import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ResetConfirmWelcomePanel from '../components/auth/reset/ResetConfirmWelcomePanel';
import ResetConfirmForm from '../components/auth/reset/ResetConfirmForm';
import ResetConfirmModal from '../components/auth/reset/ResetConfirmModal';
import Footer from '../components/common/Footer';
import { authService } from '../services/authService'; // Importar el servicio
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

  const handleSubmit = async () => {
    console.group("🔧 PasswordResetConfirmPage - handleSubmit");
    setError('');
    setSuccess('');
    
    console.log("📝 Validando contraseñas...");
    console.log("🔑 Token:", token);
    console.log("👤 UID:", uid);
    
    // Validaciones
    if (!newPassword || !confirmPassword) {
      setError('Por favor, completa ambos campos');
      console.warn("⚠️ Campos vacíos");
      console.groupEnd();
      return;
    }
    
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      console.warn("⚠️ Contraseña muy corta");
      console.groupEnd();
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      console.warn("⚠️ Contraseñas no coinciden");
      console.groupEnd();
      return;
    }
    
    if (!token) {
      setError('Enlace de restablecimiento inválido o expirado');
      console.warn("⚠️ Token no encontrado");
      console.groupEnd();
      return;
    }
    
    setIsLoading(true);
    console.log("🔄 Iniciando petición real al servidor...");
    
    try {
      // ✅ HACER LA PETICIÓN REAL en lugar de la simulación
      console.log("📤 Enviando petición con token y nueva contraseña");
      const response = await authService.changePassword(token, newPassword);
      
      console.log("✅ Respuesta del servidor:", response);
      setSuccess(response?.message || 'Tu contraseña ha sido restablecida exitosamente');
      setSuccessModal(true);
      console.log("🎉 Éxito - Modal activado");
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      const errorMessage = err?.message || 
                          (err?.errors && Object.values(err.errors).flat().join(', ')) || 
                          'Error al restablecer la contraseña';
      setError(errorMessage);
      console.log("📢 Error mostrado al usuario:", errorMessage);
    } finally {
      setIsLoading(false);
      console.log("🏁 Finalizado - Loading desactivado");
      console.groupEnd();
    }
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
          onSubmit={handleSubmit}  // ✅ Esta función ahora hace la petición REAL
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