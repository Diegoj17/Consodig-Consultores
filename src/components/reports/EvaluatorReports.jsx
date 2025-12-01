// components/admin/reports/RatingsReports.jsx
import React, { useState, useEffect } from 'react';
import { FaStar, FaProjectDiagram, FaUserTie, FaChartBar, FaDownload, FaSearch } from 'react-icons/fa';
import RatingsSummary from './RatingsSummary';
import ProjectRatingsTable from './ProjectRatingsTable';
import EvaluatorRatingsTable from './EvaluatorRatingsTable';
import '../../styles/reports/EvaluatorReports.css';

const RatingsReports = () => {
  const [activeSubTab, setActiveSubTab] = useState('project-ratings');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingsData, setRatingsData] = useState({
    projectRatings: [],
    evaluatorRatings: [],
    summary: {}
  });

  useEffect(() => {
    // Simular carga de datos desde API
    const mockData = {
      projectRatings: [
        {
          id: 1,
          name: 'Sistema de Gestión Académica',
          evaluator: 'Diego Jaimes',
          averageRating: 4.5,
          totalEvaluations: 3,
          ratings: [4.5, 4.0, 5.0],
          lastEvaluation: '2024-01-15',
          status: 'Completado'
        },
        {
          id: 2,
          name: 'App Móvil para Eventos',
          evaluator: 'María López',
          averageRating: 3.8,
          totalEvaluations: 2,
          ratings: [3.5, 4.0],
          lastEvaluation: '2024-01-10',
          status: 'Completado'
        }
      ],
      evaluatorRatings: [
        {
          id: 1,
          name: 'Diego Jaimes',
          institution: 'Universidad UFFS',
          specialization: 'Computación en la Nube',
          averageRating: 4.3,
          totalProjects: 5,
          completedEvaluations: 8,
          pendingEvaluations: 2,
          ratingsDistribution: { 5: 3, 4: 4, 3: 1, 2: 0, 1: 0 }
        },
        {
          id: 2,
          name: 'María López',
          institution: 'Tecnológico Nacional',
          specialization: 'Desarrollo Web',
          averageRating: 4.0,
          totalProjects: 3,
          completedEvaluations: 6,
          pendingEvaluations: 1,
          ratingsDistribution: { 5: 2, 4: 3, 3: 1, 2: 0, 1: 0 }
        }
      ],
      summary: {
        overallAverage: 4.1,
        totalProjects: 12,
        totalEvaluators: 8,
        totalEvaluations: 21,
        ratingDistribution: { 5: 7, 4: 10, 3: 3, 2: 1, 1: 0 }
      }
    };

    setRatingsData(mockData);
  }, []);

  const exportReport = () => {
    // Lógica para exportar reporte
    const dataToExport = activeSubTab === 'project-ratings' 
      ? ratingsData.projectRatings 
      : ratingsData.evaluatorRatings;
    
    console.log('Exportando:', dataToExport);
    alert('Reporte exportado exitosamente');
  };

  const filteredProjectRatings = ratingsData.projectRatings.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.evaluator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvaluatorRatings = ratingsData.evaluatorRatings.filter(evaluator =>
    evaluator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ratings-reports">
      <div className="reports-subheader">
        <div className="subheader-title">
          <FaChartBar className="subheader-icon" />
          <h2>Reportes de Calificaciones</h2>
        </div>
        <div className="subheader-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar proyectos o evaluadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">Todos los tiempos</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
          </select>
          <button className="export-btn" onClick={exportReport}>
            <FaDownload /> Exportar PDF
          </button>
        </div>
      </div>

      <RatingsSummary summary={ratingsData.summary} />

      <div className="sub-tabs-navigation">
        <button
          className={`sub-tab-button ${activeSubTab === 'project-ratings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('project-ratings')}
        >
          <FaProjectDiagram /> Por Proyecto
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'evaluator-ratings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('evaluator-ratings')}
        >
          <FaUserTie /> Por Evaluador
        </button>
      </div>

      <div className="sub-tab-content">
        {activeSubTab === 'project-ratings' && (
          <ProjectRatingsTable projects={filteredProjectRatings} />
        )}
        {activeSubTab === 'evaluator-ratings' && (
          <EvaluatorRatingsTable evaluators={filteredEvaluatorRatings} />
        )}
      </div>
    </div>
  );
};

export default RatingsReports;