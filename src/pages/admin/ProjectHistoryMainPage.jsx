import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaCheck, FaTimes, FaClock, FaEye, FaChartBar, FaSync } from 'react-icons/fa';
import '../../styles/pages/admin/HistoryMainPage.css';
import ProjectModal from '../../components/management/project/admin/ProjectModal';
import { historyService } from '../../services/historyService';
import { projectService } from '../../services/projectService';

const HistoryMainPage = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [projectsHistory, setProjectsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectLoading, setSelectedProjectLoading] = useState(false);

  // Cargar datos reales del backend
  const loadProjectsHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando proyectos evaluados...');

      const proyectos = await historyService.getEvaluatedProjects(timeFilter);
      setProjectsHistory(proyectos);

      console.log('✅ Proyectos cargados:', proyectos.length);
    } catch (err) {
      console.error('❌ Error cargando proyectos evaluados:', err);
      setError('Error al cargar los proyectos evaluados desde el servidor');
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    loadProjectsHistory();
  }, [loadProjectsHistory]);

  const handleRefresh = () => {
    loadProjectsHistory();
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

      {projectsHistory.length === 0 ? (
        <div className="project-admin-empty">
          <FaUser className="empty-icon" />
          <p>No hay proyectos evaluados disponibles</p>
          <p>Cuando haya proyectos con evaluaciones completadas aparecerán aquí</p>
        </div>
      ) : (
        <div className="project-admin-history-table">
          {projectsHistory.map(project => {
            return (
              <div key={project.id} className="project-admin-history-row">
                <div className="project-admin-history-evaluator">
                  <div className="project-admin-evaluator-avatar">
                    { (project.titulo || 'P').slice(0,2).toUpperCase() }
                  </div>
                  <div className="project-admin-evaluator-info">
                    <h4>{project.titulo}</h4>
                    <span className="project-admin-evaluator-profile">
                      {project.resumen?.slice(0,140) || 'Sin descripción'}
                    </span>
                    <div className="project-admin-evaluator-specialties">
                      <span className="project-admin-specialty-tag">Evaluaciones: {project.evaluacionesCount}</span>
                      {project.averageScore !== null && (
                        <span className="project-admin-specialty-tag">Promedio: {project.averageScore}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="project-admin-history-stats">
                  <div className="project-admin-history-stat">
                    <FaClock className="project-admin-stat-icon project-admin-stat-icon--assigned" />
                    <div className="project-admin-stat-content">
                      <span className="project-admin-stat-label">Última Evaluación</span>
                      <span className="project-admin-stat-value">{project.lastEvaluationFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="project-admin-history-actions">
                  <button 
                    className="project-admin-btn-detail"
                    onClick={async () => {
                      try {
                        setSelectedProjectLoading(true);
                        const full = await projectService.getById(project.id);
                        setSelectedProject(full);
                      } catch (err) {
                        console.error('Error cargando proyecto completo:', err);
                        setSelectedProject(project); // fallback al resumen
                      } finally {
                        setSelectedProjectLoading(false);
                      }
                    }}
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
          loading={selectedProjectLoading}
        />
      )}
    </div>
  );
};

export default HistoryMainPage;