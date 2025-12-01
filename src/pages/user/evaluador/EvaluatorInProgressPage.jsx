import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlay, FaFileAlt  } from 'react-icons/fa';
import Modal from '../../../components/common/Modal';
import EvaluatorEvaluationList from '../../../components/management/project/evaluador/EvaluatorEvaluationList';
import { evaluationService } from '../../../services/evaluationService';

const EvaluatorInProgressPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getInProgressEvaluations();
      console.log('DEBUG: getInProgressEvaluations response:', data);

      if (!Array.isArray(data)) {
        setEvaluations([]);
        return;
      }

      // Filtrar: solo evaluaciones ACEPTADA (no COMPLETADA). Calcular porcentaje de ítems calificados.
      const mapped = data
        .filter(ev => {
          const statusRaw = (ev.estado || ev.status || ev.state || '').toString().toUpperCase();
          const isCompleted = statusRaw.includes('COMP'); // COMPLETADA
          const isAccepted = statusRaw.includes('ACEPT') || statusRaw.includes('ACCEPT') || statusRaw.includes('ASIGN');
          return isAccepted && !isCompleted;
        })
        .map(ev => {
          const items = ev.items || ev.itemsEvaluados || ev.criterios || [];
          const total = (Array.isArray(items) ? items.length : 0);
          const gradedCount = (Array.isArray(items) ? items.filter(i => Number(i.calificacion) > 0 || i.calificado).length : 0);
          const gradedPercent = total > 0 ? Math.round((gradedCount / total) * 100) : 0;
          return { ...ev, gradedPercent, gradedCount, itemsTotal: total };
        });

      // Depuración ligera
      mapped.forEach(ev => console.log('InProgressFiltered:', ev.id, ev.gradedPercent, `${ev.gradedCount}/${ev.itemsTotal}`));
      setEvaluations(mapped);
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
    try {
      const project = evaluation.project || evaluation.proyecto || null;
      const format = evaluation.evaluationFormat || evaluation.formatoEvaluacion || evaluation.formato || evaluation.format || null;
      // Navegar a la ruta del formulario (dentro de /evaluador) y pasar evaluation, project y format en state
      navigate(`/evaluador/evaluate/${evaluation.id}`, { state: { evaluation, project, format } });
    } catch (err) {
      console.error('Error navegando al formulario de evaluación:', err);
      setErrorModalMessage('No fue posible abrir el formulario de evaluación. Revisa la consola para más detalles.');
      setShowErrorModal(true);
    }
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
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        type="error"
        size="sm"
      >
        <div style={{ padding: '0.5rem 0' }}>{errorModalMessage}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <button className="btn-primary" onClick={() => setShowErrorModal(false)}>Aceptar</button>
        </div>
      </Modal>
    </div>
  );
};

export default EvaluatorInProgressPage;