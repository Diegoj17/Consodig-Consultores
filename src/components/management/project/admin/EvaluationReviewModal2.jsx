import React, { useEffect, useState, useCallback } from 'react';
import { FaUser, FaCalendar, FaFileAlt, FaClipboardList, FaInfoCircle, FaEye, FaListAlt } from 'react-icons/fa';
import { evaluadorService } from '../../../../services/evaluadorService';
import researchService from '../../../../services/researchService';
import userService from '../../../../services/userService';
import '../../../../styles/management/project/admin/EvaluationReviewModal.css';

const EvaluationReviewModal2 = ({ evaluation, onClose }) => {
  const [resolvedEvaluatorName, setResolvedEvaluatorName] = useState(null);
  const [resolvedInvestigatorName, setResolvedInvestigatorName] = useState(null);
  const [resolvedDate, setResolvedDate] = useState(null);
  const [lineasNamesResolved, setLineasNamesResolved] = useState(null);
  const [resolvedNivelEstudio, setResolvedNivelEstudio] = useState(null);

  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      if (!evaluation) return;
      const name = evaluation.evaluador?.nombre || evaluation.evaluatorName || evaluation.nombreEvaluador || null;
      if (name) setResolvedEvaluatorName(name);
      else {
        const id = evaluation.evaluadorId || evaluation.evaluatorId || evaluation.evaluador?.id || null;
        if (id) {
          try {
            const data = await evaluadorService.getEvaluadorById(id);
            if (!mounted) return;
            const resolved = data?.nombre ? `${data.nombre}${data.apellido ? ' ' + data.apellido : ''}` : data?.fullName || data?.nombreCompleto || null;
            setResolvedEvaluatorName(resolved || 'Evaluador no disponible');
          } catch (err) {
            console.warn('Error resolviendo evaluador:', err);
            setResolvedEvaluatorName('Evaluador no disponible');
          }
        } else {
          setResolvedEvaluatorName('Evaluador no disponible');
        }
      }

      const date = evaluation.fechaCompletado || evaluation.fechaFinalizacion || evaluation.fecha || evaluation.fechaAceptacion || evaluation.fechaAsignacion || null;
      setResolvedDate(date ? new Date(date).toLocaleString() : null);

      // Resolver investigador principal y nivel de estudios desde el proyecto
      try {
        const project = evaluation?.proyecto || evaluation?.project || {};

        // Nivel de estudios: soportar múltiples claves y normalizar números a texto
        const nivelRaw = project?.nivelEstudios || project?.nivel || project?.nivel_estudios || project?.nivelEstudio || project?.nivel_estudio || project?.nivelEducativo || null;
        const mapNivel = (val) => {
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return val?.nombre || val?.name || null;
          const num = Number(val);
          const idToTextMap = {
            1: 'PREGRADO',
            2: 'TECNICO',
            3: 'TECNOLOGO',
            4: 'PROFESIONAL',
            5: 'ESPECIALIZACION',
            6: 'MAESTRIA',
            7: 'DOCTORADO',
            8: 'POSTDOCTORADO'
          };
          if (!isNaN(num) && idToTextMap[num]) return idToTextMap[num];
          return String(val).toUpperCase();
        };
        setResolvedNivelEstudio(mapNivel(nivelRaw));

        // Investgador principal: si ya viene el nombre usarlo, si viene id resolverlo
        const invName = project?.investigadorPrincipal || project?.investigador || project?.investigadorNombre || project?.investigador_name || project?.investigadorNombreCompleto || null;
        if (invName) {
          setResolvedInvestigatorName(invName);
        } else {
          const invId = project?.investigadorId || project?.investigador_id || project?.investigador || project?.investigador?.id || project?.investigadorId || null;
          if (invId) {
            try {
              // Intentar como evaluador, luego como evaluando, luego como admin
              let u = null;
              try { u = await userService.getEvaluadorById(invId); } catch { u = null; }
              if (!u) {
                try { u = await userService.getEvaluandoById(invId); } catch { u = null; }
              }
              if (!u) {
                try { u = await userService.getAdminById(invId); } catch { u = null; }
              }
              if (!mounted) return;
              const resolvedInv = u ? `${u.nombre || u.name || ''}${u.apellido ? ' ' + u.apellido : ''}`.trim() : null;
              setResolvedInvestigatorName(resolvedInv || 'Investigador no disponible');
            } catch (err) {
              console.warn('Error resolviendo investigador:', err);
              setResolvedInvestigatorName('Investigador no disponible');
            }
          } else {
            setResolvedInvestigatorName('No especificado');
          }
        }
      } catch (err) {
        console.warn('Error resolviendo investigador o nivel:', err);
      }

      // resolver líneas
      try {
        const project = evaluation?.proyecto || evaluation?.project || {};
        if (Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
          setLineasNamesResolved(project.lineasInvestigacionNames.join(', '));
        } else if (Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
          const names = project.lineasInvestigacion.map(l => l?.nombre || l?.name || l?.titulo).filter(Boolean);
          if (names.length) setLineasNamesResolved(names.join(', '));
        } else {
          const ids = project.lineasInvestigacionIds || project.lineasIds || project.lineas || null;
          if (Array.isArray(ids) && ids.length > 0) {
            const all = await researchService.getAll();
            if (!mounted) return;
            const resolved = ids.map(id => {
              const found = all.find(r => String(r.id) === String(id) || String(r.identificacion) === String(id));
              return found ? (found.nombre || found.name) : null;
            }).filter(Boolean);
            if (resolved.length) setLineasNamesResolved(resolved.join(', '));
            else setLineasNamesResolved(null);
          } else {
            setLineasNamesResolved(null);
          }
        }
      } catch (err) {
        console.warn('Error resolviendo líneas:', err);
        setLineasNamesResolved(null);
      }
    };
    resolve();
    return () => { mounted = false; };
  }, [evaluation]);

  const projectData = evaluation?.project || evaluation?.proyecto || {};
  const [activeTab, setActiveTab] = useState('details');
  const [groupedCriteria, setGroupedCriteria] = useState([]);

  const buildCriteriaGroups = useCallback((items) => {
    if (!items || items.length === 0) {
      setGroupedCriteria([]);
      return;
    }

    const formatCriterios = (
      evaluation?.formato?.criterios || evaluation?.formato?.items ||
      evaluation?.evaluationFormat?.criterios || evaluation?.evaluationFormat?.items ||
      evaluation?.format?.criterios || evaluation?.format?.items || null
    );

    // Si el formato parece traer items del formato (con itemFormatoId o criterioNombre), usarlos
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
            const cname = item.criterio?.nombre || item.criterioNombre || null;
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
        setGroupedCriteria(groups);
        return;
      }
    }

    // Fallback: agrupar por item.criterio.nombre o por 'Sin Criterio'
    const map = new Map();
    items.forEach(item => {
      const cname = item.criterio?.nombre || item.criterioNombre || 'Sin Criterio';
      const key = `crit:${cname}`;
      if (!map.has(key)) map.set(key, { id: key, nombre: cname, items: [] });
      map.get(key).items.push(item);
    });
    setGroupedCriteria(Array.from(map.values()));
  }, [evaluation]);

  const safeSetActiveTab = (tab) => setActiveTab(tab);

  useEffect(() => {
    buildCriteriaGroups(evaluation?.items || []);
  }, [evaluation, buildCriteriaGroups]);

  return (
    <>
      <div className="evaluation-review-modal-overlay">
        <div className="evaluation-review-modal">
          <div className="evaluation-review-modal-header">
            <div className="evaluation-review-modal-title-section">
              <h3>
                <FaClipboardList className="evaluation-review-modal-title-icon" />
                Ver Evaluación
              </h3>
              <div className="evaluation-review-modal-subtitle">
                <span className="evaluation-review-investigator">
                  <FaUser className="evaluation-inline-icon" />
                  {resolvedEvaluatorName || 'Evaluador no disponible'}
                </span>
                <span className="evaluation-review-date">
                  <FaCalendar className="evaluation-inline-icon" />
                  {resolvedDate || 'Fecha no disponible'}
                </span>
              </div>
            </div>
            <div className="evaluation-review-modal-header-actions">
              <button className="evaluation-review-modal-close" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="evaluation-review-modal-tabs">
            <button className={`evaluation-review-modal-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => safeSetActiveTab('details')}>
              <FaEye /> Detalles
            </button>
            <button className={`evaluation-review-modal-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => safeSetActiveTab('items')}>
              <FaListAlt /> Items ({evaluation.items?.length || 0})
            </button>
          </div>

          <div className="evaluation-review-modal-body">
            {activeTab === 'details' && (
              <div className="evaluation-review-details">
                <div className="evaluation-review-project-info">
                  <h4>Información del Proyecto</h4>
                  <div className="evaluation-review-detail-grid">
                    <div className="evaluation-review-detail-item">
                      <strong>Título:</strong>
                      <span className="project-title">{projectData?.titulo || projectData?.nombre || 'Proyecto no disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Resumen:</strong>
                      <span>{projectData?.resumen || projectData?.descripcion || 'No disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Investigador Principal:</strong>
                      <span>{resolvedInvestigatorName || projectData?.investigadorPrincipal || projectData?.investigador || 'No especificado'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Palabras clave:</strong>
                      <span>{projectData?.palabrasClave || projectData?.keywords || 'N/A'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Nivel de Estudios:</strong>
                      <span>{resolvedNivelEstudio || projectData?.nivelEstudios || projectData?.nivel || projectData?.nivel_estudios || 'N/A'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Líneas de Investigación:</strong>
                      <span>{lineasNamesResolved || 'No disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item evaluation-review-files" style={{ gridColumn: '1 / -1' }}>
                      <strong>Archivos:</strong>
                      <div className="project-files-list" style={{ marginTop: '6px' }}>
                        {(projectData?.archivos || evaluation.archivos || projectData?.files || []).length > 0 ? (
                          (projectData?.archivos || evaluation.archivos || projectData?.files || []).map((archivo) => (
                            <div key={archivo.id || archivo.nombre} className="project-file-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {archivo.tipoMime && archivo.tipoMime.toLowerCase().includes('pdf') ? <FaFileAlt style={{ color: '#d23f3f' }} /> : <FaFileAlt />}
                                <button type="button" className="project-file-link" onClick={() => {
                                  const possibleUrl = archivo.urlArchivo || archivo.url_archivo || archivo.url || archivo.urlArchivoRaw || archivo.url_raw;
                                  if (possibleUrl) window.open(possibleUrl, '_blank', 'noopener,noreferrer');
                                }} style={{ background: 'none', border: 'none', color: '#1d4ed8', textDecoration: 'underline', cursor: 'pointer' }}>
                                  {archivo.nombreArchivo || archivo.nombre || archivo.fileName || 'Archivo sin nombre'}
                                </button>
                              </span>
                              <small style={{ color: '#6b7280' }}>{archivo.tipo || archivo.tipoMime || ''}</small>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#6b7280' }}>No hay archivos adjuntos</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="evaluation-review-summary">
                  <h4>Resumen de Evaluación</h4>
                  <div className="evaluation-review-stats">
                    <div className="evaluation-review-detail-item">
                      <strong>Puntuación Total:</strong>
                      <span className={`evaluation-review-score total-score`}>
                        {evaluation.calificacion_total || evaluation.calificacionTotal || evaluation.calificacion || 0} / 100 Puntos
                      </span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Promedio:</strong>
                      <span className={`evaluation-review-score average-score`}>
                        {Math.round((evaluation.calificacion_total || evaluation.calificacionTotal || evaluation.calificacion || 0))}%
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Items Evaluados:</span>
                      <span className="stat-value">{evaluation.items?.filter(item => item.calificacion > 0).length || 0} / {evaluation.items?.length || 0}</span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Fecha Completada:</span>
                      <span className="stat-value">{resolvedDate || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="evaluation-review-items">
                <div className="evaluation-review-items-header">
                  <h4>Items de Evaluación</h4>
                </div>
                <div className="evaluation-review-items-list">
                  {(!groupedCriteria || groupedCriteria.length === 0) ? (
                    <div className="evaluation-review-no-items"><p>No hay items evaluados disponibles.</p></div>
                  ) : (
                    groupedCriteria.map((criterionGroup, groupIndex) => (
                      <div key={`criterion-${criterionGroup.id || groupIndex}`} className="evaluation-criterion-group">
                        <div className="evaluation-criterion-group-header">
                          <h4>{criterionGroup.nombre}</h4>
                          <span className="criterion-items-count">{criterionGroup.items.length} item{criterionGroup.items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="evaluation-criterion-items">
                          {criterionGroup.items.map((originalItem, itemIndex) => (
                            <div key={originalItem.id || `item-${itemIndex}`} className="evaluation-review-item">
                              <div className="evaluation-review-item-header">
                                <h5>{originalItem.nombre || originalItem.titulo || `Item ${itemIndex + 1}`}</h5>
                                <div className="evaluation-review-item-meta">
                                  <div className="evaluation-review-item-score-value">{(originalItem.calificacion || 0)} / 100 puntos</div>
                                </div>
                              </div>
                              <div className="evaluation-review-item-description-container">
                                <div className="evaluation-review-item-description-content">
                                  <label className="evaluation-review-description-label">Descripción:</label>
                                  <p className="evaluation-review-item-description">{originalItem.descripcion || originalItem.descripcionCorta || originalItem.observacion || 'Sin descripción'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="evaluation-review-modal-footer">
            <div className="evaluation-review-modal-footer-actions">
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={onClose} className="evaluation-review-btn-close" style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvaluationReviewModal2;
