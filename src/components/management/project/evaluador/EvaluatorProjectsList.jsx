import React from 'react';
import { 
  FaClipboardList, 
  FaSearch, 
  FaUser, 
  FaCalendarAlt,
  FaClock,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit
} from 'react-icons/fa';
import EvaluatorProjectCard from './EvaluatorProjectCard';
import '../../../../styles/management/project/evaluador/EvaluatorProjectsList.css';

const EvaluatorProjectsList = ({
  projects,
  searchTerm,
  onSearchChange,
  onEvaluate,
  onDownload,
  onAccept,
  onReject,
  type = 'assigned'
}) => {
  const getEmptyMessage = () => {
    const messages = {
      'assigned': 'No tienes proyectos asignados pendientes de aceptación.',
      'evaluating': 'No tienes proyectos en evaluación actualmente.',
      'history': 'No hay proyectos evaluados en tu historial.'
    };
    return messages[type] || 'No hay proyectos disponibles.';
  };

  const getEmptyIcon = () => {
    const icons = {
      'assigned': <FaClipboardList className="empty-icon" />,
      'evaluating': <FaEdit className="empty-icon" />,
      'history': <FaCheckCircle className="empty-icon" />
    };
    return icons[type] || <FaClipboardList className="empty-icon" />;
  };

  return (
    <section className="evaluator-assigned">
      <header className="evaluator-section-header">
        <div className="evaluator-header-content">
          <div className="evaluator-header-main">
            <div className="evaluator-title-section">
              <FaClipboardList className="evaluator-header-icon" />
              <div>
                <h2 className="evaluator-title">
                  Proyectos {type === 'assigned' ? 'Asignados' : type === 'evaluating' ? 'en Evaluación' : 'Evaluados'}
                </h2>
                <p className="evaluator-subtitle">
                  {type === 'assigned' && 'Revisa y acepta los proyectos preasignados para comenzar la evaluación'}
                  {type === 'evaluating' && 'Continúa con la evaluación de los proyectos asignados'}
                  {type === 'history' && 'Consulta el historial de proyectos que has evaluado'}
                </p>
              </div>
            </div>
          </div>

          <div className="evaluator-header-actions">
            <div className="evaluator-search-container">
              <div className="evaluator-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar proyectos por título, resumen o palabras clave..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="evaluator-search-input"
                  aria-label="Buscar proyectos"
                />
              </div>
              <div className="evaluator-search-info">
                <span className="project-count">
                  <strong>{projects.length}</strong> proyecto{projects.length !== 1 ? 's' : ''} encontrado{projects.length !== 1 ? 's' : ''}
                </span>
                {searchTerm && (
                  <span className="search-term">
                    para "<strong>{searchTerm}</strong>"
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="evaluator-cards-grid">
        {projects.length === 0 ? (
          <div className="evaluator-empty-state">
            {getEmptyIcon()}
            <h3>No hay proyectos</h3>
            <p>{getEmptyMessage()}</p>
          </div>
        ) : (
          projects.map(project => (
            <EvaluatorProjectCard
              key={project.id}
              project={project}
              onEvaluate={onEvaluate}
              onDownload={onDownload}
              onAccept={onAccept}
              onReject={onReject}
              type={type}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default EvaluatorProjectsList;