// src/pages/admin/ProjectsMainPage.js
import React, { useState, useMemo, useEffect } from 'react';
import { FaFileAlt, FaSync } from 'react-icons/fa';
import ProjectStats from '../../components/management/project/admin/ProjectStats';
import ProjectFilters from '../../components/management/project/admin/ProjectFilters';
import ProjectGrid from '../../components/management/project/admin/ProjectGrid';
import ProjectModal from '../../components/management/project/admin/ProjectModal';
import Modal from '../../components/common/Modal';
import { projectService } from '../../services/projectService';
import userService from '../../services/userService';
import '../../styles/pages/admin/ProjectsMainPage.css';

const ProjectsMainPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null
  });

   // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  // Estado real para proyectos desde el backend
  const [projects, setProjects] = useState([]);

  // Cargar proyectos desde el backend
  const loadProjects = async () => {
  try {
    setIsLoading(true);
    console.log('🟡 [ProjectsMainPage] Cargando proyectos desde el backend...');
    
    const projectsData = await projectService.getAll();
    console.log('🟢 [ProjectsMainPage] Proyectos cargados y limpiados:', projectsData);
    
    // Mapear los datos ya limpios del backend al formato esperado por el frontend
    const formattedProjects = await Promise.all(projectsData.map(async (project) => {
      // Los archivos ya vienen limpios del service
      const archivos = project.archivos || [];

      // Resolver investigador si hay un investigadorId
      let investigadorObj = project.investigador || null;
      if (!investigadorObj && project.investigadorId) {
        try {
          investigadorObj = await userService.getEvaluandoById(project.investigadorId);
        } catch {
          investigadorObj = null;
        }
        if (!investigadorObj && project.investigadorId) {
          try {
            investigadorObj = await userService.getEvaluadorById(project.investigadorId);
          } catch {
            investigadorObj = null;
          }
        }
        if (!investigadorObj && project.investigadorId) {
          try {
            investigadorObj = await userService.getAdminById(project.investigadorId);
          } catch {
            investigadorObj = null;
          }
        }
      }

      const resolvedName = investigadorObj ? `${investigadorObj.nombre || investigadorObj.name || ''}${investigadorObj.apellido ? ' ' + investigadorObj.apellido : ''}`.trim() : (project.investigadorPrincipal || 'Por definir');

      return {
        id: project.id,
        titulo: project.titulo || '',
        investigadorId: project.investigadorId || project.investigador?.id || null,
        investigador: investigadorObj || null,
        investigadorPrincipal: resolvedName,
        fechaEnvio: project.fechaCreacion || project.fechaEnvio || new Date().toISOString().split('T')[0],
        estado: project.estado || 'Pendiente',
        evaluadorAsignado: project.evaluadorAsignado || null,
        resumen: project.resumen || '',
        palabrasClave: project.palabrasClave || '',
        objetivoGeneral: project.objetivoGeneral || '',
        objetivosEspecificos: project.objetivoEspecifico || project.objetivosEspecificos || '',
        justificacion: project.justificacion || '',
        nivelEstudios: project.nivelEstudios || '',
        lineasInvestigacion: project.lineasInvestigacion || [],
        lineasInvestigacionIds: project.lineasInvestigacionIds || [],
        areaConocimiento: project.areaConocimiento || 'General',
        institucion: project.institucion || 'Por definir',
        presupuesto: project.presupuesto || '0',
        duracionMeses: project.duracionMeses || '12',
        archivos: archivos, // Ya vienen limpios
        totalArchivos: archivos.length
      };
    }));
    
    console.log('🟢 [ProjectsMainPage] Proyectos formateados:', formattedProjects);
    
    // Calcular estadísticas
    const totalArchivos = formattedProjects.reduce((sum, project) => sum + project.totalArchivos, 0);
    const proyectosConArchivos = formattedProjects.filter(project => project.totalArchivos > 0).length;
    
    console.log(`📊 [ProjectsMainPage] Estadísticas: ${totalArchivos} archivos en ${proyectosConArchivos} proyectos`);
    
    setProjects(formattedProjects);
    
  } catch (error) {
    console.error('❌ [ProjectsMainPage] Error cargando proyectos:', error);
    
    // Mensaje de error más específico
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      alert('Error de conexión. Verifique que el servidor esté funcionando y la conexión a internet.');
    } else if (error.response?.status === 404) {
      alert('No se pudo conectar con el servidor de proyectos.');
    } else {
      alert('Error al cargar los proyectos. Por favor, intente nuevamente.');
    }
  } finally {
    setIsLoading(false);
  }
};


  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.investigadorPrincipal && project.investigadorPrincipal.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'todos' || project.estado === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filterStatus]);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setModalMode('view');
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setModalMode('edit');
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setModalMode('create');
  };

  const handleSaveProject = async (formData, mode) => {
    setIsSubmitting(true);
    
    try {
      console.log('🟡 [ProjectsMainPage] Guardando proyecto:', { mode, formData });
      
      if (mode === 'create') {
        // Crear nuevo proyecto en el backend
        const newProject = await projectService.create(formData);
        console.log('🟢 [ProjectsMainPage] Proyecto creado en backend:', newProject);
        
        // Actualizar estado local
        const formattedProject = {
          id: newProject.id,
          titulo: newProject.titulo,
          investigadorPrincipal: formData.investigadorPrincipal || 'Por definir',
          investigadorId: newProject.investigadorId || formData.investigadorId || null,
          fechaEnvio: newProject.fechaCreacion || new Date().toISOString().split('T')[0],
          estado: 'Pendiente',
          evaluadorAsignado: null,
          resumen: newProject.resumen,
          palabrasClave: newProject.palabrasClave,
          objetivoGeneral: newProject.objetivoGeneral,
          objetivosEspecificos: newProject.objetivoEspecifico,
          justificacion: newProject.justificacion,
          nivelEstudios: newProject.nivelEstudios,
          lineasInvestigacion: newProject.lineasInvestigacion || [],
          lineasInvestigacionIds: newProject.lineasInvestigacionIds || [],
          areaConocimiento: 'General',
          institucion: 'Por definir',
          presupuesto: '0',
          duracionMeses: '12'
        };
        
        setProjects(prev => [...prev, formattedProject]);
        
      } else {
        // Actualizar proyecto existente en el backend
        const updatedProject = await projectService.update(selectedProject.id, formData);
        console.log('🟢 [ProjectsMainPage] Proyecto actualizado en backend:', updatedProject);
        
        // Actualizar estado local
        setProjects(prev => 
          prev.map(p => 
            p.id === selectedProject.id 
              ? { 
                  ...p, 
                  ...formData,
                  titulo: updatedProject.titulo,
                  resumen: updatedProject.resumen,
                  palabrasClave: updatedProject.palabrasClave,
                  objetivoGeneral: updatedProject.objetivoGeneral,
                  objetivosEspecificos: updatedProject.objetivoEspecifico,
                  justificacion: updatedProject.justificacion,
                  nivelEstudios: updatedProject.nivelEstudios
                } 
              : p
          )
        );
      }
      
      // Cerrar modal después de guardar
      setSelectedProject(null);
      setModalMode('view');
      
    } catch (error) {
      console.error('❌ [ProjectsMainPage] Error guardando proyecto:', error);
      alert('Error al guardar el proyecto. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setConfirmState({
      open: true,
      type: 'warning',
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        try {
          console.log('🟡 [ProjectsMainPage] Eliminando proyecto:', projectId);
          await projectService.delete(projectId);
          console.log('🟢 [ProjectsMainPage] Proyecto eliminado del backend');
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setSelectedProject(null);
          setModalMode('view');
        } catch (error) {
          console.error('❌ [ProjectsMainPage] Error eliminando proyecto:', error);
          alert('Error al eliminar el proyecto. Por favor, intente nuevamente.');
        }
      }
    });
  };

  const handleReviewEvaluation = (projectId) => {
    console.log(`Revisando evaluación del proyecto ${projectId}`);
    // Lógica para revisar evaluación
  };

  const handleRefreshProjects = () => {
    loadProjects();
  };

  return (
    <div className="projects-main-page">
      {/* Header con estadísticas - igual que en usuarios */}
      <ProjectStats 
        projects={projects}
        onCreateProject={handleCreateProject}
      />

      {/* Filtros */}
      <ProjectFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        isLoading={isLoading}
        onRefresh={handleRefreshProjects}
      />

      {/* Contenido principal */}
      {isLoading ? (
        <div className="projects-loading">
          <FaSync className="spinning" />
          <p>Cargando proyectos...</p>
        </div>
      ) : (
        <div className="projects-content">
          {filteredProjects.length > 0 ? (
            <ProjectGrid
              projects={filteredProjects}
              onViewDetails={handleViewDetails}
              onEditProject={handleEditProject}
              onReviewEvaluation={handleReviewEvaluation}
            />
          ) : (
            <div className="projects-empty-state">
              <FaFileAlt className="projects-empty-icon" />
              <h3>No se encontraron proyectos</h3>
              <p>
                {searchTerm || filterStatus !== 'todos' 
                  ? 'No hay proyectos que coincidan con los filtros aplicados' 
                  : 'No hay proyectos registrados en el sistema'
                }
              </p>
              {!searchTerm && filterStatus === 'todos' && (
                <button 
                  className="projects-btn-primary" 
                  onClick={handleCreateProject}
                >
                  <FaFileAlt />
                  Crear primer proyecto
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de proyecto */}
      {(selectedProject || modalMode === 'create') && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            setModalMode('view');
          }}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          mode={modalMode}
          isSubmitting={isSubmitting}
        />
      )}
      <Modal
        isOpen={confirmState.open}
        onClose={() => setConfirmState(prev => ({ ...prev, open: false }))}
        type={confirmState.type}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          if (typeof confirmState.onConfirm === 'function') {
            confirmState.onConfirm();
          } else {
            setConfirmState(prev => ({ ...prev, open: false }));
          }
        }}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        showCancel={true}
      />
    </div>
  );
};

export default ProjectsMainPage;