import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResetWelcomePanel from '../components/auth/reset/ResetWelcomePanel';
import ResetForm from '../components/auth/reset/ResetForm';
import ResetModal from '../components/auth/reset/ResetModal';
import Footer from '../components/common/Footer';
import '../styles/pages/PasswordResetPage.css';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [okModal, setOkModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    setIsLoading(true);
    
    // Simulación de envío de correo
    setTimeout(() => {
      setIsLoading(false);
      setOkModal(true);
      setSuccess('Se ha enviado un enlace de restablecimiento a tu correo electrónico');
    }, 1600);
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
          onSubmit={handleSubmit}
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