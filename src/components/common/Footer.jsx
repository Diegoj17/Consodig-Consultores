import React from 'react';
import { FaLinkedin, FaTwitter, FaFacebook, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import '../../styles/common/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Columna 1 - Quiénes Somos */}
        <div className="footer-column">
          <div className="footer-logo-section">
            <img
              src="/img/logo.png"
              alt="Consodig Consultores SAS"
              className="footer-logo"
            />
            <h3 className="footer-company-name">CONSODIG CONSULTORES S.A.S</h3>
          </div>
          <p className="footer-description">
            Empresa de consultoría dedicada a la formulación y gestión de programas, 
            proyectos, planes, políticas y soluciones de innovación digital, para el 
            desarrollo social y empresarial.
          </p>
          <div className="footer-social-links">
            <a
              href="https://web.facebook.com/profile.php?id=61572845781480"
              className="footer-social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://wa.me/573005284209"
              className="footer-social-link"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp size={20} />
            </a>
            <a
              href="https://www.instagram.com/consodig"
              className="footer-social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>

        {/* Columna 2 - Servicios */}
        <div className="footer-column">
          <h4 className="footer-column-title">Nuestros Servicios</h4>
          <div className="footer-links">
            <span className="footer-service">Consultoría para formulación de programas</span>
            <span className="footer-service">Gestión de proyectos sociales</span>
            <span className="footer-service">Planes de desarrollo empresarial</span>
            <span className="footer-service">Políticas de innovación digital</span>
            <span className="footer-service">Soluciones de innovación social</span>
            <span className="footer-service">Desarrollo tecnológico</span>
            <span className="footer-service">Transformación digital</span>
            <span className="footer-service">Consultoría en competitividad</span>
          </div>
        </div>

        {/* Columna 3 - Contacto */}
        <div className="footer-column">
          <h4 className="footer-column-title">Contacto</h4>
          <div className="footer-contact-info">
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-contact-icon" />
              <span>San José de Cúcuta, Norte de Santander, Colombia</span>
            </div>
            <div className="footer-contact-item">
              <FaPhone className="footer-contact-icon" />
              <span>+57 300 528 4209</span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope className="footer-contact-icon" />
              <span>gerencia@consodigconsultores.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* Línea divisoria */}
      <div className="footer-divider"></div>

      {/* Sección inferior */}
      <div className="footer-bottom-section">
        <div className="footer-copyright">
          © {currentYear} All Rights Reserved. Desarrollado por: Grupo 4 - Administración de Proyectos Informáticos - API
        </div>
        <div className="footer-credits">
          Innovación Social y Desarrollo Tecnológico
        </div>
      </div>
    </footer>
  );
};

export default Footer;