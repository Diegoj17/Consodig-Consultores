import React, { useState, useEffect } from 'react';
import UserManagement from '../../../pages/admin/UserManagementPage';
import StatsGrid from './StatsGrid';
import { useEvaluadores } from '../../../hooks/useEvaluadores';
import { useEvaluandos } from '../../../hooks/useEvaluandos';
import api from '../../../api/Axios';
import '../../../styles/dashboard/admin/DashboardContent.css';

const DashboardContent = ({ activeSection }) => {
  // Usar los hooks para obtener datos reales de evaluadores y evaluandos
  const { evaluadores, loading: loadingEval, error: errorEval } = useEvaluadores();
  const { evaluandos, loading: loadingEandos, error: errorEandos } = useEvaluandos();

  const loading = loadingEval || loadingEandos;
  const error = errorEval || errorEandos;

  // Cálculos de estadísticas reales
  const totalUsers = (evaluadores?.length || 0) + (evaluandos?.length || 0);
  const activeCount = [ ...(evaluadores || []), ...(evaluandos || []) ].filter(u => u.estado === 'ACTIVO').length;
  const inactiveCount = [ ...(evaluadores || []), ...(evaluandos || []) ].filter(u => u.estado === 'INACTIVO').length;
  const evaluadoresCount = evaluadores?.length || 0;
  const evaluandosCount = evaluandos?.length || 0;

  // Estado para proyectos
  const [projectsCount, setProjectsCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        // Intentamos llamar a la ruta /projects (puede variar según backend)
        const res = await api.get('/projects');
        if (!mounted) return;
        const projects = Array.isArray(res.data) ? res.data : (res.data.projects || []);
        setProjectsCount(projects.length);
      } catch (err) {
        // Si la ruta no existe o hay error, dejamos projectsCount en 0 y no rompemos la UI
        console.warn('No se pudo obtener projects desde /projects:', err?.message || err);
        setProjectsCount(0);
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    };

    fetchProjects();
    return () => { mounted = false; };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'projects':
      case 'evaluations':
        return (
          <div className="content-section">
            <h2>Evaluaciones</h2>
            <p>Gestión de evaluaciones académicas</p>
          </div>
        );
      case 'reports':
        return (
          <div className="content-section">
            <h2>Reportes y Estadísticas</h2>
            <p>Reportes detallados del sistema</p>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>Bienvenido al Panel de Administración</h2>
              <p>Gestión integral de proyectos académicos</p>
            </div>
            {/* Mostrar estadísticas reales; si está cargando mostramos ceros o indicador */}
            <StatsGrid 
              stats={[
                { title: 'Total Usuarios', value: loading ? '...' : totalUsers, type: 'default' },
                { title: 'Evaluadores', value: loading ? '...' : evaluadoresCount, type: 'default' },
                { title: 'Evaluandos', value: loading ? '...' : evaluandosCount, type: 'default' },
                { title: 'Proyectos', value: (loading || loadingProjects) ? '...' : projectsCount, type: 'default' }
              ]}
            />
            {error && <div className="stats-error">Error cargando estadísticas: {error}</div>}
          </div>
        );
    }
  };

  return renderContent();
};

export default DashboardContent;