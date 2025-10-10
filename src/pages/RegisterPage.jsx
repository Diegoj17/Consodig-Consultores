import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterWelcomePanel from '../components/auth/register/RegisterWelcomePanel';
import RegisterForm from '../components/auth/register/RegisterForm';
import RegisterModal from '../components/auth/register/RegisterModal';
import Footer from "../components/common/Footer";
import "../styles/pages/RegisterPage.css";

function isPasswordValid(pwd) {
  return pwd.length >= 6 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&*]/.test(pwd);
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    affiliation: "", cvlac: "", googleScholar: "", orcid: "",
    educationLevel: "", researchLines: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [okModal, setOkModal] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [rulesTimeout, setRulesTimeout] = useState(null);

  const navigate = useNavigate();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rulesTimeout) clearTimeout(rulesTimeout);
    };
  }, [rulesTimeout]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    
    // Si es el campo de contraseña, mantener las reglas visibles
    if (name === 'password') {
      setShowPasswordRules(true);
      if (rulesTimeout) clearTimeout(rulesTimeout);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, completa todos los campos obligatorios");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!isPasswordValid(formData.password)) {
      setError("La contraseña no cumple con los requisitos de seguridad");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOkModal(true);
    }, 1600);
  };

  const handlePasswordFocus = () => {
    setShowPasswordRules(true);
    if (rulesTimeout) clearTimeout(rulesTimeout);
  };

  const handlePasswordBlur = () => {
    // Esperar un poco antes de ocultar las reglas para permitir hacer clic en el botón de visibilidad
    const timeout = setTimeout(() => {
      setShowPasswordRules(false);
    }, 200);
    setRulesTimeout(timeout);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="auth-page-container">
      <div className="register-portal-container">
        <RegisterWelcomePanel onLoginClick={handleLoginClick} />
        
        <RegisterForm
          formData={formData}
          loading={loading}
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
          onPasswordFocus={handlePasswordFocus}
          onPasswordBlur={handlePasswordBlur}
          showPasswordRules={showPasswordRules}
        />
      </div>
      <Footer />

      {/* MODALES */}
      {okModal && (
        <RegisterModal
          type="success"
          title="¡Cuenta creada!"
          message="Tu cuenta se ha creado correctamente."
          onClose={() => { setOkModal(false); window.location.href = "/login"; }}
          buttonText="Aceptar"
        />
      )}
      {errModal && (
        <RegisterModal
          type="error"
          title="¡Error!"
          message={errMsg}
          onClose={() => { setErrModal(false); setErrMsg(""); }}
          buttonText="Cerrar"
        />
      )}
    </div>
  );
}