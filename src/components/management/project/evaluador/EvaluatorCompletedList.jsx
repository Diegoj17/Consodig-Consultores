import React from 'react';
import { FaEye, FaFilePdf, FaFileExcel, FaCalendar, FaStar, FaCheckCircle } from 'react-icons/fa';
import '../../../../styles/management/project/evaluador/EvaluatorCompletedList.css';

const EvaluatorCompletedList = ({ 
  evaluations, 
  onViewEvaluation, 
  onExportPDF, 
  onExportExcel 
}) => {

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-poor';
    return 'score-fail';
  };

  const getStatusBadge = () => {
    return (
      <span className="status-badge status-completed">
        <FaCheckCircle />
        Completada
      </span>
    );
  };

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

  // Obtener datos del proyecto
  const getProjectData = (evaluation) => {
    return evaluation.proyecto || evaluation.project || {};
  };

  // Obtener puntaje final - CORREGIDO: usar calificacionTotal
  const getFinalScore = (evaluation) => {
    return evaluation.calificacionTotal || evaluation.puntajeFinal || evaluation.finalScore || evaluation.score || 0;
  };

  // Obtener fecha de finalización
  const getCompletedDate = (evaluation) => {
    return evaluation.fechaFinalizacion || evaluation.completedDate || evaluation.finishedAt;
  };

  // Obtener comentarios finales
  const getFinalComments = (evaluation) => {
    // Buscar en items o en la evaluación principal
    if (evaluation.items && evaluation.items.length > 0) {
      const comments = evaluation.items.map(item => item.comentarios).filter(Boolean);
      return comments.join(' | ');
    }
    return evaluation.comentariosFinales || evaluation.finalComments || '';
  };

  if (evaluations.length === 0) {
    return (
      <div className="evaluator-empty-state">
        <FaCheckCircle className="empty-icon" />
        <h3>No hay evaluaciones completadas</h3>
        <p>No se encontraron evaluaciones finalizadas.</p>
      </div>
    );
  }

  return (
    <div className="evaluator-completed-list">
      <div className="evaluation-grid">
          {evaluations.map(evaluation => {
          const project = getProjectData(evaluation);
          const finalScore = getFinalScore(evaluation);
          const completedDate = getCompletedDate(evaluation);
          const finalComments = getFinalComments(evaluation);
          // Código del proyecto: usar código del proyecto si existe, sino usar el id que tenga la evaluación
          const projectCode = project.codigo || project.code || evaluation.proyectoId || evaluation.projectId || (evaluation.proyecto && evaluation.proyecto.id) || (evaluation.project && evaluation.project.id) || 'N/A';
          
          return (
            <div key={evaluation.id} className="evaluation-card completed-card">
              <div className="evaluation-header">
                <h3 className="project-title">{project.titulo || project.title || 'Sin título'}</h3>
                {getStatusBadge()}
              </div>
              
              <div className="evaluation-details">
                <div className="detail-item">
                  <span className="detail-label">ID Evaluación:</span>
                  <span className="detail-value">#{evaluation.id}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Código Proyecto:</span>
                  <span className="detail-value">{projectCode}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Formato:</span>
                  <span className="detail-value">
                    {evaluation.formato?.nombre || evaluation.evaluationFormat?.name || 'N/A'}
                  </span>
                </div>
                
                {/* Puntaje final */}
                <div className="detail-item score-item">
                  <span className="detail-label">
                    <FaStar className="score-icon" />
                    Calificación Final:
                  </span>
                  <span className={`detail-value score-value ${getScoreColor(finalScore)}`}>
                    {finalScore}/100
                  </span>
                </div>

                {/* Progreso visual */}
                <div className="detail-item full-width">
                  <span className="detail-label">Progreso:</span>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${finalScore}%` }}
                    ></div>
                    <span className="progress-text">{finalScore}% completado</span>
                  </div>
                </div>

                {/* Fechas importantes */}
                <div className="detail-item">
                  <span className="detail-label">
                    <FaCalendar />
                    Completada:
                  </span>
                  <span className="detail-value">
                    {formatDate(completedDate)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Asignada:</span>
                  <span className="detail-value">
                    {formatDate(evaluation.fechaAsignacion || evaluation.assignedDate)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Aceptada:</span>
                  <span className="detail-value">
                    {formatDate(evaluation.fechaAceptacion)}
                  </span>
                </div>

                {/* Comentarios finales */}
                {finalComments && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Observaciones:</span>
                    <span className="detail-value comments-preview">
                      {finalComments.length > 120 
                        ? `${finalComments.substring(0, 120)}...` 
                        : finalComments
                      }
                    </span>
                  </div>
                )}

                {/* Items evaluados */}
                {evaluation.items && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Criterios evaluados:</span>
                    <span className="detail-value">
                      {evaluation.items.length} criterio(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="evaluation-actions">
                <div className="action-group">
                  <button
                    className="btn btn-primary btn-view"
                    onClick={() => onViewEvaluation(evaluation)}
                  >
                    <FaEye />
                    Ver Detalles
                  </button>
                </div>
                
                <div className="export-group">
                  <span className="export-label">Exportar:</span>
                  <div className="export-buttons">
                    <button
                      className="btn btn-export btn-pdf"
                      onClick={() => onExportPDF(evaluation.id)}
                      title="Descargar PDF"
                    >
                      <FaFilePdf />
                      <span>PDF</span>
                    </button>
                    <button
                      className="btn btn-export btn-excel"
                      onClick={() => onExportExcel(evaluation.id)}
                      title="Descargar Excel"
                    >
                      <FaFileExcel />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluatorCompletedList;