import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlay, FaFileAlt  } from 'react-icons/fa';
import EvaluatorEvaluationList from '../../components/management/project/evaluador/EvaluatorEvaluationList';
import { evaluationService } from '../../services/evaluationService';

const EvaluatorInProgressPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getInProgressEvaluations();
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error cargando evaluaciones en progreso:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueEvaluation = (evaluation) => {
    // Navegar al formulario de evaluación
    console.log('Continuando evaluación:', evaluation);
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const project = evaluation.project || evaluation.proyecto || {};
    const searchText = searchTerm.toLowerCase();
    
    return (
      project.title?.toLowerCase().includes(searchText) ||
      project.nombre?.toLowerCase().includes(searchText) ||
      project.code?.toLowerCase().includes(searchText) ||
      project.codigo?.toLowerCase().includes(searchText) ||
      evaluation.id?.toString().includes(searchText)
    );
  });

  return (
    <div className="evaluator-evaluations-page">
      <div className="evaluator-page-header">
        
        <div className="header-actions">
          <div className="evaluations-count">
            <span className="count-number">{filteredEvaluations.length}</span>
            <span className="count-label"> evaluaciones</span>
          </div>
        </div>
      </div>

      <div className="evaluator-search-section">
        <div className="evaluator-search-box">
          <FaSearch className="evaluator-search-icon" />
          <input
            type="text"
            placeholder="Buscar por título, código del proyecto o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="evaluator-search-input"
          />
        </div>
      </div>

      <div className="evaluator-evaluations-content">
        {loading ? (
          <div className="evaluator-loading">
            <div className="evaluator-spinner"></div>
            <p>Cargando evaluaciones en progreso...</p>
          </div>
        ) : (
          <EvaluatorEvaluationList
            evaluations={filteredEvaluations}
            currentStatus="in-progress"
            onStartEvaluation={handleContinueEvaluation}
            emptyMessage="No hay evaluaciones en progreso."
          />
        )}
      </div>
    </div>
  );
};

export default EvaluatorInProgressPage;