import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaChartBar, FaUserTie, FaEnvelope, FaCog, FaFilter, FaDownload } from 'react-icons/fa';
import RatingsReports from '../../components/reports/RatingsReports';
import EvaluatorReports from '../../components/reports/EvaluatorReports';
import NotificationSystem from '../../components/notifications/admin/NotificationSystem';
import '../../styles/pages/admin/ReportsPage.css';

const ReportsMainPage = () => {
  const [activeTab, setActiveTab] = useState('ratings');
  const [activeSubTab, setActiveSubTab] = useState('summary');

  const location = useLocation();

  // Leer query param ?tab=notifications para abrir la pestaña correcta
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
        setActiveSubTab(tab === 'ratings' ? 'summary' : 'performance');
      }
    } catch {
      // ignore
    }
  }, [location.search]);

  const mainTabs = [
    { 
      id: 'ratings', 
      label: 'Reportes de Calificaciones', 
      icon: <FaChartBar />,
      description: 'Analiza promedios y tendencias de calificaciones'
    },
    { 
      id: 'evaluators', 
      label: 'Reportes por Evaluador', 
      icon: <FaUserTie />,
      description: 'Genera reportes individuales de evaluadores'
    },
    { 
      id: 'notifications', 
      label: 'Mensajes y Notificaciones', 
      icon: <FaEnvelope />,
      description: 'Gestiona comunicaciones con evaluadores'
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: <FaCog />,
      description: 'Configura preferencias de reportes'
    }
  ];

  const ratingsSubTabs = [
    { id: 'summary', label: 'Resumen General' },
    { id: 'projects', label: 'Por Proyecto' },
    { id: 'evaluators', label: 'Por Evaluador' },
    { id: 'comparative', label: 'Análisis Comparativo' }
  ];

  const evaluatorsSubTabs = [
    { id: 'performance', label: 'Desempeño' },
    { id: 'productivity', label: 'Productividad' },
    { id: 'timeline', label: 'Línea de Tiempo' },
    { id: 'detailed', label: 'Reporte Detallado' }
  ];

  const getCurrentSubTabs = () => {
    switch (activeTab) {
      case 'ratings': return ratingsSubTabs;
      case 'evaluators': return evaluatorsSubTabs;
      default: return [];
    }
  };

  const getCurrentComponent = () => {
    switch (activeTab) {
      case 'ratings':
        return <RatingsReports activeSubTab={activeSubTab} />;
      case 'evaluators':
        return <EvaluatorReports activeSubTab={activeSubTab} />;
      case 'notifications':
        return <NotificationSystem />;
      default:
        return <RatingsReports activeSubTab={activeSubTab} />;
    }
  };

  const hasSubTabs = ['ratings', 'evaluators'].includes(activeTab);
  const subTabs = getCurrentSubTabs();

  return (
    <div className="reports-page">
      {/* Header Principal */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Sistema de Reportes y Notificaciones</h1>
            <p>
              {mainTabs.find(tab => tab.id === activeTab)?.description || 
               'Gestiona reportes de evaluaciones y comunícate con los evaluadores'}
            </p>
          </div>
          <div className="header-actions">
            <button className="filter-btn">
              <FaFilter /> Filtros
            </button>
            <button className="export-btn">
              <FaDownload /> Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="main-tabs-navigation">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            className={`main-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setActiveSubTab(tab.id === 'ratings' ? 'summary' : 'performance');
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sub Navegación (solo para algunas pestañas) */}
      {hasSubTabs && subTabs.length > 0 && (
        <div className="sub-tabs-navigation">
          <div className="sub-tabs-container">
            {subTabs.map(subTab => (
              <button
                key={subTab.id}
                className={`sub-tab-button ${activeSubTab === subTab.id ? 'active' : ''}`}
                onClick={() => setActiveSubTab(subTab.id)}
              >
                {subTab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="reports-content">
        {getCurrentComponent()}
      </div>
    </div>
  );
};

export default ReportsMainPage;