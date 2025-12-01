import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEye, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import { evaluationService } from '../../services/evaluationService';
import EvaluationReviewModal2 from '../../components/management/project/admin/EvaluationReviewModal2';
import { evaluadorService } from '../../services/evaluadorService';
import '../../styles/pages/admin/EvaluationReviewPage.css';
import { isValidated } from '../../utils/evaluationUtils';

const ValidatedEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInvalidateModal, setShowInvalidateModal] = useState(false);
  const [invalidateReason, setInvalidateReason] = useState('');
  const [currentToInvalidate, setCurrentToInvalidate] = useState(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState('');
  const [resultModalType, setResultModalType] = useState('success');

  

  const enrichEvaluators = useCallback(async (list) => {
    if (!Array.isArray(list) || list.length === 0) return list;
    try {
      // recolectar ids únicos
      const ids = new Set();
      list.forEach(ev => {
        const id = ev.evaluadorId || ev.evaluatorId || ev.evaluador?.id || ev.evaluador_id || ev.evaluador?.userId || ev.evaluador?.user_id || null;
        if (id) ids.add(String(id));
      });

      const idArray = Array.from(ids);
      const map = new Map();
      await Promise.all(idArray.map(async (id) => {
        try {
          const data = await evaluadorService.getEvaluadorById(id);
          const name = data?.nombre ? `${data.nombre}${data.apellido ? ' ' + data.apellido : ''}` : data?.fullName || data?.nombreCompleto || null;
          if (name) map.set(String(id), name);
        } catch {
          // ignore per-id errors
        }
      }));

      // construir listado enriquecido con campo displayEvaluatorName
      return list.map(ev => {
        const id = ev.evaluadorId || ev.evaluatorId || ev.evaluador?.id || ev.evaluador_id || ev.evaluador?.userId || ev.evaluador?.user_id || null;
        const possible = ev.evaluador?.nombre || ev.evaluatorName || ev.nombreEvaluador || ev.evaluador?.nombreCompleto || ev.evaluador?.fullName || null;
        const display = possible || (id ? map.get(String(id)) : null) || 'Evaluador no disponible';
        return { ...ev, displayEvaluatorName: display };
      });
    } catch (err) {
      console.warn('Error enriqueciendo evaluadores:', err);
      return list.map(ev => ({ ...ev, displayEvaluatorName: ev.evaluador?.nombre || ev.evaluatorName || 'Evaluador no disponible' }));
    }
  }, []);

  const loadValidated = useCallback(async () => {
    try {
      setLoading(true);
      // Cargar todas las evaluaciones completadas (mismo flujo que en EvaluationReviewMainPage)
      const completedEvaluations = await evaluationService.getCompletedEvaluations();
      const rawList = completedEvaluations || [];
      // Filtrar solo las que están validadas según el helper shared
      const validatedOnly = rawList.filter(ev => isValidated(ev));
      // intentar resolver nombres de evaluadores en lote para evitar llamadas al abrir modal
      const enriched = await enrichEvaluators(validatedOnly);
      setEvaluations(enriched);
      setFiltered(enriched);
    } catch (err) {
      console.error('Error cargando evaluaciones validadas:', err);
      setEvaluations([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [enrichEvaluators]);

  useEffect(() => {
    loadValidated();
  }, [loadValidated]);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(evaluations);
      return;
    }
    const f = (evaluations || []).filter(ev => {
      const project = ev.proyecto || ev.project || {};
      const title = (project.titulo || project.nombre || '').toString().toLowerCase();
      const evaluator = (ev.displayEvaluatorName || ev.evaluador?.nombre || ev.evaluatorName || '').toString().toLowerCase();
      const id = (ev.id || '').toString();
      return title.includes(term) || evaluator.includes(term) || id.includes(term);
    });
    setFiltered(f);
  }, [search, evaluations]);

  const handleView = async (ev) => {
    // Intentar resolver nombre del evaluador si no viene en el objeto
    let enriched = { ...ev };
    try {
      const namePresent = ev.evaluador?.nombre || ev.evaluatorName || ev.nombreEvaluador;
      if (!namePresent) {
        const id = ev.evaluadorId || ev.evaluatorId || ev.evaluador?.id || ev.evaluador_id || ev.evaluador?.userId || null;
        if (id) {
          const data = await evaluadorService.getEvaluadorById(id);
          const resolved = data?.nombre ? `${data.nombre}${data.apellido ? ' ' + data.apellido : ''}` : data?.fullName || data?.nombreCompleto || null;
          if (resolved) enriched = { ...enriched, evaluador: { ...(enriched.evaluador||{}), nombre: resolved } };
        }
      }
    } catch (err) {
      console.warn('No se pudo resolver evaluador:', err);
    }

    setSelected(enriched);
    setShowModal(true);
  };

  const handleInvalidate = (ev) => {
    setCurrentToInvalidate(ev);
    setInvalidateReason('');
    setShowInvalidateModal(true);
  };

  const confirmInvalidate = async () => {
    if (!currentToInvalidate) return;
    if (!invalidateReason || invalidateReason.trim().length === 0) {
      setResultModalType('error');
      setResultModalMessage('Por favor indique el motivo de invalidación.');
      setResultModalOpen(true);
      return;
    }
    try {
      await evaluationService.invalidateEvaluation(currentToInvalidate.id, { motivoInvalidacion: invalidateReason });
      // cerrar modal de input
      setShowInvalidateModal(false);
      // recargar
      await loadValidated();
      // mostrar resultado
      setResultModalType('success');
      setResultModalMessage('Evaluación invalidada correctamente');
      setResultModalOpen(true);
    } catch (err) {
      console.error('Error invalidando evaluación:', err);
      setResultModalType('error');
      setResultModalMessage('Error invalidando evaluación. Ver consola.');
      setResultModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="evaluation-review-page">
        <div className="loading-container">
          <FaSync className="loading-spinner" />
          <p>Cargando evaluaciones validadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-review-page">
      <div className="filters-section">
        <div className="filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por proyecto, evaluador o ID..." />
          </div>
        </div>
        <div className="filter-actions">
          <button onClick={loadValidated} className="refresh-btn"><FaSync /> Actualizar</button>
          <span className="results-count">{filtered.length} evaluación{filtered.length!==1 ? 'es':''} encontrada{filtered.length!==1 ? 's':''}</span>
        </div>
      </div>

      <div className="evaluations-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FaExclamationTriangle />
            <p>No hay evaluaciones validadas.</p>
          </div>
        ) : (
          filtered.map(ev => {
            const project = ev.proyecto || ev.project || {};
            const evaluatorName = ev.displayEvaluatorName || ev.evaluador?.nombre || ev.evaluatorName || 'Evaluador no disponible';
            const date = ev.fechaFinalizacion || ev.fechaAceptacion || ev.fechaAsignacion || null;
            const total = ev.calificacionTotal || (ev.items?.reduce ? ev.items.reduce((s,it)=>s+(it.calificacion||0),0):0);
            return (
              <div key={ev.id} className="evaluation-card">
                <div className="evaluation-info">
                  <div className="evaluation-header">
                    <h3>Proyecto: {project.titulo || project.nombre || 'Proyecto no disponible'}</h3>
                  </div>
                  <div className="evaluation-meta">
                    <span><strong>Evaluador:</strong> {evaluatorName}</span>
                    <span><strong>Fecha de calificacion:</strong> {date ? new Date(date).toLocaleDateString() : 'No disponible'}</span>
                  </div>
                  <div className="evaluation-stats">
                    <span><strong>Items:</strong> {ev.items?.length||0}</span>
                    <span><strong>Puntuación Total:</strong> {total}</span>
                  </div>
                </div>
                <div className="evaluation-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-badge status-validated" style={{ background: '#10b981', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontWeight: 700, marginRight: '8px' }}>VALIDADA</span>
                  <button className="btn-view" onClick={()=>handleView(ev)} style={{ background: '#2563eb', color: '#fff', borderRadius: '6px', padding: '0.45rem 0.7rem', border: 'none' }}><FaEye style={{ marginRight: '6px' }} /> Ver</button>
                  <button className="btn-invalidate" onClick={()=>handleInvalidate(ev)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.45rem 0.7rem', borderRadius: '6px' }}>Invalidar</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selected && (
        <EvaluationReviewModal2
          evaluation={selected}
          onClose={() => { setShowModal(false); setSelected(null); }}
        />
      )}
      {/* Modal para solicitar motivo de invalidación */}
      <Modal
        isOpen={showInvalidateModal}
        onClose={() => setShowInvalidateModal(false)}
        title="Invalidar Evaluación"
        type="warning"
        size="sm"
        onConfirm={confirmInvalidate}
        confirmText="Invalidar"
        cancelText="Cancelar"
        showCancel={true}
      >
        <div style={{ marginBottom: '0.5rem' }}>Ingrese el motivo de invalidación:</div>
        <textarea
          rows={4}
          value={invalidateReason}
          onChange={(e) => setInvalidateReason(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </Modal>

      {/* Modal de resultado (éxito/error) */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={resultModalType === 'success' ? 'Éxito' : 'Error'}
        type={resultModalType}
        size="sm"
      >
        <div style={{ padding: '0.5rem 0' }}>{resultModalMessage}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <button className="btn-primary" onClick={() => setResultModalOpen(false)}>Aceptar</button>
        </div>
      </Modal>
    </div>
  );
};

export default ValidatedEvaluationsPage;
