import React, { useState } from 'react';
import { FaUser, FaCheck, FaTimes, FaClock, FaEye, FaChartBar } from 'react-icons/fa';
import HistoryStats from '../../components/management/project/admin/HistoryStats';
import '../../styles/pages/admin/HistoryMainPage.css';
import ProjectModal from '../../components/management/project/admin/ProjectModal';

const HistoryMainPage = () => {
  
  const [timeFilter, setTimeFilter] = useState('all');

  // Datos de ejemplo para historial
  const evaluatorsHistory = [
    {
      id: 1,
      nombre: 'Dr. Carlos Rodríguez',
      perfil: 'Inteligencia Artificial',
      avatar: 'CR',
      asignados: 15,
      completados: 12,
      incumplimientos: 1,
      tiempoPromedio: '7 días',
      ultimaEvaluacion: '2024-03-15',
      especialidades: ['Machine Learning', 'Deep Learning', 'Visión por Computadora']
    },
    {
      id: 2,
      nombre: 'Dra. Laura Sánchez',
      perfil: 'IoT y Sistemas Embebidos',
      avatar: 'LS',
      asignados: 8,
      completados: 8,
      incumplimientos: 0,
      tiempoPromedio: '5 días',
      ultimaEvaluacion: '2024-03-18',
      especialidades: ['IoT', 'Sensores Inteligentes', 'Energía']
    },
    {
      id: 3,
      nombre: 'Dr. Miguel Ángel Torres',
      perfil: 'Educación y Tecnología',
      avatar: 'MT',
      asignados: 12,
      completados: 9,
      incumplimientos: 2,
      tiempoPromedio: '10 días',
      ultimaEvaluacion: '2024-03-10',
      especialidades: ['Realidad Aumentada', 'E-learning', 'Tecnología Educativa']
    },
    {
      id: 4,
      nombre: 'Mg. Patricia Gómez',
      perfil: 'Ciencias de la Salud',
      avatar: 'PG',
      asignados: 6,
      completados: 6,
      incumplimientos: 0,
      tiempoPromedio: '4 días',
      ultimaEvaluacion: '2024-03-20',
      especialidades: ['Medicina', 'Salud Pública', 'Epidemiología']
    }
  ];

  const handleViewDetails = (evaluator) => {
    console.log('Ver detalle del evaluador:', evaluator);
  };

  // Abrir ProjectModal usando información mínima mapeada desde el evaluador
  const [selectedProject, setSelectedProject] = useState(null);

  const handleOpenProjectFromEvaluator = (evaluator) => {
    // Mapear datos del evaluador a una estructura de proyecto mínima para visualización
    const project = {
      id: evaluator.id,
      titulo: `Historial - ${evaluator.nombre}`,
      resumen: `Resumen de actividad del evaluador ${evaluator.nombre}`,
      palabrasClave: evaluator.especialidades ? evaluator.especialidades.join(', ') : '',
      objetivoGeneral: '',
      objetivosEspecificos: evaluator.especialidades ? evaluator.especialidades.join('\n') : '',
      justificacion: '',
      nivelEstudios: '',
      investigadorPrincipal: evaluator.nombre,
      lineasInvestigacionIds: []
    };
    setSelectedProject(project);
  };

  const getPerformanceColor = (completados, asignados) => {
    const ratio = completados / asignados;
    if (ratio >= 0.9) return '#10b981';
    if (ratio >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const getEfficiencyBadge = (tiempoPromedio) => {
    const days = parseInt(tiempoPromedio);
    if (days <= 5) return { text: 'Muy Eficiente', color: '#10b981' };
    if (days <= 10) return { text: 'Eficiente', color: '#f59e0b' };
    return { text: 'En mejora', color: '#ef4444' };
  };

  return (
    <div className="project-admin-history-page">
      <HistoryStats 
      evaluatorsHistory={evaluatorsHistory}
      timeFilter={timeFilter}
    />

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

      {/* Modal de detalle del proyecto (usando ProjectModal) */}
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