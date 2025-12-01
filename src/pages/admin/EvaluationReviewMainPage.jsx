// pages/admin/EvaluationReviewMainPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEye, FaEdit, FaSync, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { evaluationService } from '../../services/evaluationService';
import { evaluadorService } from '../../services/evaluadorService';
import EvaluationReviewModal from '../../components/management/project/admin/EvaluationReviewModal';
import '../../styles/pages/admin/EvaluationReviewPage.css';
import Modal from '../../components/common/Modal';
import { isValidated } from '../../utils/evaluationUtils';

const EvaluationReviewMainPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluatorNames, setEvaluatorNames] = useState({});
  const [alertModal, setAlertModal] = useState({ open: false, type: 'info', title: '', message: '', onConfirm: null, showCancel: false });

  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Cargando evaluaciones completadas...');
      const completedEvaluations = await evaluationService.getCompletedEvaluations();
      console.log('✅ Evaluaciones completadas obtenidas (raw):', completedEvaluations);
      // Usar directamente la respuesta CRUDA del backend sin normalizar, pero filtrando las validadas.
      const rawList = completedEvaluations || [];
      const filtered = rawList.filter(ev => !isValidated(ev));
      setEvaluations(filtered);
      // Resolver nombres de evaluadores por ID (si vienen solo como evaluadorId)
      try {
        const ids = Array.from(new Set((completedEvaluations || []).map(ev => ev.evaluadorId || ev.evaluatorId || ev.evaluador?.id).filter(Boolean)));
        const missing = ids.filter(id => !evaluatorNames[String(id)]);
        if (missing.length > 0) {
          const map = { ...evaluatorNames };
          await Promise.all(missing.map(async (id) => {
            try {
              const data = await evaluadorService.getEvaluadorById(id);
              const nombre = (data?.nombre || data?.firstName || '') + (data?.apellido ? ` ${data.apellido}` : '');
              map[String(id)] = nombre.trim() || (data?.nombre || data?.fullName || 'Evaluador no disponible');
            } catch (err) {
              console.warn('No se pudo obtener evaluador', id, err);
            }
          }));
          setEvaluatorNames(map);
        }
      } catch (err) {
        console.warn('Error resolviendo nombres de evaluadores:', err);
      }
      
    } catch (err) {
      console.error('❌ Error cargando evaluaciones:', err);
      setError('Error al cargar las evaluaciones completadas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [evaluatorNames]);

  // Cargar evaluaciones completadas: ejecutar después de declarar `loadEvaluations`
  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const applyFilters = useCallback(() => {
    let filtered = [...evaluations];

    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(evaluation => {
        const project = evaluation.project || evaluation.proyecto || {};
        const projectTitle = (project?.titulo || project?.nombre || '').toString().toLowerCase();
        const evaluatorId = evaluation.evaluadorId || evaluation.evaluatorId || evaluation.evaluador?.id || null;
        const evaluatorName = (evaluatorNames[String(evaluatorId)] || evaluation.evaluatorName || evaluation.evaluador?.nombre || evaluation.evaluador || '').toString().toLowerCase();
        const evaluationId = (evaluation.id || '').toString();
        const projectId = (project?.id || '').toString();

        return (
          projectTitle.includes(searchTerm) ||
          evaluatorName.includes(searchTerm) ||
          evaluationId.includes(searchTerm) ||
          projectId.includes(searchTerm)
        );
      });
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(evaluation => 
        (evaluation.estado || '').toString().toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, filters, evaluatorNames]);

  // Ejecutar filtro cuando cambian evaluaciones o filtros.
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowModal(true);
  };

  const handleAddObservation = async (evaluationId, observation) => {
    try {
      console.log('📝 Registrando observación general:', evaluationId, observation);
      
      // Buscar la evaluación actual
      const currentEvaluation = evaluations.find(e => e.id === evaluationId);
      if (!currentEvaluation) {
        throw new Error('Evaluación no encontrada');
      }

      // Preparar los datos para editar - SOLO observación general
      const payload = {
        observacionGeneral: observation,
        fechaObservacion: new Date().toISOString(),
        autorObservacion: 'Administrador'
      };

      // Usar el endpoint de edición para agregar la observación
      await evaluationService.editEvaluation(evaluationId, payload);
      
      console.log('✅ Observación general agregada correctamente');
      // Mostrar modal de éxito y recargar al confirmar
      setAlertModal({ open: true, type: 'success', title: 'Observación registrada', message: 'Observación general agregada correctamente', onConfirm: async () => { await loadEvaluations(); }, showCancel: false });
      return true;
    } catch (error) {
      console.error('❌ Error registrando observación general:', error);
      setAlertModal({ open: true, type: 'error', title: 'Error', message: 'No se pudo registrar la observación. Por favor, intente nuevamente.', onConfirm: null, showCancel: false });
      throw new Error('No se pudo registrar la observación. Por favor, intente nuevamente.');
    }
  };

  const handleEditEvaluation = async (evaluationId, itemsEditados) => {
    try {
      console.log('✏️ Editando items de evaluación:', evaluationId, itemsEditados);
      
      // Verificar que itemsEditados sea un array
      if (!Array.isArray(itemsEditados)) {
        throw new Error('Los datos de edición no son válidos');
      }

      // Preparar payload para el endpoint de edición
      // El backend espera un ArrayList<EditarItemEvaluadoDTO>
      const payload = itemsEditados.map(item => ({
        itemEvaluadoId: item.itemEvaluadoId,
        calificacion: item.calificacion,
        observacion: item.observacion || ''
      }));

      console.log('📤 Payload para edición:', payload);
      
      await evaluationService.editEvaluation(evaluationId, payload);
      console.log('✅ Evaluación editada exitosamente');
      // Mostrar modal de éxito y recargar al confirmar
      setAlertModal({ open: true, type: 'success', title: 'Cambios guardados', message: 'Cambios guardados correctamente', onConfirm: async () => { await loadEvaluations(); }, showCancel: false });
    } catch (error) {
      console.error('❌ Error editando evaluación:', error);
      setAlertModal({ open: true, type: 'error', title: 'Error', message: 'Error al guardar los cambios. Por favor, intente nuevamente.', onConfirm: null, showCancel: false });
      throw error;
    }
  };

  const handleApproveEvaluation = async (evaluationId) => {
    try {
      console.log('✅ Aprobando evaluación:', evaluationId);
      // Llamar al endpoint de validación (backend: POST /evaluaciones/{id}/validar)
      await evaluationService.validateEvaluation(evaluationId);
      // Recargar inmediatamente y cerrar modal — así la evaluación no seguirá apareciendo en la lista
      await loadEvaluations();
      setShowModal(false);
      // Mostrar modal de éxito (sin necesidad de recargar al confirmar)
      setAlertModal({ open: true, type: 'success', title: 'Evaluación aprobada', message: 'La evaluación fue validada correctamente.', onConfirm: null, showCancel: false });
    } catch (error) {
      console.error('❌ Error aprobando evaluación:', error);
      setAlertModal({ open: true, type: 'error', title: 'Error', message: 'Error al aprobar la evaluación. Por favor, intente nuevamente.', onConfirm: null, showCancel: false });
      throw error;
    }
  };

  const handleRequestChanges = async (evaluationId, reason) => {
    try {
      console.log('🔄 Solicitando cambios:', evaluationId, reason);
      await evaluationService.requestChanges(evaluationId, reason);
      setAlertModal({ open: true, type: 'success', title: 'Cambios solicitados', message: 'Se solicitaron cambios correctamente.', onConfirm: async () => { await loadEvaluations(); setShowModal(false); }, showCancel: false });
    } catch (error) {
      console.error('❌ Error solicitando cambios:', error);
      setAlertModal({ open: true, type: 'error', title: 'Error', message: 'Error al solicitar cambios. Por favor, intente nuevamente.', onConfirm: null, showCancel: false });
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETADA':
        return <span className="status-badge status-completed"><FaCheckCircle /> Completada</span>;
      case 'APROBADA':
        return <span className="status-badge status-approved"><FaCheckCircle /> Aprobada</span>;
      case 'CAMBIOS_SOLICITADOS':
        return <span className="status-badge status-changes-requested"><FaExclamationTriangle /> Cambios Solicitados</span>;
      case 'RECHAZADA':
        return <span className="status-badge status-rejected"><FaTimes /> Rechazada</span>;
      default:
        return <span className="status-badge status-unknown">{status || 'Desconocido'}</span>;
    }
  };

  const getTotalScore = (evaluation) => {
    return evaluation.calificacionTotal || 
           evaluation.items?.reduce((sum, item) => sum + (item.calificacion || 0), 0) || 
           0;
  };

  if (loading) {
    return (
      <div className="evaluation-review-page">
        <div className="loading-container">
          <FaSync className="loading-spinner" />
          <p>Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluation-review-page">
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <button onClick={loadEvaluations} className="retry-btn">
            <FaSync /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-review-page">
    
      {/* Filtros y Controles */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por proyecto, evaluador o ID..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="status-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="aprobada">Aprobadas</option>
            <option value="cambios_solicitados">Cambios Solicitados</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <button 
            onClick={loadEvaluations} 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <span className="results-count">
            {filteredEvaluations.length} evaluación{filteredEvaluations.length !== 1 ? 'es' : ''} encontrada{filteredEvaluations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista de evaluaciones */}
      <div className="evaluations-list">
        {filteredEvaluations.length === 0 ? (
          <div className="empty-state">
            <FaEye className="empty-icon" />
            <p>No hay evaluaciones que coincidan con los criterios de búsqueda</p>
            <button onClick={() => setFilters({search: '', status: 'all'})} className="retry-btn">
              Limpiar Filtros
            </button>
          </div>
        ) : (
          filteredEvaluations.map(evaluation => {
            const project = evaluation.project || evaluation.proyecto || {};
            const evaluatorId = evaluation.evaluadorId || evaluation.evaluatorId || evaluation.evaluador?.id || evaluation.evaluador?.userId || null;
            const evaluatorName = evaluatorNames[String(evaluatorId)]
              || evaluation.evaluatorName
              || evaluation.evaluador?.nombre
              || evaluation.evaluador?.fullName
              || evaluation.evaluador
              || 'Evaluador no disponible';
            const displayDate = evaluation.fechaCompletado 
              || evaluation.fechaFinalizacion 
              || evaluation.fechaAsignacion 
              || evaluation.fechaAceptacion 
              || null;
            return (
              <div key={evaluation.id} className="evaluation-card">
                <div className="evaluation-info">
                  <div className="evaluation-header">
                    <h3>Proyecto: {project?.titulo || project?.nombre || evaluation.titulo || 'Proyecto no disponible'}</h3>
                    {getStatusBadge(evaluation.estado)}
                  </div>

                  <div className="evaluation-format" style={{ marginTop: '6px', marginBottom: '8px', color: '#374151' }}>
                    <strong>Formato:</strong> {evaluation.formato?.nombre || project?.formato || 'N/A'}
                  </div>

                  <div className="evaluation-meta">
                    <span><strong>Evaluador:</strong> {evaluatorName}</span>
                    <span><strong>Fecha:</strong> {displayDate ? new Date(displayDate).toLocaleDateString() : 'No disponible'}</span>
                  </div>

                  <div className="evaluation-stats">
                    <span className="stat-item">
                      <strong>Items Evaluados:</strong> {evaluation.items?.length || 0}
                    </span>
                    <span className="stat-item">
                      <strong>Puntuación Total:</strong> {getTotalScore(evaluation)}
                    </span>
                  </div>

                  {/* Observación General Preview */}
                  {evaluation.observacionGeneral && (
                    <div className="evaluation-observation-preview">
                      <strong>Observación:</strong> 
                      <p>{evaluation.observacionGeneral.length > 100 
                        ? `${evaluation.observacionGeneral.substring(0, 100)}...` 
                        : evaluation.observacionGeneral}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="evaluation-actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleViewEvaluation(evaluation)}
                  >
                    <FaEye /> Revisar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de revisión */}
      {showModal && selectedEvaluation && (
        <EvaluationReviewModal
          evaluation={selectedEvaluation}
          onClose={() => setShowModal(false)}
          onAddObservation={handleAddObservation}
          onApprove={handleApproveEvaluation}
          onRequestChanges={handleRequestChanges}
          onEditEvaluation={handleEditEvaluation}
        />
      )}
      <Modal
        isOpen={alertModal.open}
        onClose={() => setAlertModal(a => ({ ...a, open: false }))}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={async () => { if (alertModal.onConfirm) await alertModal.onConfirm(); setAlertModal(a => ({ ...a, open: false })); }}
        showCancel={alertModal.showCancel}
        confirmText="Aceptar"
        cancelText="Cerrar"
      />
    </div>
  );
};

export default EvaluationReviewMainPage;