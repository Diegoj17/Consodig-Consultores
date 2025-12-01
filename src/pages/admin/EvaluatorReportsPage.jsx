import React, { useState, useEffect } from 'react';
import '../../styles/pages/admin/EvaluatorReportsPage.css';
import userService from '../../services/userService';
import projectApi from '../../api/ProjectAxios';
import evaluationService from '../../services/evaluationService';
import EvaluatorReportsHeader from '../../components/reports/EvaluatorReportsHeader';
import EvaluatorReportsSummary from '../../components/reports/EvaluatorReportsSummary';
import EvaluatorReportsSelection from '../../components/reports/EvaluatorReportsSelection';
import EvaluatorReportsDetails from '../../components/reports/EvaluatorReportsDetails';

const pickString = (values, fallback = '') => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return fallback;
};

const extractRating = (ev) => {
  if (!ev) return null;
  const candidates = [
    ev.calificacion_total, ev.calificacionTotal, ev.calificacion,
    ev.score, ev.promedio, ev.rating, ev.nota
  ];
  let r = null;
  for (const c of candidates) {
    if (typeof c === 'number' && !isNaN(c)) { r = c; break; }
    if (typeof c === 'string' && c.trim() !== '' && !isNaN(Number(c))) { r = Number(c); break; }
  }

  if (r == null) {
    const items = ev.items || ev.criterios || ev.itemsEvaluados || ev.itemEvaluados || ev.itemEvaluado;
    if (Array.isArray(items) && items.length > 0) {
      const sum = items.reduce((s, it) => {
        const v = it.calificacion || it.score || it.valor || it.puntuacion || it.nota;
        return s + (typeof v === 'number' ? v : (typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : 0));
      }, 0);
      r = sum / items.length;
    }
  }

  if (r == null) return null;
  if (r > 5) r = r / 20;
  return Number(r);
};

const getProjectName = (evaluation) => pickString([
  evaluation?.proyecto?.nombre,
  evaluation?.proyecto?.titulo,
  evaluation?.project?.name,
  evaluation?.project?.title,
  evaluation?.projectName,
  evaluation?.proyectoNombre,
  evaluation?.nombreProyecto,
  evaluation?.projectTitle,
  evaluation?.proyectoTitulo
], `Proyecto #${evaluation?.proyectoId || evaluation?.projectId || evaluation?.id || ''}`);

const getEvaluationName = (evaluation) => pickString([
  evaluation?.formato?.nombre,
  evaluation?.formatoEvaluacion?.nombre,
  evaluation?.evaluationFormat?.name,
  evaluation?.format?.name,
  evaluation?.nombre,
  evaluation?.titulo,
  evaluation?.nombreEvaluacion,
  evaluation?.evaluacionNombre,
  evaluation?.evaluationName,
  evaluation?.evaluationTitle,
  evaluation?.descripcion
], `Evaluación #${evaluation?.id || ''}`);

