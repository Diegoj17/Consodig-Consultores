import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaClock, FaFileAlt } from 'react-icons/fa';
import EvaluatorEvaluationList from '../../../components/management/project/evaluador/EvaluatorEvaluationList';
import { evaluationService } from '../../../services/evaluationService';

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
    (async () => {
      try {
        console.log('🚀 Iniciando evaluación (handler):', evaluation);

        // Si la evaluación no trae proyecto o formato, intentar obtener la evaluación completa desde el backend
        let full = evaluation;
        if (!evaluation.proyecto || !evaluation.formato) {
          try {
            console.log('🔎 Datos incompletos: solicitando detalles al backend para evaluación id=', evaluation.id);
            full = await evaluationService.getById(evaluation.id);
            console.log('✅ Detalles obtenidos desde backend:', full);
          } catch (err) {
            console.warn('❌ No se pudieron obtener detalles desde backend:', err);
            // si falla la petición, seguir con el objeto original para mostrar mensaje de error
            full = evaluation;
          }
        }

        // Verificar que ahora tengamos los datos necesarios
        if (!full.proyecto || !full.formato) {
          console.error('❌ Faltan datos del proyecto o formato incluso después de intentar cargar desde API', { full });
          alert('Error: No se pudo cargar la información completa de la evaluación. Intenta recargar la página o contacta al administrador.');
          return;
        }

        // Navegar al formulario de evaluación usando la ruta con parametro evaluationId
        // Rutas en `EvaluadorLayout` exponen: /evaluador/evaluate/:evaluationId
        navigate(`/evaluador/evaluate/${full.id}`, {
          state: {
            evaluation: full,
            project: full.proyecto,
            format: full.formato
          }
        });
      } catch (err) {
        console.error('Error en handleStartEvaluation:', err);
        alert('Ocurrió un error al iniciar la evaluación. Revisa la consola para más detalles.');
      }
    })();
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