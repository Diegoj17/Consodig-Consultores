import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../../../styles/management/user/UserCard.css';

const UserCard = ({ user, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="user-card">
      <div className="card-header">
        <div className="user-avatar">
          <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div className="user-meta">
          <h3>{user.name}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="status-indicator">
          <span className={`status-badge ${user.status}`}>
            {user.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="info-group">
          <label>Institución:</label>
          <p>{user.institution}</p>
        </div>
        <div className="info-group">
          <label>Nivel de Estudios:</label>
          <p>{user.educationLevel}</p>
        </div>
        <div className="info-group">
          <label>Líneas de Investigación:</label>
          <p className="research-lines">{user.researchLines}</p>
        </div>

        <div className="user-links">
          {user.cvLink && (
            <a href={user.cvLink} target="_blank" rel="noopener noreferrer" className="link-item">
              <span>CVLAC</span>
            </a>
          )}
          {user.scholarLink && (
            <a href={user.scholarLink} target="_blank" rel="noopener noreferrer" className="link-item">
              <span>Google Scholar</span>
            </a>
          )}
          {user.orcid && (
            <span className="link-item">
              ORCID: {user.orcid}
            </span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className="action-buttons">
          <button 
            className="btn-icon btn-edit"
            onClick={() => onEdit(user)}
            title="Editar"
          >
            <FaEdit />
          </button>
          <button 
            className="btn-icon btn-delete"
            onClick={() => onDelete(user.id)}
            title="Eliminar"
          >
            <FaTrash />
          </button>
          <button 
            className={`btn-toggle ${user.status === 'active' ? 'active' : ''}`}
            onClick={() => onToggleStatus(user.id)}
            title={user.status === 'active' ? 'Desactivar' : 'Activar'}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
        <div className="registration-date">
          Registrado: {new Date(user.registrationDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default UserCard;