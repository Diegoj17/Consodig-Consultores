// Login.jsx actualizado
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/login/AuthForm';
import WelcomePanel from '../components/auth/login/AuthWelcomePanel';
import Footer from '../components/common/Footer';
import '../styles/pages/LoginPage.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría tu lógica real de autenticación
      console.log('Login attempt:', { email, password });
    }, 2000);
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-portal-container">
        <AuthForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          setError={setError}
        />
        
        <WelcomePanel onRegisterClick={handleRegisterClick} />
      </div>
      <Footer />
    </div>
  );
};

export default Login;