import React, { useEffect, useState, useCallback } from 'react';
import EvaluandoStats from '../../../components/dashboard/evaluando/EvaluandoStats';
import EvaluandoActions from '../../../components/dashboard/evaluando/EvaluandoActions';
import PendingEvaluations from '../../../components/dashboard/evaluando/PendingEvaluations';
import EvaluationResults from '../../../components/dashboard/evaluando/EvaluationResults';
import '../../../styles/pages/user/evaluando/EvaluandoDashboardPage.css';
import { evaluationService } from '../../../services/evaluationService';

const EvaluandoDashboardPage = () => {
  // const { user } = useAuth(); // not required here yet

  const [pending, setPending] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, ip, c] = await Promise.all([
        evaluationService.getPendingEvaluations(),
        evaluationService.getInProgressEvaluations(),
        evaluationService.getCompletedEvaluations(),
      ]);

      setPending(Array.isArray(p) ? p : []);
      setInProgress(Array.isArray(ip) ? ip : []);
      setCompleted(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error('Error cargando dashboard evaluando:', err);
      setError(err?.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const safeGet = (obj, ...keys) => {
    for (const k of keys) {
      if (!obj) return undefined;
      if (obj[k] !== undefined) return obj[k];
    }
    return undefined;
  };

  const mapPending = (arr) => (arr || []).map(ev => {
    const rawName = safeGet(ev, 'name', 'titulo', 'nombre') || ev.formato?.nombre || ev.formato?.name || ev.formatoName || ev.descripcion || 'Evaluación';
    let name = rawName;
    if (name && typeof name === 'object') {
      name = name.nombre || name.name || name.titulo || name.descripcion || `Formato ${name.id || ''}` || 'Evaluación';
    }

    const dueDate = safeGet(ev, 'dueDate', 'fechaVencimiento', 'vence', 'fecha_limite') || ev.fecha || null;
    const duration = safeGet(ev, 'duration', 'duracion', 'tiempoEstimado') || '';
    let project = safeGet(ev, 'project', 'proyecto', 'projectName', 'proyectoNombre') || (ev.proyecto && (ev.proyecto.nombre || ev.proyecto.name)) || '';
    if (project && typeof project === 'object') {
      project = project.nombre || project.name || String(project.id || project._id || '') || '';
    }
    return {
      id: ev.id,
      name,
      dueDate,
      duration,
      project,
      raw: ev
    };
  });

  const mapResults = (arr) => (arr || []).map(ev => {
    const rawName = safeGet(ev, 'name', 'titulo', 'nombre') || ev.formato?.nombre || ev.formato?.name || 'Evaluación';
    let name = rawName;
    if (name && typeof name === 'object') {
      name = name.nombre || name.name || name.titulo || name.descripcion || `Formato ${name.id || ''}` || 'Evaluación';
    }

    const score = safeGet(ev, 'score', 'nota', 'calificacion', 'notaFinal') || safeGet(ev, 'resultado', 'resultadoFinal') || null;
    const date = safeGet(ev, 'completedAt', 'fechaFinalizacion', 'fecha', 'updatedAt') || ev.fecha || null;
    let project = safeGet(ev, 'project', 'proyecto', 'projectName') || (ev.proyecto && (ev.proyecto.nombre || ev.proyecto.name)) || '';
    if (project && typeof project === 'object') {
      project = project.nombre || project.name || String(project.id || project._id || '') || '';
    }
    return {
      id: ev.id,
      evaluation: name,
      score: typeof score === 'number' ? score : (score ? Number(score) : 0),
      date,
      project,
      raw: ev
    };
  });

  const stats = {
    pendingEvaluations: pending.length + inProgress.length,
    completedEvaluations: completed.length,
    averageScore: completed.length > 0 ? Math.round((completed.reduce((sum, ev) => {
      const s = safeGet(ev, 'nota', 'score', 'calificacion', 'notaFinal') || safeGet(ev, 'resultado', 0) || 0;
      return sum + (typeof s === 'number' ? s : (s ? Number(s) : 0));
    }, 0) / completed.length)) : 0,
    projectsEnrolled: (() => {
      const set = new Set();
      [...pending, ...inProgress, ...completed].forEach(ev => {
        const pid = safeGet(ev, 'proyecto', 'project', 'projectId', 'proyectoId') || (ev.proyecto && (ev.proyecto.id || ev.proyecto._id));
        if (pid) set.add(pid);
      });
      return set.size;
    })()
  };

  const handleStartEvaluation = (evaluationId) => {
    console.log('Comenzando evaluación:', evaluationId);
    // TODO: navegar a la ruta de evaluación
  };

  const handleViewResults = (resultId) => {
    console.log('Viendo resultados:', resultId);
    // TODO: navegar a detalles
  };

  return (
    <div className="evaluando-dashboard">
      {loading && <div>Cargando datos del dashboard...</div>}
      {error && <div style={{ color: 'var(--danger, #d9534f)' }}>Error: {error}</div>}

      {!loading && !error && (
        <>
          <EvaluandoStats stats={stats} />

          <EvaluandoActions 
            onViewAllEvaluations={() => console.log('Ver todas las evaluaciones')}
            onViewAllResults={() => console.log('Ver todos los resultados')}
          />

          <div className="dashboard-content">
            <div className="content-column">
              <PendingEvaluations 
                evaluations={mapPending([...pending, ...inProgress])}
                onStartEvaluation={handleStartEvaluation}
              />
            </div>

            <div className="content-column">
              <EvaluationResults 
                results={mapResults(completed).slice(0, 6)}
                onViewDetails={handleViewResults}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluandoDashboardPage;