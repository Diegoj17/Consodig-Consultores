import React from 'react';
import '../../styles/dashboard/StatCard.css';

const StatCard = ({ title, value, type = 'default' }) => {
  const getTypeClass = () => {
    const typeClasses = {
      pending: 'stat-card--pending',
      active: 'stat-card--active',
      completed: 'stat-card--completed',
      default: 'stat-card--default'
    };
    return typeClasses[type] || typeClasses.default;
  };

  return (
    <div className={`stat-card ${getTypeClass()}`}>
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <span className="stat-card__value">{value}</span>
      </div>
      <div className="stat-card__icon">
        {/* Puedes agregar íconos según el tipo */}
      </div>
    </div>
  );
};

export default StatCard;