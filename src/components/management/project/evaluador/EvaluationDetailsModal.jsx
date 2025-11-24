import React from 'react';
import { 
  FaTimes, FaFileContract, FaList, FaStar, 
  FaCalendar, FaCheckCircle, FaUser, FaProjectDiagram 
} from 'react-icons/fa';
import '../../../../styles/management/project/evaluador/EvaluationDetailsModal.css';

const EvaluationDetailsModal = ({ 
  evaluation, 
  onClose 
}) => {
  if (!evaluation) return null;

  // Obtener datos del proyecto
  const project = evaluation.proyecto || {};
  const format = evaluation.formato || {};
  
  // Obtener puntaje final
  const finalScore = evaluation.calificacionTotal || 0;
  
  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color del puntaje
  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-poor';
    return 'score-fail';
  };

  // Bloquear scroll del body mientras el modal esté abierto
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, []);

  return (
    <div className="evaluation-details-modal-overlay" onClick={onClose}>
      <div className="evaluation-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="evaluation-details-modal-header">
          <div className="evaluation-details-modal-title-section">
            <div>
              <h3>Detalles de Evaluación Completada</h3>
              <div className="evaluation-details-modal-subtitle">
                <span className="evaluation-details-status evaluation-details-status--completed">
                  <FaCheckCircle />
                  Evaluación Completada
                </span>
              </div>
            </div>
          </div>
          
          <div className="evaluation-details-modal-header-actions">
            <button 
              className="evaluation-details-modal-close" 
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="evaluation-details-modal-body">
          <div className="evaluation-details-modal-content">
            
            {/* Información del Proyecto */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaProjectDiagram className="evaluation-details-modal-section-icon" />
                <h3>Información del Proyecto</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-info-grid">
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Título:</span>
                    <span className="evaluation-details-modal-info-value">{project.titulo || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Código:</span>
                    <span className="evaluation-details-modal-info-value">{project.codigo || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Resumen:</span>
                    <span className="evaluation-details-modal-info-value">{project.resumen || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Objetivo General:</span>
                    <span className="evaluation-details-modal-info-value">{project.objetivoGeneral || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Palabras Clave:</span>
                    <span className="evaluation-details-modal-info-value">{project.palabrasClave || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Evaluación */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaFileContract className="evaluation-details-modal-section-icon" />
                <h3>Información de la Evaluación</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-info-grid">
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">ID Evaluación:</span>
                    <span className="evaluation-details-modal-info-value">#{evaluation.id}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Formato:</span>
                    <span className="evaluation-details-modal-info-value">{format.nombre || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Descripción del Formato:</span>
                    <span className="evaluation-details-modal-info-value">{format.descripcion || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item full-width">
                    <span className="evaluation-details-modal-info-label">Calificación Final:</span>
                    <div className="evaluation-details-modal-score-container">
                      <span className={`evaluation-details-modal-score ${getScoreColor(finalScore)}`}>
                        <FaStar className="evaluation-details-modal-score-icon" />
                        {finalScore}/100
                      </span>
                      <div className="evaluation-details-modal-progress">
                        <div 
                          className="evaluation-details-modal-progress-bar"
                          style={{ width: `${finalScore}%` }}
                        ></div>
                        <span className="evaluation-details-modal-progress-text">{finalScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cronología */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaCalendar className="evaluation-details-modal-section-icon" />
                <h3>Cronología</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-timeline">
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaUser />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Asignada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaAsignacion)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Aceptada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaAceptacion)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaFileContract />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Completada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaFinalizacion)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterios Evaluados */}
            {evaluation.items && evaluation.items.length > 0 && (
              <div className="evaluation-details-modal-section">
                <div className="evaluation-details-modal-section-header">
                  <FaList className="evaluation-details-modal-section-icon" />
                  <h3>Criterios Evaluados</h3>
                </div>
                
                <div className="evaluation-details-modal-section-content">
                  <div className="evaluation-details-modal-criterios-list">
                    {evaluation.items.map((item, index) => (
                      <div key={index} className="evaluation-details-modal-criterio-item">
                        <div className="evaluation-details-modal-criterio-header">
                          <span className="evaluation-details-modal-criterio-title">
                            {item.nombre || `Criterio ${index + 1}`}
                          </span>
                          <span className={`evaluation-details-modal-criterio-score ${getScoreColor(item.calificacion)}`}>
                            {item.calificacion || 0}%
                          </span>
                        </div>
                        
                        {item.descripcion && (
                          <p className="evaluation-details-modal-criterio-desc">
                            {item.descripcion}
                          </p>
                        )}
                        
                        {item.comentarios && (
                          <div className="evaluation-details-modal-criterio-comments">
                            <span className="evaluation-details-modal-criterio-comments-label">Comentarios:</span>
                            <p className="evaluation-details-modal-criterio-comments-text">
                              {item.comentarios}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Resumen de criterios */}
                  <div className="evaluation-details-modal-criterios-summary">
                    <div className="evaluation-details-modal-criterios-total">
                      <strong>Total de criterios: {evaluation.items.length}</strong>
                    </div>
                    <div className="evaluation-details-modal-criterios-average">
                      <strong>Promedio: {finalScore}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="evaluation-details-modal-footer">
          <div className="evaluation-details-modal-footer-actions">
            <button 
              className="evaluation-details-modal-btn-primary" 
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailsModal;