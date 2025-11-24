import React from 'react';
import EvaluandoStats from '../../components/dashboard/evaluando/EvaluandoStats';
import EvaluandoActions from '../../components/dashboard/evaluando/EvaluandoActions';
import PendingEvaluations from '../../components/dashboard/evaluando/PendingEvaluations';
import EvaluationResults from '../../components/dashboard/evaluando/EvaluationResults';
import '../../styles/pages/user/EvaluandoDashboardPage.css';

const EvaluandoDashboardPage = () => {
  // Datos de ejemplo
  const dashboardData = {
    stats: {
      pendingEvaluations: 2,
      completedEvaluations: 8,
      averageScore: 85,
      projectsEnrolled: 3
    },
    pendingEvaluations: [
      { id: 1, name: 'Evaluación de Habilidades Técnicas', dueDate: '2024-01-18', duration: '45 min', project: 'Proyecto Alpha' },
      { id: 2, name: 'Evaluación de Soft Skills', dueDate: '2024-01-25', duration: '30 min', project: 'Proyecto Gamma' }
    ],
    recentResults: [
      { id: 1, evaluation: 'Evaluación Inicial', score: 92, date: '2024-01-05', project: 'Proyecto Beta' },
      { id: 2, evaluation: 'Test de Conocimientos', score: 78, date: '2023-12-20', project: 'Proyecto Alpha' },
      { id: 3, evaluation: 'Evaluación de Competencias', score: 85, date: '2023-12-10', project: 'Proyecto Beta' }
    ]
  };

  const handleStartEvaluation = (evaluationId) => {
    console.log('Comenzando evaluación:', evaluationId);
    // Navegar a la evaluación
  };

  const handleViewResults = (resultId) => {
    console.log('Viendo resultados:', resultId);
    // Navegar a resultados detallados
  };

  return (
    <div className="evaluando-dashboard">
      <EvaluandoStats stats={dashboardData.stats} />
      
      <EvaluandoActions 
        onViewAllEvaluations={() => console.log('Ver todas las evaluaciones')}
        onViewAllResults={() => console.log('Ver todos los resultados')}
      />

      <div className="dashboard-content">
        <div className="content-column">
          <PendingEvaluations 
            evaluations={dashboardData.pendingEvaluations}
            onStartEvaluation={handleStartEvaluation}
          />
        </div>
        
        <div className="content-column">
          <EvaluationResults 
            results={dashboardData.recentResults}
            onViewDetails={handleViewResults}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluandoDashboardPage;