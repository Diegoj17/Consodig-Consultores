// components/management/project/admin/EvaluationReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaCheck, FaEdit, FaFileAlt, FaUser, FaCalendar, 
  FaClipboardList, FaSave, FaUndo, FaEye, FaComment,
  FaExclamationTriangle, FaInfoCircle, FaCalculator,
  FaAlignLeft, FaListAlt
} from 'react-icons/fa';
import Modal from '../../../common/Modal';
import '../../../../styles/management/project/admin/EvaluationReviewModal.css';
import researchService from '../../../../services/researchService';

const EvaluationReviewModal = ({ 
  evaluation, 
  onClose, 
  onAddObservation, 
  onApprove, 
  onRequestChanges,
  onEditEvaluation 
}) => {
  const [observation, setObservation] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [editingItems, setEditingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [observacionGeneral, setObservacionGeneral] = useState('');
  
  // Estados para el modal de confirmación
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState('success');
  // Mensaje inline (no bloquear con modal)
  const [inlineMessage, setInlineMessage] = useState(null); // { text, type }

  // Inicializar estados cuando la evaluación cambia
  useEffect(() => {
    if (evaluation) {
      setObservacionGeneral(evaluation.observacionGeneral || '');
      
      const initialItems = evaluation.items?.map(item => ({
        itemEvaluadoId: item.id,
        calificacion: item.calificacion || 0,
        observacion: item.observacion || '',
        peso: item.criterio?.peso || item.peso || 100,
        itemOriginal: { ...item }
      })) || [];
      
      setItemsEditados(initialItems);
      setModifiedCount(0);
    }
  }, [evaluation]);

  const [itemsEditados, setItemsEditados] = useState([]);
  const [modifiedCount, setModifiedCount] = useState(0);

  const showModalMessage = (message, type = 'success') => {
    setSuccessMessage(message);
    setModalType(type);
    setShowSuccessModal(true);
  };

  const showInline = (message, type = 'info', duration = 2500) => {
    setInlineMessage({ text: message, type });
    if (duration > 0) {
      setTimeout(() => setInlineMessage(null), duration);
    }
  };

  // Confirmar descartar cambios si hay edición activa
  const confirmDiscardChanges = () => {
    if (!editingItems) return true;
    if (!hasChanges()) return true;
    return window.confirm('Hay cambios sin guardar en los items. ¿Desea descartar los cambios?');
  };

  // Manejo seguro de cierre del modal
  const handleCloseRequest = () => {
    if (!confirmDiscardChanges()) return;
    if (typeof onClose === 'function') onClose();
  };

  // Wrapper para cambiar tabs con confirmación si hay cambios
  const safeSetActiveTab = (tab) => {
    if (tab === activeTab) return;
    if (!confirmDiscardChanges()) return;
    setActiveTab(tab);
  };

  // FUNCIÓN MEJORADA PARA OBTENER LA DESCRIPCIÓN DEL ITEM
  const getItemDescription = (item) => {
    // Buscar descripción en diferentes ubicaciones posibles
    const description = 
      item.criterio?.descripcion || 
      item.descripcion || 
      item.criterioDescripcion ||
      item.itemDescripcion ||
      'Sin descripción disponible';
    
    return description;
  };

  // FUNCIÓN MEJORADA PARA OBTENER EL NOMBRE DEL ITEM
  const getItemName = (item) => {
    return item.criterio?.nombre || item.nombre || `Item ${item.id || 'N/A'}`;
  };

  // FUNCIÓN MEJORADA PARA OBTENER EL PESO DEL ITEM
  const getItemWeight = (item) => {
    return item.criterio?.peso || item.peso || 100;
  };

  // CALCULAR PUNTAJE TOTAL CORREGIDO - Considerando pesos
  const calculateTotalScore = () => {
    // Si el backend ya nos provee una puntuación total explícita, usarla (prioridad)
    const backendTotal = evaluation?.calificacion_total ?? evaluation?.calificacionTotal ?? evaluation?.calificacion ?? null;
    if (backendTotal !== null && backendTotal !== undefined) {
      return Math.round(Number(backendTotal));
    }

    if (itemsEditados.length === 0) return 0;
    
    // Si hay pesos diferentes, calcular con pesos
    const hasDifferentWeights = itemsEditados.some(item => item.peso !== 100);
    
    if (hasDifferentWeights) {
      // Calcular con pesos
      const totalWeight = itemsEditados.reduce((sum, item) => sum + (item.peso || 100), 0);
      const weightedScore = itemsEditados.reduce((sum, item) => {
        const itemScore = item.calificacion || 0;
        const itemWeight = item.peso || 100;
        return sum + (itemScore * itemWeight) / 100;
      }, 0);
      
      // Normalizar al total de pesos
      return Math.round((weightedScore / totalWeight) * 100);
    } else {
      // Calcular promedio simple si todos los pesos son 100
      const total = itemsEditados.reduce((sum, item) => sum + (item.calificacion || 0), 0);
      return Math.round(total / itemsEditados.length);
    }
  };

  // CALCULAR PUNTAJE MÁXIMO POSIBLE
  const calculateMaxPossibleScore = () => {
    return 100; // Siempre es sobre 100%
  };

  // CALCULAR PROMEDIO (es el mismo que el total en este caso)
  const calculateAverageScore = () => {
    // Mostrar el porcentaje tal cual viene del backend si existe
    const backendTotal = evaluation?.calificacion_total ?? evaluation?.calificacionTotal ?? evaluation?.calificacion ?? null;
    if (backendTotal !== null && backendTotal !== undefined) return Math.round(Number(backendTotal));
    return calculateTotalScore();
  };

  // Helper: Obtener texto de Nivel de Estudios (soporta múltiples keys/formats)
  const getNivelEstudiosText = (project) => {
    if (!project) return 'N/A';
    const candidates = [
      project.nivelEstudios,
      project.nivel_estudios,
      project.nivelEstudio,
      project.nivel_estudio,
      project.nivel,
      project.nivelEstudiosName,
      project.nivelEstudiosNombre,
      project.nivel_estudios_nombre,
      // a veces viene como objeto
      project.nivelEstudiosObj,
      project.nivelEstudioObj
    ];

    for (const v of candidates) {
      if (!v && v !== 0) continue;
      if (typeof v === 'string' && v.trim() !== '') return v;
      if (typeof v === 'number') return String(v);
      if (typeof v === 'object') {
        if (v.nombre) return v.nombre;
        if (v.name) return v.name;
        if (v.label) return v.label;
      }
    }

    return 'N/A';
  };

  // Helper: Obtener texto de Líneas de Investigación (soporta varios formatos)
  const getLineasInvestigacionText = (project) => {
    if (!project) return 'N/A';
    const listCandidates = [
      project.lineasInvestigacion,
      project.lineas_investigacion,
      project.lineas,
      project.lineasInvestigacionNames,
      project.lineasInvestigacionNombre,
      project.lineasInvestigacionNamesArray,
      project.lineasInvestigacionString,
      project.lineas_investigacion_ids,
      project.lineasInvestigacionIds,
      project.linea_investigacion,
      project.lineaInvestigacion
    ];

    let list = null;
    for (const cand of listCandidates) {
      if (cand === undefined || cand === null) continue;
      // si es un objeto con { data: [...] } usar data
      if (typeof cand === 'object' && !Array.isArray(cand) && cand.data && Array.isArray(cand.data) && cand.data.length > 0) {
        list = cand.data;
        break;
      }
      list = cand;
      break;
    }

    if (!list) return 'N/A';

    // Si viene como array
    if (Array.isArray(list)) {
      // Si es array de strings
      const names = list.map(li => {
        if (li === undefined || li === null) return null;
        if (typeof li === 'string') return li;
        if (typeof li === 'number') return String(li); // IDs
        if (typeof li === 'object') return li.nombre || li.name || li.titulo || li.title || (li.id ? String(li.id) : null);
        return String(li);
      }).filter(Boolean);

      // Si todos son numéricos -> probablemente son IDs
      const allNumeric = names.length > 0 && names.every(n => /^\d+$/.test(n));
      if (allNumeric) return `IDs: ${names.join(', ')}`;

      return names.length ? names.join(', ') : 'N/A';
    }

    // Si viene como string
    if (typeof list === 'string') return list;

    // Si viene como objeto único
    if (typeof list === 'object') {
      // intentar extraer array interno
      if (list.nombre) return list.nombre;
      if (list.name) return list.name;
      if (list.titulo) return list.titulo;
      if (list.title) return list.title;
      if (list.id) return String(list.id);
      // si tiene campo items/lineas
      if (Array.isArray(list.lineas) && list.lineas.length) {
        return list.lineas.map(li => (li.nombre || li.name || li.titulo || li.title || (li.id ? String(li.id) : null))).filter(Boolean).join(', ');
      }
    }

    return 'N/A';
  };

  // Extraer IDs de líneas si vienen como array de IDs o single ID
  const getLineasIds = (project) => {
    if (!project) return [];
    const candidates = [
      project.lineasInvestigacion,
      project.lineas_investigacion,
      project.lineas_investigacion_ids,
      project.lineasInvestigacionIds,
      project.lineas,
      project.linea_investigacion,
      project.lineaInvestigacion
    ];

    for (const cand of candidates) {
      if (cand === undefined || cand === null) continue;
      // objeto con data
      if (typeof cand === 'object' && !Array.isArray(cand) && cand.data && Array.isArray(cand.data)) {
        return cand.data.map(d => (typeof d === 'object' ? d.id || d.identificacion || d.identificador || d.identify : d)).filter(Boolean).map(Number);
      }
      if (Array.isArray(cand)) {
        // si es array de objetos o números
        const ids = cand.map(x => (typeof x === 'object' ? x.id || x.identificacion || x.identificador || x.identify : x)).filter(Boolean).map(Number);
        if (ids.length) return ids;
      }
      // si es string con comas
      if (typeof cand === 'string' && /^\d+(,\s*\d+)*$/.test(cand)) {
        return cand.split(',').map(s => Number(s.trim())).filter(Boolean);
      }
      // si es número
      if (typeof cand === 'number' || (typeof cand === 'string' && /^\d+$/.test(cand))) {
        return [Number(cand)];
      }
    }

    return [];
  };

  const [lineasNamesResolved, setLineasNamesResolved] = useState(null);

  // Si las líneas vienen como IDs, resolver nombres usando el servicio
  useEffect(() => {
    const project = evaluation?.project;
    if (!project) return;
    const ids = getLineasIds(project);
    if (!ids || ids.length === 0) return;

    let mounted = true;
    (async () => {
      try {
        const all = await researchService.getAll();
        if (!mounted) return;
        const map = new Map(all.map(r => [Number(r.id), r.nombre]));
        const names = ids.map(id => map.get(Number(id)) || `ID:${id}`).filter(Boolean);
        setLineasNamesResolved(names.length ? names.join(', ') : null);
      } catch (err) {
        console.error('Error resolviendo líneas de investigación:', err);
      }
    })();

    return () => { mounted = false; };
  }, [evaluation]);

  // Helper para abrir archivos del proyecto en nueva pestaña
  const openProjectFile = (archivo) => {
    if (!archivo) return alert('Archivo inválido');
    const possibleUrl = archivo.urlArchivo || archivo.url_archivo || archivo.url || archivo.urlArchivoRaw || archivo.url_raw;
    if (!possibleUrl) return alert('No hay URL pública disponible para este archivo');

    // Si no tiene extensión PDF y tipo mime indica pdf, intentar abrir con .pdf añadido (Cloudinary raw)
    const hasPdfExt = /\.pdf($|\?)/i.test(possibleUrl);
    const isPdfMime = archivo.tipoMime && archivo.tipoMime.toLowerCase().includes('pdf');
    const urlToOpen = !hasPdfExt && isPdfMime ? `${possibleUrl}.pdf` : possibleUrl;

    const newWin = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    if (!newWin) {
      // popup blocked -> intentar abrir la URL original
      window.open(possibleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmitObservation = async () => {
    if (observation.trim()) {
      try {
        setSaving(true);
        await onAddObservation(evaluation.id, observation);
        setObservacionGeneral(observation);
        setObservation('');
        showModalMessage('✅ Observación registrada correctamente');
      } catch (error) {
        console.error('Error agregando observación:', error);
        showModalMessage('❌ Error al registrar la observación', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      await onEditEvaluation(evaluation.id, itemsEditados);
      setEditingItems(false);
      showModalMessage('✅ Cambios guardados correctamente');
      setModifiedCount(0);
      
      setTimeout(() => {
        if (typeof onClose === 'function') {
          window.dispatchEvent(new CustomEvent('evaluationUpdated'));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error guardando cambios:', error);
      showModalMessage('❌ Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    const revertedItems = evaluation.items?.map(item => ({
      itemEvaluadoId: item.id,
      calificacion: item.calificacion || 0,
      observacion: item.observacion || '',
      peso: getItemWeight(item),
      itemOriginal: { ...item }
    })) || [];
    
    setItemsEditados(revertedItems);
    setEditingItems(false);
    setModifiedCount(0);
    // Mostrar mensaje inline en vez de abrir un modal adicional
    showInline('Cambios cancelados', 'info', 2500);
  };

  const updateItemScore = (index, newScore) => {
    const updatedItems = [...itemsEditados];
    updatedItems[index].calificacion = Math.max(0, Math.min(parseInt(newScore) || 0, 100));
    setItemsEditados(updatedItems);
    // actualizar contador de modificados
    const count = updatedItems.reduce((acc, it, idx) => {
      const orig = evaluation.items?.[idx];
      if (!orig) return acc;
      if (it.calificacion !== (orig.calificacion || 0) || it.observacion !== (orig.observacion || '')) return acc + 1;
      return acc;
    }, 0);
    setModifiedCount(count);
  };

  const updateItemObservation = (index, newObservation) => {
    const updatedItems = [...itemsEditados];
    updatedItems[index].observacion = newObservation;
    setItemsEditados(updatedItems);
    // actualizar contador de modificados
    const count = updatedItems.reduce((acc, it, idx) => {
      const orig = evaluation.items?.[idx];
      if (!orig) return acc;
      if (it.calificacion !== (orig.calificacion || 0) || it.observacion !== (orig.observacion || '')) return acc + 1;
      return acc;
    }, 0);
    setModifiedCount(count);
  };

  const hasChanges = () => {
    return itemsEditados.some((item, index) => {
      const originalItem = evaluation.items?.[index];
      return item.calificacion !== (originalItem?.calificacion || 0) ||
             item.observacion !== (originalItem?.observacion || '');
    });
  };

  const handleApprove = async () => {
    if (window.confirm('¿Está seguro de que desea aprobar esta evaluación?')) {
      try {
        await onApprove(evaluation.id);
        showModalMessage('✅ Evaluación aprobada correctamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error aprobando evaluación:', error);
        showModalMessage('❌ Error al aprobar la evaluación', 'error');
      }
    }
  };

  const handleRequestChanges = async () => {
    const reason = prompt('Por favor, especifique los cambios requeridos:');
    if (reason) {
      try {
        await onRequestChanges(evaluation.id, reason);
        showModalMessage('✅ Cambios solicitados correctamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error solicitando cambios:', error);
        showModalMessage('❌ Error al solicitar cambios', 'error');
      }
    }
  };

  const getStatusBadge = () => {
    const status = evaluation.estado?.toUpperCase();
    switch (status) {
      case 'COMPLETADA':
        return <span className="status-badge status-completed">Completada</span>;
      case 'APROBADA':
        return <span className="status-badge status-approved">Aprobada</span>;
      case 'CAMBIOS_SOLICITADOS':
        return <span className="status-badge status-changes-requested">Cambios Solicitados</span>;
      default:
        return <span className="status-badge status-unknown">{evaluation.estado || 'Desconocido'}</span>;
    }
  };

  // Función para obtener el color basado en el score
  const getScoreColorClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-poor';
    return 'score-fail';
  };

  const totalScore = calculateTotalScore();
  const averageScore = calculateAverageScore();
  const maxScore = calculateMaxPossibleScore();

  return (
    <>
      <div className="evaluation-review-modal-overlay">
        {/* Mensaje inline no bloqueante */}
        {inlineMessage && (
          <div className={`inline-message inline-message-${inlineMessage.type}`} role="status">
            <div className="inline-message-content">{inlineMessage.text}</div>
            <button className="inline-message-close" onClick={() => setInlineMessage(null)} aria-label="Cerrar mensaje">×</button>
          </div>
        )}
        <div className="evaluation-review-modal">
          
          {/* Header */}
          <div className="evaluation-review-modal-header">
            <div className="evaluation-review-modal-title-section">
              <h3>
                <FaClipboardList className="evaluation-review-modal-title-icon" />
                Revisar Evaluación
              </h3>
              <div className="evaluation-review-modal-subtitle">
                <span className="evaluation-review-investigator">
                  <FaUser className="evaluation-inline-icon" />
                  {evaluation.evaluatorName || 'Evaluador no disponible'}
                </span>
                <span className="evaluation-review-date">
                  <FaCalendar className="evaluation-inline-icon" />
                  {evaluation.fechaCompletado ? new Date(evaluation.fechaCompletado).toLocaleDateString() : 'Fecha no disponible'}
                </span>
              </div>
            </div>
            <div className="evaluation-review-modal-header-actions">
              {getStatusBadge()}
              {editingItems && modifiedCount > 0 && (
                <div className="editing-summary-badge" style={{ marginRight: '8px', color: '#fff', fontWeight: 600 }}>
                  Edición: {modifiedCount} cambio{modifiedCount > 1 ? 's' : ''}
                </div>
              )}
              <button className="evaluation-review-modal-close" onClick={handleCloseRequest}>
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="evaluation-review-modal-tabs">
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => safeSetActiveTab('details')}
            >
              <FaEye /> Detalles
            </button>
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => safeSetActiveTab('items')}
            >
              <FaListAlt /> Items ({evaluation.items?.length || 0})
            </button>
          </div>

          {/* Body */}
          <div className="evaluation-review-modal-body">
            
            {/* Tab: Detalles */}
            {activeTab === 'details' && (
              <div className="evaluation-review-details">
                <div className="evaluation-review-project-info">
                  <h4>Información del Proyecto</h4>
                  <div className="evaluation-review-detail-grid">
                    <div className="evaluation-review-detail-item">
                      <strong>Título:</strong>
                      <span className="project-title">{evaluation.project?.titulo || 'Proyecto no disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Resumen:</strong>
                      <span>{evaluation.project?.resumen || evaluation.project?.descripcion || 'No disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Investigador Principal:</strong>
                      <span>{evaluation.project?.investigadorPrincipal || evaluation.project?.investigador || 'No especificado'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Palabras clave:</strong>
                      <span>{evaluation.project?.palabrasClave || evaluation.project?.keywords || 'N/A'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Nivel de Estudios:</strong>
                      <span>{getNivelEstudiosText(evaluation.project)}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Líneas de Investigación:</strong>
                      <span>{lineasNamesResolved || getLineasInvestigacionText(evaluation.project)}</span>
                    </div>

                    <div className="evaluation-review-detail-item evaluation-review-files" style={{ gridColumn: '1 / -1' }}>
                      <strong>Archivos:</strong>
                      <div className="project-files-list" style={{ marginTop: '6px' }}>
                        {(evaluation.project?.archivos || evaluation.archivos || evaluation.project?.files || []).length > 0 ? (
                          (evaluation.project?.archivos || evaluation.archivos || evaluation.project?.files || []).map((archivo) => (
                            <div key={archivo.id || archivo.nombre} className="project-file-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {archivo.tipoMime && archivo.tipoMime.toLowerCase().includes('pdf') ? <FaFileAlt style={{ color: '#d23f3f' }} /> : <FaFileAlt />}
                                <button type="button" className="project-file-link" onClick={() => openProjectFile(archivo)} style={{ background: 'none', border: 'none', color: '#1d4ed8', textDecoration: 'underline', cursor: 'pointer' }}>
                                  {archivo.nombreArchivo || archivo.nombre || archivo.fileName || 'Archivo sin nombre'}
                                </button>
                              </span>
                              <small style={{ color: '#6b7280' }}>{archivo.tipo || archivo.tipoMime || ''}</small>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#6b7280' }}>No hay archivos adjuntos</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="evaluation-review-summary">
                  <h4>Resumen de Evaluación</h4>
                  <div className="evaluation-review-stats">
                    <div className="evaluation-review-detail-item">
                      <strong>
                        Puntuación Total:
                      </strong>
                      <span className={`evaluation-review-score total-score ${getScoreColorClass(totalScore)}`}>
                        {totalScore} / {maxScore} Puntos
                      </span>
                    </div>

                    {/* PROMEDIO CORREGIDO */}
                    <div className="evaluation-review-detail-item">
                      <strong>
                        Promedio:
                      </strong>
                      <span className={`evaluation-review-score average-score ${getScoreColorClass(averageScore)}`}>
                        {averageScore}%
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Items Evaluados:</span>
                      <span className="stat-value">
                        {evaluation.items?.filter(item => item.calificacion > 0).length || 0} / {evaluation.items?.length || 0}
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Fecha Completada:</span>
                      <span className="stat-value">
                        {evaluation.fechaCompletado ? new Date(evaluation.fechaCompletado).toLocaleString() : 'No disponible'}
                      </span>
                    </div>
                    
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Items Evaluados - MEJORADO */}
            {activeTab === 'items' && (
              <div className="evaluation-review-items">
                <div className="evaluation-review-items-header">
                  <h4>
                    Items de Evaluación
                  </h4>
                  <div className="evaluation-review-items-actions">
                    {!editingItems ? (
                      <button 
                        className="evaluation-review-edit-btn"
                        onClick={() => setEditingItems(true)}
                      >
                        <FaEdit /> Editar Items
                      </button>
                    ) : (
                      <div className="evaluation-review-edit-controls">
                        <span className="editing-badge">Modo Edición</span>
                        <button 
                          onClick={handleCancelEdits} 
                          className="evaluation-review-cancel-btn"
                          disabled={saving}
                        >
                          <FaUndo /> Cancelar
                        </button>
                        <button 
                          onClick={handleSaveEdits} 
                          className="evaluation-review-save-btn"
                          disabled={saving || !hasChanges()}
                        >
                          <FaSave /> 
                          {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="evaluation-review-items-list">
                  {evaluation.items?.map((originalItem, index) => {
                    const editedItem = itemsEditados[index];
                    const isChanged = editedItem && (
                      editedItem.calificacion !== (originalItem.calificacion || 0) ||
                      editedItem.observacion !== (originalItem.observacion || '')
                    );

                    const itemName = getItemName(originalItem);
                    const itemDescription = getItemDescription(originalItem);
                    const itemWeight = getItemWeight(originalItem);

                    return (
                      <div key={originalItem.id} className={`evaluation-review-item ${isChanged ? 'item-changed' : ''}`}>
                        <div className="evaluation-review-item-header">
                          <h5>{itemName}</h5>
                          <div className="evaluation-review-item-meta">
                            {itemWeight && itemWeight !== 100 && (
                              <span className="evaluation-review-item-weight">
                                Peso: {itemWeight}%
                              </span>
                            )}
                            {isChanged && editingItems && (
                              <span className="evaluation-review-item-changed-badge">Modificado</span>
                            )}
                          </div>
                        </div>
                        
                        {/* DESCRIPCIÓN MEJORADA */}
                        <div className="evaluation-review-item-description-container">
                          <div className="evaluation-review-item-description-content">
                            <label className="evaluation-review-description-label">Descripción:</label>
                            <p className="evaluation-review-item-description">
                              {itemDescription}
                            </p>
                          </div>
                        </div>

                        <div className="evaluation-review-item-controls">
                          <div className="evaluation-review-item-score">
                            <label>Calificación (0-100 puntos):</label>
                            {editingItems ? (
                              <div className="score-input-container">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editedItem?.calificacion || 0}
                                  onChange={(e) => updateItemScore(index, e.target.value)}
                                  className="evaluation-review-score-input"
                                />
                                <span className="score-range">/ 100 puntos</span>
                              </div>
                            ) : (
                              <span className="evaluation-review-item-score-value">
                                {originalItem.calificacion || 0} / 100 puntos
                              </span>
                            )}
                          </div>

                          <div className="evaluation-review-item-observation">
                            <label>Observación del Evaluador:</label>
                            {editingItems ? (
                              <textarea
                                value={editedItem?.observacion || ''}
                                onChange={(e) => updateItemObservation(index, e.target.value)}
                                placeholder="Agregar o modificar observación..."
                                rows="3"
                                className="evaluation-review-observation-textarea"
                              />
                            ) : (
                              <div className="evaluation-review-observation-display">
                                {originalItem.observacion || 'Sin observaciones'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {evaluation.items?.length === 0 && (
                  <div className="evaluation-review-no-items">
                    <p>No hay items evaluados disponibles.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="evaluation-review-modal-footer">
            <div className="evaluation-review-modal-footer-actions">
              {editingItems ? (
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
                  <button
                    className="evaluation-review-cancel-btn"
                    onClick={handleCancelEdits}
                    disabled={saving}
                  >
                    <FaUndo /> Cancelar
                  </button>
                  <button
                    className="evaluation-review-save-btn"
                    onClick={handleSaveEdits}
                    disabled={saving || !hasChanges()}
                  >
                    <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleCloseRequest} 
                    className="evaluation-review-btn-close"
                    disabled={saving}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={
          modalType === 'success' ? 'Éxito' :
          modalType === 'error' ? 'Error' :
          modalType === 'warning' ? 'Advertencia' : 'Información'
        }
        type={modalType}
        size="sm"
      >
        <div className="modal-message-content">
          <div className={`modal-message-icon modal-message-${modalType}`}>
            {modalType === 'success' && <FaCheck />}
            {modalType === 'error' && <FaExclamationTriangle />}
            {modalType === 'warning' && <FaExclamationTriangle />}
            {modalType === 'info' && <FaInfoCircle />}
          </div>
          <p className="modal-message-text">{successMessage}</p>
          <div className="modal-actions">
            <button 
              className="btn-primary" 
              onClick={() => setShowSuccessModal(false)}
              autoFocus
            >
              <FaCheck /> Aceptar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EvaluationReviewModal;
