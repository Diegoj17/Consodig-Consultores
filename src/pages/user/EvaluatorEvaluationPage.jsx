import React, { useState } from 'react';
import EvaluatorStats from '../../components/management/project/evaluador/EvaluatorStats';
import EvaluatorProjectsList from '../../components/management/project/evaluador/EvaluatorProjectsList';
import EvaluatorEvaluationForm from '../../components/management/project/evaluador/EvaluatorEvaluationForm';
import EvaluatorHistory from '../../components/management/project/evaluador/EvaluatorHistory';
import '../../styles/pages/user/EvaluatorEvaluationPage.css';

const EvaluatorEvaluationPage = ({ projects = [], onAccept, onReject, onSubmitEvaluation }) => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const assignedProjects = (Array.isArray(projects) ? projects : []).filter(p => 
    p && (p.estado === 'Preasignado' || p.estado === 'En evaluación')
  );

  const filteredProjects = assignedProjects.filter(project =>
    project.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    assigned: projects.filter(p => p.estado === 'Preasignado').length,
    inProgress: projects.filter(p => p.estado === 'En evaluación').length,
    completed: projects.filter(p => p.estado === 'Evaluado').length,
    pending: assignedProjects.filter(p => p.deadline && new Date(p.deadline) < new Date()).length
  };

  const handleEvaluate = (project) => {
    setSelectedProject(project);
    setActiveTab('evaluate');
  };

  const handleDownload = (project) => {
    alert(`Descargando proyecto: ${project.titulo}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assigned':
        return (
          <EvaluatorProjectsList
            projects={filteredProjects}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEvaluate={handleEvaluate}
            onDownload={handleDownload}
            onAccept={onAccept}
            onReject={onReject}
          />
        );
      case 'evaluate':
        return (
          <EvaluatorEvaluationForm
            selectedProject={selectedProject}
            onSubmitEvaluation={onSubmitEvaluation}
            onCancel={() => setSelectedProject(null)}
          />
        );
      case 'history':
        return <EvaluatorHistory projects={projects} />;
      default:
        return null;
    }
  };

  return (
    <div className="evaluator-dashboard-container">
      <div className="evaluator-welcome-section">
        <h2>Panel de Evaluador</h2>
        <p>Gestiona tus proyectos asignados y evaluaciones pendientes</p>
      </div>

      <EvaluatorStats stats={stats} />

      <div className="evaluator-tabs">
        <button className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => setActiveTab('assigned')}>Asignados</button>
        <button className={`tab-button ${activeTab === 'evaluate' ? 'active' : ''}`} onClick={() => setActiveTab('evaluate')}>Evaluar</button>
        <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Historial</button>
      </div>

      <div className="evaluator-content-section">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EvaluatorEvaluationPage;