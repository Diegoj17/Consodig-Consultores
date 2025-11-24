import React, { useState, useEffect } from 'react';
import { FaSearch, FaClock, FaPlay, FaCheck, FaFileAlt, FaBug } from 'react-icons/fa';
import EvaluatorEvaluationForm from '../../components/management/project/evaluador/EvaluatorEvaluationForm';
import EvaluatorEvaluationList from '../../components/management/project/evaluador/EvaluatorEvaluationList';
import { evaluationService, EVALUATION_STATUS } from '../../services/evaluationService';
import '../../styles/pages/user/EvaluatorEvaluationsPage.css';

const EvaluatorEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'in-progress', 'completed'

  // Determinar qué evaluaciones cargar según la pestaña activa
  useEffect(() => {
    loadEvaluations();
  }, [activeTab]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      let data = [];

      switch (activeTab) {
        case 'pending':
          data = await evaluationService.getPendingEvaluations();
          break;
        case 'in-progress':
          data = await evaluationService.getInProgressEvaluations();
          break;
        case 'completed':
          data = await evaluationService.getCompletedEvaluations();
          break;
        default:
          data = await evaluationService.getPendingEvaluations();
      }

      setEvaluations(data || []);
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
      alert(`Error al cargar evaluaciones: ${error.message}`);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // Aceptar evaluación (mueve de Pendientes a En Progreso)
  const handleAcceptEvaluation = async (evaluationId) => {
    try {
      await evaluationService.acceptEvaluation(evaluationId);
      // Recargar las evaluaciones pendientes
      if (activeTab === 'pending') {
        loadEvaluations();
      }
    } catch (error) {
      console.error('Error aceptando evaluación:', error);
      alert(`Error al aceptar la evaluación: ${error.message}`);
    }
  };

  // Rechazar evaluación
  const handleRejectEvaluation = async (evaluationId, reason) => {
    try {
      await evaluationService.rejectEvaluation(evaluationId, reason);
      if (activeTab === 'pending') {
        loadEvaluations();
      }
    } catch (error) {
      console.error('Error rechazando evaluación:', error);
      alert(`Error al rechazar la evaluación: ${error.message}`);
    }
  };

  // Iniciar evaluación (solo abre el formulario, NO cambia estado en backend)
  const handleStartEvaluation = (evaluation) => {
    const status = evaluation.estado || evaluation.status;
    
    // Solo permitir iniciar evaluaciones que estén ACEPTADAS (En Progreso)
    if (status !== EVALUATION_STATUS.ACEPTADA) {
      alert('Esta evaluación debe ser aceptada primero antes de poder iniciarla');
      return;
    }
    
    setSelectedEvaluation(evaluation);
  };

  // Enviar evaluación completada (cambia estado a COMPLETADA)
  const handleSubmitEvaluation = async (evaluationId, evaluationData) => {
    try {
      // Primero calificar todos los items si es necesario
      if (evaluationData.criterios && evaluationData.criterios.length > 0) {
        for (const criterio of evaluationData.criterios) {
          await evaluationService.gradeItem(evaluationId, {
            criterioId: criterio.id,
            calificacion: criterio.calificacion,
            comentarios: criterio.comentarios
          });
        }
      }

      // Luego finalizar la evaluación
      await evaluationService.finishEvaluation(evaluationId, {
        comentarios: evaluationData.comentarios,
        calificacionFinal: evaluationData.calificacionFinal
      });

      setSelectedEvaluation(null);
      
      // Si estábamos en la pestaña "En Progreso", recargar
      if (activeTab === 'in-progress') {
        loadEvaluations();
      }
    } catch (error) {
      console.error('Error enviando evaluación:', error);
      alert(`Error al enviar la evaluación: ${error.message}`);
    }
  };

  const handleCancelEvaluation = () => {
    setSelectedEvaluation(null);
  };

  // Filtrar evaluaciones por búsqueda
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

  // Obtener información de la pestaña activa
  const getTabInfo = () => {
    switch (activeTab) {
      case 'pending':
        return {
          title: 'Evaluaciones Pendientes',
          description: 'Evaluaciones asignadas pendientes de aceptación o rechazo',
          icon: <FaClock />,
          emptyMessage: 'No hay evaluaciones pendientes de aceptación.'
        };
      case 'in-progress':
        return {
          title: 'Evaluaciones en Progreso',
          description: 'Evaluaciones aceptadas en proceso de evaluación',
          icon: <FaPlay />,
          emptyMessage: 'No hay evaluaciones en progreso.'
        };
      case 'completed':
        return {
          title: 'Evaluaciones Completadas',
          description: 'Evaluaciones finalizadas y completadas',
          icon: <FaCheck />,
          emptyMessage: 'No hay evaluaciones completadas.'
        };
      default:
        return {
          title: 'Evaluaciones',
          description: '',
          icon: <FaFileAlt />,
          emptyMessage: 'No se encontraron evaluaciones.'
        };
    }
  };

  const tabInfo = getTabInfo();

  // Si hay una evaluación seleccionada, mostrar el formulario
  if (selectedEvaluation) {
    return (
      <EvaluatorEvaluationForm
        selectedProject={selectedEvaluation.project || selectedEvaluation.proyecto}
        evaluationFormat={selectedEvaluation.evaluationFormat || selectedEvaluation.formatoEvaluacion}
        onSubmitEvaluation={(evaluationData) => handleSubmitEvaluation(selectedEvaluation.id, evaluationData)}
        onCancel={handleCancelEvaluation}
      />
    );
  }

  return (
    <div className="evaluator-evaluations-page">
      {/* Header */}
      <div className="evaluator-page-header">
        <div className="page-title-section">
          <div className="page-icon">
            {tabInfo.icon}
          </div>
          <div className="page-title-content">
            <h1>{tabInfo.title}</h1>
            <p>{tabInfo.description}</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="evaluations-count">
            <span className="count-number">{filteredEvaluations.length}</span>
            <span className="count-label">evaluaciones</span>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="evaluator-evaluations-tabs">
        <button 
          className={`evaluator-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FaClock className="evaluator-tab-icon" />
          <span className="evaluator-tab-label">Pendientes</span>
          <span className="evaluator-tab-count">
            {activeTab === 'pending' ? filteredEvaluations.length : evaluations.length}
          </span>
        </button>
        
        <button 
          className={`evaluator-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in-progress')}
        >
          <FaPlay className="evaluator-tab-icon" />
          <span className="evaluator-tab-label">En Progreso</span>
          <span className="evaluator-tab-count">
            {activeTab === 'in-progress' ? filteredEvaluations.length : evaluations.length}
          </span>
        </button>
        
        <button 
          className={`evaluator-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FaCheck className="evaluator-tab-icon" />
          <span className="evaluator-tab-label">Completadas</span>
          <span className="evaluator-tab-count">
            {activeTab === 'completed' ? filteredEvaluations.length : evaluations.length}
          </span>
        </button>
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
            <p>Cargando evaluaciones...</p>
          </div>
        ) : (
          <EvaluatorEvaluationList
            evaluations={filteredEvaluations}
            currentStatus={activeTab}
            onAcceptEvaluation={handleAcceptEvaluation}
            onRejectEvaluation={handleRejectEvaluation}
            onStartEvaluation={handleStartEvaluation}
            emptyMessage={tabInfo.emptyMessage}
          />
        )}
      </div>
    </div>
  );
};

export default EvaluatorEvaluationsPage;