const EvaluatorReportsPage = () => {
  const [timeFilter, setTimeFilter] = useState('last-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluator, setSelectedEvaluator] = useState('');
  const [reportData, setReportData] = useState({
    evaluators: [],
    summary: {
      totalEvaluators: 0,
      activeEvaluators: 0,
      averageRating: 0,
      totalEvaluations: 0
    },
    selectedEvaluatorData: null
  });

  // Reutilizable: intentar obtener una calificación normalizada 0-5 desde una evaluación

  useEffect(() => {
    // Cargar evaluadores reales y sus evaluaciones desde la API
    const load = async () => {
      try {
        const evaluadores = await userService.getEvaluadores();
        const resp = await projectApi.get('/evaluaciones');
        const evaluations = resp.data || [];

        // Agrupar evaluaciones por evaluador (soportar varios nombres de campo)
        const grouped = {};
        evaluations.forEach((ev) => {
          let eid = ev.evaluadorId || (ev.evaluador && ev.evaluador.id) || ev.evaluatorId || ev.asignadoA || ev.assignedToId || ev.evaluador;
          if (typeof eid === 'object') eid = eid?.id;
          if (!eid) return;
          const key = String(eid);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(ev);
        });

        // usamos la función extractRating definida fuera del useEffect

        const evaluatorsProcessed = (evaluadores || []).map((ev) => {
          const idKey = String(ev.id);
          const evals = grouped[idKey] || [];

          const ratings = evals.map(extractRating).filter(v => v != null && !isNaN(v));
          const averageRating = ratings.length ? Number((ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1)) : null;

          const ratingsDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          ratings.forEach(r => {
            const star = Math.min(5, Math.max(1, Math.round(r)));
            ratingsDistribution[star] = (ratingsDistribution[star] || 0) + 1;
          });

          const completed = evals.filter(e => ((e.estado || e.status || '').toUpperCase()) === 'COMPLETADA').length;
          const pending = evals.filter(e => {
            const st = ((e.estado || e.status || '') || '').toUpperCase();
            if (st === 'ASIGNADA') return true;
            if (st === 'ACEPTADA') {
              return (evaluationService && evaluationService.calculateProgress) ? evaluationService.calculateProgress(e) === 0 : true;
            }
            return false;
          }).length;

          return {
            id: ev.id,
            name: ev.nombre || `${ev.nombre || ''} ${ev.apellido || ''}`.trim() || ev.nombreCompleto || ev.nombre || ev.email || (`ID ${ev.id}`),
            email: ev.email || ev.correo || ev.mail || ev.email || '',
            institution: ev.afiliacionInstitucional || ev.afiliacion || ev.institucion || ev.institution || '',
            specialization: ev.nivelEducativo || ev.especializacion || '',
            status: ev.estado || ev.estado || (ev.estado === 'INACTIVO' ? 'Inactivo' : 'Activo'),
            averageRating,
            totalProjects: evals.length,
            completedEvaluations: completed,
            pendingEvaluations: pending,
            joinDate: ev.registrationDate || ev.fechaRegistro || ev.createdAt || '',
            lastActivity: ev.lastActivity || '',
            evaluations: evals,
            ratingsDistribution
          };
        });

        const summary = {
          totalEvaluators: evaluatorsProcessed.length,
          activeEvaluators: evaluatorsProcessed.filter(e => (e.status || '').toUpperCase() === 'ACTIVO').length,
          averageRating: (evaluatorsProcessed.reduce((s, e) => s + (Number(e.averageRating) || 0), 0) / Math.max(1, evaluatorsProcessed.length)).toFixed(1),
          totalEvaluations: evaluations.length
        };

        setReportData({ evaluators: evaluatorsProcessed, summary, selectedEvaluatorData: null });
        setSelectedEvaluator(evaluatorsProcessed[0]?.id || '');
      } catch (error) {
        console.error('Error cargando datos de evaluadores/evaluaciones:', error);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (selectedEvaluator) {
      const evaluator = reportData.evaluators.find(e => String(e.id) === String(selectedEvaluator));
      if (evaluator) {
        const evals = evaluator.evaluations || [];

        // Construir timeline por mes
        const timelineMap = {};
        evals.forEach(ev => {
          const dateStr = ev.fecha || ev.fechaAsignacion || ev.createdAt || ev.createdAt || ev.updatedAt || ev.date;
          const d = dateStr ? new Date(dateStr) : null;
          const month = d ? d.toLocaleString('default', { month: 'short' }) : 'N/A';
          if (!timelineMap[month]) timelineMap[month] = { evaluations: 0, avgSum: 0, count: 0 };
          timelineMap[month].evaluations += 1;
          const ratingVal = extractRating(ev);
          const rating = (typeof ratingVal === 'number' && !isNaN(ratingVal)) ? ratingVal : 0;
          if (rating > 0) { timelineMap[month].avgSum += rating; timelineMap[month].count += 1; }
        });

        const timeline = Object.keys(timelineMap).map(m => ({ month: m, evaluations: timelineMap[m].evaluations, averageRating: timelineMap[m].count ? +(timelineMap[m].avgSum / timelineMap[m].count).toFixed(2) : 0 })).slice(-12);

        const projects = evals.map(ev => {
          const ratingValue = extractRating(ev);
          return {
            projectName: getProjectName(ev),
            evaluationName: getEvaluationName(ev),
            rating: ratingValue != null ? Number(ratingValue).toFixed(1) : '0.0',
            date: ev.fecha || ev.createdAt || '',
            status: ev.estado || ev.status || ''
          };
        }).slice(0, 12);

        const ratingsDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        evals.forEach(ev => {
          const val = extractRating(ev);
          const rounded = typeof val === 'number' && !isNaN(val) ? Math.round(val) : 0;
          const r = Math.min(5, Math.max(0, rounded));
          if (r >= 1 && r <= 5) ratingsDistribution[r] += 1;
        });

        const detailedData = { ...evaluator, performance: { timeline, projects, ratingsDistribution } };
        setReportData(prev => ({ ...prev, selectedEvaluatorData: detailedData }));
      }
    }
  }, [selectedEvaluator, reportData.evaluators]);

  const exportReport = () => {
    alert('Exportando reporte del evaluador...');
  };

  const sendMessage = (evaluator) => {
    alert(`Enviando mensaje a: ${evaluator.name}`);
  };

  const filteredEvaluators = reportData.evaluators.filter(evaluator =>
    (evaluator.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (evaluator.institution || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (evaluator.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="evaluator-reports-page">
      <EvaluatorReportsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        onExport={exportReport}
      />

      <EvaluatorReportsSummary summary={reportData.summary} />

      <EvaluatorReportsSelection
        evaluators={filteredEvaluators}
        selectedEvaluator={selectedEvaluator}
        onSelectEvaluator={setSelectedEvaluator}
        onSendMessage={sendMessage}
      />

      {/* Detalles del Evaluador Seleccionado */}
      {reportData.selectedEvaluatorData && (
        <>
          <EvaluatorReportsDetails evaluator={reportData.selectedEvaluatorData} />
        </>
      )}
    </div>
  );
};

export default EvaluatorReportsPage;