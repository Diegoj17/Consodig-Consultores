import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaFileAlt, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import Modal from '../../../common/Modal';
import projectService from '../../../../services/projectService';
import { evaluationService } from '../../../../services/evaluationService';
import evaluationFormatService from '../../../../services/evaluationFormatService.js';
import '../../../../styles/management/project/evaluador/EvaluatorEvaluationForm.css';
import '../../../../styles/management/project/evaluador/EvaluatorCriterio.css';

const EvaluatorEvaluationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { evaluation, project, format } = location.state || {};
  
  console.log('📍 Location state:', location.state);
  console.log('📋 Evaluation:', evaluation);
  console.log('🏢 Project:', project);
  console.log('📝 Format:', format);

  const [evaluationData, setEvaluationData] = useState({
    items: [],
    comentarios: '',
    calificacionFinal: 0
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formatItems, setFormatItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    showCancel: false,
    onConfirm: null
  });

  // Cargar items reales del formato desde el backend
  useEffect(() => {
    if (format?.id) {
      loadFormatItems(format.id);
    } else {
      setError('No se pudo cargar el formato de evaluación');
      setLoadingItems(false);
    }
  }, [format]);

  // Cargar información completa del proyecto si es necesario
  useEffect(() => {
    let mounted = true;
    const loadProjectDetails = async () => {
      if (!project) return;
      // Si ya vienen campos clave, los usamos directamente
      const needsFullFetch = !project.resumen || !project.objetivoGeneral || !project.lineasInvestigacion;
      if (!needsFullFetch) {
        setProjectDetails(project);
        return;
      }

      try {
        // setLoadingProject(true);
        const id = project.id || project.proyectoId || project.proyecto?.id || project.codigo;
        if (!id) {
          setProjectDetails(project);
          return;
        }
        const full = await projectService.getById(id);
        if (mounted) setProjectDetails(full || project);
      } catch (err) {
        console.error('❌ Error cargando detalles del proyecto:', err);
        if (mounted) setProjectDetails(project);
      } finally {
        // finished loading project details
      }
    };

    loadProjectDetails();

    return () => { mounted = false; };
  }, [project]);

  const loadFormatItems = async (formatId) => {
    try {
      setLoadingItems(true);
      setError(null);
      console.log('🔄 Cargando items del formato ID:', formatId);
      
      // Obtener el formato completo con sus items
      const formatData = await evaluationFormatService.getFormatById(formatId);
      console.log('✅ Formato obtenido:', formatData);
      
      // Los items vienen en la propiedad 'items' del formato
      const items = formatData.items || [];
      console.log('📋 Items del formato:', items);
      
      if (items.length === 0) {
        setError('El formato de evaluación no tiene criterios configurados');
      }
      
      setFormatItems(items);
      
      // Inicializar datos de evaluación con los items reales
      const initialItems = items.map(item => ({
        itemFormatoId: item.id,
        calificacion: 0,
        observacion: ''
      }));
      
      setEvaluationData(prev => ({
        ...prev,
        items: initialItems
      }));
      
    } catch (error) {
      console.error('❌ Error cargando items del formato:', error);
      setError(`Error al cargar los criterios: ${error.message}`);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setEvaluationData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.itemFormatoId === itemId
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  useEffect(() => {
    // Recalcular puntuación final cuando cambian los items
    const total = evaluationData.items.reduce((sum, item) => {
      const formatItem = formatItems.find(fi => fi.id === item.itemFormatoId);
      const peso = formatItem?.peso || 0;
      return sum + (item.calificacion * peso / 100);
    }, 0);

    setEvaluationData(prev => ({
      ...prev,
      calificacionFinal: Math.round(total)
    }));
  }, [evaluationData.items, formatItems]);

  const handleSubmit = async () => {
    // Validar que todos los items tengan calificación
    const itemsIncompletos = evaluationData.items.filter(item => item.calificacion === 0);
    
    if (itemsIncompletos.length > 0) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Criterios incompletos',
        message: 'Por favor califica todos los criterios antes de enviar la evaluación.',
        confirmText: 'Entendido',
        showCancel: false,
        onConfirm: null
      });
      return;
    }

    if (!evaluationData.comentarios.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Comentarios requeridos',
        message: 'Por favor ingresa comentarios justificativos.',
        confirmText: 'Entendido',
        showCancel: false,
        onConfirm: null
      });
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Enviando evaluación...');
      
      // Calificar cada item individualmente
      for (const item of evaluationData.items) {
        console.log('📝 Calificando item:', item);
        await evaluationService.gradeItem(evaluation.id, {
          itemFormatoId: item.itemFormatoId,
          calificacion: item.calificacion,
          observacion: item.observacion
        });
      }

      // Finalizar la evaluación
      console.log('🏁 Finalizando evaluación...');
      await evaluationService.finishEvaluation(evaluation.id, {
        comentarios: evaluationData.comentarios,
        calificacionFinal: evaluationData.calificacionFinal
      });
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Evaluación completada',
          message: '✅ Evaluación completada exitosamente',
          confirmText: 'Ir a completadas',
          showCancel: false,
          onConfirm: () => navigate('/evaluador/evaluations/completed')
        });
    } catch (error) {
      console.error('❌ Error enviando evaluación:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error al enviar',
        message: `Error al enviar la evaluación: ${error.message}`,
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    // Guardar progreso parcial sin finalizar
    setLoading(true);
    try {
      const itemsConCalificacion = evaluationData.items.filter(item => item.calificacion > 0);
      
      if (itemsConCalificacion.length === 0) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Nada para guardar',
          message: 'No hay criterios calificados para guardar.',
          confirmText: 'Entendido',
          showCancel: false,
          onConfirm: null
        });
        setLoading(false);
        return;
      }

      console.log('💾 Guardando progreso...');
      for (const item of itemsConCalificacion) {
        console.log('💾 Guardando item:', item);
        await evaluationService.gradeItem(evaluation.id, {
          itemFormatoId: item.itemFormatoId,
          calificacion: item.calificacion,
          observacion: item.observacion
        });
      }
      
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Progreso guardado',
        message: '✅ Progreso guardado exitosamente',
        confirmText: 'Ir a en progreso',
        showCancel: false,
        onConfirm: () => navigate('/evaluador/evaluations/in-progress')
      });
    } catch (error) {
      console.error('❌ Error guardando progreso:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error al guardar',
        message: `Error al guardar progreso: ${error.message}`,
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar estado de error con Modal común
  if (error) {
    return (
      <Modal
        isOpen={!!error}
        onClose={() => setError(null)}
        type="error"
        title="Error al cargar la evaluación"
        message={error}
        confirmText="Volver"
        showCancel={false}
        onConfirm={() => {
          setError(null);
            navigate('/evaluador/evaluations/pending');
        }}
      />
    );
  }

  if (!evaluation || !project || !format) {
    const missingMsg = `Faltan datos necesarios: ${!evaluation ? 'Evaluation ' : ''}${!project ? 'Project ' : ''}${!format ? 'Format' : ''}`;
    return (
      <>
        <Modal
          isOpen={true}
          onClose={() => navigate('/evaluador/evaluations/pending')}
          type="error"
          title="Información no disponible"
          message={missingMsg}
          confirmText="Volver a la lista"
          showCancel={false}
          onConfirm={() => navigate('/evaluador/evaluations/pending')}
        />
      </>
    );
  }

  const displayProject = projectDetails || project || {};

  const getInstitution = () => {
    // Prefer project-level institution, then evaluation, then format, then fallback
    return (
      displayProject.institucion ||
      displayProject.institucionNombre ||
      displayProject.institution ||
      evaluation?.institucion ||
      evaluation?.institucionNombre ||
      evaluation?.institution ||
      format?.institucion ||
      format?.institucionNombre ||
      format?.institution ||
      'No especificada'
    );
  };

  // --- Helpers para archivos (similar a EvaluatorProjectCard) ---
  const getFileName = (archivo) => {
    return archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre';
  };

  

  const handleOpenFile = async (archivo) => {
    try {
      if (archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
        return;
      }

      setModalState({
        isOpen: true,
        type: 'info',
        title: 'Archivo no disponible',
        message: 'Este archivo no está disponible para abrir desde aquí. Ve a Mis Documentos si necesitas descargarlo.',
        confirmText: 'Ir a Mis Documentos',
        showCancel: true,
        onConfirm: () => navigate('/evaluador/documents')
      });
    } catch (error) {
      console.error('Error abriendo archivo:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error al abrir archivo',
        message: 'No se pudo abrir el archivo. Intenta en Mis Documentos.',
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: null
      });
    }
  };

  // Nota: la opción de descarga fue eliminada por diseño — solo permitimos abrir archivos.

  const steps = [
    { title: 'Información del Proyecto', completed: currentStep > 0 },
    { title: 'Criterios de Evaluación', completed: currentStep > 1 },
    { title: 'Comentarios y Envío', completed: currentStep > 2 }
  ];

  return (
    <div className="evaluator-evaluation-form">
      {/* Header */}
      <div className="evaluator-form-header">
        <button className="evaluator-back-btn" onClick={() => navigate('/evaluador/evaluations/pending')}>
          <FaArrowLeft />
          Volver a la lista
        </button>
        
        <div className="evaluator-form-title">
          <div>
            <h1>Evaluación del Proyecto</h1>
            <p>{project.titulo || 'Sin título'}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="evaluator-progress-steps">
        {steps.map((step, index) => (
          <div key={index} className={`evaluator-step ${currentStep === index ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
            <div className="evaluator-step-number">
              {step.completed ? '✓' : index + 1}
            </div>

            {/* (removed duplicated project files block) */}
            <span className="evaluator-step-label">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="evaluator-form-content">
        {currentStep === 0 && (
          <div className="evaluator-step-section">
            <h2>Información del Proyecto</h2>
            
            <div className="evaluator-project-details">
              <div className="evaluator-detail-group">
                <h3>Datos Básicos</h3>
                <div className="evaluator-detail-item">
                  <strong>Título:</strong>
                  <span>{displayProject.titulo || displayProject.nombre || 'Sin título'}</span>
                </div>
                <div className="evaluator-detail-item">
                  <strong>Resumen:</strong>
                  <p>{displayProject.resumen || displayProject.descripcion || 'Sin resumen disponible'}</p>
                </div>
              </div>

              <div className="evaluator-detail-group">
                <h3>Detalles</h3>
                <div className="evaluator-detail-item full-width">
                  <strong>Objetivo General:</strong>
                  <p>{displayProject.objetivoGeneral || displayProject.objetivo || 'No disponible'}</p>
                </div>
                <div className="evaluator-detail-item full-width">
                  <strong>Palabras Clave:</strong>
                  <p>{displayProject.palabrasClave || (displayProject.palabrasClaveArray ? displayProject.palabrasClaveArray.join(', ') : '') || 'No disponible'}</p>
                </div>
                <div className="evaluator-detail-item full-width">
                  <strong>Líneas de Investigación:</strong>
                  <p>{(displayProject.lineasInvestigacionNames && displayProject.lineasInvestigacionNames.join(', ')) || (displayProject.lineasInvestigacion && displayProject.lineasInvestigacion.map(l=>l.nombre).join(', ')) || 'No especificadas'}</p>
                </div>
                <div className="evaluator-detail-item full-width">
                  <strong>Institución:</strong>
                  <p>{getInstitution()}</p>
                </div>
              </div>
            </div>

            <div className="evaluator-format-info">
              <h3>Formato de Evaluación Asignado</h3>
              <div className="evaluator-format-details">
                <strong>{format.nombre}</strong>
                <p>{format.descripcion}</p>
                <div className="evaluator-format-stats">
                  <span>{formatItems.length} criterios</span>
                  <span>Valor total: {formatItems.reduce((sum, item) => sum + (item.peso || 0), 0)}%</span>
                </div>
              </div>
            </div>

            {/* Sección de Archivos del Proyecto (única aparición) */}
            {Array.isArray(displayProject.archivos) && displayProject.archivos.length > 0 && (
              <div className="evaluator-project-files">
                <h3>Archivos del Proyecto</h3>
                <div className="evaluator-files-list">
                  {displayProject.archivos.map((archivo) => (
                    <div key={archivo.id || archivo.nombreArchivo || archivo.urlArchivo} className="evaluator-file-item">
                      <div className="evaluator-file-meta">
                        <FaFileAlt className="evaluator-file-icon" />
                        <span className="evaluator-file-name">{getFileName(archivo)}</span>
                      </div>
                      <div className="evaluator-file-actions">
                        <button className="evaluator-file-open" title="Abrir" onClick={() => handleOpenFile(archivo)}>
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="evaluator-step-actions">
              <button
                className="evaluator-btn evaluator-btn-primary"
                onClick={() => setCurrentStep(1)}
                disabled={loadingItems}
              >
                {loadingItems ? 'Cargando criterios...' : 'Continuar a Criterios'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="evaluator-step-section">
            <h2>Criterios de Evaluación</h2>
            <p>Califica cada criterio según el formato establecido</p>
            
            {loadingItems ? (
              <div className="evaluator-loading-items">
                <div className="evaluator-spinner"></div>
                <p>Cargando criterios de evaluación...</p>
              </div>
            ) : formatItems.length === 0 ? (
              <div className="evaluator-no-items">
                <FaInfoCircle className="evaluator-no-items-icon" />
                <h3>No hay criterios definidos</h3>
                <p>El formato de evaluación no tiene criterios configurados.</p>
              </div>
            ) : (
              <div className="evaluator-criteria-section">
                {formatItems.map((formatItem, index) => {
                  const evaluationItem = evaluationData.items.find(item => item.itemFormatoId === formatItem.id) || {};
                  
                  return (
                    <div key={formatItem.id} className="evaluator-criterion">
                      <div className="evaluator-criterion-header">
                        <div className="evaluator-criterion-title">
                          <h4>{index + 1}. {formatItem.nombre}</h4>
                          <span className="evaluator-criterion-weight">Valor: {formatItem.peso}%</span>
                        </div>
                        <div className="evaluator-criterion-score">
                          <span className="evaluator-score-display">
                            {evaluationItem.calificacion || 0} / 100
                          </span>
                        </div>
                      </div>

                      <div className="evaluator-criterion-description">
                        <FaInfoCircle className="evaluator-info-icon" />
                        <p>{formatItem.descripcion}</p>
                      </div>

                      <div className="evaluator-criterion-controls">
                        <div className="evaluator-score-input">
                          <label>Calificación:</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={evaluationItem.calificacion || 0}
                            onChange={(e) => handleItemChange(formatItem.id, 'calificacion', parseInt(e.target.value))}
                            className="evaluator-range"
                          />
                          <div className="evaluator-range-labels">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                        </div>

                        <div className="evaluator-criterion-comments">
                          <label>Observaciones:</label>
                          <textarea
                            rows="3"
                            placeholder="Observaciones específicas para este criterio..."
                            value={evaluationItem.observacion || ''}
                            onChange={(e) => handleItemChange(formatItem.id, 'observacion', e.target.value)}
                            className="evaluator-comments-textarea"
                          />
                        </div>
                      {/* Modal global para mensajes de éxito / error */}
                      <Modal
                        isOpen={modalState.isOpen}
                        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                        type={modalState.type}
                        title={modalState.title}
                        message={modalState.message}
                        confirmText={modalState.confirmText}
                        showCancel={modalState.showCancel}
                        onConfirm={() => {
                          try {
                            if (modalState.onConfirm) modalState.onConfirm();
                          } finally {
                            setModalState(prev => ({ ...prev, isOpen: false }));
                          }
                        }}
                      />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="evaluator-step-actions">
              <button
                className="evaluator-btn evaluator-btn-secondary"
                onClick={() => setCurrentStep(0)}
                disabled={loading}
              >
                Anterior
              </button>
              <button
                className="evaluator-btn evaluator-btn-primary"
                onClick={() => setCurrentStep(2)}
                disabled={loading || formatItems.length === 0}
              >
                Continuar a Comentarios
              </button>
              <button
                className="evaluator-btn evaluator-btn-outline"
                onClick={handleSaveProgress}
                disabled={loading || formatItems.length === 0}
              >
                <FaSave />
                Guardar Progreso
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="evaluator-step-section">
            <h2>Comentarios y Finalización</h2>
            
            <div className="evaluator-comments-section">
              <h3>Comentarios Justificativos</h3>
              <p className="evaluator-help-text">
                Proporciona observaciones detalladas que justifiquen tu calificación
              </p>
              <textarea
                className="evaluator-comments-textarea"
                rows="6"
                placeholder="Describe los aspectos positivos, áreas de mejora y justificación de las calificaciones asignadas..."
                value={evaluationData.comentarios}
                onChange={(e) => setEvaluationData(prev => ({
                  ...prev,
                  comentarios: e.target.value
                }))}
              />
            </div>

            <div className="evaluator-final-score">
              <h3>Calificación Final</h3>
              <div className="evaluator-score-display">
                <span className="evaluator-score-value">{evaluationData.calificacionFinal}</span>
                <span className="evaluator-score-label">/ 100</span>
              </div>
              <div className="evaluator-score-breakdown">
                <h4>Desglose por Criterios:</h4>
                {formatItems.map(formatItem => {
                  const evaluationItem = evaluationData.items.find(item => item.itemFormatoId === formatItem.id) || {};
                  return (
                    <div key={formatItem.id} className="evaluator-criterio-score">
                      <span>{formatItem.nombre}</span>
                      <span>{evaluationItem.calificacion || 0} pts ({formatItem.peso}% valor)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="evaluator-step-actions">
              <button
                className="evaluator-btn evaluator-btn-secondary"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                Anterior
              </button>
              <button
                className="evaluator-btn evaluator-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                <FaCheckCircle />
                {loading ? 'Enviando...' : 'Finalizar Evaluación'}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };

  export default EvaluatorEvaluationForm;