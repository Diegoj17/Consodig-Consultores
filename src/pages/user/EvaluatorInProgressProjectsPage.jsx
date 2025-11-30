import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaClipboardList, FaSearch, FaFileAlt, FaDownload, 
  FaEye, FaExclamationTriangle, FaClock 
} from 'react-icons/fa';
import evaluationService from '../../services/evaluationService';
import projectService from '../../services/projectService';
import EvaluatorProjectCard2 from '../../components/management/project/evaluador/EvaluatorProjectCard2';
import '../../styles/pages/user/EvaluatorInProgressProjectsPage.css';

const EvaluatorInProgressProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  

  const loadInProgressProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando proyectos en evaluación...');
      
      // Obtener evaluaciones en progreso (ACEPTADA con progreso 1-99%)
      const evaluations = await evaluationService.getInProgressEvaluations();
      console.log('✅ Evaluaciones en progreso:', evaluations);
      
      if (!evaluations || evaluations.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Cargar todos los proyectos para hacer el mapeo
      const allProjects = await projectService.getAll();
      console.log('✅ Proyectos disponibles:', allProjects);

      // Mapear evaluaciones con proyectos
      const projectsWithDetails = await Promise.all(
        evaluations.map(async (evaluation) => {
          try {
            // Extraer proyectoId de la evaluación
            const proyectoId = extractProyectoId(evaluation);
            
            if (!proyectoId) {
              console.error('❌ No se pudo extraer proyectoId de:', evaluation);
              return null;
            }

            // Buscar proyecto completo
            const projectDetails = allProjects.find(p => Number(p.id) === Number(proyectoId));
            
            if (!projectDetails) {
              console.error(`❌ Proyecto ${proyectoId} no encontrado`);
              return null;
            }

            // Calcular progreso
            const progress = evaluationService.calculateProgress(evaluation);

            // Enriquecer con todos los campos del proyecto para que la tarjeta
            // pueda mostrar toda la información (sin formatear fechas aquí)
            return {
              // Spread del proyecto completo
              ...projectDetails,

              // Información de la evaluación
              id: evaluation.id,
              evaluacionId: evaluation.id,
              estado: 'En evaluación',
              progreso: progress,
              fechaAceptacion: evaluation.fechaAceptacion || evaluation.fecha_aceptacion,
              fechaAsignacion: evaluation.fechaAsignacion || evaluation.fecha_asignacion,
              fechaCompletacion: evaluation.fechaCompletacion || evaluation.fecha_completacion,
              fechaLimite: evaluation.fechaLimite || evaluation.fecha_limite,

              // Metadata
              proyectoId: proyectoId
            };

          } catch (err) {
            console.error('❌ Error procesando evaluación:', evaluation.id, err);
            return null;
          }
        })
      );

      const validProjects = projectsWithDetails.filter(p => p !== null);
      console.log('✅ Proyectos en evaluación cargados:', validProjects);
      
      setProjects(validProjects);

    } catch (err) {
      console.error('❌ Error cargando proyectos en evaluación:', err);
      setError('Error al cargar los proyectos en evaluación: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInProgressProjects();
  }, [loadInProgressProjects]);

  const extractProyectoId = (evaluation) => {
    const possibleKeys = [
      'proyectoId', 'proyecto_id', 'projectId', 'idProyecto'
    ];
    
    for (const key of possibleKeys) {
      if (evaluation[key]) {
        return evaluation[key];
      }
    }
    
    if (evaluation.proyecto) {
      return evaluation.proyecto.id || evaluation.proyecto.proyectoId;
    }
    
    return null;
  };

  

  const handleEvaluate = (project) => {
    console.log('📝 Navegando a evaluación:', project.evaluacionId);
    navigate(`/evaluador/evaluate/${project.evaluacionId}`);
  };

  const handleReviewEvaluation = (project) => {
    console.log('📋 Revisando evaluación del proyecto:', project);
    const evaluationId = project.evaluacionId || project.id;
    navigate(`/evaluador/evaluacion/${evaluationId}/review`);
  };

  const filteredProjects = projects.filter(project =>
    project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.palabrasClave && project.palabrasClave.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="evaluator-inprogress-projects">
        <div className="evaluator-inprogress-loading">
          <div className="evaluator-inprogress-spinner"></div>
          <p>Cargando proyectos en evaluación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluator-inprogress-projects">
        <div className="evaluator-inprogress-error">
          <FaExclamationTriangle className="evaluator-inprogress-error-icon" />
          <h3>Error al cargar proyectos</h3>
          <p>{error}</p>
          <button onClick={loadInProgressProjects} className="evaluator-inprogress-btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluator-inprogress-projects">

      <div className="evaluator-inprogress-search-section">
        <div className="evaluator-inprogress-search-bar">
          <FaSearch className="evaluator-inprogress-search-icon" />
          <input
            type="text"
            placeholder="Buscar proyectos en evaluación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="evaluator-inprogress-search-input"
          />
        </div>
        <div className="evaluator-inprogress-search-info">
          <strong>{filteredProjects.length}</strong> proyecto{filteredProjects.length !== 1 ? 's' : ''} en evaluación
        </div>
      </div>

      <div className="evaluator-inprogress-grid">
          {filteredProjects.length === 0 ? (
          <div className="evaluator-inprogress-empty">
            <div className="evaluator-inprogress-empty-icon">
              <FaClipboardList />
            </div>
            <h3>No hay proyectos en evaluación</h3>
            <p>
              {searchTerm 
                ? `No se encontraron proyectos que coincidan con "${searchTerm}"`
                : 'No tienes proyectos en proceso de evaluación actualmente.'
              }
            </p>
          </div>
        ) : (
          <div className="evaluator-inprogress-cards-wrapper">
            {filteredProjects.map((projectItem, idx) => (
              <EvaluatorProjectCard2
                key={projectItem.evaluacionId || projectItem.proyectoId || idx}
                project={{
                  // prefer full project details when available
                  titulo: projectItem.titulo,
                  resumen: projectItem.resumen,
                  palabrasClave: projectItem.palabrasClave,
                  investigadorPrincipal: projectItem.investigadorPrincipal,
                  nivelEstudios: projectItem.nivelEstudios,
                  objetivoGeneral: projectItem.objetivoGeneral,
                  objetivosEspecificos: projectItem.objetivosEspecificos,
                  justificacion: projectItem.justificacion,
                  lineasInvestigacionNames: projectItem.lineasInvestigacionNames,
                  archivos: projectItem.archivos || projectItem.archivos || [],
                  fechaCreacion: projectItem.fechaCreacion || projectItem.fechaEnvio || projectItem.fechaAceptacion,
                  fechaEnvio: projectItem.fechaEnvio || projectItem.fechaAceptacion,
                  estado: projectItem.estado || 'En evaluación',
                  evaluacionId: projectItem.evaluacionId,
                  id: projectItem.proyectoId || projectItem.id || null,
                }}
                showFull={true}
                onStartEvaluation={() => handleEvaluate(projectItem)}
                onReviewEvaluation={() => handleReviewEvaluation(projectItem)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluatorInProgressProjectsPage;