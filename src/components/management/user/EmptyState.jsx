import React from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import '../../../styles/management/user/EmptyState.css';

const EmptyState = () => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FaUsers />
      </div>
      <h3>No se encontraron usuarios</h3>
      <p>No hay usuarios que coincidan con los criterios de búsqueda.</p>
    </div>
  );
};

export default EmptyState;