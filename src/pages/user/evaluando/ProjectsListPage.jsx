import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaSync, FaPlus } from 'react-icons/fa';
import ProjectCardEvaluando from '../../../components/management/project/evaluando/ProjectCardEvaluando';
import ProjectModalEvaluando from '../../../components/management/project/evaluando/ProjectModalEvaluando';
import Modal from '../../../components/common/Modal';
import { projectService } from '../../../services/projectService';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/pages/user/evaluando/ProjectsListPage.css';

const ProjectsListPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });

  // Cargar proyectos del usuario actual
  useEffect(() => {
    let mounted = true;
    const loadProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await projectService.getAll();
        if (!mounted) return;
        
        const myId = user?.id || user?.identificacion || user?.identidad || null;
        const myProjects = allProjects.filter(p => {
          const projectInvestigatorId = p.investigadorId || p.investigador_id || p.investigador?.id;
          return projectInvestigatorId && String(projectInvestigatorId) === String(myId);
        });
        
        setProjects(myProjects);
      } catch (err) {
        console.error('Error cargando proyectos', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadProjects();
    return () => { mounted = false; };
  }, [user]);

  // Filtrar proyectos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.investigadorPrincipal && project.investigadorPrincipal.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'todos' || project.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateProject = () => {
    console.log('Opening modal for create');
    setModalProject(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleSave = async (payload, action) => {
    try {
      console.log('ProjectsListPage.handleSave', action, payload);
      if (action === 'create') {
        const created = await projectService.create(payload);
        // Prepend to list
        setProjects(prev => [created, ...prev]);
        setModalOpen(false);
        setModalProject(null);
        setModalMode('view');
        setSuccessModal({ open: true, title: 'Proyecto creado', message: 'El proyecto se ha creado correctamente.' });
      } else if (action === 'edit') {
        if (!modalProject?.id) return;
        const updated = await projectService.update(modalProject.id, payload);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setModalOpen(false);
        setModalProject(null);
        setModalMode('view');
        setSuccessModal({ open: true, title: 'Proyecto actualizado', message: 'Los cambios se guardaron correctamente.' });
      }
    } catch (err) {
      console.error('Error saving project', err);
      // Optionally show notification
    }
  };

  const handleViewProject = (project) => {
    console.log('Opening modal for view', project?.id);
    setModalProject(project);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditProject = (project) => {
    console.log('Opening modal for edit', project?.id);
    setModalProject(project);
    setModalMode('edit');
    setModalOpen(true);
  };

  return (
    <div className="project-list-evaluando-page">
      {/* Filtros */}
      <div className="project-list-evaluando-filters">
        <div className="project-list-evaluando-filter-group">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="project-list-evaluando-search-input"
          />
        </div>
        <div className="project-list-evaluando-filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="project-list-evaluando-status-filter"
          >
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Revisado">Revisado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div className="project-list-evaluando-filters-right">
          <button 
            type="button"
            className="project-list-evaluando-btn-primary" 
            onClick={handleCreateProject}
          >
            <FaPlus />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="project-list-evaluando-loading">
          <FaSync className="project-list-evaluando-spinning" />
          <p>Cargando proyectos...</p>
        </div>
      ) : (
        <div className="project-list-evaluando-content">
          {filteredProjects.length > 0 ? (
            <div className="project-list-evaluando-grid">
              {filteredProjects.map(project => (
                <ProjectCardEvaluando 
                  key={project.id} 
                  project={project} 
                  onView={() => handleViewProject(project)}
                  onEdit={() => handleEditProject(project)}
                />
              ))}
            </div>
          ) : (
            <div className="project-list-evaluando-empty-state">
              <FaFileAlt className="project-list-evaluando-empty-icon" />
              <h3>No se encontraron proyectos</h3>
              <p>
                {searchTerm || filterStatus !== 'todos' 
                  ? 'No hay proyectos que coincidan con los filtros aplicados' 
                  : 'No hay proyectos registrados en el sistema'
                }
              </p>
              {!searchTerm && filterStatus === 'todos' && (
                <button 
                  className="project-list-evaluando-btn-primary" 
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
      
      <ProjectModalEvaluando
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => { setModalOpen(false); setModalProject(null); setModalMode('view'); }}
        onSave={handleSave}
        onCreated={(created) => { setProjects(prev => [created, ...prev]); setModalOpen(false); setModalProject(null); setModalMode('view'); }}
        project={modalProject}
        readOnly={Boolean(modalProject && modalProject.id)}
      />
      <Modal
        isOpen={successModal.open}
        onClose={() => setSuccessModal({ open: false, title: '', message: '' })}
        type="success"
        title={successModal.title}
        message={successModal.message}
        confirmText="Aceptar"
        showCancel={false}
      />
    </div>
  );
};

export default ProjectsListPage;