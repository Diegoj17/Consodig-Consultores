import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaFilter } from 'react-icons/fa';
import EvaluationReportsHeader from '../../components/reports/EvaluationReportsHeader';
import EvaluationReportsMetrics from '../../components/reports/EvaluationReportsMetrics';
import EvaluationReportsProjectsTable from '../../components/reports/EvaluationReportsProjectsTable';
import EvaluationReviewModal from '../../components/management/project/admin/EvaluationReviewModal';
import EvaluationReportsAdditionalStats from '../../components/reports/EvaluationReportsAdditionalStats';
import '../../styles/pages/admin/EvaluationReportsPage.css';
import evaluationService from '../../services/evaluationService';
import { userService } from '../../services/userService';
import Modal from '../../components/common/Modal';
import evaluationFormatService from '../../services/evaluationFormatService';

const EvaluationReportsPage = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState({
    summary: {},
    projects: [],
    statistics: {}
  });

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const evaluations = await evaluationService.getCompletedEvaluations();

        // Agrupar evaluaciones por proyecto
        const projectsMap = new Map();
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalTimeMs = 0;
        let timeCount = 0;

        for (const ev of evaluations) {
          const proj = ev.project || ev.proyecto || ev.proyectoId ? (ev.project || ev.proyecto) : null;
          const projectId = proj?.id ?? ev.proyectoId ?? ev.projectId ?? `p-${ev.id}`;
          const projectName = proj?.titulo || proj?.name || proj?.tituloProyecto || proj?.nombre || proj?.tituloProyecto || `Proyecto ${projectId}`;

          // Obtener calificación total (0-100) y mapear a escala 0-5 para estrellas
          const rawScore = ev.calificacion_total ?? ev.calificacionTotal ?? ev.calificacion ?? (
            Array.isArray(ev.items) ? (ev.items.reduce((s, it) => s + (it.calificacion || 0), 0) / (ev.items.length || 1)) : null
          );
          const rating = rawScore !== null && rawScore !== undefined ? (Number(rawScore) / 20) : null; // 0-5 scale

          // Actualizar distribución por estrella redondeada (1-5)
          if (rating !== null && rating !== undefined && !isNaN(rating)) {
            const star = Math.min(5, Math.max(1, Math.round(rating)));
            ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
          }

          // Calcular tiempo entre asignación y finalización si está disponible
          const start = ev.fecha_asignacion || ev.fechaAsignacion || ev.fecha_asignacion;
          const end = ev.fecha_finalizacion || ev.fechaFinalizacion || ev.fecha_finalizacion;
          if (start && end) {
            const s = new Date(start).getTime();
            const e = new Date(end).getTime();
            if (!isNaN(s) && !isNaN(e) && e > s) {
              totalTimeMs += (e - s);
              timeCount += 1;
            }
          }

          // Intentar obtener nombre del evaluador desde distintos campos
          let evaluatorName = ev.evaluatorName || ev.evaluador?.nombre || ev.evaluador || ev.usuario?.nombre || ev.revisor || null;
          const evaluadorId = ev.evaluador_id || ev.evaluadorId || ev.evaluador?.id || ev.usuarioId || ev.usuario?.id || ev.revisorId;

          if ((!evaluatorName || evaluatorName === 'No disponible') && evaluadorId) {
            try {
              const evaluadorObj = await userService.getEvaluadorById(evaluadorId);
              if (evaluadorObj) {
                evaluatorName = evaluadorObj.nombre ? `${evaluadorObj.nombre} ${evaluadorObj.apellido || ''}`.trim() : (evaluadorObj.nombre || evaluadorObj.email || `ID ${evaluadorId}`);
              }
            } catch (err) {
              console.warn('No se pudo obtener evaluador por id', evaluadorId, err);
            }
          }

          if (!evaluatorName) evaluatorName = 'No disponible';

          // Fecha legible para mostrar en la tabla
          const dateRaw = ev.fechaCompletado || ev.fecha || ev.updatedAt || ev.createdAt || ev.fecha_finalizacion || ev.fechaFinalizacion || null;
          const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : null;
          const dateTs = dateRaw ? new Date(dateRaw).getTime() : 0;

          if (!projectsMap.has(projectId)) {
            projectsMap.set(projectId, {
              id: projectId,
              name: projectName,
              evaluator: evaluatorName,
              averageRating: rating !== null && rating !== undefined ? Number(rating.toFixed ? rating.toFixed(1) : rating) : 0,
              totalEvaluations: 1,
              ratings: rating !== null && rating !== undefined ? [rating] : [],
              lastEvaluation: dateStr,
              lastEvaluationTs: dateTs,
              status: ev.estado || ev.status || 'COMPLETADO',
              rawEvaluations: [ev]
            });
          } else {
            const entry = projectsMap.get(projectId);
            const newRatings = entry.ratings.concat(rating !== null && rating !== undefined ? [rating] : []);
            const newTotal = entry.totalEvaluations + 1;
            entry.ratings = newRatings;
            entry.totalEvaluations = newTotal;
            entry.averageRating = newRatings.length > 0 ? Number((newRatings.reduce((a,b)=>a+b,0)/newRatings.length).toFixed(1)) : entry.averageRating;
            entry.rawEvaluations.push(ev);
            // preferir evaluadorName del último si existe
            entry.evaluator = evaluatorName || entry.evaluator;
            // actualizar fecha si la nueva es más reciente
            const existingTs = entry.lastEvaluationTs || 0;
            if (dateTs && dateTs > existingTs) {
              entry.lastEvaluation = dateStr;
              entry.lastEvaluationTs = dateTs;
            }
            projectsMap.set(projectId, entry);
          }
        }

        const projects = Array.from(projectsMap.values());

        // Estadísticas y resumen
        const totalProjects = projects.length;
        const totalEvaluations = evaluations.length;
        const overallAverage = projects.length > 0 ? Number((projects.reduce((s,p) => s + (p.averageRating || 0), 0) / projects.length).toFixed(1)) : 0;
        // promedio de tiempo en formato legible
        let averageTime = null;
        if (timeCount > 0) {
          const avgMs = totalTimeMs / timeCount;
          const avgHours = avgMs / (1000 * 60 * 60);
          if (avgHours < 24) {
            averageTime = `${avgHours.toFixed(1)} horas`;
          } else {
            averageTime = `${(avgHours / 24).toFixed(1)} días`;
          }
        }

        setReportData({
          summary: {
            overallAverage,
            totalProjects,
            totalEvaluations,
            completedEvaluations: totalEvaluations,
            pendingEvaluations: 0
          },
          projects,
          statistics: {
            ratingDistribution,
            completionRate: totalEvaluations > 0 ? 100 : 0,
            averageTime
          }
        });
      } catch (error) {
        console.error('Error cargando evaluaciones reales:', error);
        // Mantener datos vacíos o podríamos setear un fallback
        setReportData(prev => ({ ...prev }));
      }
    };

    loadRealData();
  }, []);

  const exportReport = () => {
    setModalState({
      isOpen: true,
      type: 'info',
      title: 'Exportar reporte',
      message: 'Exportando reporte de evaluaciones...',
      confirmText: 'Cerrar',
      showCancel: false,
      onConfirm: null
    });
  };

  const filteredProjects = reportData.projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.evaluator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estado para modal de revisión de evaluación
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    showCancel: false,
    onConfirm: null
  });

  const handleViewDetails = async (project) => {
    // Preferir abrir la evaluación real más reciente si está disponible
    const raw = Array.isArray(project.rawEvaluations) && project.rawEvaluations.length > 0
      ? project.rawEvaluations[project.rawEvaluations.length - 1]
      : null;

    // Construir evaluación para el modal basándonos en la evaluación real (raw) y en el resumen de proyecto
    const evaluation = {};

    if (raw) {
      // Copiar campos relevantes de la evaluación real
      Object.assign(evaluation, raw);

      // Asegurar nombres de campos usados por el modal
      evaluation.id = raw.id ?? raw.evaluacionId ?? raw.evaluationId ?? project.id;
      evaluation.evaluatorName = raw.evaluatorName || raw.evaluador?.nombre || raw.evaluador || project.evaluator || 'No disponible';
      // Si solo tenemos evaluador id, intentar obtener el nombre desde userService
      const evaluadorId = raw.evaluador_id || raw.evaluadorId || raw.evaluador?.id || raw.evaluador;
      if ((!evaluation.evaluatorName || evaluation.evaluatorName === 'No disponible') && evaluadorId) {
        try {
          const evaluadorObj = await userService.getEvaluadorById(evaluadorId);
          if (evaluadorObj) {
            evaluation.evaluatorName = evaluadorObj.nombre ? `${evaluadorObj.nombre} ${evaluadorObj.apellido || ''}`.trim() : (evaluadorObj.nombre || evaluadorObj.email || `ID ${evaluadorId}`);
          }
        } catch (err) {
          console.warn('No se pudo obtener evaluador por id', evaluadorId, err);
        }
      }
      evaluation.fechaCompletado = raw.fecha_finalizacion || raw.fechaFinalizacion || raw.fechaCompletado || raw.fecha || raw.updatedAt || raw.createdAt || project.lastEvaluation;
      evaluation.estado = raw.estado || raw.status || project.status || 'COMPLETADO';

      // Si la evaluación ya trae el objeto project, preferirlo
      evaluation.project = raw.project || raw.proyecto || raw.proyectoObj || raw.proyectoData || {
        id: project.id,
        titulo: project.name,
        resumen: project.summary || project.resumen || project.description || '',
        investigadorPrincipal: project.investigator || project.evaluator || 'No disponible',
        palabrasClave: project.palabrasClave || project.keywords || [],
        nivelEstudios: project.nivelEstudios || null,
        lineasInvestigacionNames: project.lineasInvestigacionNames || [],
        archivos: project.archivos || []
      };

      // Asegurar items: si vienen del backend, usarlos, si no, construir desde ratings
      if (!Array.isArray(evaluation.items) || evaluation.items.length === 0) {
        evaluation.items = (project.ratings || []).map((r, idx) => {
          // Intentar extraer descripción desde la evaluación raw (si viene)
          const rawDesc = raw?.items?.[idx]?.descripcion || raw?.items?.[idx]?.descripcionItem || raw?.items?.[idx]?.descripcion_formato;
          // Intentar extraer desde propiedades del proyecto (por si vienen los items del formato allí)
          const projItemDesc = (project.item_formato && project.item_formato[idx] && project.item_formato[idx].descripcion) || project.items?.[idx]?.descripcion || project.items_descriptions?.[idx] || project.itemDescriptions?.[idx];

          const descripcion = rawDesc || projItemDesc || 'Descripción no disponible';

          return {
            itemEvaluadoId: idx + 1,
            nombre: `Criterio ${idx + 1}`,
            descripcion,
            peso: 1,
            calificacion: r,
            observacion: ''
          };
        });
      }

      // Si las descripciones no están presentes, intentar cargarlas desde el formato asociado
      const missingDesc = evaluation.items.some(it => !it.descripcion || it.descripcion === 'Descripción no disponible');
      if (missingDesc) {
        // Intentar obtener formatoId desde la evaluación raw o desde el proyecto
        const formatoId = raw.formatoId || raw.formato_id || raw.formato?.id || raw.formato?.formatoId || project.formatoId || project.formato_id || project.formato?.id || project.formatId || project.formatoId;

        if (formatoId) {
          try {
            setModalState({ isOpen: true, type: 'info', title: 'Cargando', message: 'Obteniendo datos del formato...', confirmText: 'Cerrar', showCancel: false, onConfirm: null });
            const formatData = await evaluationFormatService.getFormatById(formatoId);
            const formatItems = formatData.items || formatData.item_formato || [];

            // Mapear descripciones desde formatItems por índice o por id
            evaluation.items = evaluation.items.map((it, idx) => {
              if (it.descripcion && it.descripcion !== 'Descripción no disponible') return it;

              // Intentar por id: buscar un item de formato que coincida con itemEvaluadoId o itemFormatoId
              const byId = formatItems.find(fi => fi.id === it.itemFormatoId || fi.item_formato_id === it.itemFormatoId || fi.id === it.itemEvaluadoId || fi.id === it.item_id);
              const descById = byId?.descripcion || byId?.descripcionItem || byId?.descripcion_formato;

              const byIndex = formatItems[idx];
              const descByIndex = byIndex?.descripcion || byIndex?.descripcionItem || byIndex?.descripcion_formato;

              const descripcion = descById || descByIndex || it.descripcion || 'Descripción no disponible';

              return { ...it, descripcion };
            });
          } catch (err) {
            console.warn('No se pudo cargar formato para descripciones:', err);
          } finally {
            setModalState(prev => ({ ...prev, isOpen: false }));
          }
        }
      }
    } else {
      // No hay raw; construir desde el resumen del proyecto
      evaluation.id = project.id;
      evaluation.evaluatorName = project.evaluator || 'No disponible';
      evaluation.fechaCompletado = project.lastEvaluation;
      evaluation.estado = project.status || 'COMPLETADO';
      evaluation.calificacionTotal = project.averageRating;
      evaluation.items = (project.ratings || []).map((r, idx) => {
        const projItemDesc = (project.item_formato && project.item_formato[idx] && project.item_formato[idx].descripcion) || project.items?.[idx]?.descripcion || project.items_descriptions?.[idx] || project.itemDescriptions?.[idx];
        const descripcion = projItemDesc || 'Descripción no disponible';

        return {
          itemEvaluadoId: idx + 1,
          nombre: `Criterio ${idx + 1}`,
          descripcion,
          peso: 1,
          calificacion: r,
          observacion: ''
        };
      });
      evaluation.project = {
        id: project.id,
        titulo: project.name,
        resumen: project.description || '',
        investigadorPrincipal: project.evaluator,
        palabrasClave: project.palabrasClave || project.keywords || [],
        nivelEstudios: project.nivelEstudios || null,
        lineasInvestigacionNames: project.lineasInvestigacionNames || [],
        archivos: project.archivos || []
      };
    }

    setSelectedEvaluation(evaluation);
    // DEBUG: mostrar evaluación construida para verificar campos del backend (temporal)
    console.log('DEBUG selectedEvaluation (from reports page):', { raw, project, evaluation });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedEvaluation(null);
  };

  // Callbacks mínimos (mock) que el modal espera
  const onAddObservation = async (evaluationId, observation) => {
    setModalState({
      isOpen: true,
      type: 'info',
      title: 'Agregar observación',
      message: `Observación para evaluación ${evaluationId}: ${observation}`,
      confirmText: 'Cerrar',
      showCancel: false,
      onConfirm: null
    });
  };

  const onApprove = async (evaluationId) => {
    setModalState({
      isOpen: true,
      type: 'success',
      title: 'Aprobar evaluación',
      message: `Evaluación ${evaluationId} aprobada (mock).`,
      confirmText: 'Cerrar',
      showCancel: false,
      onConfirm: () => handleCloseReviewModal()
    });
  };

  const onRequestChanges = async (evaluationId, reason) => {
    setModalState({
      isOpen: true,
      type: 'info',
      title: 'Solicitud de cambios',
      message: `Solicitud de cambios para evaluación ${evaluationId}: ${reason}`,
      confirmText: 'Cerrar',
      showCancel: false,
      onConfirm: () => handleCloseReviewModal()
    });
  };

  const onEditEvaluation = async (evaluationId) => {
    setModalState({
      isOpen: true,
      type: 'success',
      title: 'Editar evaluación',
      message: `Edición guardada (mock) para evaluación ${evaluationId}`,
      confirmText: 'Cerrar',
      showCancel: false,
      onConfirm: null
    });
  };

  return (
    <div className="evaluation-reports-page">
      <EvaluationReportsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        onExport={exportReport}
      />

      <EvaluationReportsMetrics
        summary={reportData.summary}
        statistics={reportData.statistics}
      />

      <EvaluationReportsProjectsTable
        projects={filteredProjects}
        onFilter={() => setModalState({ isOpen: true, type: 'info', title: 'Filtros', message: 'Filtros avanzados (mock)', confirmText: 'Cerrar', showCancel: false, onConfirm: null })}
        onViewDetails={handleViewDetails}
      />

      {showReviewModal && selectedEvaluation && (
        <EvaluationReviewModal
          evaluation={selectedEvaluation}
          onClose={handleCloseReviewModal}
          onAddObservation={onAddObservation}
          onApprove={onApprove}
          onRequestChanges={onRequestChanges}
          onEditEvaluation={onEditEvaluation}
        />
      )}

      <EvaluationReportsAdditionalStats
        statistics={reportData.statistics}
        summary={reportData.summary}
      />
      {/* Modal global para mensajes */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        showCancel={modalState.showCancel}
        onConfirm={() => {
          try {
            if (modalState.onConfirm) modalState.onConfirm();
          } finally {
            setModalState(prev => ({ ...prev, isOpen: false }));
          }
        }}
      />
    </div>
  );
};

export default EvaluationReportsPage;