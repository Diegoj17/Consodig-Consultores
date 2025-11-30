// pages/admin/EvaluatorReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaFilter, FaUserTie, FaChartLine, FaEnvelope, FaStar } from 'react-icons/fa';
import '../../styles/pages/admin/EvaluatorReportsPage.css';

const EvaluatorReportsPage = () => {
  const [timeFilter, setTimeFilter] = useState('last-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluator, setSelectedEvaluator] = useState('');
  const [reportData, setReportData] = useState({
    evaluators: [],
    summary: {},
    selectedEvaluatorData: null
  });

  useEffect(() => {
    // Datos de ejemplo para reportes por evaluador
    const mockData = {
      evaluators: [
        {
          id: 1,
          name: 'Diego Jaimes',
          email: 'diego.jaimes@uffs.edu',
          institution: 'Universidad UFFS',
          specialization: 'Computación en la Nube',
          status: 'Activo',
          averageRating: 4.3,
          totalProjects: 5,
          completedEvaluations: 8,
          pendingEvaluations: 2,
          joinDate: '2023-01-15',
          lastActivity: '2024-01-15'
        },
        {
          id: 2,
          name: 'María López',
          email: 'maria.lopez@tecnologico.edu',
          institution: 'Tecnológico Nacional',
          specialization: 'Desarrollo Web',
          status: 'Activo',
          averageRating: 4.0,
          totalProjects: 3,
          completedEvaluations: 6,
          pendingEvaluations: 1,
          joinDate: '2023-02-20',
          lastActivity: '2024-01-10'
        },
        {
          id: 3,
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@central.edu',
          institution: 'Universidad Central',
          specialization: 'Base de Datos',
          status: 'Inactivo',
          averageRating: 4.1,
          totalProjects: 4,
          completedEvaluations: 7,
          pendingEvaluations: 0,
          joinDate: '2023-03-10',
          lastActivity: '2024-01-05'
        }
      ],
      summary: {
        totalEvaluators: 8,
        activeEvaluators: 6,
        averageRating: 4.1,
        totalEvaluations: 45
      }
    };

    setReportData(mockData);
    setSelectedEvaluator(mockData.evaluators[0].id);
  }, []);

  useEffect(() => {
    if (selectedEvaluator) {
      // Simular carga de datos detallados del evaluador seleccionado
      const evaluator = reportData.evaluators.find(e => e.id === parseInt(selectedEvaluator));
      if (evaluator) {
        const detailedData = {
          ...evaluator,
          performance: {
            timeline: [
              { month: 'Oct', evaluations: 4, averageRating: 4.2 },
              { month: 'Nov', evaluations: 5, averageRating: 4.3 },
              { month: 'Dic', evaluations: 3, averageRating: 4.1 },
              { month: 'Ene', evaluations: 6, averageRating: 4.4 }
            ],
            projects: [
              { name: 'Sistema Académico', rating: 4.5, date: '2024-01-15', status: 'Completado' },
              { name: 'Plataforma E-learning', rating: 4.5, date: '2024-01-08', status: 'Completado' },
              { name: 'App Móvil', rating: 4.0, date: '2024-01-10', status: 'Completado' },
              { name: 'Sistema de Inventarios', rating: 4.5, date: '2024-01-05', status: 'Completado' }
            ],
            ratingsDistribution: { 5: 3, 4: 4, 3: 1, 2: 0, 1: 0 }
          }
        };
        setReportData(prev => ({ ...prev, selectedEvaluatorData: detailedData }));
      }
    }
  }, [selectedEvaluator, reportData.evaluators]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="star empty" />);
      }
    }

    return stars;
  };

  const exportReport = () => {
    alert('Exportando reporte del evaluador...');
  };

  const sendMessage = (evaluator) => {
    alert(`Enviando mensaje a: ${evaluator.name}`);
  };

  const filteredEvaluators = reportData.evaluators.filter(evaluator =>
    evaluator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="evaluator-reports-page">
      {/* Header de la página */}
      <div className="page-header">
        <div className="header-content">
          <h1>Reportes por Evaluador</h1>
          <p>Analiza el desempeño individual de cada evaluador</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar evaluadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="last-week">Última semana</option>
            <option value="last-month">Último mes</option>
            <option value="last-quarter">Último trimestre</option>
            <option value="last-year">Último año</option>
          </select>
          <button className="export-btn" onClick={exportReport}>
            <FaDownload /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="summary-metrics">
        <div className="summary-card">
          <div className="summary-icon">
            <FaUserTie />
          </div>
          <div className="summary-info">
            <h3>Total Evaluadores</h3>
            <div className="summary-value">{reportData.summary.totalEvaluators}</div>
            <div className="summary-subtext">{reportData.summary.activeEvaluators} activos</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FaChartLine />
          </div>
          <div className="summary-info">
            <h3>Calificación Promedio</h3>
            <div className="summary-value">{reportData.summary.averageRating}/5.0</div>
            <div className="summary-subtext">General del sistema</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FaStar />
          </div>
          <div className="summary-info">
            <h3>Evaluaciones Totales</h3>
            <div className="summary-value">{reportData.summary.totalEvaluations}</div>
            <div className="summary-subtext">Completadas</div>
          </div>
        </div>
      </div>

      {/* Selector de Evaluador y Lista */}
      <div className="evaluator-selection">
        <div className="selection-header">
          <h2>Seleccionar Evaluador</h2>
          <select 
            value={selectedEvaluator} 
            onChange={(e) => setSelectedEvaluator(e.target.value)}
            className="evaluator-select"
          >
            {filteredEvaluators.map(evaluator => (
              <option key={evaluator.id} value={evaluator.id}>
                {evaluator.name} - {evaluator.institution}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Evaluadores */}
        <div className="evaluators-list">
          <h3>Lista de Evaluadores</h3>
          <div className="evaluators-grid">
            {filteredEvaluators.map(evaluator => (
              <div 
                key={evaluator.id} 
                className={`evaluator-card ${selectedEvaluator == evaluator.id ? 'selected' : ''}`}
                onClick={() => setSelectedEvaluator(evaluator.id)}
              >
                <div className="evaluator-header">
                  <div className="evaluator-avatar">
                    <FaUserTie />
                  </div>
                  <div className="evaluator-info">
                    <h4>{evaluator.name}</h4>
                    <p>{evaluator.institution}</p>
                    <span className={`status-badge ${evaluator.status.toLowerCase()}`}>
                      {evaluator.status}
                    </span>
                  </div>
                </div>
                <div className="evaluator-stats">
                  <div className="stat">
                    <span className="stat-value">{evaluator.averageRating}</span>
                    <span className="stat-label">Calificación</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{evaluator.completedEvaluations}</span>
                    <span className="stat-label">Completadas</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{evaluator.pendingEvaluations}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </div>
                <button 
                  className="message-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMessage(evaluator);
                  }}
                >
                  <FaEnvelope /> Mensaje
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalles del Evaluador Seleccionado */}
      {reportData.selectedEvaluatorData && (
        <div className="evaluator-details">
          <div className="details-header">
            <h2>Reporte Detallado: {reportData.selectedEvaluatorData.name}</h2>
            <div className="evaluator-meta">
              <span>{reportData.selectedEvaluatorData.institution}</span>
              <span>{reportData.selectedEvaluatorData.specialization}</span>
              <span>Miembro desde: {reportData.selectedEvaluatorData.joinDate}</span>
            </div>
          </div>

          <div className="performance-metrics">
            <div className="performance-card">
              <h3>Desempeño General</h3>
              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-value">
                    {renderStars(reportData.selectedEvaluatorData.averageRating)}
                    <span>{reportData.selectedEvaluatorData.averageRating}</span>
                  </div>
                  <div className="metric-label">Calificación Promedio</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{reportData.selectedEvaluatorData.totalProjects}</div>
                  <div className="metric-label">Proyectos Asignados</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{reportData.selectedEvaluatorData.completedEvaluations}</div>
                  <div className="metric-label">Evaluaciones Completadas</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{reportData.selectedEvaluatorData.pendingEvaluations}</div>
                  <div className="metric-label">Evaluaciones Pendientes</div>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <h3>Distribución de Calificaciones</h3>
              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="distribution-item">
                    <span className="rating-label">{rating} ★</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{
                          width: `${(reportData.selectedEvaluatorData.performance.ratingsDistribution[rating] / reportData.selectedEvaluatorData.completedEvaluations) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="count">{reportData.selectedEvaluatorData.performance.ratingsDistribution[rating]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proyectos Recientes */}
          <div className="recent-projects">
            <h3>Proyectos Evaluados Recientemente</h3>
            <div className="projects-list">
              {reportData.selectedEvaluatorData.performance.projects.map((project, index) => (
                <div key={index} className="project-item">
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <span className="project-date">{project.date}</span>
                  </div>
                  <div className="project-rating">
                    <span className="rating-badge">{project.rating} ★</span>
                    <span className="project-status">{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorReportsPage;