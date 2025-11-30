import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EvaluadorStats from '../../components/dashboard/evaluador/EvaluadorStats';
import EvaluadorActions from '../../components/dashboard/evaluador/EvaluadorActions';
import RecentEvaluations from '../../components/dashboard/evaluador/RecentEvaluations';
import AssignedProjects from '../../components/dashboard/evaluador/AssignedProjects';
import InProgressEvaluations from '../../components/dashboard/evaluador/InProgressEvaluations';
import '../../styles/pages/user/EvaluadorDashboardPage.css';
import { evaluationService } from '../../services/evaluationService';
import projectService from '../../services/projectService';

const EvaluadorDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingEvaluations: 0, completedEvaluations: 0, assignedProjects: 0, averageRating: 0 });
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [inProgressEvaluations, setInProgressEvaluations] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [pending, inProgress, completed, projects] = await Promise.all([
          evaluationService.getPendingEvaluations().catch(() => []),
          evaluationService.getInProgressEvaluations().catch(() => []),
          evaluationService.getCompletedEvaluations().catch(() => []),
          projectService.getAll().catch(() => [])
        ]);

        if (!mounted) return;

        // Mapear in-progress y pending por separado para mostrarlos donde corresponda
        const mappedInProgress = (inProgress || []).map(ev => {
          const progress = evaluationService.calculateProgress(ev);
          const status = ev.estado === 'COMPLETADA' || ev.state === 'COMPLETADA' ? 'completed' : (progress > 0 ? 'in-progress' : 'pending');
          const projectTitle = ev.proyecto?.titulo || ev.project?.titulo || ev.titulo || ev.nombreProyecto || ev.projectTitle || 'Proyecto sin título';
          const evaluandoName = ev.evaluando?.nombre ? `${ev.evaluando.nombre} ${ev.evaluando.apellido || ''}` : (ev.evaluandoNombre || ev.evaluando || '');
          const dueDate = ev.fechaLimite || ev.fechaEntrega || ev.dueDate || ev.fechaEnvio || ev.createdAt || '';
          const formatoName = ev.formato?.nombre || ev.formatoNombre || ev.formato?.title || '';
          return {
            id: ev.id,
            project: projectTitle,
            evaluando: evaluandoName,
            dueDate,
            status,
            progress,
            formato: formatoName
          };
        });

        const mappedPending = (pending || []).map(ev => {
          const progress = evaluationService.calculateProgress(ev);
          const status = ev.estado === 'COMPLETADA' || ev.state === 'COMPLETADA' ? 'completed' : (progress > 0 ? 'in-progress' : 'pending');
          const projectTitle = ev.proyecto?.titulo || ev.project?.titulo || ev.titulo || ev.nombreProyecto || ev.projectTitle || 'Proyecto sin título';
          const evaluandoName = ev.evaluando?.nombre ? `${ev.evaluando.nombre} ${ev.evaluando.apellido || ''}` : (ev.evaluandoNombre || ev.evaluando || '');
          const dueDate = ev.fechaLimite || ev.fechaEntrega || ev.dueDate || ev.fechaEnvio || ev.createdAt || '';
          const formatoName = ev.formato?.nombre || ev.formatoNombre || ev.formato?.title || '';
          return {
            id: ev.id,
            project: projectTitle,
            evaluando: evaluandoName,
            dueDate,
            status,
            progress,
            formato: formatoName
          };
        });

        // Recent = combinar pending + inProgress (limitado)
        const combinedRecent = [...mappedInProgress, ...mappedPending].slice(0, 8);

        setInProgressEvaluations(mappedInProgress);
        setPendingEvaluations(mappedPending);
        setRecentEvaluations(combinedRecent);

        // Estadísticas básicas
        setStats({
          pendingEvaluations: (pending || []).length,
          completedEvaluations: (completed || []).length,
          assignedProjects: (projects || []).length,
          averageRating: 0 // si hay endpoint para rating, reemplazar aquí
        });

        // Mapear proyectos para AssignedProjects, incluir resumen y fecha de creación
        const mappedProjects = (projects || []).slice(0, 8).map(p => ({
          id: p.id,
          name: p.titulo || p.nombre || p.name || p.nombreProyecto || 'Proyecto',
          resumen: p.resumen || p.summary || p.abstract || '',
          creationDate: p.fechaCreacion || p.fechaEnvio || p.createdAt || p.fecha || '',
          evaluandos: p.evaluandos || p.evaluandosCount || (p.participantes ? p.participantes.length : 0) || 0,
          progress: p.progress || p.avance || 0,
          deadline: p.fechaLimite || p.fechaVencimiento || p.deadline || ''
        }));

        setAssignedProjects(mappedProjects);

      } catch (err) {
        console.error('Error cargando datos del dashboard del evaluador', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleViewEvaluations = () => navigate('/evaluador/evaluations/pending');
  const handleViewProjects = () => navigate('/evaluador/projects/assigned');

  return (
    <div className="evaluador-dashboard">
      <EvaluadorStats stats={stats} />
      
      <EvaluadorActions 
        onViewEvaluations={handleViewEvaluations}
        onViewProjects={handleViewProjects}
      />

      {/* Mostrar primero las evaluaciones en progreso */}
      <InProgressEvaluations evaluations={inProgressEvaluations} onContinue={() => navigate('/evaluador/evaluations/in-progress')} />

      <div className="dashboard-content">
        <div className="content-column">
          <RecentEvaluations 
            evaluations={recentEvaluations}
            onStartEvaluation={() => navigate('/evaluador/evaluations/in-progress')}
          />
        </div>
        
        <div className="content-column">
          <AssignedProjects 
            projects={assignedProjects}
            onViewProject={(id) => navigate(`/evaluador/projects/${id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluadorDashboardPage;