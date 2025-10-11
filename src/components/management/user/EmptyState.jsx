import React from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import '../../../styles/management/user/EmptyState.css';

const EmptyState = ({ onCreateUser }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FaUsers />
      </div>
      <h3>No se encontraron evaluadores</h3>
      <p>No hay evaluadores que coincidan con los criterios de búsqueda.</p>
      <button 
        className="btn-primary"
        onClick={onCreateUser}
      >
        <FaPlus />
        <span>Agregar Primer Evaluador</span>
      </button>
    </div>
  );
};

export default EmptyState;