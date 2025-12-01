import React, { useEffect, useState, useMemo } from 'react';
import { 
  FaTimes, FaFileContract, FaList, FaStar, 
  FaCalendar, FaCheckCircle, FaUser, FaProjectDiagram 
} from 'react-icons/fa';
import '../../../../styles/management/project/evaluador/EvaluationDetailsModal.css';
import { researchService } from '../../../../services/researchService';
import { projectService } from '../../../../services/projectService';

const EvaluationDetailsModal = ({ 
  evaluation, 
  onClose 
}) => {
  // Registrar efecto para bloquear scroll (si evaluation cambia)
  useEffect(() => {
    if (!evaluation) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [evaluation]);

  // Obtener datos del proyecto y formato
  const project = useMemo(() => (evaluation.proyecto || evaluation.project || {}), [evaluation]);
  const format = evaluation.formato || evaluation.format || evaluation.evaluationFormat || {};

  // Estados auxiliares para nivel y líneas
  const [nivelLabel, setNivelLabel] = useState('N/A');
  const [lineasLabels, setLineasLabels] = useState('N/A');

  // Obtener puntaje final
  const finalScore = evaluation.calificacionTotal ?? 0;
  
  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color del puntaje
  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-poor';
    return 'score-fail';
  };

  // Cargar etiquetas de nivel y líneas usando los servicios
  useEffect(() => {
    let mounted = true;
    const loadMeta = async () => {
      try {
        const allLineas = await researchService.getAll();
        if (!mounted) return;

        const normalized = projectService.normalizeProject(project || {}, allLineas || []);

        const nivelFromNormalized = normalized && normalized.nivelEstudios ? normalized.nivelEstudios : null;
        if (nivelFromNormalized) {
          setNivelLabel(nivelFromNormalized);
        } else {
          const rawNivel = project.nivelEstudios || project.nivel || project.nivelId || project.nivel_estudio || null;
          if (rawNivel) {
            if (typeof rawNivel === 'object') {
              setNivelLabel(rawNivel.nombre || rawNivel.name || String(rawNivel.id || rawNivel.value || 'N/A'));
            } else {
              setNivelLabel(String(rawNivel));
            }
          } else {
            setNivelLabel('N/A');
          }
        }

        const names = (normalized && Array.isArray(normalized.lineasInvestigacionNames) && normalized.lineasInvestigacionNames.length > 0)
          ? normalized.lineasInvestigacionNames
          : (Array.isArray(normalized.lineasInvestigacion) && normalized.lineasInvestigacion.length > 0)
            ? normalized.lineasInvestigacion.map(l => l.nombre || l.name).filter(Boolean)
            : [];

        if (names && names.length > 0) {
          setLineasLabels(names.join(', '));
        } else {
          const direct = project.lineasInvestigacion || project.lineas || project.lineasIds || project.lineas_investigacion || [];
          if (Array.isArray(direct) && direct.length > 0) {
            const all = allLineas || await researchService.getAll();
            if (!mounted) return;
            const resolved = direct.map(id => {
              if (!id) return null;
              if (typeof id === 'object') return id.nombre || id.name || id.id;
              const found = all.find(l => String(l.id) === String(id) || String(l.identificacion) === String(id));
              return found ? (found.nombre || found.name) : String(id);
            }).filter(Boolean);
            setLineasLabels(resolved.join(', '));
          } else {
            setLineasLabels('N/A');
          }
        }

      } catch (err) {
        console.warn('Error cargando meta del proyecto', err);
        if (mounted) {
          setNivelLabel(project.nivelEstudios || project.nivel || 'N/A');
          setLineasLabels('N/A');
        }
      }
    };

    loadMeta();
    return () => { mounted = false; };
  }, [project]);

  // Función para agrupar criterios/ítems de la evaluación
  const getCriteriosGroups = () => {
    const items = Array.isArray(evaluation.items) ? evaluation.items.filter(it => it && (it.calificacion != null || it.valor != null || it.puntuacion != null || it.score != null || it.calificacion > -1)) : [];
    if (!items || items.length === 0) return [];

    const formatCriterios = (
      evaluation?.formato?.criterios || evaluation?.formato?.items ||
      evaluation?.evaluationFormat?.criterios || evaluation?.evaluationFormat?.items ||
      evaluation?.format?.criterios || evaluation?.format?.items || null
    );

    if (Array.isArray(formatCriterios) && formatCriterios.length > 0) {
      const looksLikeFormatItems = formatCriterios.some(fc => fc.criterioNombre || fc.item_formato_id || fc.itemFormatoId || fc.nombre);
      if (looksLikeFormatItems) {
        const criteriaMap = new Map();
        const formatItemById = new Map();

        formatCriterios.forEach(fi => {
          const fid = fi.id || fi.itemFormatoId || fi.item_formato_id || null;
          if (fid != null) formatItemById.set(String(fid), fi);
          const cname = fi.criterioNombre || fi.criterio?.nombre || fi.nombre || 'Sin Criterio';
          const key = `crit:${cname}`;
          if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: cname, items: [] });
        });

        const unassigned = [];
        items.forEach(item => {
          let assigned = false;
          const fmtId = item.itemFormatoId || item.item_formato_id || item.formatoItemId || item.formatoItem?.id || item.formatoId || null;
          if (fmtId != null && formatItemById.has(String(fmtId))) {
            const fi = formatItemById.get(String(fmtId));
            const cname = fi.criterioNombre || fi.criterio?.nombre || fi.nombre || 'Sin Criterio';
            const key = `crit:${cname}`;
            if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: cname, items: [] });
            criteriaMap.get(key).items.push(item);
            assigned = true;
          }

          if (!assigned) {
            const cname = item.criterio?.nombre || item.criterioNombre || item.criterio_nombre || null;
            if (cname) {
              const key = `crit:${String(cname)}`;
              if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: String(cname), items: [] });
              criteriaMap.get(key).items.push(item);
              assigned = true;
            }
          }

          if (!assigned) unassigned.push(item);
        });

        if (unassigned.length > 0) {
          const key = 'crit:Sin Criterio';
          if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: 'Sin Criterio', items: [] });
          unassigned.forEach(it => criteriaMap.get(key).items.push(it));
        }

        const groups = Array.from(criteriaMap.values()).filter(g => g.items && g.items.length > 0);
        return groups;
      }
    }

    const map = new Map();
    items.forEach(item => {
      const cname = item.criterio?.nombre || item.criterioNombre || item.criterio_nombre || 'Sin Criterio';
      const key = `crit:${cname}`;
      if (!map.has(key)) map.set(key, { id: key, nombre: cname, items: [] });
      map.get(key).items.push(item);
    });
    return Array.from(map.values());
  };

  if (!evaluation) return null;

  return (
    <div className="evaluation-details-modal-overlay" onClick={onClose}>
      <div className="evaluation-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="evaluation-details-modal-header">
          <div className="evaluation-details-modal-title-section">
            <div>
              <h3>Detalles de Evaluación Completada</h3>
              <div className="evaluation-details-modal-subtitle">
                <span className="evaluation-details-status evaluation-details-status--completed">
                  <FaCheckCircle />
                  Evaluación Completada
                </span>
              </div>
            </div>
          </div>
          
          <div className="evaluation-details-modal-header-actions">
            <button 
              className="evaluation-details-modal-close" 
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="evaluation-details-modal-body">
          <div className="evaluation-details-modal-content">
            
            {/* Información del Proyecto */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaProjectDiagram className="evaluation-details-modal-section-icon" />
                <h3>Información del Proyecto</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-info-grid">
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Título:</span>
                    <span className="evaluation-details-modal-info-value">{project.titulo || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Proyecto:</span>
                    <span className="evaluation-details-modal-info-value">{project.id || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Resumen:</span>
                    <span className="evaluation-details-modal-info-value">{project.resumen || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Objetivo General:</span>
                    <span className="evaluation-details-modal-info-value">{project.objetivoGeneral || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Palabras Clave:</span>
                    <span className="evaluation-details-modal-info-value">{project.palabrasClave || 'N/A'}</span>
                  </div>
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Nivel de Estudios:</span>
                    <span className="evaluation-details-modal-info-value">{nivelLabel}</span>
                  </div>
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Líneas de Investigación:</span>
                    <span className="evaluation-details-modal-info-value">{lineasLabels}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Evaluación */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaFileContract className="evaluation-details-modal-section-icon" />
                <h3>Información de la Evaluación</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-info-grid">
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">ID Evaluación:</span>
                    <span className="evaluation-details-modal-info-value">#{evaluation.id}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Formato:</span>
                    <span className="evaluation-details-modal-info-value">{format.nombre || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item">
                    <span className="evaluation-details-modal-info-label">Descripción del Formato:</span>
                    <span className="evaluation-details-modal-info-value">{format.descripcion || 'N/A'}</span>
                  </div>
                  
                  <div className="evaluation-details-modal-info-item full-width">
                    <span className="evaluation-details-modal-info-label">Calificación Final:</span>
                    <div className="evaluation-details-modal-score-container">
                      <span className={`evaluation-details-modal-score ${getScoreColor(finalScore)}`}>
                        <FaStar className="evaluation-details-modal-score-icon" />
                        {finalScore}/100
                      </span>
                      <div className="evaluation-details-modal-progress">
                        <div 
                          className="evaluation-details-modal-progress-bar"
                          style={{ width: `${finalScore}%` }}
                        ></div>
                        <span className="evaluation-details-modal-progress-text">{finalScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cronología */}
            <div className="evaluation-details-modal-section">
              <div className="evaluation-details-modal-section-header">
                <FaCalendar className="evaluation-details-modal-section-icon" />
                <h3>Cronología</h3>
              </div>
              
              <div className="evaluation-details-modal-section-content">
                <div className="evaluation-details-modal-timeline">
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaUser />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Asignada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaAsignacion)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Aceptada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaAceptacion)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="evaluation-details-modal-timeline-item">
                    <div className="evaluation-details-modal-timeline-icon">
                      <FaFileContract />
                    </div>
                    <div className="evaluation-details-modal-timeline-content">
                      <span className="evaluation-details-modal-timeline-title">Completada</span>
                      <span className="evaluation-details-modal-timeline-date">
                        {formatDate(evaluation.fechaFinalizacion)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterios Evaluados */}
            {(() => {
              const groups = getCriteriosGroups();
              if (!groups || groups.length === 0) return null;

              const totalItems = groups.reduce((s, g) => s + (Array.isArray(g.items) ? g.items.length : 0), 0);

              return (
                <div className="evaluation-details-modal-section">
                  <div className="evaluation-details-modal-section-header">
                    <FaList className="evaluation-details-modal-section-icon" />
                    <h3>Criterios Evaluados</h3>
                  </div>
                  <div className="evaluation-details-modal-section-content">
                    {groups.map((g, gi) => (
                      <div key={gi} className="evaluation-details-modal-criterio-group">
                        <h4 className="evaluation-details-modal-criterio-group-title">{g.nombre}</h4>
                        <div className="evaluation-details-modal-criterios-list">
                          {g.items.map((item, idx) => {
                            const score = item.calificacion ?? item.valor ?? item.puntuacion ?? item.score ?? 0;
                            const observation = item.observacion || item.comentarios || item.observaciones || item.observ || item.notes || '';
                            return (
                              <div key={idx} className="evaluation-details-modal-criterio-item">
                                <div className="evaluation-details-modal-criterio-header">
                                  <span className="evaluation-details-modal-criterio-title">{item.nombre || item.titulo || `Ítem ${idx + 1}`}</span>
                                  <span className={`evaluation-details-modal-criterio-score ${getScoreColor(score)}`}>{score}%</span>
                                </div>
                                {item.descripcion && <p className="evaluation-details-modal-criterio-desc">{item.descripcion}</p>}
                                {observation && (
                                  <div className="evaluation-details-modal-criterio-observation">
                                    <strong>Observación:</strong>
                                    <p className="evaluation-details-modal-criterio-observation-text">{observation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="evaluation-details-modal-criterios-summary">
                      <div className="evaluation-details-modal-criterios-total">
                        <strong>Total de ítems calificados: {totalItems}</strong>
                      </div>
                      <div className="evaluation-details-modal-criterios-average">
                        <strong>Promedio: {finalScore}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="evaluation-details-modal-footer">
          <div className="evaluation-details-modal-footer-actions">
            <button 
              className="evaluation-details-modal-btn-primary" 
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailsModal;
