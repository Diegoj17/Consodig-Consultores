import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const params = useParams();

  // Mantener estados locales para permitir cargar desde API si location.state está vacío
  const [evaluationState, setEvaluationState] = useState(location.state?.evaluation || null);
  const [projectState, setProjectState] = useState(location.state?.project || null);
  const [formatState, setFormatState] = useState(location.state?.format || null);

  console.log('📍 Location state:', location.state);
  console.log('📋 Evaluation:', evaluationState);
  console.log('🏢 Project:', projectState);
  console.log('📝 Format:', formatState);

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

  // Función para cargar items del formato (definida aquí antes de los efectos que la usan)
  const loadFormatItems = useCallback(async (formatId) => {
    try {
      setLoadingItems(true);
      setError(null);
      console.log('🔄 Cargando items del formato ID:', formatId);
      
      // Obtener el formato completo con sus items
      const formatData = await evaluationFormatService.getFormatById(formatId);
      console.log('✅ Formato obtenido:', formatData);
      
      // Los items vienen en la propiedad 'items' del formato
      const items = formatData.items || formatData.criterios || [];
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

      // Si ya existen calificaciones guardadas en la evaluación, mezclarlas
      try {
        const evalItems = evaluationState?.items || evaluationState?.criterios || evaluationState?.itemsEvaluados || evaluationState?.itemEvaluados || evaluationState?.items_evaluados || [];

        if (Array.isArray(evalItems) && evalItems.length > 0) {
          const mapEvalByFormatId = (ei) => {
            // intentar obtener id de item de evaluación usando varias claves
            return ei.itemFormatoId || ei.item_formato_id || ei.formatoItemId || ei.item_formato || ei.itemFormato?.id || ei.formatoId || ei.itemEvaluadoId || ei.id || null;
          };

          const merged = initialItems.map(init => {
            const match = evalItems.find(ei => {
              const candidate = mapEvalByFormatId(ei);
              // candidate puede ser número o string
              if (candidate == null) return false;
              try {
                return String(candidate) === String(init.itemFormatoId) || Number(candidate) === Number(init.itemFormatoId);
              } catch { return false; }
            });

            if (match) {
              // posibles campos de calificación
              const score = match.calificacion || match.valor || match.puntuacion || match.score || match.nota || match.notaFinal || match.calificacionFinal || 0;
              const obs = match.observacion || match.comentarios || match.comentario || match.observaciones || '';
              return {
                ...init,
                calificacion: typeof score === 'number' ? score : (score ? Number(score) : 0),
                observacion: obs || ''
              };
            }

            return init;
          });

          setEvaluationData(prev => ({ ...prev, items: merged }));
        } else {
          setEvaluationData(prev => ({ ...prev, items: initialItems }));
        }
      } catch (mergeErr) {
        console.warn('Error mezclando items existentes:', mergeErr);
        setEvaluationData(prev => ({ ...prev, items: initialItems }));
      }
      
    } catch (error) {
      console.error('❌ Error cargando items del formato:', error);
      setError(`Error al cargar los criterios: ${error.message}`);
    } finally {
      setLoadingItems(false);
    }
  }, [evaluationState]);

  // Si no llegaron datos por location.state, intentar cargar la evaluación por id
  useEffect(() => {
    const tryLoadFromApi = async () => {
      const idFromParams = params.evaluationId || params.id;
      if ((!evaluationState || !formatState || !projectState) && idFromParams) {
        try {
          const ev = await evaluationService.getById(idFromParams);
          if (ev) {
            setEvaluationState(ev);
            // extraer proyecto y formato de la evaluacion si vienen
            const proj = ev.project || ev.proyecto || ev.proyectoId ? (ev.project || ev.proyecto) : null;
            setProjectState(proj || projectState);
            const fmt = ev.evaluationFormat || ev.formatoEvaluacion || ev.formato || ev.format || (ev.formatoId ? { id: ev.formatoId } : null);
            setFormatState(fmt || formatState);
          }
        } catch (err) {
          console.warn('No se pudo cargar la evaluación desde API:', err);
        }
      }
    };

    tryLoadFromApi();
  }, [params, evaluationState, formatState, projectState]);

  // Cargar items reales del formato desde el backend
  useEffect(() => {
    if (formatState?.id) {
      loadFormatItems(formatState.id);
    } else {
      setError('No se pudo cargar el formato de evaluación');
      setLoadingItems(false);
    }
  }, [formatState, loadFormatItems]);

  // Cargar información completa del proyecto si es necesario
  useEffect(() => {
    let mounted = true;
    const loadProjectDetails = async () => {
      if (!projectState) return;
      // Si ya vienen campos clave, los usamos directamente
      const needsFullFetch = !projectState.resumen || !projectState.objetivoGeneral || !projectState.lineasInvestigacion;
      if (!needsFullFetch) {
        setProjectDetails(projectState);
        return;
      }

      try {
        const id = projectState.id || projectState.proyectoId || projectState.proyecto?.id || projectState.codigo;
        if (!id) {
          setProjectDetails(projectState);
          return;
        }
        const full = await projectService.getById(id);
        if (mounted) setProjectDetails(full || projectState);
      } catch (err) {
        console.error('❌ Error cargando detalles del proyecto:', err);
        if (mounted) setProjectDetails(projectState);
      } finally {
        // finished loading project details
      }
    };

    loadProjectDetails();

    return () => { mounted = false; };
  }, [projectState]);
 

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
          await evaluationService.gradeItem(evaluationState.id, {
            itemFormatoId: item.itemFormatoId,
            calificacion: item.calificacion,
            observacion: item.observacion
          });
        }

      // Finalizar la evaluación
      console.log('🏁 Finalizando evaluación...');
      await evaluationService.finishEvaluation(evaluationState.id, {
        comentarios: evaluationData.comentarios,
        calificacionFinal: evaluationData.calificacionFinal
      });

      // Intentar obtener la evaluación actualizada desde la API para mostrar la calificación real
      let finalFromApi = null;
      try {
        const refreshed = await evaluationService.getById(evaluationState.id);
        finalFromApi = refreshed?.calificacionFinal ?? refreshed?.calificacion ?? null;
        // actualizar estado local si viene la calificación
        if (refreshed) setEvaluationState(refreshed);
      } catch (refreshErr) {
        console.warn('No se pudo obtener la evaluación finalizada:', refreshErr);
      }

      const successMessage = finalFromApi != null
        ? `✅ Evaluación completada exitosamente. Calificación final: ${finalFromApi}`
        : '✅ Evaluación completada exitosamente.';

      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Evaluación completada',
        message: successMessage,
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
        await evaluationService.gradeItem(evaluationState.id, {
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

  if (!evaluationState || !projectState || !formatState) {
    const missingMsg = `Faltan datos necesarios: ${!evaluationState ? 'Evaluation ' : ''}${!projectState ? 'Project ' : ''}${!formatState ? 'Format' : ''}`;
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
  const displayProject = projectDetails || projectState || {};

  // Preferir la calificación final que venga del backend (evaluationState) si está disponible
  const displayFinal = evaluationState?.calificacionFinal ?? evaluationData.calificacionFinal;

  const getInstitution = () => {
    // Prefer project-level institution, then evaluation, then format, then fallback
    return (
      displayProject.institucion ||
        displayProject.institucionNombre ||
        displayProject.institution ||
        evaluationState?.institucion ||
        evaluationState?.institucionNombre ||
        evaluationState?.institution ||
        formatState?.institucion ||
        formatState?.institucionNombre ||
        formatState?.institution ||
      'No especificada'
    );
  };

  // --- Helpers para archivos (similar a EvaluatorProjectCard) ---
  const getFileName = (archivo) => {
    return archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre';
  };

  // Navegación de regreso: intenta volver a la página anterior, si no hay historial,
  // usa un fallback basado en el estado de la evaluación (ASIGNADA/ACEPTADA/COMPLETADA)
  const handleBack = () => {
    try {
      // Si la navegación incluyó una ruta origen explícita en location.state, úsala
      if (location.state && location.state.from) {
        navigate(location.state.from);
        return;
      }

      // Intentar volver en el historial del navegador
      navigate(-1);
    } catch {
      // Fallback: deducir ruta por el estado de la evaluación
      const status = (evaluationState?.estado || evaluationState?.status || '').toString().toUpperCase();
      if (status === 'ASIGNADA') navigate('/evaluador/evaluations/pending');
      else if (status === 'ACEPTADA') navigate('/evaluador/evaluations/in-progress');
      else if (status === 'COMPLETADA') navigate('/evaluador/evaluations/completed');
      else navigate('/evaluador/evaluations');
    }
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
        <button className="evaluator-back-btn" onClick={handleBack}>
          <FaArrowLeft />
          Volver a la lista
        </button>
        
        <div className="evaluator-form-title">
          <div>
            <h1>Evaluación del Proyecto</h1>
            <p>{projectState?.titulo || projectState?.nombre || 'Sin título'}</p>
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
                <strong>{formatState?.nombre || formatState?.name}</strong>
                <p>{formatState?.descripcion || formatState?.description}</p>
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
                <span className="evaluator-score-value">{displayFinal}</span>
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