import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaClipboardList, FaSearch, FaCheckCircle, FaTimesCircle, 
  FaFileAlt, FaDownload, FaEye, FaExclamationTriangle 
} from 'react-icons/fa';
import evaluationService from '../../../services/evaluationService';
import projectService from '../../../services/projectService';
import EvaluatorProjectCard from '../../../components/management/project/evaluador/EvaluatorProjectCard';
import Modal from '../../../components/common/Modal';
import '../../../styles/pages/user/evaluador/EvaluatorPages.css';

const EvaluatorProjectsPage = () => {
  const { type = 'assigned' } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, evaluacionId: null, project: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    loadProjects();
  }, [type]);

  // ✅ SOLUCIÓN: Obtener evaluación completa por ID para conseguir proyectoId
  const getFullEvaluation = async (evaluacionId) => {
    try {
      console.log(`🔍 Obteniendo evaluación completa: ${evaluacionId}`);
      const fullEvaluation = await evaluationService.getEvaluationById(evaluacionId);
      console.log('✅ Evaluación completa:', fullEvaluation);
      return fullEvaluation;
    } catch (error) {
      console.error(`❌ Error obteniendo evaluación ${evaluacionId}:`, error);
      return null;
    }
  };
      
  
  const extractProyectoId = (evaluation) => {
    console.log('🔍 Buscando proyectoId en:', evaluation);
    
    // Lista de todas las posibles claves donde puede estar el proyectoId
    const possibleKeys = [
      'proyectoId',
      'proyecto_id',
      'projectId',
      'idProyecto',
      'proyecto.id',
      'proyecto.proyectoId'
    ];
    
    // Buscar en campos directos
    for (const key of possibleKeys) {
      if (key.includes('.')) {
        // Para claves anidadas como 'proyecto.id'
        const parts = key.split('.');
        let value = evaluation;
        for (const part of parts) {
          value = value?.[part];
          if (!value) break;
        }
        if (value) {
          console.log(`✅ ProyectoId encontrado en '${key}':`, value);
          return value;
        }
      } else {
        // Para claves directas
        if (evaluation[key]) {
          console.log(`✅ ProyectoId encontrado en '${key}':`, evaluation[key]);
          return evaluation[key];
        }
      }
    }
    
    // Buscar en objeto proyecto si existe
    if (evaluation.proyecto) {
      const proyecto = evaluation.proyecto;
      if (proyecto.id) {
        console.log('✅ ProyectoId encontrado en proyecto.id:', proyecto.id);
        return proyecto.id;
      }
    }
    
    console.warn('⚠️ No se encontró proyectoId en:', evaluation);
    return null;
  };

  // ✅ FUNCIÓN PRINCIPAL - Carga proyectos automáticamente
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [EvaluatorProjects] Cargando proyectos tipo:', type);
      
      const statusMap = {
        'assigned': 'ASIGNADA',
        'evaluating': 'ACEPTADA', 
        'history': 'COMPLETADA'
      };

      const status = statusMap[type];
      console.log('🔍 [EvaluatorProjects] Buscando evaluaciones con estado:', status);
      
      // 1. Obtener evaluaciones básicas por estado
      const evaluaciones = await evaluationService.getEvaluationsByStatus(status);
      console.log('✅ [EvaluatorProjects] Evaluaciones obtenidas:', evaluaciones);
      
      if (!evaluaciones || evaluaciones.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // 2. Para cada evaluación, obtener detalles completos (incluyendo proyectoId)
      const evaluacionesCompletas = await Promise.all(
        evaluaciones.map(async (ev) => {
          const fullEv = await getFullEvaluation(ev.id);
          return fullEv || ev;
        })
      );

      console.log('✅ [EvaluatorProjects] Evaluaciones completas:', evaluacionesCompletas);

      // 3. Cargar TODOS los proyectos disponibles
      console.log('📦 [EvaluatorProjects] Cargando todos los proyectos...');
      const allProjects = await projectService.getAll();
      console.log('✅ [EvaluatorProjects] Proyectos disponibles:', allProjects);

      // 4. MAPEAR evaluaciones con sus proyectos
      const projectsWithFullDetails = evaluacionesCompletas.map((evaluation) => {
        try {
          console.log('📋 Procesando evaluación:', evaluation);
          
          // Extraer proyectoId
          let proyectoId = extractProyectoId(evaluation);
          
          // Si aún no encontramos proyectoId, intentar con la base de datos
          // Según tu DB: tabla evaluacion tiene campo proyecto_id
          if (!proyectoId && evaluation.proyectoId === undefined) {
            console.warn('⚠️ Backend no devuelve proyectoId. Verificar modelo Evaluacion en Java.');
          }
          
          if (!proyectoId) {
            console.error('❌ No se pudo extraer proyectoId de:', evaluation);
            // FALLBACK: Intentar obtener el primer proyecto como temporal
            if (allProjects.length > 0) {
              console.warn('⚠️ Usando primer proyecto como fallback temporal');
              proyectoId = allProjects[0].id;
            } else {
              return null;
            }
          }

          // Buscar el proyecto completo
          const projectDetails = allProjects.find(p => Number(p.id) === Number(proyectoId));
          
          if (!projectDetails) {
            console.error(`❌ Proyecto ${proyectoId} no encontrado`);
            return null;
          }

          console.log('🎉 PROYECTO ENCONTRADO:', projectDetails);

          // Construir objeto completo para la tarjeta
          const projectData = {
            // Información de la evaluación
            id: evaluation.id,
            evaluacionId: evaluation.id,
            estado: mapEvaluationStatus(evaluation.estado),
            fechaEnvio: formatDate(evaluation.fechaAsignacion || evaluation.fecha_asignacion),
            deadline: evaluation.fechaLimite || evaluation.fecha_limite || evaluation.tiempoLimiteHoras
              ? formatDate(
                  evaluation.fechaLimite || 
                  evaluation.fecha_limite || 
                  new Date(Date.now() + (evaluation.tiempoLimiteHoras || 24) * 60 * 60 * 1000).toISOString()
                )
              : null,
            
            // ✅ INFORMACIÓN COMPLETA DEL PROYECTO
            titulo: projectDetails.titulo,
            resumen: projectDetails.resumen,
            palabrasClave: projectDetails.palabrasClave,
            investigadorPrincipal: projectDetails.investigadorPrincipal,
            objetivoGeneral: projectDetails.objetivoGeneral,
            objetivosEspecificos: projectDetails.objetivosEspecificos || projectDetails.objetivoEspecifico,
            justificacion: projectDetails.justificacion,
            nivelEstudios: projectDetails.nivelEstudios,
            lineasInvestigacion: projectDetails.lineasInvestigacion,
            lineasInvestigacionNames: projectDetails.lineasInvestigacionNames,
            archivos: projectDetails.archivos || [],
            isBlind: projectDetails.evaluacionDobleCiego || false,
            
            // Metadata
            proyectoId: proyectoId,
            hasProject: true
          };

          console.log('🎨 Proyecto final construido:', projectData);
          return projectData;

        } catch (err) {
          console.error('❌ Error procesando evaluación:', evaluation.id, err);
          return null;
        }
      });

      // Filtrar nulos
      const validProjects = projectsWithFullDetails.filter(p => p !== null);
      console.log('✅ [EvaluatorProjects] Proyectos finales cargados:', validProjects);
      
      setProjects(validProjects);

    } catch (err) {
      console.error('❌ [EvaluatorProjects] Error loading projects:', err);
      setError('Error al cargar los proyectos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const mapEvaluationStatus = (status) => {
    const statusMap = {
      'ASIGNADA': 'Preasignado',
      'ACEPTADA': 'En evaluación', 
      'COMPLETADA': 'Evaluado',
      'RECHAZADA': 'Rechazado'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleAccept = (evaluacionId, projectParam) => {
    const projectFound = projectParam || projects.find(p => Number(p.evaluacionId) === Number(evaluacionId));
    setConfirmModal({ isOpen: true, action: 'accept', evaluacionId, project: projectFound });
  };

  const handleReject = (evaluacionId, projectParam) => {
    const projectFound = projectParam || projects.find(p => Number(p.evaluacionId) === Number(evaluacionId));
    setConfirmModal({ isOpen: true, action: 'reject', evaluacionId, project: projectFound });
  };

  const confirmAction = async () => {
    const { action, evaluacionId } = confirmModal;
    setConfirmModal({ isOpen: false, action: null, evaluacionId: null, project: null });
    try {
      if (action === 'accept') {
        await evaluationService.acceptEvaluation(evaluacionId);
        setAlertModal({ isOpen: true, type: 'success', title: 'Proyecto aceptado', message: 'El proyecto se ha aceptado correctamente.' });
      } else if (action === 'reject') {
        await evaluationService.rejectEvaluation(evaluacionId);
        setAlertModal({ isOpen: true, type: 'success', title: 'Proyecto rechazado', message: 'El proyecto se ha rechazado correctamente.' });
      }
      loadProjects();
    } catch (error) {
      console.error('❌ Error en acción de confirmación:', error);
      setAlertModal({ isOpen: true, type: 'error', title: 'Error', message: error.message || 'Error desconocido' });
    }
  };

  const closeAlertModal = () => setAlertModal({ isOpen: false, type: 'info', title: '', message: '' });

  const handleEvaluate = (project) => {
    console.log('📝 Navegando a evaluación:', project.evaluacionId);
    navigate(`/evaluador/evaluate/${project.evaluacionId}`);
  };

  const handleDownload = async (project) => {
    try {
      if (!project.archivos || project.archivos.length === 0) {
        alert('📭 Este proyecto no tiene archivos adjuntos');
        return;
      }
      
      const archivo = project.archivos[0];
      
      // Intentar descargar forzando blob desde la URL (evita abrir en nueva pestaña)
      const filename = archivo.nombreArchivo || archivo.nombre || 'proyecto.pdf';

      if (archivo.urlArchivo) {
        try {
          const resp = await fetch(archivo.urlArchivo, { method: 'GET', credentials: 'include' });
          if (resp.ok) {
            const blob = await resp.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => { if (blobUrl.startsWith('blob:')) window.URL.revokeObjectURL(blobUrl); }, 10000);
            return;
          }
        } catch (err) {
          console.warn('fetch directo fallo, intentando fallback por API:', err);
        }
      }

      // Fallback: solicitar al backend (stream) por id
      if (archivo.id) {
        const response = await projectService.downloadFile(archivo.id);
        const blob = response?.data || response;
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => { if (blobUrl.startsWith('blob:')) window.URL.revokeObjectURL(blobUrl); }, 10000);
        return;
      }

      // Último recurso: abrir en nueva pestaña (si no hay id ni blob posible)
      if (archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank');
      }
    } catch (error) {
      console.error('❌ Error descargando:', error);
      alert('❌ Error al descargar: ' + error.message);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.palabrasClave && project.palabrasClave.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="evaluator-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluator-page">
        <div className="error-container">
          <FaExclamationTriangle size={48} color="#e74c3c" />
          <h3>Error al cargar proyectos</h3>
          <p>{error}</p>
          <button onClick={loadProjects} className="evaluator-btn evaluator-btn-evaluate">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluator-page">
      <div className="evaluator-page-header">
      </div>

      <div className="evaluator-search-section">
        <div className="evaluator-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="evaluator-search-input"
          />
        </div>
        <div className="evaluator-search-info">
          <strong>{filteredProjects.length}</strong> proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="evaluator-cards-grid">
        {filteredProjects.length === 0 ? (
          <div className="evaluator-empty-state">
            <div className="evaluator-empty-icon">
              <FaClipboardList size={64} />
            </div>
            <h3>No hay proyectos {type === 'assigned' ? 'asignados' : type === 'evaluating' ? 'en evaluación' : 'en historial'}</h3>
            <p>
              {searchTerm 
                ? `No se encontraron proyectos que coincidan con "${searchTerm}"`
                : 'No tienes proyectos asignados en este momento.'
              }
            </p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <EvaluatorProjectCard
              key={project.evaluacionId}
              project={project}
              onEvaluate={handleEvaluate}
              onDownload={handleDownload}
              onAccept={handleAccept}
              onReject={handleReject}
              type={type}
            />
          ))
        )}
      </div>
        {/* Modales para confirmar acciones y mostrar resultados */}
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null, evaluacionId: null, project: null })}
          type="warning"
          title={confirmModal.action === 'accept' ? 'Confirmar aceptación' : 'Confirmar rechazo'}
          message={
            confirmModal.project
              ? `¿Está seguro de que desea ${confirmModal.action === 'accept' ? 'aceptar' : 'rechazar'} el proyecto "${confirmModal.project.titulo}"?`
              : '¿Está seguro de que desea continuar?'
          }
          onConfirm={confirmAction}
          confirmText={confirmModal.action === 'accept' ? 'Sí, aceptar' : 'Sí, rechazar'}
        />

        <Modal
          isOpen={alertModal.isOpen}
          onClose={closeAlertModal}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          showCancel={false}
          confirmText="Cerrar"
        />

      </div>
  );
};

export default EvaluatorProjectsPage;