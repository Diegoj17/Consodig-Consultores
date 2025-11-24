// src/pages/user/EvaluatorHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHistory, FaUser, FaFilter, FaCheckCircle } from 'react-icons/fa';
import { projectService } from '../../services/projectService';
import { evaluationService } from '../../services/evaluationService';
import { userService } from '../../services/userService';
import EvaluatorProjectCard2 from '../../components/management/project/evaluador/EvaluatorProjectCard2';
import '../../styles/pages/user/EvaluatorHistoryPage.css';

const EvaluatorHistoryPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentEvaluator, setCurrentEvaluator] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Cargando historial de evaluaciones...');
    loadEvaluationHistory();
  }, []);

  // Función auxiliar para extraer proyectoId de una evaluación
  const extractProyectoIdFromEvaluation = (evaluation) => {
    const possibleKeys = [
      'proyectoId',
      'proyecto_id',
      'projectId',
      'idProyecto',
      'proyecto.id',
      'proyecto.proyectoId'
    ];

    for (const key of possibleKeys) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let value = evaluation;
        for (const part of parts) {
          value = value?.[part];
          if (!value) break;
        }
        if (value) return value;
      } else {
        if (evaluation[key]) return evaluation[key];
      }
    }

    return null;
  };

  // Método de respaldo: cargar historial desde proyectos
  const loadHistoryFromProjectsFallback = async () => {
    console.log('🔄 Usando método de respaldo para historial...');
    
    const evaluadores = await userService.getEvaluadores();
    const currentUser = evaluadores[0];
    setCurrentEvaluator(currentUser);

    const allProjects = await projectService.getAll();
    
    // Filtrar proyectos que están en estados de "completado" o "evaluado"
    const historyProjects = allProjects.filter(project => {
      const isCompleted = project.estado === 'Evaluado' || 
                         project.estado === 'COMPLETADO' ||
                         project.estado === 'COMPLETADA';
      
      const hasThisEvaluator = project.evaluadorAsignado && 
        (project.evaluadorAsignado.includes(currentUser.nombre) ||
         project.evaluadorAsignado.includes(currentUser.id?.toString()));

      return isCompleted && hasThisEvaluator;
    });

    console.log('📋 Historial desde respaldo:', historyProjects);
    setProjects(historyProjects);
    setFilteredProjects(historyProjects);
  };

  // Cargar HISTORIAL de evaluaciones (proyectos aceptados y calificados)
  const loadEvaluationHistory = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener el evaluador actual
      const evaluadores = await userService.getEvaluadores();
      const currentUser = evaluadores[0];
      setCurrentEvaluator(currentUser);
      
      console.log('👤 Evaluador actual para historial:', currentUser);

      // 2. Obtener evaluaciones COMPLETADAS del evaluador
      let completedEvaluations = [];
      try {
        completedEvaluations = await evaluationService.getCompletedEvaluations();
        console.log('✅ Evaluaciones completadas obtenidas:', completedEvaluations);
      } catch (error) {
        console.warn('⚠️ No se pudieron obtener evaluaciones completadas:', error);
      }

      // 3. Obtener evaluaciones ACEPTADAS (pero no necesariamente completadas)
      let acceptedEvaluations = [];
      try {
        acceptedEvaluations = await evaluationService.getEvaluationsByStatus('ACEPTADA');
        console.log('✅ Evaluaciones aceptadas obtenidas:', acceptedEvaluations);
      } catch (error) {
        console.warn('⚠️ No se pudieron obtener evaluaciones aceptadas:', error);
      }

      // 4. Combinar y filtrar evaluaciones únicas
      const allEvaluations = [...completedEvaluations, ...acceptedEvaluations];
      const uniqueEvaluations = allEvaluations.filter((evalItem, index, self) => 
        index === self.findIndex(e => e.id === evalItem.id)
      );

      console.log('📊 Evaluaciones únicas para historial:', uniqueEvaluations);

      // 5. Obtener todos los proyectos para mapear
      const allProjects = await projectService.getAll();
      console.log('📚 Todos los proyectos disponibles:', allProjects);

      // 6. Mapear evaluaciones a proyectos completos
      const historyProjects = uniqueEvaluations.map(evaluation => {
        try {
          // Extraer proyectoId de la evaluación - CORREGIDO: sin this
          const proyectoId = evaluation.proyectoId || 
                            evaluation.proyecto?.id || 
                            extractProyectoIdFromEvaluation(evaluation);

          if (!proyectoId) {
            console.warn('⚠️ Evaluación sin proyectoId:', evaluation.id);
            return null;
          }

          // Buscar proyecto completo
          const projectDetails = allProjects.find(p => 
            Number(p.id) === Number(proyectoId)
          );

          if (!projectDetails) {
            console.warn(`⚠️ Proyecto ${proyectoId} no encontrado para evaluación ${evaluation.id}`);
            return null;
          }

          // Construir objeto completo para el historial
          const historyProject = {
            // Información del proyecto
            ...projectDetails,
            
            // Información específica de la evaluación
            evaluacionId: evaluation.id,
            evaluacionEstado: evaluation.estado,
            fechaAsignacion: evaluation.fechaAsignacion || evaluation.fecha_asignacion,
            fechaAceptacion: evaluation.fechaAceptacion || evaluation.fecha_aceptacion,
            fechaCompletacion: evaluation.fechaCompletacion || evaluation.fecha_completacion,
            fechaLimite: evaluation.fechaLimite || evaluation.fecha_limite,
            
            // Información de calificación (si existe)
            calificacionFinal: evaluation.calificacionFinal || evaluation.calificacion_final,
            comentarios: evaluation.comentarios || evaluation.observaciones,
            
            // Metadata
            isCompleted: evaluation.estado === 'COMPLETADA',
            isAccepted: evaluation.estado === 'ACEPTADA',
            hasEvaluation: true
          };

          console.log('✅ Proyecto agregado al historial:', historyProject);
          return historyProject;

        } catch (error) {
          console.error('❌ Error procesando evaluación para historial:', evaluation.id, error);
          return null;
        }
      }).filter(project => project !== null);

      console.log('🎯 Historial final de proyectos:', historyProjects);
      setProjects(historyProjects);
      setFilteredProjects(historyProjects);

    } catch (error) {
      console.error('❌ Error cargando historial de evaluaciones:', error);
      
      // Fallback: intentar cargar desde proyectos
      try {
        await loadHistoryFromProjectsFallback();
      } catch (fallbackError) {
        console.error('❌ Error en carga de respaldo:', fallbackError);
        setProjects([]);
        setFilteredProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros de búsqueda y estado para HISTORIAL
  useEffect(() => {
    if (!searchTerm && statusFilter === 'all') {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => {
      // Filtro de búsqueda
      const matchesSearch = !searchTerm || 
        project.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.palabrasClave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id?.toString().includes(searchTerm);

      // Filtro de estado ESPECÍFICO para historial
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'completed' && project.isCompleted) ||
        (statusFilter === 'accepted' && project.isAccepted && !project.isCompleted);

      return matchesSearch && matchesStatus;
    });

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  const handleReviewEvaluation = (project) => {
    console.log('📋 Revisando evaluación del proyecto:', project);
    
    const evaluationId = project.evaluacionId || project.id;
    navigate(`/evaluador/evaluacion/${evaluationId}/review`);
  };

  const handleViewDetails = (project) => {
    console.log('📍 Abriendo detalles del proyecto:', project);
    // El modal se maneja dentro del EvaluatorProjectCard2
  };

  // Función para recargar historial
  const handleReload = () => {
    loadEvaluationHistory();
  };

  const getStatusStats = () => {
    const completed = projects.filter(p => p.isCompleted).length;
    const accepted = projects.filter(p => p.isAccepted && !p.isCompleted).length;
    const total = projects.length;

    return { completed, accepted, total };
  };

  const statusStats = getStatusStats();

  return (
    <div className="evaluator-history-page">
      {/* Header ESPECÍFICO para historial */}
      <div className="evaluator-history-header">
        
        <div className="evaluator-history-stats">
          <div className="evaluator-history-stat-card">
            <span className="evaluator-history-stat-number">{statusStats.completed}</span>
            <span className="evaluator-history-stat-label">Completados</span>
          </div>
          <div className="evaluator-history-stat-card">
            <span className="evaluator-history-stat-number">{statusStats.accepted}</span>
            <span className="evaluator-history-stat-label">En Progreso</span>
          </div>
          <div className="evaluator-history-stat-card">
            <span className="evaluator-history-stat-number">{statusStats.total}</span>
            <span className="evaluator-history-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda ESPECÍFICOS para historial */}
      <div className="evaluator-history-filters">
        <div className="evaluator-history-search-box">
          <FaSearch className="evaluator-history-search-icon" />
          <input
            type="text"
            placeholder="Buscar en historial por título, código, palabras clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="evaluator-history-search-input"
          />
        </div>
        
        <div className="evaluator-history-filter-group">
          <FaFilter className="evaluator-history-filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="evaluator-history-filter-select"
          >
            <option value="all">Todo el historial</option>
            <option value="completed">Evaluaciones Completadas</option>
            <option value="accepted">En Proceso</option>
          </select>
        </div>

        <button 
          className="evaluator-reload-btn"
          onClick={handleReload}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar Historial'}
        </button>
      </div>

      {/* Contenido */}
      <div className="evaluator-history-content">
        {loading ? (
          <div className="evaluator-history-loading">
            <div className="evaluator-history-spinner"></div>
            <p>Cargando historial de evaluaciones...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="evaluator-history-empty">
            <FaHistory className="evaluator-history-empty-icon" />
            {projects.length === 0 ? (
              <>
                <h3>No hay historial de evaluaciones</h3>
                <p>No se encontraron proyectos evaluados en tu historial.</p>
                <div className="evaluator-help-info">
                  <p>El historial mostrará los proyectos que hayas aceptado y evaluado.</p>
                  <button 
                    className="evaluator-reload-btn"
                    onClick={handleReload}
                  >
                    Reintentar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>No se encontraron evaluaciones</h3>
                <p>No hay proyectos en el historial que coincidan con los filtros aplicados.</p>
                <button 
                  className="evaluator-clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Resumen de resultados */}
            <div className="evaluator-results-summary">
              <p>
                Mostrando {filteredProjects.length} de {projects.length} evaluaciones en historial
                {searchTerm && ` para "${searchTerm}"`}
                {statusFilter !== 'all' && 
                  ` • ${statusFilter === 'completed' ? 'Completadas' : 'En proceso'}`}
              </p>
            </div>

            {/* Grid de proyectos del historial */}
            <div className="evaluator-projects-grid">
              {filteredProjects.map(project => (
                <EvaluatorProjectCard2
                  key={project.evaluacionId || project.id}
                  project={project}
                  onReviewEvaluation={handleReviewEvaluation}
                  onViewDetails={handleViewDetails}
                  isHistory={true} // Prop para indicar que es historial
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluatorHistoryPage;