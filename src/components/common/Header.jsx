import React from 'react';
import { FaBars, FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';
import '../../styles/common/Header.css';

const Header = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <div className="page-info">
          <h1 className="page-title">{pageTitle}</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Buscar..." className="search-input" />
        </div>
        
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <div className="user-avatar-sm">
            <FaUserCircle />
          </div>
          <div className="user-details">
            <span className="user-name">Administrador</span>
            <span className="user-role">Supervisor</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;