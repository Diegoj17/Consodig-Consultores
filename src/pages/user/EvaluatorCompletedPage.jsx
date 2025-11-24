// src/components/management/evaluation/evaluador/EvaluatorCompletedPage.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaEye, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import EvaluatorCompletedList from '../../components/management/project/evaluador/EvaluatorCompletedList';
import EvaluationDetailsModal from '../../components/management/project/evaluador/EvaluationDetailsModal'; 
import { evaluationService } from '../../services/evaluationService';
import '../../styles/pages/user/EvaluatorEvaluationsPage.css';

const EvaluatorCompletedPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🔄 Cargando evaluaciones completadas...');
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getCompletedEvaluations();
      console.log('✅ Evaluaciones completadas recibidas:', data);
      console.log('📊 Número de evaluaciones:', data?.length);
      setEvaluations(data || []);
    } catch (error) {
      console.error('❌ Error cargando evaluaciones completadas:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREGIDO: Solo abrir el modal
  const handleViewEvaluation = (evaluation) => {
    console.log('📍 Abriendo modal con evaluación:', evaluation);
    setSelectedEvaluation(evaluation);
  };

  // ✅ CORREGIDO: Solo cerrar el modal
  const handleCloseModal = () => {
    setSelectedEvaluation(null);
  };

  // Exportar resultados
  const handleExportPDF = async (evaluationId) => {
    try {
      console.log('Exportando a PDF:', evaluationId);
    } catch (error) {
      console.error('Error exportando PDF:', error);
    }
  };

  const handleExportExcel = async (evaluationId) => {
    try {
      console.log('Exportando a Excel:', evaluationId);
    } catch (error) {
      console.error('Error exportando Excel:', error);
    }
  };

  // Filtrar evaluaciones por búsqueda
  const filteredEvaluations = evaluations.filter(evaluation => {
    const project = evaluation.proyecto || {};
    const searchText = searchTerm.toLowerCase();
    
    return (
      project.titulo?.toLowerCase().includes(searchText) ||
      project.codigo?.toLowerCase().includes(searchText) ||
      evaluation.calificacionTotal?.toString().includes(searchText) ||
      evaluation.id?.toString().includes(searchText)
    );
  });

  // Agregar debug para verificar el filtrado
  useEffect(() => {
    console.log('🔍 Evaluaciones después del filtro:', filteredEvaluations);
    console.log('🔍 Término de búsqueda:', searchTerm);
  }, [filteredEvaluations, searchTerm]);

  // ❌ ELIMINAR ESTE BLOQUE COMPLETO - Está mostrando el formulario en lugar del modal
  // if (selectedEvaluation) {
  //   return (
  //     <EvaluatorEvaluationForm
  //       evaluation={selectedEvaluation}
  //       selectedProject={selectedEvaluation.proyecto}
  //       evaluationFormat={selectedEvaluation.formato}
  //       isReadOnly={true}
  //       onCancel={handleCloseView}
  //       onSubmitEvaluation={null}
  //     />
  //   );
  // }

  return (
    <div className="evaluator-evaluations-page">
      
      {/* Header de la página */}
      <div className="evaluator-page-header">
        
        {/* Contador y acciones */}
        <div className="header-actions">
          <div className="evaluations-count">
            <span className="count-number">{filteredEvaluations.length}</span>
            <span className="count-label">completadas</span>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="evaluator-search-section">
        <div className="evaluator-search-box">
          <FaSearch className="evaluator-search-icon" />
          <input
            type="text"
            placeholder="Buscar por título, código, puntaje o ID..."
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
            <p>Cargando evaluaciones completadas...</p>
          </div>
        ) : (
          <EvaluatorCompletedList
            evaluations={filteredEvaluations}
            onViewEvaluation={handleViewEvaluation}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        )}
      </div>

      {/* ✅ Modal que se abre cuando selectedEvaluation no es null */}
      {selectedEvaluation && (
        <EvaluationDetailsModal
          evaluation={selectedEvaluation}
          onClose={handleCloseModal}
        />
      )}
      
    </div>
  );
};

export default EvaluatorCompletedPage;