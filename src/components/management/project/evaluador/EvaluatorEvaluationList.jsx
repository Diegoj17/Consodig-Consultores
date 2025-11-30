import React, { useState } from 'react';
import { FaPlay, FaEye, FaCalendar, FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaDownload } from 'react-icons/fa';
import Modal from '../../../common/Modal';
import api from '../../../../api/Axios';
import evaluationService from '../../../../services/evaluationService';
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

  // Descargar archivo usando la instancia `api` (añade Authorization si existe)
  const handleDownload = async (url, filename) => {
    if (!url) return;

    const extractNameFromUrl = (u) => {
      try {
        const parts = u.split('/');
        const last = parts[parts.length - 1];
        return decodeURIComponent(last.split('?')[0]) || last;
      } catch {
        return '';
      }
    };

    const extractFilenameFromContentDisposition = (cd) => {
      if (!cd) return null;
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(cd);
      if (match) return decodeURIComponent(match[1] || match[2]);
      return null;
    };

    // Primero intentamos con axios (usa interceptor para agregar token si existe)
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const cd = response.headers?.['content-disposition'];
      const suggested = filename || extractFilenameFromContentDisposition(cd) || extractNameFromUrl(url);
      const blob = new Blob([response.data], { type: response.data?.type || 'application/octet-stream' });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = suggested || '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      return;
    } catch {
      // Si falla (CORS u otro), intentamos con fetch incluyendo credenciales/Authorization
      try {
        const headers = {};
        const token = localStorage.getItem('authToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const resp = await fetch(url, { headers, credentials: 'include' });
        if (!resp.ok) throw new Error('No fue posible obtener el archivo');
        const blob = await resp.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || extractNameFromUrl(url) || '';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
        return;
      } catch {
        // último recurso: abrir en nueva pestaña para que el navegador/servidor gestione la descarga
        try {
          window.open(url, '_blank', 'noopener');
        } catch {
          alert('No se pudo descargar el archivo. Intente abrir el enlace en una nueva pestaña.');
        }
      }
    }
  };

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

  // Calcular progreso de la evaluación (delegado al servicio para usar totalItems cuando exista)
  const calculateProgress = (evaluation) => {
    try {
      return evaluationService.calculateProgress(evaluation);
    } catch (err) {
      console.warn('EvaluatorEvaluationList.calculateProgress: fallback simple', err);
      const items = evaluation.itemsEvaluados || evaluation.criterios || evaluation.items || [];
      if (items.length === 0) return 0;
      const completedItems = items.filter(item => item.calificacion > 0 || item.calificado).length;
      return Math.round((completedItems / items.length) * 100);
    }
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
    } catch {
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
          
          // Resolve file info from different possible shapes: nested object, array, flat fields
          const resolveFile = (source) => {
            if (!source) return null;
            // if array, pick first
            if (Array.isArray(source)) source = source[0] || null;
            if (!source) return null;

            // if it's a string, assume it's a URL
            if (typeof source === 'string') {
              const parts = source.split('/');
              const last = parts[parts.length - 1] || source;
              return { name: decodeURIComponent((last || '').split('?')[0]) || last, url: source };
            }

            const name = source.nombre_archivo || source.nombreArchivo || source.nombre || source.fileName || source.file || source.documentName || source.documento || source.name || source.title || source.titleDocumento || null;
            const url = source.url_archivo || source.url || source.fileUrl || source.file_url || source.link || source.enlace || source.downloadUrl || source.download_url || source.ruta || source.path || source.archivoUrl || source.urlArchivo || null;

            return { name, url };
          };

          // Try multiple places where file info may live (check plural 'archivos' arrays first)
          const fileFromProyecto = resolveFile(project.archivos) || resolveFile(project.archivo) || resolveFile(project.files) || resolveFile(project) || null;
          const fileFromEvaluation = resolveFile(evaluation.archivo) || resolveFile(evaluation) || null;

          const fileObj = fileFromProyecto || fileFromEvaluation || { name: null, url: null };

          let projectFileDisplay = fileObj.name;
          const projectFileUrl = fileObj.url;
          // Depuración: mostrar en consola la información de archivos para cada evaluación
          console.log('EvaluatorEvaluationList - file debug', { evaluationId: evaluation.id, fileObj, projectFileUrl, projectFileDisplay, project, evaluation });
          if (!projectFileDisplay && projectFileUrl) {
            try {
              const parts = projectFileUrl.split('/');
              projectFileDisplay = decodeURIComponent(parts[parts.length - 1]) || projectFileUrl;
            } catch {
              projectFileDisplay = projectFileUrl;
            }
          }

          return (
            <div key={evaluation.id} className="evaluator-evaluation-list-card">
              <div className="evaluator-evaluation-list-header">
                <div className="evaluator-evaluation-list-project-info">
                  <span className="evaluator-evaluation-list-project-label">Proyecto:</span>
                  <h3 className="evaluator-evaluation-list-project-title">{project.titulo || project.nombre || project.title || 'Sin título'}</h3>
                </div>
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
                <div className="evaluator-evaluation-list-detail-item evaluator-evaluation-list-file-row">
                  <span className="evaluator-evaluation-list-detail-label">Archivo:</span>
                  <span className="evaluator-evaluation-list-detail-value">
                    {projectFileUrl ? (
                      <>
                        <a className="evaluator-evaluation-list-file-link" href={projectFileUrl} target="_blank" rel="noopener noreferrer">{projectFileDisplay || projectFileUrl}</a>
                        <a
                          className="evaluator-evaluation-list-file-download"
                          href={projectFileUrl}
                          onClick={(e) => { e.preventDefault(); handleDownload(projectFileUrl, projectFileDisplay); }}
                          title="Descargar archivo"
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaDownload />
                          <span style={{ marginLeft: '6px', fontWeight: 600 }}>Descargar</span>
                        </a>
                        {/* botón azul oscuro eliminado por solicitud */}
                      </>
                    ) : (
                      <>
                        <span>{(projectFileDisplay && projectFileDisplay !== '') ? projectFileDisplay : 'No disponible'}</span>
                        <button
                          disabled
                          title="No hay enlace disponible para descargar"
                          style={{
                            marginLeft: 12,
                            padding: '8px 12px',
                            background: '#94a3b8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'not-allowed',
                            fontWeight: 700
                          }}
                        >
                          <FaDownload style={{ marginRight: 8 }} /> No disponible
                        </button>
                      </>
                    )}
                  </span>
                </div>
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