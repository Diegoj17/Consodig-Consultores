import React from 'react';
import { FaUsers } from 'react-icons/fa';
import '../../../styles/management/user/UserStats.css';

const UserStats = ({ users, onCreateUser }) => {
  const getStatusCount = (status) => {
    return users.filter(user => user.status === status).length;
  };

  return (
    <div className="management-header">
      <div className="header-content">
        <div className="header-title">
          <p>Administra y gestiona los evaluadores del sistema</p>
        </div>
        <button 
          className="btn-primary btn-with-icon"
          onClick={onCreateUser}
        >
          <FaUsers />
          <span>Nuevo Evaluador</span>
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Evaluadores</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getStatusCount('active')}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{getStatusCount('inactive')}</span>
            <span className="stat-label">Inactivos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;