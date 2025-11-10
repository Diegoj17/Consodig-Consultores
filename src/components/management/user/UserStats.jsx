import React from 'react';
import { FaUsers } from 'react-icons/fa';
import '../../../styles/management/user/UserStats.css';

const UserStats = ({ users, onCreateUser, onCreateEvaluando }) => {
  // Contar usuarios activos basado en el campo 'estado' del backend
  const getActiveCount = () => {
    return users.filter(user => user.estado === 'ACTIVO').length;
  };

  const getInactiveCount = () => {
    return users.filter(user => user.estado === 'INACTIVO').length;
  };

  // Contar por rol
  const getEvaluadoresCount = () => {
    return users.filter(user => user.role === 'evaluador').length;
  };

  const getEvaluandosCount = () => {
    return users.filter(user => user.role === 'evaluando').length;
  };

  return (
    <div className="management-header">
      <div className="header-content">
        <div className="header-title">
          <p>Administra y gestiona los usuarios del sistema</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary btn-with-icon"
            onClick={onCreateEvaluando}
          >
            <FaUsers />
            <span>Nuevo Evaluando</span>
          </button>

          <button 
            className="btn-primary btn-with-icon"
            onClick={onCreateUser}
          >
            <FaUsers />
            <span>Nuevo Evaluador</span>
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getActiveCount()}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getInactiveCount()}</span>
            <span className="stat-label">Inactivos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon evaluador">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getEvaluadoresCount()}</span>
            <span className="stat-label">Evaluadores</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon evaluando">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getEvaluandosCount()}</span>
            <span className="stat-label">Evaluandos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;