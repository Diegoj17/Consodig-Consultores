// pages/admin/EvaluationReviewMainPage.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaEdit, FaSync, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { evaluationService } from '../../services/evaluationService';
import { userService } from '../../services/userService';
import EvaluationReviewModal from '../../components/management/project/admin/EvaluationReviewModal';
import '../../styles/pages/admin/EvaluationReviewPage.css';

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

  // Cargar evaluaciones completadas
  useEffect(() => {
    loadEvaluations();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [evaluations, filters]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Cargando evaluaciones completadas...');
      const completedEvaluations = await evaluationService.getCompletedEvaluations();
      console.log('✅ Evaluaciones completadas obtenidas:', completedEvaluations);
      
      // Enriquecer datos con información del evaluador
      const enrichedEvaluations = await Promise.all(
        completedEvaluations.map(async (evaluation) => {
          try {
            // Obtener información del evaluador
            let evaluatorName = 'Evaluador no disponible';
            if (evaluation.evaluadorId) {
              try {
                const evaluador = await userService.getEvaluadorById(evaluation.evaluadorId);
                evaluatorName = `${evaluador.nombre} ${evaluador.apellido || ''}`.trim();
              } catch (error) {
                console.warn('⚠️ No se pudo obtener información del evaluador:', error);
              }
            }

            // Asegurar que los items tengan estructura consistente
            const items = evaluation.items?.map(item => ({
              id: item.id || item.itemEvaluadoId,
              calificacion: item.calificacion || item.puntuacion || 0,
              observacion: item.observacion || item.comentario || '',
              criterio: item.criterio || { 
                nombre: item.nombreCriterio || `Criterio ${item.id}`,
                descripcion: item.descripcionCriterio || '',
                peso: item.peso || 0
              }
            })) || [];

            return {
              ...evaluation,
              id: evaluation.id || evaluation.evaluacionId,
              project: evaluation.proyecto || evaluation.project,
              evaluatorName,
              fechaCompletado: evaluation.fechaFinalizacion || evaluation.fechaCompletado || evaluation.fechaCreacion,
              calificacionTotal: evaluation.calificacionTotal || evaluation.calificacion_total || evaluation.puntuacionTotal || 0,
              estado: evaluation.estado || 'COMPLETADA',
              items: items,
              observacionGeneral: evaluation.observacionGeneral || evaluation.observacionAdmin || ''
            };
          } catch (error) {
            console.error('❌ Error procesando evaluación:', error);
            return {
              ...evaluation,
              project: evaluation.proyecto || evaluation.project,
              evaluatorName: 'Evaluador no disponible',
              fechaCompletado: evaluation.fechaFinalizacion || evaluation.fechaCompletado,
              calificacionTotal: evaluation.calificacionTotal || 0,
              estado: evaluation.estado || 'COMPLETADA',
              items: evaluation.items || [],
              observacionGeneral: evaluation.observacionGeneral || ''
            };
          }
        })
      );

      console.log('✅ Evaluaciones enriquecidas:', enrichedEvaluations);
      setEvaluations(enrichedEvaluations);
      
    } catch (err) {
      console.error('❌ Error cargando evaluaciones:', err);
      setError('Error al cargar las evaluaciones completadas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...evaluations];

    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(evaluation => 
        evaluation.project?.titulo?.toLowerCase().includes(searchTerm) ||
        evaluation.evaluatorName?.toLowerCase().includes(searchTerm) ||
        evaluation.id?.toString().includes(searchTerm) ||
        evaluation.project?.id?.toString().includes(searchTerm)
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(evaluation => 
        evaluation.estado?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredEvaluations(filtered);
  };

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
      
      // Recargar las evaluaciones
      await loadEvaluations();
      
      return true;
    } catch (error) {
      console.error('❌ Error registrando observación general:', error);
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
      
      // Recargar la lista
      await loadEvaluations();
      
      alert('✅ Cambios guardados correctamente');
    } catch (error) {
      console.error('❌ Error editando evaluación:', error);
      alert('❌ Error al guardar los cambios. Por favor, intente nuevamente.');
      throw error;
    }
  };

  const handleApproveEvaluation = async (evaluationId) => {
    try {
      console.log('✅ Aprobando evaluación:', evaluationId);
      await evaluationService.approveEvaluation(evaluationId);
      
      alert('✅ Evaluación aprobada correctamente');
      await loadEvaluations();
      setShowModal(false);
    } catch (error) {
      console.error('❌ Error aprobando evaluación:', error);
      alert('❌ Error al aprobar la evaluación. Por favor, intente nuevamente.');
      throw error;
    }
  };

  const handleRequestChanges = async (evaluationId, reason) => {
    try {
      console.log('🔄 Solicitando cambios:', evaluationId, reason);
      await evaluationService.requestChanges(evaluationId, reason);
      
      alert('✅ Cambios solicitados correctamente');
      await loadEvaluations();
      setShowModal(false);
    } catch (error) {
      console.error('❌ Error solicitando cambios:', error);
      alert('❌ Error al solicitar cambios. Por favor, intente nuevamente.');
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
          filteredEvaluations.map(evaluation => (
            <div key={evaluation.id} className="evaluation-card">
              <div className="evaluation-info">
                <div className="evaluation-header">
                  <h3>{evaluation.project?.titulo || 'Proyecto no disponible'}</h3>
                  {getStatusBadge(evaluation.estado)}
                </div>
                
                <div className="evaluation-meta">
                  <span><strong>Evaluador:</strong> {evaluation.evaluatorName}</span>
                  <span><strong>Fecha:</strong> {evaluation.fechaCompletado ? new Date(evaluation.fechaCompletado).toLocaleDateString() : 'No disponible'}</span>
                  <span><strong>ID Evaluación:</strong> {evaluation.id}</span>
                </div>
                
                <div className="evaluation-stats">
                  <span className="stat-item">
                    <strong>Puntuación Total:</strong> {getTotalScore(evaluation)}
                  </span>
                  <span className="stat-item">
                    <strong>Proyecto ID:</strong> {evaluation.project?.id || 'N/A'}
                  </span>
                  <span className="stat-item">
                    <strong>Items Evaluados:</strong> {evaluation.items?.length || 0}
                  </span>
                  <span className="stat-item">
                    <strong>Formato:</strong> {evaluation.formato?.nombre || evaluation.project?.formato || 'N/A'}
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
                <button 
                  className="btn-edit"
                  onClick={() => handleViewEvaluation(evaluation)}
                >
                  <FaEdit /> Editar
                </button>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default EvaluationReviewMainPage;