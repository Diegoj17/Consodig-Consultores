import React, { useState } from 'react';
import { FaPlay, FaEye, FaCalendar, FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import Modal from '../../../common/Modal';
import '../../../../styles/management/project/evaluador/EvaluatorEvaluationList.css';

const EvaluatorEvaluationList = ({ 
  evaluations, 
  onAcceptEvaluation,
  onRejectEvaluation,
  onStartEvaluation,
  emptyMessage = "No se encontraron evaluaciones."
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const handleRejectClick = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedEvaluation) return;
    if (!rejectReason.trim()) {
      alert('Por favor indique el motivo del rechazo.');
      return;
    }
    onRejectEvaluation(selectedEvaluation.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedEvaluation(null);
  };

  // Función para obtener el estado de la evaluación
  const getEvaluationStatus = (evaluation) => {
    return evaluation.estado || evaluation.status;
  };

  // Calcular progreso de la evaluación
  const calculateProgress = (evaluation) => {
    const items = evaluation.itemsEvaluados || evaluation.criterios || evaluation.items || [];
    if (items.length === 0) return 0;
    
    const completedItems = items.filter(item => 
      item.calificacion > 0 || item.calificado
    ).length;
    
    return Math.round((completedItems / items.length) * 100);
  };

  // Obtener etiqueta de estado basado en progreso
  const getStatusBadge = (evaluation) => {
    const status = getEvaluationStatus(evaluation);
    const progress = calculateProgress(evaluation);

    // Para estado ACEPTADA, mostramos diferente según el progreso
    if (status === 'ACEPTADA') {
      if (progress === 0) {
        return {
          label: 'Pendiente', 
          class: 'evaluator-evaluation-list-status-pending', 
          icon: <FaClock />
        };
      } else if (progress < 100) {
        return {
          label: 'En Progreso', 
          class: 'evaluator-evaluation-list-status-in-progress', 
          icon: <FaPlay />
        };
      }
    }

    // Para otros estados
    const statusConfig = {
      'ASIGNADA': { label: 'Por Aceptar', class: 'evaluator-evaluation-list-status-assigned', icon: <FaClock /> },
      'ACEPTADA': { label: 'En Progreso', class: 'evaluator-evaluation-list-status-in-progress', icon: <FaPlay /> },
      'RECHAZADA': { label: 'Rechazada', class: 'evaluator-evaluation-list-status-rejected', icon: <FaTimesCircle /> },
      'COMPLETADA': { label: 'Completada', class: 'evaluator-evaluation-list-status-completed', icon: <FaCheckCircle /> }
    };

    return statusConfig[status] || statusConfig['ASIGNADA'];
  };

  // Función para obtener el formato de evaluación
  const getEvaluationFormat = (evaluation) => {
    return evaluation.formato || 
           evaluation.evaluationFormat || 
           evaluation.formatoEvaluacion || 
           evaluation.formatoDTO || 
           {};
  };

  // Función para obtener información del proyecto
  const getProjectInfo = (evaluation) => {
    return evaluation.proyecto || evaluation.project || {};
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Calcular tiempo restante
  const getTimeRemaining = (assignedDate, limitHours) => {
    if (!assignedDate || !limitHours) return 'No especificado';
    
    const assigned = new Date(assignedDate);
    const deadline = new Date(assigned.getTime() + limitHours * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = deadline - now;
    
    if (diffMs <= 0) return 'Tiempo agotado';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
  };

  // Obtener texto del botón según el estado y progreso
  const getButtonText = (evaluation) => {
    const status = getEvaluationStatus(evaluation);
    const progress = calculateProgress(evaluation);

    if (status === 'ASIGNADA') {
      return { text: 'Aceptar Evaluación', icon: <FaCheckCircle />, class: 'evaluator-evaluation-list-btn-accept' };
    }
    
    if (status === 'ACEPTADA') {
      if (progress === 0) {
        return { text: 'Iniciar Evaluación', icon: <FaPlay />, class: 'evaluator-evaluation-list-btn-primary' };
      } else {
        return { text: 'Continuar Evaluación', icon: <FaPlay />, class: 'evaluator-evaluation-list-btn-primary' };
      }
    }
    
    if (status === 'COMPLETADA') {
      return { text: 'Ver Evaluación', icon: <FaEye />, class: 'evaluator-evaluation-list-btn-secondary' };
    }
    
    return { text: 'Ver Detalles', icon: <FaEye />, class: 'evaluator-evaluation-list-btn-secondary' };
  };

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="evaluator-evaluation-list-empty-state">
        <FaFileAlt className="evaluator-evaluation-list-empty-icon" />
        <h3>No hay evaluaciones</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="evaluator-evaluation-list">
      <div className="evaluator-evaluation-list-grid">
        {evaluations.map(evaluation => {
          const status = getEvaluationStatus(evaluation);
          const progress = calculateProgress(evaluation);
          const project = getProjectInfo(evaluation);
          const format = getEvaluationFormat(evaluation);
          const statusConfig = getStatusBadge(evaluation);
          const buttonConfig = getButtonText(evaluation);
          
          return (
            <div key={evaluation.id} className="evaluator-evaluation-list-card">
              <div className="evaluator-evaluation-list-header">
                <h3 className="evaluator-evaluation-list-project-title">{project.titulo || project.nombre || project.title || 'Sin título'}</h3>
                <span className={`evaluator-evaluation-list-status-badge ${statusConfig.class}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              
              {/* Barra de progreso para evaluaciones en progreso */}
              {(status === 'ACEPTADA' && progress > 0) && (
                <div className="evaluator-evaluation-list-progress-section">
                  <div className="evaluator-evaluation-list-progress-info">
                    <span>Progreso: {progress}%</span>
                  </div>
                  <div className="evaluator-evaluation-list-progress-bar">
                    <div 
                      className="evaluator-evaluation-list-progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="evaluator-evaluation-list-details">
                <div className="evaluator-evaluation-list-detail-item">
                  <span className="evaluator-evaluation-list-detail-label">Código:</span>
                  <span className="evaluator-evaluation-list-detail-value">{project.codigo || project.code || 'N/A'}</span>
                </div>
                
                <div className="evaluator-evaluation-list-detail-item">
                  <span className="evaluator-evaluation-list-detail-label">Formato:</span>
                  <span className="evaluator-evaluation-list-detail-value">
                    {format.nombre || format.name || 'N/A'}
                  </span>
                </div>
                
                <div className="evaluator-evaluation-list-detail-item">
                  <span className="evaluator-evaluation-list-detail-label">
                    <FaCalendar />
                    Asignado:
                  </span>
                  <span className="evaluator-evaluation-list-detail-value">
                    {formatDate(evaluation.fechaAsignacion || evaluation.fechaCreacion)}
                  </span>
                </div>
                
                {evaluation.fechaAceptacion && (
                  <div className="evaluator-evaluation-list-detail-item">
                    <span className="evaluator-evaluation-list-detail-label">
                      <FaCheckCircle />
                      Aceptado:
                    </span>
                    <span className="evaluator-evaluation-list-detail-value">
                      {formatDate(evaluation.fechaAceptacion)}
                    </span>
                  </div>
                )}
                
                {(evaluation.tiempoLimiteHoras || evaluation.limitHours) && (
                  <div className="evaluator-evaluation-list-detail-item">
                    <span className="evaluator-evaluation-list-detail-label">Límite:</span>
                    <span className="evaluator-evaluation-list-detail-value">
                      {getTimeRemaining(
                        evaluation.fechaAsignacion || evaluation.fechaCreacion,
                        evaluation.tiempoLimiteHoras || evaluation.limitHours
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="evaluator-evaluation-list-actions">
                {/* Evaluaciones ASIGNADA (por aceptar) */}
                {status === 'ASIGNADA' && (
                  <>
                    <button
                      className="evaluator-evaluation-list-btn evaluator-evaluation-list-btn-accept"
                      onClick={() => onAcceptEvaluation(evaluation.id)}
                    >
                      <FaCheckCircle />
                      Aceptar Evaluación
                    </button>
                    <button
                      className="evaluator-evaluation-list-btn evaluator-evaluation-list-btn-reject"
                      onClick={() => handleRejectClick(evaluation)}
                    >
                      <FaTimesCircle />
                      Rechazar
                    </button>
                  </>
                )}

                {/* Evaluaciones ACEPTADA (pendientes y en progreso) */}
                {status === 'ACEPTADA' && (
                  <button
                    className={`evaluator-evaluation-list-btn ${buttonConfig.class}`}
                    onClick={() => onStartEvaluation(evaluation)}
                  >
                    {buttonConfig.icon}
                    {buttonConfig.text}
                  </button>
                )}

                {/* Evaluaciones COMPLETADA */}
                {status === 'COMPLETADA' && (
                  <button
                    className="evaluator-evaluation-list-btn evaluator-evaluation-list-btn-secondary"
                    onClick={() => onStartEvaluation(evaluation)}
                  >
                    <FaEye />
                    Ver Evaluación
                  </button>
                )}

                {/* Evaluaciones RECHAZADA */}
                {status === 'RECHAZADA' && (
                  <div className="evaluator-evaluation-list-rejected-info">
                    <FaTimesCircle />
                    <span>Evaluación rechazada</span>
                    {evaluation.motivoRechazo && (
                      <p className="evaluator-evaluation-list-rejection-reason">Motivo: {evaluation.motivoRechazo}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para rechazar evaluación */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        type="warning"
        title="Rechazar Evaluación"
        message="¿Está seguro de que desea rechazar esta evaluación?"
        onConfirm={confirmReject}
        confirmText="Confirmar Rechazo"
        cancelText="Cancelar"
        showCancel={true}
      >
        <textarea
          placeholder="Motivo del rechazo (obligatorio)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="evaluator-evaluation-list-reject-reason-textarea"
          rows="4"
        />
      </Modal>
    </div>
  );
};

export default EvaluatorEvaluationList;