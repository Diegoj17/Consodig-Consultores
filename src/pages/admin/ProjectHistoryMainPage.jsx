import React, { useState, useEffect } from 'react';
import { FaUser, FaCheck, FaTimes, FaClock, FaEye, FaChartBar, FaSync } from 'react-icons/fa';
import HistoryStats from '../../components/management/project/admin/HistoryStats';
import '../../styles/pages/admin/HistoryMainPage.css';
import ProjectModal from '../../components/management/project/admin/ProjectModal';
import { historyService } from '../../services/historyService';

const HistoryMainPage = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [evaluatorsHistory, setEvaluatorsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Cargar datos reales del backend
  useEffect(() => {
    loadEvaluatorsHistory();
  }, [timeFilter]);

  const loadEvaluatorsHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando historial real de evaluadores...');
      
      const historial = await historyService.getEvaluatorsHistory(timeFilter);
      setEvaluatorsHistory(historial);
      
      console.log('✅ Historial cargado exitosamente:', historial);
    } catch (err) {
      console.error('❌ Error cargando historial:', err);
      setError('Error al cargar el historial de evaluadores desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (evaluator) => {
    console.log('Ver detalle del evaluador:', evaluator);
  };

  const handleOpenProjectFromEvaluator = (evaluator) => {
    const project = {
      id: evaluator.id,
      titulo: `Historial - ${evaluator.nombre}`,
      resumen: `Resumen de actividad del evaluador ${evaluator.nombre}. ${evaluator.completados} de ${evaluator.asignados} evaluaciones completadas. Tiempo promedio: ${evaluator.tiempoPromedio}.`,
      palabrasClave: evaluator.especialidades ? evaluator.especialidades.join(', ') : '',
      objetivoGeneral: `Seguimiento del desempeño del evaluador ${evaluator.nombre}`,
      objetivosEspecificos: evaluator.especialidades ? evaluator.especialidades.join('\n') : '',
      justificacion: `Información de cumplimiento y métricas de desempeño`,
      nivelEstudios: evaluator.nivelEducativo || 'No especificado',
      investigadorPrincipal: evaluator.nombre,
      lineasInvestigacionIds: []
    };
    setSelectedProject(project);
  };

  const getPerformanceColor = (completados, asignados) => {
    if (asignados === 0) return '#6b7280';
    const ratio = completados / asignados;
    if (ratio >= 0.9) return '#10b981';
    if (ratio >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const getEfficiencyBadge = (tiempoPromedio) => {
    const days = parseFloat(tiempoPromedio);
    if (days <= 5) return { text: 'Muy Eficiente', color: '#10b981' };
    if (days <= 10) return { text: 'Eficiente', color: '#f59e0b' };
    return { text: 'En mejora', color: '#ef4444' };
  };

  const handleRefresh = () => {
    loadEvaluatorsHistory();
  };

  if (loading) {
    return (
      <div className="project-admin-history-page">
        <div className="project-admin-loading">
          <FaSync className="loading-spinner" />
          <p>Cargando historial de evaluadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-admin-history-page">
        <div className="project-admin-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="project-admin-btn-refresh">
            <FaSync /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-admin-history-page">
      <HistoryStats 
        evaluatorsHistory={evaluatorsHistory}
        timeFilter={timeFilter}
      />

      <div className="project-admin-history-header">
        <div className="project-admin-history-filters">
          <div className="project-admin-filter-group">
            <label>Filtrar por período:</label>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="project-admin-filter-select"
            >
              <option value="all">Todos los tiempos</option>
              <option value="30days">Últimos 30 días</option>
              <option value="90days">Últimos 90 días</option>
              <option value="1year">Último año</option>
            </select>
          </div>
        </div>
      </div>

      {evaluatorsHistory.length === 0 ? (
        <div className="project-admin-empty">
          <FaUser className="empty-icon" />
          <p>No hay datos de historial disponibles</p>
          <p>Los evaluadores aparecerán aquí cuando completen evaluaciones</p>
        </div>
      ) : (
        <div className="project-admin-history-table">
          {evaluatorsHistory.map(evaluator => {
            const performanceColor = getPerformanceColor(evaluator.completados, evaluator.asignados);
            const efficiencyBadge = getEfficiencyBadge(evaluator.tiempoPromedio);

            return (
              <div key={evaluator.id} className="project-admin-history-row">
                <div className="project-admin-history-evaluator">
                  <div className="project-admin-evaluator-avatar">
                    {evaluator.avatar}
                  </div>
                  <div className="project-admin-evaluator-info">
                    <h4>{evaluator.nombre}</h4>
                    <span className="project-admin-evaluator-profile">
                      {evaluator.perfil}
                    </span>
                    <div className="project-admin-evaluator-specialties">
                      {evaluator.especialidades.map((esp, index) => (
                        <span key={index} className="project-admin-specialty-tag">
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="project-admin-history-stats">
                  <div className="project-admin-history-stat">
                    <FaClock className="project-admin-stat-icon project-admin-stat-icon--assigned" />
                    <div className="project-admin-stat-content">
                      <span className="project-admin-stat-label">Asignados</span>
                      <span className="project-admin-stat-value">{evaluator.asignados}</span>
                    </div>
                  </div>
                  
                  <div className="project-admin-history-stat">
                    <FaCheck className="project-admin-stat-icon project-admin-stat-icon--completed" />
                    <div className="project-admin-stat-content">
                      <span className="project-admin-stat-label">Completados</span>
                      <span 
                        className="project-admin-stat-value"
                        style={{color: performanceColor}}
                      >
                        {evaluator.completados}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-admin-history-stat">
                    <FaTimes className="project-admin-stat-icon project-admin-stat-icon--overdue" />
                    <div className="project-admin-stat-content">
                      <span className="project-admin-stat-label">Incumplimientos</span>
                      <span className="project-admin-stat-value project-admin-stat-value--warning">
                        {evaluator.incumplimientos}
                      </span>
                    </div>
                  </div>

                  <div className="project-admin-history-stat">
                    <FaChartBar className="project-admin-stat-icon" />
                    <div className="project-admin-stat-content">
                      <span className="project-admin-stat-label">Tiempo Promedio</span>
                      <span className="project-admin-stat-value">{evaluator.tiempoPromedio}</span>
                      <span 
                        className="project-admin-efficiency-badge"
                        style={{backgroundColor: efficiencyBadge.color}}
                      >
                        {efficiencyBadge.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="project-admin-history-actions">
                  <button 
                    className="project-admin-btn-detail"
                    onClick={() => { handleViewDetails(evaluator); handleOpenProjectFromEvaluator(evaluator); }}
                  >
                    <FaEye />
                    Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalle del proyecto */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          mode="view"
        />
      )}
    </div>
  );
};

export default HistoryMainPage;