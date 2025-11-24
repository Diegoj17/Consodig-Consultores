import React from 'react';
import '../../../../styles/management/project/evaluador/EvaluatorStats.css';

const EvaluatorStats = ({ stats }) => {
  const statCards = [
    {
      key: 'assigned',
      title: 'Preasignados',
      value: stats.assigned,
      icon: '📋',
      variant: 'pending'
    },
    {
      key: 'inProgress',
      title: 'En Evaluación',
      value: stats.inProgress,
      icon: '⏱️',
      variant: 'active'
    },
    {
      key: 'completed',
      title: 'Completados',
      value: stats.completed,
      icon: '✓',
      variant: 'completed'
    },
    {
      key: 'pending',
      title: 'Vencidos',
      value: stats.pending,
      icon: '⚠️',
      variant: 'warning'
    }
  ];

  return (
    <div className="evaluator-stats-grid">
      {statCards.map(stat => (
        <div key={stat.key} className={`evaluator-stat-card evaluator-stat-card--${stat.variant}`}>
          <div className="evaluator-stat-card__content">
            <span className="evaluator-stat-card__title">{stat.title}</span>
            <span className="evaluator-stat-card__value">{stat.value}</span>
          </div>
          <i className="evaluator-stat-card__icon">{stat.icon}</i>
        </div>
      ))}
    </div>
  );
};

export default EvaluatorStats;