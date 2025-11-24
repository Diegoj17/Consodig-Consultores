import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardContent from '../../components/dashboard/admin/DashboardContent';
import '../../styles/pages/admin/DashboardPage.css';

function DashboardPage() {
  const location = useLocation();

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/evaluations')) return 'evaluations';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/templates')) return 'templates';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <div className="dashboard-page-content">
      <DashboardContent activeSection={getActiveSection()} />
    </div>
  );
}

export default DashboardPage;