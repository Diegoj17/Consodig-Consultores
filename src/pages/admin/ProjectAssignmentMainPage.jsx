// ProjectAssignmentMainPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaUser, FaUserCheck, FaCalendar, FaUserPlus, FaEye, FaSync, FaFilter, FaGraduationCap, FaCodeBranch } from 'react-icons/fa';
import AssignmentStats from '../../components/management/project/admin/AssignmentStats';
import Modal from '../../components/common/Modal';
import evaluationService from '../../services/evaluationService';
import projectService from '../../services/projectService';
import evaluationFormatService from '../../services/evaluationFormatService';
import { AsignarEvaluacionDTO } from '../../services/dtos';
import '../../styles/pages/admin/AssignmentMainPage.css';
import userService from '../../services/userService';

const ProjectAssignmentMainPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluationDeadline, setEvaluationDeadline] = useState({ mode: 'date', date: '', days: 7, hours: 0 });
  const [anonymousEvaluation, setAnonymousEvaluation] = useState(true);
  const [projects, setProjects] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [filterByCompatibility, setFilterByCompatibility] = useState(true);
  const [formats, setFormats] = useState([]);
  const [selectedFormatId, setSelectedFormatId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, projectId: null, evaluatorId: null, title: '', message: '' });
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, evaluatorsData, formatsData] = await Promise.all([
        projectService.getAll(),
        userService.getEvaluadores(),
        evaluationFormatService.getAllFormats()
      ]);
      setProjects(transformProjectsData(projectsData));
      setEvaluators(transformEvaluatorsData(evaluatorsData));
      setFormats(Array.isArray(formatsData) ? formatsData : []);
      // Seleccionar formato por defecto si no hay seleccionado
      if ((!selectedFormatId || selectedFormatId === null) && Array.isArray(formatsData) && formatsData.length > 0) {
        setSelectedFormatId(formatsData[0].id);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
    } finally { setLoading(false); }
  }, [selectedFormatId]);

  useEffect(() => { loadData(); }, [loadData]);

  const transformProjectsData = (projectsData) => {
    if (!Array.isArray(projectsData)) return [];
    const mapNivel = (nivel) => {
      if (!nivel && nivel !== 0) return null;
      const m = {1:'PREGRADO',2:'TECNICO',3:'TECNOLOGO',4:'PROFESIONAL',5:'ESPECIALIZACION',6:'MAESTRIA',7:'DOCTORADO',8:'POSTDOCTORADO'};
      if (typeof nivel === 'number') return m[nivel] || String(nivel);
      const n = Number(nivel); if (!isNaN(n)) return m[n] || String(n);
      return String(nivel).trim().toUpperCase();
    };
    const normalizeLineas = (p) => {
      if (p.lineasInvestigacionNames && Array.isArray(p.lineasInvestigacionNames) && p.lineasInvestigacionNames.length > 0) return p.lineasInvestigacionNames.map(String);
      const raw = p.lineasInvestigacion || p.lineasInvestigacionIds || [];
      if (!Array.isArray(raw)) return [];
      return raw.map(item => { if (typeof item === 'string') return item; if (typeof item === 'number') return String(item); if (typeof item === 'object') return item.nombre || item.name || String(item.id || ''); return String(item); }).filter(Boolean);
    };
    return projectsData.map(p => ({
      id: p.id,
      titulo: p.titulo || p.nombre || 'Sin título',
      investigadorPrincipal: p.investigadorPrincipal || p.autor || 'Investigador no asignado',
      fechaEnvio: p.fechaEnvio || p.fechaCreacion || new Date().toISOString().split('T')[0],
      estado: p.evaluaciones && p.evaluaciones.length > 0 ? 'Preasignado' : (p.estado || 'Pendiente'),
      evaluadorAsignado: p.evaluaciones && p.evaluaciones.length > 0 ? p.evaluaciones[0]?.evaluador?.nombre : null,
      area: (p.lineasInvestigacion && p.lineasInvestigacion.length > 0) ? (typeof p.lineasInvestigacion[0] === 'string' ? p.lineasInvestigacion[0] : p.lineasInvestigacion[0].nombre || 'General') : (p.area || 'General'),
      lineasInvestigacion: normalizeLineas(p),
      nivelEstudios: mapNivel(p.nivelEstudios || p.nivelEstudio || p.nivel || null),
      proyectoOriginal: p
    }));
  };

  const transformEvaluatorsData = (evaluatorsData) => {
    if (!Array.isArray(evaluatorsData)) return [];
    const normalizeLineas = (e) => { const raw = e.lineasInvestigacionEvaluador || e.lineasInvestigacion || []; if (!Array.isArray(raw)) return []; return raw.map(item => { if (typeof item === 'string') return item; if (typeof item === 'number') return String(item); if (typeof item === 'object') return item.nombre || item.name || String(item.id || ''); return String(item); }).filter(Boolean); };
    const normalizeNivel = (nivel) => { if (!nivel && nivel !== 0) return null; const m = {1:'PREGRADO',2:'TECNICO',3:'TECNOLOGO',4:'PROFESIONAL',5:'ESPECIALIZACION',6:'MAESTRIA',7:'DOCTORADO',8:'POSTDOCTORADO'}; if (typeof nivel === 'number') return m[nivel] || String(nivel); const n = Number(nivel); if (!isNaN(n)) return m[n] || String(n); return String(nivel).trim().toUpperCase(); };
    return evaluatorsData.map(e => ({ id: e.id, nombre: `${e.nombre || ''} ${e.apellido || ''}`.trim() || 'Evaluador', perfil: e.afiliacionInstitucional || e.nivelEducativo || 'Evaluador', disponible: (e.estado === 'ACTIVO') && ((e.proyectosAsignados || 0) < 3), especialidades: normalizeLineas(e), proyectosAsignados: e.proyectosAsignados || 0, lineasInvestigacion: normalizeLineas(e), nivelEducativo: normalizeNivel(e.nivelEducativo || e.nivel || null), evaluadorOriginal: e }));
  };

  const calculateCompatibility = (project, evaluator) => {
    let score = 0; let matches = [];
    const projectLines = Array.isArray(project.lineasInvestigacion) ? project.lineasInvestigacion : [];
    const evaluatorLines = Array.isArray(evaluator.lineasInvestigacion) ? evaluator.lineasInvestigacion : [];
    const commonLines = projectLines.filter(pl => evaluatorLines.some(el => { if (!pl || !el) return false; const plName = typeof pl === 'string' ? pl : (pl.nombre || pl.name || String(pl)); const elName = typeof el === 'string' ? el : (el.nombre || el.name || String(el)); return plName === elName; }));
    if (commonLines.length > 0) { score += 50; matches.push(`${commonLines.length} línea(s) de investigación coincidente(s)`); }
    const projectLevel = project.nivelEstudios; const evaluatorLevel = evaluator.nivelEducativo; if (projectLevel && evaluatorLevel) { const hierarchy = {'PREGRADO':1,'TECNICO':2,'TECNOLOGO':3,'PROFESIONAL':4,'ESPECIALIZACION':5,'MAESTRIA':6,'DOCTORADO':7,'POSTDOCTORADO':8}; const pN = hierarchy[String(projectLevel).toUpperCase()] || 0; const eN = hierarchy[String(evaluatorLevel).toUpperCase()] || 0; if (eN >= pN) { score += 30; matches.push(`Nivel educativo compatible (${evaluatorLevel} ≥ ${projectLevel})`); } }
    if (evaluator.disponible) { score += 20; matches.push('Evaluador disponible'); }
    return { score, matches, percentage: Math.min(100, score), commonLines: commonLines.length };
  };

  // Compatibilidad estricta: requiere al menos 1 línea coincidente y mismo nivel de estudios
  const isStrictMatch = (project, evaluator) => {
    if (!project || !evaluator) return false;
    const projectLines = Array.isArray(project.lineasInvestigacion) ? project.lineasInvestigacion : [];
    const evaluatorLines = Array.isArray(evaluator.lineasInvestigacion) ? evaluator.lineasInvestigacion : [];
    if (projectLines.length === 0 || evaluatorLines.length === 0) return false;
    const hasCommonLine = projectLines.some(pl => {
      if (!pl) return false;
      const plName = (typeof pl === 'string' ? pl : (pl.nombre || pl.name || '')).toString().trim().toUpperCase();
      return evaluatorLines.some(el => {
        if (!el) return false;
        const elName = (typeof el === 'string' ? el : (el.nombre || el.name || '')).toString().trim().toUpperCase();
        return plName && elName && plName === elName;
      });
    });
    if (!hasCommonLine) return false;
    const projectLevel = (project.nivelEstudios || '').toString().trim().toUpperCase();
    const evaluatorLevel = (evaluator.nivelEducativo || '').toString().trim().toUpperCase();
    if (!projectLevel || !evaluatorLevel) return false;
    return projectLevel === evaluatorLevel;
  };

  const calculateTimeLimitInHours = (deadline) => {
    const DEFAULT = 168; if (!deadline) return DEFAULT;
    if (typeof deadline === 'object' && deadline.mode === 'duration') { const d = Number(deadline.days) || 0; const h = Number(deadline.hours) || 0; const total = d * 24 + h; return Math.max(24, total || DEFAULT); }
    let dateString = '';
    if (typeof deadline === 'object' && deadline.mode === 'date') dateString = deadline.date;
    if (typeof deadline === 'string') dateString = deadline;
    if (!dateString) return DEFAULT;
    try { const d = new Date(dateString); const now = new Date(); if (isNaN(d.getTime())) return DEFAULT; if (d <= now) return DEFAULT; const diff = Math.ceil((d - now) / (1000 * 60 * 60)); return Math.max(24, diff); } catch (err) { console.error('Error calculando tiempo límite:', err); return DEFAULT; }
  };

  const availableProjects = useMemo(() => projects.filter(p => !p.evaluadorAsignado || p.estado === 'Pendiente'), [projects]);

  const availableEvaluators = useMemo(() => {
    if (!selectedProject) return [];
    let list = evaluators.filter(e => e.disponible);
    list = list.map(e => ({ ...e, compatibility: calculateCompatibility(selectedProject, e) }));
    // Si el admin activa el filtro por compatibilidad, aplicar filtrado estricto
    if (filterByCompatibility) {
      list = list.filter(e => isStrictMatch(selectedProject, e)).sort((a,b) => b.compatibility.score - a.compatibility.score);
    }
    return list;
  }, [evaluators, selectedProject, filterByCompatibility]);

  const handleAssignEvaluator = async (projectId, evaluatorId) => {
    try {
      setAssigning(true);
      const tiempoLimiteHoras = calculateTimeLimitInHours(evaluationDeadline);
      if (!projectId || !evaluatorId) throw new Error('Datos incompletos para la asignación');
      if (!selectedFormatId) throw new Error('Formato de evaluación no seleccionado');
      const dto = AsignarEvaluacionDTO(projectId, Number(selectedFormatId), evaluatorId, tiempoLimiteHoras);
      await evaluationService.assignEvaluation(dto);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, evaluadorAsignado: evaluators.find(ev => ev.id === evaluatorId)?.nombre, estado: 'Preasignado' } : p));
      setEvaluators(prev => prev.map(ev => ev.id === evaluatorId ? { ...ev, proyectosAsignados: (ev.proyectosAsignados || 0) + 1, disponible: ((ev.proyectosAsignados || 0) + 1) < 3 } : ev));
      setNotifyModal({ isOpen: true, type: 'success', title: 'Asignación exitosa', message: 'Evaluador asignado exitosamente en modalidad doble ciego' });
      setSelectedProject(null);
      setEvaluationDeadline({ mode: 'date', date: '', days: 7, hours: 0 });
    } catch (err) {
      console.error('Error asignando evaluador:', err);
      let msg = 'Error al asignar evaluador'; if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message; else if (err.message) msg = err.message; setNotifyModal({ isOpen: true, type: 'error', title: 'Error', message: msg });
    } finally { setAssigning(false); }
  };

  const openConfirmAssign = (projectId, evaluatorId, evaluatorName) => {
    const projectTitle = projects.find(p => p.id === projectId)?.titulo || '';
    const timeText = evaluationDeadline.mode === 'date' ? `Fecha límite: ${evaluationDeadline.date || 'No especificada'}` : `Plazo: ${evaluationDeadline.days} días ${evaluationDeadline.hours} horas`;
    const formatName = (formats.find(f => String(f.id) === String(selectedFormatId))?.nombre) || '';
    setConfirmModal({ isOpen: true, projectId, evaluatorId, title: 'Confirmar asignación', message: `¿Asignar a ${evaluatorName} al proyecto "${projectTitle}"?\n${timeText}\nFormato: ${formatName}` });
  };

  const getProjectDetails = () => { if (!selectedProject) return null; return { lineasInvestigacion: selectedProject.lineasInvestigacion || [], nivelEstudios: selectedProject.nivelEstudios, area: selectedProject.area }; };

  const formatDate = (dateString) => { if (!dateString) return 'No especificada'; try { return new Date(dateString).toLocaleDateString('es-ES'); } catch { return dateString; } };
  const getMinDate = () => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); return tomorrow.toISOString().split('T')[0]; };

  if (loading) return (<div className="project-admin-assignment-page loading"><div className="loading-spinner"><FaSync className="spinning" /><p>Cargando datos...</p></div></div>);
  if (error) return (<div className="project-admin-assignment-page error"><div className="error-message"><p>{error}</p><button onClick={loadData} className="retry-button">Reintentar</button></div></div>);

  const projectDetails = getProjectDetails();

  return (
    <div className="project-admin-assignment-page">
      <AssignmentStats projects={projects} evaluators={evaluators} selectedProject={selectedProject} />

      <div className="project-admin-assignment-grid">
        <div className="project-admin-assignment-column">
          <div className="project-admin-column-header">
            <FaUser className="project-admin-column-icon" />
            <h3>Proyectos Disponibles</h3>
            <span className="project-admin-count-badge">{availableProjects.length}</span>
            <button onClick={loadData} className="refresh-button" title="Actualizar datos"><FaSync /></button>
          </div>

          <div className="project-admin-assignment-list">
            {availableProjects.length === 0 ? (
              <div className="project-admin-empty-state"><p>No hay proyectos disponibles para asignación</p></div>
            ) : (
              availableProjects.map(project => (
                <div key={project.id} className={`project-admin-assignment-card ${selectedProject?.id === project.id ? 'project-admin-assignment-card--selected' : ''}`} onClick={() => setSelectedProject(project)}>
                  <div className="project-admin-assignment-card-content">
                    <h4>{project.titulo}</h4>
                    <p className="project-admin-card-field"><FaCodeBranch className="project-admin-card-icon" /> <strong>Líneas:</strong> {project.lineasInvestigacion?.length ? (project.lineasInvestigacion.slice(0,2).join(', ') + (project.lineasInvestigacion.length > 2 ? ` +${project.lineasInvestigacion.length - 2} más` : '')) : 'No especificado'}</p>
                    <p className="project-admin-card-field"><FaGraduationCap className="project-admin-card-icon" /> <strong>Nivel:</strong> {project.nivelEstudios || 'No especificado'}</p>
                    <p className="project-admin-card-field"><FaCalendar className="project-admin-card-icon" /> <strong>Envío:</strong> {formatDate(project.fechaEnvio)}</p>
                  </div>
                  <FaEye className="project-admin-select-indicator" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="project-admin-assignment-column">
          {selectedProject ? (
            <>
              <div className="project-admin-column-header"><FaUserCheck className="project-admin-column-icon" /><h3>Evaluadores Compatibles</h3><span className="project-admin-count-badge">{availableEvaluators.length}</span></div>

              <div className="project-admin-project-selected">
                <h4>Proyecto seleccionado:</h4>
                <p><strong>{selectedProject.titulo}</strong></p>
                <div className="project-details">
                  {projectDetails?.lineasInvestigacion?.length > 0 && (<p><FaCodeBranch /> <strong>Líneas de investigación:</strong> {projectDetails.lineasInvestigacion.map(l => typeof l === 'string' ? l : l.nombre).join(', ')}</p>)}
                  {projectDetails?.nivelEstudios && (<p><FaGraduationCap /> <strong>Nivel de estudios requerido:</strong> {projectDetails.nivelEstudios}</p>)}
                </div>
              </div>

              <div className="project-admin-assignment-options">
                <div className="project-admin-option-group">
                  <label className="project-admin-checkbox-label">
                    <input type="checkbox" checked={anonymousEvaluation} onChange={(e) => setAnonymousEvaluation(e.target.checked)} disabled />
                    <span>Evaluación Doblemente Ciega (Siempre activa)</span>
                    <small>El evaluador no conocerá al autor y viceversa</small>
                  </label>
                </div>

                <div className="project-admin-option-group">
                  <label className="project-admin-checkbox-label">
                    <input type="checkbox" checked={filterByCompatibility} onChange={(e) => setFilterByCompatibility(e.target.checked)} />
                    <span><FaFilter /> Filtrar por compatibilidad</span>
                    <small>Mostrar solo evaluadores con líneas de investigación y nivel educativo compatibles</small>
                  </label>
                </div>

                <div className="project-admin-form-group">
                  <label><FaCalendar className="project-admin-label-icon" /> Plazo de Evaluación <small>Especifique una fecha límite o un plazo (días + horas)</small></label>

                  <div className="project-admin-format-select">
                    <label>Formato de evaluación</label>
                    <select value={selectedFormatId || ''} onChange={(e) => setSelectedFormatId(e.target.value)}>
                      <option value="">Seleccionar formato...</option>
                      {formats.map(fmt => (
                        <option key={fmt.id} value={fmt.id}>{fmt.nombre || fmt.name || `Formato ${fmt.id}`}</option>
                      ))}
                    </select>
                    {(!selectedFormatId) && (<small className="warning">Debe seleccionar un formato válido antes de asignar</small>)}
                  </div>

                  <div className="deadline-mode-toggle"><label><input type="radio" name="deadlineMode" checked={evaluationDeadline.mode === 'date'} onChange={() => setEvaluationDeadline(prev => ({ ...prev, mode: 'date' }))} /> Fecha límite</label><label><input type="radio" name="deadlineMode" checked={evaluationDeadline.mode === 'duration'} onChange={() => setEvaluationDeadline(prev => ({ ...prev, mode: 'duration' }))} /> Plazo (días / horas)</label></div>

                  {evaluationDeadline.mode === 'date' ? (
                    <>
                      <input type="date" className="project-admin-date-input" value={evaluationDeadline.date} onChange={(e) => setEvaluationDeadline(prev => ({ ...prev, date: e.target.value, mode: 'date' }))} min={getMinDate()} />
                      {evaluationDeadline.date && <div className="date-info"><small>Tiempo límite: {calculateTimeLimitInHours(evaluationDeadline)} horas ({Math.round(calculateTimeLimitInHours(evaluationDeadline) / 24)} días)</small></div>}
                    </>
                  ) : (
                    <div className="duration-inputs"><div className="duration-field"><label>Días</label><input type="number" min={0} className="project-admin-number-input" value={evaluationDeadline.days} onChange={(e) => setEvaluationDeadline(prev => ({ ...prev, days: Math.max(0, Number(e.target.value) || 0), mode: 'duration' }))} /></div><div className="duration-field"><label>Horas</label><input type="number" min={0} max={23} className="project-admin-number-input" value={evaluationDeadline.hours} onChange={(e) => setEvaluationDeadline(prev => ({ ...prev, hours: Math.max(0, Math.min(23, Number(e.target.value) || 0)), mode: 'duration' }))} /></div><div className="date-info"><small>Tiempo límite: {calculateTimeLimitInHours(evaluationDeadline)} horas ({Math.floor(calculateTimeLimitInHours(evaluationDeadline) / 24)} días y {calculateTimeLimitInHours(evaluationDeadline) % 24} horas)</small></div></div>
                  )}
                </div>
              </div>

              <div className="project-admin-evaluators-list">
                {availableEvaluators.length === 0 ? (<div className="project-admin-empty-state"><p>No hay evaluadores compatibles disponibles</p><small>Intenta desactivar el filtro de compatibilidad o verifica la disponibilidad de evaluadores</small></div>) : (
                  availableEvaluators.map(evaluator => (
                    <div key={evaluator.id} className="project-admin-evaluator-card">
                      <div className="project-admin-evaluator-info">
                        <h4>{evaluator.nombre}</h4>
                        <span className="project-admin-evaluator-badge">{evaluator.perfil}</span>
                        {evaluator.compatibility && (<div className="compatibility-indicator"><div className="compatibility-score"><div className="compatibility-bar" style={{ width: `${evaluator.compatibility.percentage}%` }} /><span>{evaluator.compatibility.percentage}% compatible</span></div><div className="compatibility-details">{evaluator.compatibility.matches.map((m, i) => <span key={i} className="compatibility-match">✓ {m}</span>)}</div></div>)}
                        <div className="project-admin-evaluator-specialties">{evaluator.especialidades && evaluator.especialidades.slice(0, 3).map((esp, idx) => <span key={idx} className="project-admin-specialty-tag">{typeof esp === 'string' ? esp : (esp.nombre || 'Especialidad')}</span>)}{evaluator.especialidades && evaluator.especialidades.length > 3 && <span className="project-admin-more-specialties">+{evaluator.especialidades.length - 3} más</span>}</div>
                        <div className="project-admin-evaluator-stats"><span>Proyectos asignados: {evaluator.proyectosAsignados}</span><span className={`availability ${evaluator.disponible ? 'available' : 'busy'}`}>{evaluator.disponible ? 'Disponible' : 'Ocupado'}</span></div>
                      </div>
                      <button className={`project-admin-btn-assign ${assigning ? 'disabled' : ''}`} onClick={() => openConfirmAssign(selectedProject.id, evaluator.id, evaluator.nombre)} disabled={assigning} title={`Asignar evaluador - ${evaluator.compatibility?.percentage || 0}% compatible`}><FaUserPlus /> {assigning ? 'Asignando...' : 'Asignar'}</button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="project-admin-empty-selection"><FaUserCheck className="project-admin-empty-icon" /><h4>Selecciona un proyecto</h4><p>Selecciona un proyecto de la lista para ver los evaluadores compatibles</p></div>
          )}
        </div>
      </div>
        {/* Modales: confirmación y notificación */}
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          type="warning"
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={async () => {
            // cerrar modal de confirmación y realizar la asignación
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            await handleAssignEvaluator(confirmModal.projectId, confirmModal.evaluatorId);
          }}
          confirmText="Confirmar"
        />

        <Modal
          isOpen={notifyModal.isOpen}
          onClose={() => setNotifyModal(prev => ({ ...prev, isOpen: false }))}
          type={notifyModal.type}
          title={notifyModal.title}
          message={notifyModal.message}
          showCancel={false}
          confirmText="Aceptar"
        />
    </div>
  );
};

export default ProjectAssignmentMainPage;