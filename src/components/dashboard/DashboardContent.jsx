import React from 'react';
import UserManagement from '../../pages/admin/UserManagementPage';
import StatsGrid from './StatsGrid';
import '../../styles/dashboard/DashboardContent.css';

const DashboardContent = ({ activeSection }) => {
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
            <StatsGrid 
              stats={[
          { title: 'Proyectos Pendientes', value: 12, type: 'pending' },
          { title: 'Evaluadores Activos', value: 8, type: 'active' },
          { title: 'Evaluaciones Completadas', value: 24, type: 'completed' }
              ]}
            />
          </div>
        );
    }
  };

  return renderContent();
};

export default DashboardContent;