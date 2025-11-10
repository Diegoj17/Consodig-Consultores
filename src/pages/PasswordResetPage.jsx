import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResetWelcomePanel from '../components/auth/reset/ResetWelcomePanel';
import ResetForm from '../components/auth/reset/ResetForm';
import ResetModal from '../components/auth/reset/ResetModal';
import Footer from '../components/common/Footer';
import { authService } from '../services/authService'; // Importar el servicio
import '../styles/pages/PasswordResetPage.css';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [okModal, setOkModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    console.group("🔧 PasswordResetPage - handleSubmit");
    setError('');
    setSuccess('');
    
    console.log("📝 Validando email:", email);
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      console.warn("⚠️ Email vacío");
      console.groupEnd();
      return;
    }
    
    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      console.warn("⚠️ Email inválido:", email);
      console.groupEnd();
      return;
    }
    
    setIsLoading(true);
    console.log("🔄 Iniciando petición real al servidor...");
    
    try {
      // ✅ HACER LA PETICIÓN REAL en lugar de la simulación
      console.log("📤 Enviando petición con email:", email);
      const response = await authService.resetPassword(email);
      
      console.log("✅ Respuesta del servidor:", response);
      setSuccess(response?.message || 'Se ha enviado un enlace de restablecimiento a tu correo electrónico');
      setOkModal(true);
      console.log("🎉 Éxito - Modal activado");
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      const errorMessage = err?.message || 
                          (err?.errors && Object.values(err.errors).flat().join(', ')) || 
                          'Error al enviar la solicitud';
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
    setOkModal(false);
    navigate('/login');
  };

  return (
    <div className="auth-page-container">
      <div className="reset-main-container">
        <ResetWelcomePanel onLoginClick={handleLoginClick} />
        
        <ResetForm
          email={email}
          setEmail={setEmail}
          error={error}
          success={success}
          isLoading={isLoading}
          onSubmit={handleSubmit}  // ✅ Esta función ahora hace la petición REAL
        />

        {/* MODAL DE ÉXITO */}
        {okModal && (
          <ResetModal
            type="success"
            title="¡Correo enviado!"
            message="Se ha enviado un enlace de restablecimiento a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones."
            onClose={handleModalClose}
            buttonText="Aceptar"
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PasswordResetPage;