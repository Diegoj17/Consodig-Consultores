import React, { useState } from 'react';
import { FaEdit, FaEye, FaFileContract, FaTrash, FaList, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import EvaluationStats from '../../components/management/project/admin/EvaluationStats';
import EvaluationFormatModal from '../../components/management/project/admin/EvaluationFormatModal';
import Modal from '../../components/common/Modal';
import { useEvaluationFormats } from '../../hooks/useEvaluationFormats';
import '../../styles/pages/admin/EvaluationsMainPage.css';

const EvaluationsMainPage = () => {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, format: null });
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const {
    formats: evaluationFormats,
    loading,
    error,
    createFormat,
    updateFormat,
    deleteFormat,
    toggleFormatStatus,
    loadFormats
  } = useEvaluationFormats();

  const handleCreateFormat = () => {
    setSelectedFormat(null);
    setModalMode('create');
  };

  const handleEditFormat = (format) => {
    setSelectedFormat(format);
    setModalMode('edit');
  };

  const handleViewFormat = (format) => {
    setDeleteModal({ isOpen: false, format: null });
    setSelectedFormat(format);
    setModalMode('view');
  };

  const handleSaveFormat = async (formData, mode) => {
    setIsSubmitting(true);
    
    try {
      console.log('Guardando formato en modo:', mode, formData);
      
      if (mode === 'create') {
        await createFormat(formData);
        setNotifyModal({ isOpen: true, type: 'success', title: 'Formato creado', message: 'El formato se creó correctamente.' });
      } else {
        await updateFormat(selectedFormat.id, formData);
        setNotifyModal({ isOpen: true, type: 'success', title: 'Formato actualizado', message: 'Los cambios se guardaron correctamente.' });
      }
      
      // Cerrar modal después de guardar
      setSelectedFormat(null);
      setModalMode('view');
    } catch (error) {
      console.error('Error guardando formato:', error);
      setNotifyModal({ isOpen: true, type: 'error', title: 'Error', message: `Error al guardar el formato: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFormat = (format) => {
    setDeleteModal({ isOpen: true, format });
  };

  const confirmDeleteFormat = async () => {
    if (!deleteModal.format) return;

    try {
      await deleteFormat(deleteModal.format.id);
      setSelectedFormat(null);
      setModalMode('view');
      setNotifyModal({ isOpen: true, type: 'success', title: 'Formato eliminado', message: 'El formato fue eliminado correctamente.' });
    } catch (error) {
      console.error('Error eliminando formato:', error);
      setNotifyModal({ isOpen: true, type: 'error', title: 'Error', message: `Error al eliminar el formato: ${error.message}` });
    } finally {
      setDeleteModal({ isOpen: false, format: null });
    }
  };

  const handleToggleFormatStatus = async (formatId) => {
    const format = evaluationFormats.find(f => f.id === formatId);
    if (!format) return;

    const newStatus = format.estado === 'active' ? false : true;
    
    try {
      await toggleFormatStatus(formatId, newStatus);
    } catch (error) {
      console.error('Error cambiando estado del formato:', error);
      setNotifyModal({ isOpen: true, type: 'error', title: 'Error', message: `Error al cambiar el estado: ${error.message}` });
    }
  };

  const handleViewCriteria = (format) => {
    setDeleteModal({ isOpen: false, format: null });
    setSelectedFormat(format);
    setModalMode('view');
  };

  const handleRetry = () => {
    loadFormats();
  };

  // Mostrar estado de carga
  if (loading && evaluationFormats.length === 0) {
    return (
      <div className="evaluations-main-page">
        <div className="evaluations-loading">
          <div className="loading-spinner"></div>
          <p>Cargando formatos de evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluations-main-page">
      {/* Header con estadísticas */}
      <EvaluationStats 
        formats={evaluationFormats}
        onCreateFormat={handleCreateFormat}
      />

      <div className="evaluations-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="evaluations-error-banner">
            <FaExclamationTriangle className="error-icon" />
            <div className="error-content">
              <strong>Error al cargar los formatos</strong>
              <span>{error}</span>
            </div>
            <button 
              className="evaluation-btn evaluation-btn-retry"
              onClick={handleRetry}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="evaluations-formats-container">
          <div className="evaluations-formats-list">
            {evaluationFormats.map(format => (
              <div key={format.id} className="evaluation-format-card">
                <div className="evaluation-format-card-header">
                  <FaFileContract className="evaluation-format-icon" />
                  <div className="evaluation-format-info">
                    <h3>{format.nombre}</h3>
                    <p className="evaluation-format-description">
                      {format.descripcion}
                    </p>
                  </div>
                  <div className="evaluation-format-status">
                    <button
                      className={`evaluation-status-toggle ${format.estado === 'active' ? 'active' : ''}`}
                      onClick={() => handleToggleFormatStatus(format.id)}
                      title={format.estado === 'active' ? 'Desactivar formato' : 'Activar formato'}
                    >
                      <span className="evaluation-toggle-slider"></span>
                    </button>
                    <span className={`evaluation-status-badge evaluation-status-${format.estado}`}>
                      {format.estado === 'active' ? (
                        <>
                          <FaCheck /> Activo
                        </>
                      ) : (
                        <>
                          <FaTimes /> Inactivo
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="evaluation-format-meta">
                  <span className="evaluation-meta-item">
                    <strong>{format.criterios}</strong> Criterios
                  </span>
                  <span className="evaluation-meta-item">
                    <strong>{format.pesoTotal}%</strong> Valor total
                  </span>
                  <span className="evaluation-meta-item">
                    <strong>{format.areaConocimiento}</strong>
                  </span>
                </div>

                <div className="evaluation-format-details">
                  <div className="evaluation-format-detail">
                    <strong>Creado por:</strong> {format.creadoPor}
                  </div>
                  <div className="evaluation-format-detail">
                    <strong>Fecha creación:</strong> {new Date(format.fechaCreacion).toLocaleDateString()}
                  </div>
                  <div className="evaluation-format-detail">
                    <strong>Institución:</strong> {format.institucion}
                  </div>
                </div>
                
                <div className="evaluation-format-actions">
                  <button 
                    className="evaluation-btn evaluation-btn-edit"
                    onClick={() => handleEditFormat(format)}
                  >
                    <FaEdit />
                    Editar
                  </button>
                  <button 
                    className="evaluation-btn evaluation-btn-criteria"
                    onClick={() => handleViewCriteria(format)}
                  >
                    <FaList />
                    Criterios ({format.criterios})
                  </button>
                  <button 
                    className="evaluation-btn evaluation-btn-view"
                    onClick={() => handleViewFormat(format)}
                  >
                    <FaEye />
                    Detalles
                  </button>
                  <button 
                    className="evaluation-btn evaluation-btn-delete"
                    onClick={() => handleDeleteFormat(format)}
                  >
                    <FaTrash />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {evaluationFormats.length === 0 && !loading && !error && (
          <div className="evaluations-empty-state">
            <FaFileContract className="evaluations-empty-icon" />
            <h3>No hay formatos de evaluación</h3>
            <p>Comienza creando el primer formato de evaluación para el sistema</p>
          </div>
        )}
      </div>

      {/* Modal de Formato de Evaluación */}
      {(selectedFormat || modalMode === 'create') && (
        <EvaluationFormatModal 
          format={selectedFormat}
          onClose={() => {
            setSelectedFormat(null);
            setModalMode('view');
          }}
          onSave={handleSaveFormat}
          onDelete={handleDeleteFormat}
          mode={modalMode}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal de Confirmación para Eliminar */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, format: null })}
        onConfirm={confirmDeleteFormat}
        type="error"
        title="Eliminar Formato de Evaluación"
        message={`¿Estás seguro de que deseas eliminar el formato "${deleteModal.format?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        showCancel={true}
      />

      {/* Modal de notificaciones (éxito / error) */}
      <Modal
        isOpen={notifyModal.isOpen}
        onClose={() => setNotifyModal({ isOpen: false, type: 'info', title: '', message: '' })}
        type={notifyModal.type}
        title={notifyModal.title}
        message={notifyModal.message}
        confirmText="Aceptar"
        showCancel={false}
      />
    </div>
  );
};

export default EvaluationsMainPage;