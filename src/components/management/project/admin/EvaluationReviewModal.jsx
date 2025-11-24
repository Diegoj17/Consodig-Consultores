// components/management/project/admin/EvaluationReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaCheck, FaEdit, FaFileAlt, FaUser, FaCalendar, 
  FaClipboardList, FaSave, FaUndo, FaEye, FaComment,
  FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import Modal from '../../../common/Modal';
import '../../../../styles/management/project/admin/EvaluationReviewModal.css';

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

  // Inicializar estados cuando la evaluación cambia
  useEffect(() => {
    if (evaluation) {
      setObservacionGeneral(evaluation.observacionGeneral || '');
      
      const initialItems = evaluation.items?.map(item => ({
        itemEvaluadoId: item.id,
        calificacion: item.calificacion || 0,
        observacion: item.observacion || '',
        itemOriginal: { ...item }
      })) || [];
      
      setItemsEditados(initialItems);
    }
  }, [evaluation]);

  const [itemsEditados, setItemsEditados] = useState([]);

  const showModalMessage = (message, type = 'success') => {
    setSuccessMessage(message);
    setModalType(type);
    setShowSuccessModal(true);
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
      // Llamar a la función para editar evaluación
      await onEditEvaluation(evaluation.id, itemsEditados);
      setEditingItems(false);
      showModalMessage('✅ Cambios guardados correctamente');
      
      // Forzar actualización inmediata del modal padre
      // Esto asegura que los cambios se reflejen al instante
      setTimeout(() => {
        if (typeof onClose === 'function') {
          // Recargar los datos o forzar actualización
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
      itemOriginal: { ...item }
    })) || [];
    
    setItemsEditados(revertedItems);
    setEditingItems(false);
    showModalMessage('ℹ️ Cambios cancelados', 'info');
  };

  const updateItemScore = (index, newScore) => {
    const updatedItems = [...itemsEditados];
    updatedItems[index].calificacion = Math.max(0, Math.min(parseInt(newScore) || 0, 100));
    setItemsEditados(updatedItems);
  };

  const updateItemObservation = (index, newObservation) => {
    const updatedItems = [...itemsEditados];
    updatedItems[index].observacion = newObservation;
    setItemsEditados(updatedItems);
  };

  const calculateTotalScore = () => {
    if (itemsEditados.length === 0) return evaluation.calificacionTotal || 0;
    return itemsEditados.reduce((total, item) => total + (item.calificacion || 0), 0);
  };

  const calculateAverageScore = () => {
    if (itemsEditados.length === 0) return 0;
    const total = calculateTotalScore();
    return Math.round(total / itemsEditados.length);
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
        // Cerrar el modal después de aprobar
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
        // Cerrar el modal después de solicitar cambios
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

  return (
    <>
      <div className="evaluation-review-modal-overlay">
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
                <span className="evaluation-review-id">
                  <FaFileAlt className="evaluation-inline-icon" />
                  ID: {evaluation.id}
                </span>
                <span className="evaluation-review-date">
                  <FaCalendar className="evaluation-inline-icon" />
                  {evaluation.fechaCompletado ? new Date(evaluation.fechaCompletado).toLocaleDateString() : 'Fecha no disponible'}
                </span>
              </div>
            </div>
            <div className="evaluation-review-modal-header-actions">
              {getStatusBadge()}
              <button className="evaluation-review-modal-close" onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="evaluation-review-modal-tabs">
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FaEye /> Detalles
            </button>
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              <FaClipboardList /> Items ({evaluation.items?.length || 0})
            </button>
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'observations' ? 'active' : ''}`}
              onClick={() => setActiveTab('observations')}
            >
              <FaComment /> Observaciones
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
                      <strong>ID Proyecto:</strong>
                      <span className="project-id">{evaluation.project?.id || 'N/A'}</span>
                    </div>
                    <div className="evaluation-review-detail-item">
                      <strong>Formato:</strong>
                      <span>{evaluation.formato?.nombre || evaluation.project?.formato || 'N/A'}</span>
                    </div>
                    <div className="evaluation-review-detail-item">
                      <strong>Puntuación Total:</strong>
                      <span className="evaluation-review-score total-score">
                        {calculateTotalScore()} / {itemsEditados.length * 100}
                      </span>
                    </div>
                    <div className="evaluation-review-detail-item">
                      <strong>Promedio:</strong>
                      <span className="evaluation-review-score average-score">
                        {calculateAverageScore()}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="evaluation-review-summary">
                  <h4>Resumen de Evaluación</h4>
                  <div className="evaluation-review-stats">
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Items Evaluados:</span>
                      <span className="stat-value">
                        {evaluation.items?.filter(item => item.calificacion > 0).length || 0} / {evaluation.items?.length || 0}
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Estado:</span>
                      {getStatusBadge()}
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Evaluador ID:</span>
                      <span className="stat-value">{evaluation.evaluadorId}</span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Fecha Completada:</span>
                      <span className="stat-value">
                        {evaluation.fechaCompletado ? new Date(evaluation.fechaCompletado).toLocaleString() : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observación General en Detalles */}
                {observacionGeneral && (
                  <div className="evaluation-review-general-observation">
                    <h4>Observación General del Administrador</h4>
                    <div className="observation-content">
                      <p>{observacionGeneral}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Items Evaluados */}
            {activeTab === 'items' && (
              <div className="evaluation-review-items">
                <div className="evaluation-review-items-header">
                  <h4>Items de Evaluación</h4>
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

                    return (
                      <div key={originalItem.id} className={`evaluation-review-item ${isChanged ? 'item-changed' : ''}`}>
                        <div className="evaluation-review-item-header">
                          <h5>{originalItem.criterio?.nombre || `Item ${index + 1}`}</h5>
                          <div className="evaluation-review-item-meta">
                            {originalItem.criterio?.peso && (
                              <span className="evaluation-review-item-weight">
                                Peso: {originalItem.criterio.peso}%
                              </span>
                            )}
                            {isChanged && editingItems && (
                              <span className="evaluation-review-item-changed-badge">Modificado</span>
                            )}
                          </div>
                        </div>
                        
                        <p className="evaluation-review-item-description">
                          {originalItem.criterio?.descripcion || 'Sin descripción disponible'}
                        </p>

                        <div className="evaluation-review-item-controls">
                          <div className="evaluation-review-item-score">
                            <label>Calificación:</label>
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
                                <span className="score-range">/ 100</span>
                              </div>
                            ) : (
                              <span className="evaluation-review-item-score-value">
                                {originalItem.calificacion || 0} / 100
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

            {/* Tab: Observaciones */}
            {activeTab === 'observations' && (
              <div className="evaluation-review-observations">
                <h4>Observaciones del Administrador</h4>
                
                <div className="evaluation-review-observation-input">
                  <label>Nueva Observación General:</label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Escribe tus observaciones generales sobre esta evaluación..."
                    rows="6"
                    className="evaluation-review-general-observation-textarea"
                  />
                  <button 
                    onClick={handleSubmitObservation} 
                    className="evaluation-review-add-observation-btn"
                    disabled={!observation.trim() || saving}
                  >
                    <FaSave /> 
                    {saving ? 'Registrando...' : 'Registrar Observación'}
                  </button>
                </div>

                {/* Observación General Existente */}
                {observacionGeneral && (
                  <div className="evaluation-review-existing-observations">
                    <h5>Observación General Actual</h5>
                    <div className="evaluation-review-observations-list">
                      <div className="evaluation-review-observation-item general-observation">
                        <div className="observation-content">
                          <p>{observacionGeneral}</p>
                          <small>
                            Registrada por: Administrador • 
                            Fecha: {new Date().toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observaciones por Item */}
                <div className="evaluation-review-item-observations">
                  <h5>Observaciones por Item</h5>
                  {evaluation.items?.filter(item => item.observacion).length > 0 ? (
                    <div className="evaluation-review-item-observations-list">
                      {evaluation.items
                        .filter(item => item.observacion)
                        .map((item, index) => (
                          <div key={item.id} className="evaluation-review-item-observation">
                            <strong>{item.criterio?.nombre || `Item ${index + 1}`}:</strong>
                            <p>{item.observacion}</p>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="evaluation-review-no-observations">
                      No hay observaciones específicas por item.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="evaluation-review-modal-footer">
            <div className="evaluation-review-modal-footer-actions">
              <div className="evaluation-review-modal-primary-actions">
                <button 
                  onClick={handleRequestChanges} 
                  className="evaluation-review-btn-request-changes"
                  disabled={editingItems || saving}
                >
                  <FaTimes /> Solicitar Cambios
                </button>
                <button 
                  onClick={handleApprove} 
                  className="evaluation-review-btn-approve"
                  disabled={editingItems || saving}
                >
                  <FaCheck /> Aprobar Evaluación
                </button>
              </div>
              <button 
                onClick={onClose} 
                className="evaluation-review-btn-close"
                disabled={saving}
              >
                Cerrar
              </button>
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