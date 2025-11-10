import React from 'react';
import { FaClipboardList, FaCheckCircle, FaChartLine, FaProjectDiagram } from 'react-icons/fa';
import '../../../styles/dashboard/evaluando/EvaluandoStats.css';

const EvaluandoStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Evaluaciones Pendientes',
      value: stats.pendingEvaluations,
      icon: <FaClipboardList />,
      color: '#ff6b6b',
      description: 'Por completar'
    },
    {
      title: 'Evaluaciones Completadas',
      value: stats.completedEvaluations,
      icon: <FaCheckCircle />,
      color: '#51cf66',
      description: 'Total realizadas'
    },
    {
      title: 'Puntaje Promedio',
      value: `${stats.averageScore}%`,
      icon: <FaChartLine />,
      color: '#339af0',
      description: 'Rendimiento general'
    },
    {
      title: 'Proyectos Inscritos',
      value: stats.projectsEnrolled,
      icon: <FaProjectDiagram />,
      color: '#cc5de8',
      description: 'Participando'
    }
  ];

  return (
    <div className="evaluando-stats-container">
      {statCards.map((stat, index) => (
        <div key={index} className="evaluando-stat-card">
          <div className="evaluando-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="evaluando-stat-content">
            <h3>{stat.value}</h3>
            <p className="evaluando-stat-title">{stat.title}</p>
            <span className="evaluando-stat-description">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvaluandoStats;