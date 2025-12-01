import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import EvaluandoCompletedList from '../../../components/management/project/evaluando/EvaluandoCompletedList';
import EvaluandoEvaluationDetailsModal from '../../../components/management/project/evaluando/EvaluandoEvaluationDetailsModal';
import { evaluationService } from '../../../services/evaluationService';
import { useAuth } from '../../../contexts/AuthContext';
import { isValidated } from '../../../utils/evaluationUtils';
import '../../../styles/pages/user/evaluador/EvaluatorEvaluationsPage.css';

const EvaluandoCompletedPage = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Esperar a que el contexto de `user` esté disponible antes de cargar
    // `loadEvaluations` se define en el componente; lo llamamos directamente cuando `user` cambia.
    if (!user) return;
    (async () => { await loadEvaluations(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getCompletedEvaluations();
      console.log('Respuesta de evaluaciones completadas (raw):', data);
      // Determinar si la evaluación pertenece al usuario (soporta varios formatos)
      const possibleUserValues = [
        user?.id,
        user?.userId,
        user?.identificacion,
        user?.identificacionUsuario,
        user?.identification,
        user?.email,
        user?.correo,
        user?.username,
        user?.nombre,
        user?.fullName,
      ].filter(Boolean).map(v => String(v).toLowerCase());

      console.log('Usuario actual (posibles valores):', possibleUserValues, user);

      const valueMatchesUser = (val) => {
        if (!val && val !== 0) return false;
        const s = String(val).toLowerCase();
        if (possibleUserValues.includes(s)) return true;
        return possibleUserValues.some(uv => s.includes(uv) || uv.includes(s));
      };

      // Añadir logging por evaluación para depurar por qué no matchea
      const checkEvaluationMatches = (ev = {}) => {
        const reasons = [];
        const evalIds = [ev.evaluandoId, ev.evaluando, ev.investigadorId, ev.investigador, ev.investigadorPrincipal, ev.ownerId, ev.authorId];
        for (const v of evalIds) if (valueMatchesUser(v)) reasons.push({ type: 'evalField', value: v });

        const proyecto = ev.proyecto || ev.project || {};
        const projectOwnerFields = [
          proyecto.investigadorId,
          proyecto.investigador,
          proyecto.investigadorPrincipal,
          proyecto.investigadorPrincipalId,
          proyecto.authorId,
          proyecto.ownerId,
          proyecto.userId,
          proyecto.creadorId,
          proyecto.autorId,
          proyecto.id,
        ];
        for (const v of projectOwnerFields) if (valueMatchesUser(v)) reasons.push({ type: 'projectField', value: v });

        const nestedOwner = proyecto.investigador || proyecto.investigadorPrincipal || proyecto.autor || proyecto.creador;
        if (nestedOwner && typeof nestedOwner === 'object') {
          const nestedId = nestedOwner.id || nestedOwner.userId || nestedOwner.usuarioId || nestedOwner.identificacion;
          if (nestedId && valueMatchesUser(nestedId)) reasons.push({ type: 'nestedId', value: nestedId });
          const nestedName = nestedOwner.nombre || nestedOwner.fullName || nestedOwner.nombreCompleto || nestedOwner.email;
          if (nestedName) {
            const nn = String(nestedName).toLowerCase();
            if (possibleUserValues.some(uv => nn.includes(uv) || uv.includes(nn))) reasons.push({ type: 'nestedName', value: nestedName });
          }
        }

        const matched = reasons.length > 0;
        console.log('Eval check', { id: ev.id, proyectoId: proyecto.id, matched, reasons });
        return matched;
      };

      let mine = (data || []).filter(ev => checkEvaluationMatches(ev));

      console.log('Evaluaciones pertenecientes al usuario (después de filtro):', mine.length, mine);

      // Si no se encontró nada, intentar una heurística por nombre de Investigador Principal
      if ((!mine || mine.length === 0) && Array.isArray(data) && data.length > 0) {
        const uname = (user?.fullName || user?.nombre || user?.username || user?.email || '').toString().toLowerCase();
        if (uname) {
          const alt = (data || []).filter(ev => {
            const proyecto = ev.proyecto || ev.project || {};
            const ip = (proyecto.investigadorPrincipal || proyecto.investigador || proyecto.investigadorNombre || proyecto.investigadorNombreCompleto || '').toString().toLowerCase();
            return ip && ip.includes(uname);
          });
          if (alt.length > 0) {
            console.log('Fallback: coincidencias por `investigadorPrincipal` encontradas:', alt.length, alt);
            mine = alt;
          }
        }
      }

      // Filtrar solo las evaluaciones que ya fueron validadas por el administrador
      const validated = (mine || []).filter(ev => isValidated(ev));

      // Por doble ciego, eliminar/ocultar cualquier campo que muestre el nombre del evaluador
      const sanitized = validated.map(ev => {
        const copy = { ...ev };
        // eliminar referencias directas a evaluador
        if (copy.evaluador) delete copy.evaluador;
        if (copy.evaluatorName) delete copy.evaluatorName;
        if (copy.evaluadorId) delete copy.evaluadorId;
        if (copy.evaluatorId) delete copy.evaluatorId;
        return copy;
      });

      setEvaluations(sanitized || []);
    } catch (error) {
      console.error('Error cargando evaluaciones para evaluando:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
  };

  const handleCloseModal = () => {
    setSelectedEvaluation(null);
  };

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

  const filteredEvaluations = evaluations.filter(evaluation => {
    const project = evaluation.proyecto || evaluation.project || {};
    const searchText = searchTerm.toLowerCase();

    return (
      (project.titulo || project.title || '').toString().toLowerCase().includes(searchText) ||
      (project.codigo || project.code || '').toString().toLowerCase().includes(searchText) ||
      (evaluation.calificacionTotal || '').toString().toLowerCase().includes(searchText) ||
      (evaluation.id || '').toString().includes(searchText)
    );
  });

  return (
    <div className="evaluator-evaluations-page">
      <div className="evaluator-page-header">
        <div className="header-actions">
          <div className="evaluations-count">
            <span className="count-number">{filteredEvaluations.length}</span>
            <span className="count-label"> completadas</span>
          </div>
        </div>
      </div>

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

      <div className="evaluator-evaluations-content">
        {loading ? (
          <div className="evaluator-loading">
            <div className="evaluator-spinner"></div>
            <p>Cargando evaluaciones completadas...</p>
          </div>
        ) : (
          // Para el rol "evaluando" usamos la versión que oculta el formato
          <EvaluandoCompletedList
            evaluations={filteredEvaluations}
            onViewEvaluation={handleViewEvaluation}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        )}
      </div>

      {selectedEvaluation && (
        // Modal para evaluando — oculta IDs y formato
        <EvaluandoEvaluationDetailsModal
          evaluation={selectedEvaluation}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EvaluandoCompletedPage;
