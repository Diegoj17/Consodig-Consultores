import React from 'react';
import { 
  FaEye, 
  FaFilePdf, 
  FaFileExcel, 
  FaCalendar, 
  FaStar, 
  FaCheckCircle,
  FaClipboardList,
  FaFileAlt,
  FaChartBar,
  FaComment
} from 'react-icons/fa';

const EvaluandoCompletedList = ({ 
  evaluations, 
  onViewEvaluation, 
  onExportPDF, 
  onExportExcel 
}) => {

  const getScoreColor = (score) => {
    if (score >= 90) return 'evaluator-evaluation-completed-score-excellent';
    if (score >= 80) return 'evaluator-evaluation-completed-score-good';
    if (score >= 70) return 'evaluator-evaluation-completed-score-average';
    if (score >= 60) return 'evaluator-evaluation-completed-score-poor';
    return 'evaluator-evaluation-completed-score-fail';
  };

  const getStatusBadge = () => {
    return (
      <span className="evaluator-evaluation-completed-status-badge evaluator-evaluation-completed-status-completed">
        <FaCheckCircle />
        Completada
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getProjectData = (evaluation) => {
    return evaluation.proyecto || evaluation.project || {};
  };

  const getFinalScore = (evaluation) => {
    return evaluation.calificacionTotal ?? evaluation.puntajeFinal ?? evaluation.finalScore ?? evaluation.score ?? 0;
  };

  const getCompletedDate = (evaluation) => {
    return evaluation.fechaFinalizacion || evaluation.completedDate || evaluation.finishedAt;
  };

  const getFinalComments = (evaluation) => {
    if (evaluation.items && Array.isArray(evaluation.items)) {
      const comments = evaluation.items
        .map(item => item.comentarios)
        .filter(Boolean)
        .join(' | ');
      return comments || evaluation.comentariosFinales || evaluation.finalComments || '';
    }
    return evaluation.comentariosFinales || evaluation.finalComments || '';
  };

  const getProjectTitle = (project) => {
    return project.titulo || project.title || 'Sin título';
  };

  const handleViewDetails = (evaluation) => {
    if (onViewEvaluation) onViewEvaluation(evaluation);
  };

  const handleExportPDF = (evaluationId, event) => {
    event.stopPropagation();
    if (onExportPDF) onExportPDF(evaluationId);
  };

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="evaluator-evaluation-completed-empty-state">
        <FaCheckCircle className="evaluator-evaluation-completed-empty-icon" />
        <h3>No hay evaluaciones completadas</h3>
        <p>No se encontraron evaluaciones finalizadas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="evaluator-evaluation-completed-list">
      <div className="evaluator-evaluation-completed-grid">
        {evaluations.map((evaluation) => {
          const project = getProjectData(evaluation);
          const finalScore = getFinalScore(evaluation);
          const completedDate = getCompletedDate(evaluation);
          const finalComments = getFinalComments(evaluation);
          const projectTitle = getProjectTitle(project);

          return (
            <div 
              key={evaluation.id || Math.random()}
              className="evaluator-evaluation-completed-card evaluator-evaluation-completed-completed-card"
              onClick={() => handleViewDetails(evaluation)}
              style={{ cursor: 'pointer' }}
            >
              <div className="evaluator-evaluation-completed-header">
                <h3 className="evaluator-evaluation-completed-project-title">
                  {projectTitle}
                </h3>
                {getStatusBadge()}
              </div>

              <div className="evaluator-evaluation-completed-details">

                {/* Puntaje Final */}
                <div className="evaluator-evaluation-completed-detail-item evaluator-evaluation-completed-score-item">
                  <span className="evaluator-evaluation-completed-detail-label">
                    <FaStar className="evaluator-evaluation-completed-score-icon" />
                    Calificación Final:
                  </span>
                  <span className={`evaluator-evaluation-completed-detail-value evaluator-evaluation-completed-score-value ${getScoreColor(finalScore)}`}>
                    {finalScore}/100
                  </span>
                </div>

                {/* Barra de Progreso */}
                <div className="evaluator-evaluation-completed-detail-item evaluator-evaluation-completed-detail-item-full-width">
                  <span className="evaluator-evaluation-completed-detail-label">
                    <FaChartBar />
                    Progreso:
                  </span>
                  <div className="evaluator-evaluation-completed-progress-bar-container">
                    <div 
                      className="evaluator-evaluation-completed-progress-bar-fill"
                      style={{ width: `${finalScore}%` }}
                    ></div>
                    <span className="evaluator-evaluation-completed-progress-text">
                      {finalScore}% completado
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                <div className="evaluator-evaluation-completed-detail-item">
                  <span className="evaluator-evaluation-completed-detail-label">
                    <FaCalendar />
                    Completada:
                  </span>
                  <span className="evaluator-evaluation-completed-detail-value">
                    {formatDate(completedDate)}
                  </span>
                </div>

                {/* Comentarios Finales */}
                {finalComments && (
                  <div className="evaluator-evaluation-completed-detail-item evaluator-evaluation-completed-detail-item-full-width">
                    <span className="evaluator-evaluation-completed-detail-label">
                      <FaComment />
                      Observaciones:
                    </span>
                    <div className="evaluator-evaluation-completed-detail-value evaluator-evaluation-completed-comments-preview">
                      {finalComments.length > 120 
                        ? `${finalComments.substring(0, 120)}...` 
                        : finalComments
                      }
                    </div>
                  </div>
                )}

                {/* Items Evaluados */}
                {evaluation.items && (
                  <div className="evaluator-evaluation-completed-detail-item evaluator-evaluation-completed-detail-item-full-width">
                    <span className="evaluator-evaluation-completed-detail-label">
                      <FaClipboardList />
                      Criterios evaluados:
                    </span>
                    <span className="evaluator-evaluation-completed-detail-value">
                      {evaluation.items.length} criterio(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="evaluator-evaluation-completed-actions">
                <div className="evaluator-evaluation-completed-action-group">
                  <button
                    className="evaluator-evaluation-completed-btn evaluator-evaluation-completed-btn-primary evaluator-evaluation-completed-btn-view"
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(evaluation); }}
                    aria-label={`Ver detalles de la evaluación`}
                  >
                    <FaEye />
                    Ver Detalles
                  </button>
                </div>

                <div className="evaluator-evaluation-completed-export-group">
                  <span className="evaluator-evaluation-completed-export-label">
                    Exportar:
                  </span>
                  <div className="evaluator-evaluation-completed-export-buttons">
                    <button
                      className="evaluator-evaluation-completed-btn evaluator-evaluation-completed-btn-export evaluator-evaluation-completed-btn-pdf"
                      onClick={(e) => handleExportPDF(evaluation.id, e)}
                      title="Descargar PDF"
                      aria-label={`Exportar evaluación a PDF`}
                    >
                      <FaFilePdf />
                      <span>PDF</span>
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

export default EvaluandoCompletedList;
