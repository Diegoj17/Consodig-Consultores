import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaClock, FaFileAlt } from 'react-icons/fa';
import EvaluatorEvaluationList from '../../components/management/project/evaluador/EvaluatorEvaluationList';
import { evaluationService } from '../../services/evaluationService';

const EvaluatorPendingPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getPendingEvaluations();
      console.log('📋 Evaluaciones pendientes cargadas:', data);
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error cargando evaluaciones pendientes:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // Navegar al formulario de evaluación
  const handleStartEvaluation = (evaluation) => {
    console.log('🚀 Iniciando evaluación:', evaluation);
    console.log('📋 Proyecto:', evaluation.proyecto);
    console.log('📝 Formato:', evaluation.formato);
    
    // Verificar que tenemos los datos necesarios
    if (!evaluation.proyecto || !evaluation.formato) {
      console.error('❌ Faltan datos del proyecto o formato');
      alert('Error: No se pudo cargar la información de la evaluación');
      return;
    }

    // Navegar al formulario de evaluación con los datos necesarios
    navigate('/evaluador/evaluation', { 
      state: { 
        evaluation: evaluation,
        project: evaluation.proyecto,
        format: evaluation.formato
      }
    });
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const project = evaluation.proyecto || {};
    const searchText = searchTerm.toLowerCase();
    
    return (
      project.titulo?.toLowerCase().includes(searchText) ||
      project.codigo?.toLowerCase().includes(searchText) ||
      evaluation.id?.toString().includes(searchText)
    );
  });

  return (
    <div className="evaluator-evaluations-page">
      {/* Header */}
      <div className="evaluator-page-header">
        
        <div className="header-actions">
          <div className="evaluations-count">
            <span className="count-number">{filteredEvaluations.length}</span>
            <span className="count-label"> evaluaciones</span>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
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

      {/* Contenido */}
      <div className="evaluator-evaluations-content">
        {loading ? (
          <div className="evaluator-loading">
            <div className="evaluator-spinner"></div>
            <p>Cargando evaluaciones pendientes...</p>
          </div>
        ) : (
          <EvaluatorEvaluationList
            evaluations={filteredEvaluations}
            currentStatus="pending"
            onStartEvaluation={handleStartEvaluation}
            emptyMessage="No hay evaluaciones pendientes."
          />
        )}
      </div>
    </div>
  );
};

export default EvaluatorPendingPage;