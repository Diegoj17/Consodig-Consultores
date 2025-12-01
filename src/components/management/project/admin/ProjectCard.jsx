import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaCalendar, FaUserCheck, FaEye, FaFileAlt, FaEdit, 
  FaPaperclip, FaDownload, FaFilePdf, FaFileExcel, FaExternalLinkAlt,
  FaFileWord, FaFileImage, FaFileArchive
} from 'react-icons/fa';
import '../../../../styles/management/project/admin/ProjectCard.css';
import { researchService } from '../../../../services/researchService';
import { projectService } from '../../../../services/projectService';
import userService from '../../../../services/userService';

const ProjectCard = ({ project, onViewDetails, onEditProject, onReviewEvaluation }) => {
  const [researchOptions, setResearchOptions] = useState([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);

  const archivos = project.archivos || [];
  const [resolvedInvestigatorName, setResolvedInvestigatorName] = useState(null);

  // DEBUG: Mostrar en consola los campos relacionados al investigador
  useEffect(() => {
    console.log('🔎 [ProjectCard] investigador fields for project:', {
      id_candidates: {
        investigadorId: project?.investigadorId,
        investigador_id: project?.investigador_id,
        investigadorIdAlt: project?.investigatorId
      },
      investigadorPrincipal: project?.investigadorPrincipal,
      investigador: project?.investigador,
      investigadorObj: project?.investigadorPrincipalObj || project?.investigadorObj || null,
      rawProject: project
    });
  }, [project]);

  const getStatusClass = (estado) => {
    const statusMap = {
      'Pendiente': 'project-admin-status-pending',
      'Preasignado': 'project-admin-status-preasigned',
      'En evaluación': 'project-admin-status-evaluation',
      'Evaluado': 'project-admin-status-evaluated'
    };
    return statusMap[estado] || 'project-admin-status-default';
  };

  // Extraer estado real del backend y mapear a etiqueta legible
  const extractBackendStatus = (p) => {
    const possibleKeys = ['estado', 'estadoProyecto', 'estado_proyecto', 'status', 'estadoActual', 'estado_sistema', 'state', 'estadoSistema', 'estado_db'];
    let code = null;
    for (const k of possibleKeys) {
      if (p && p[k] != null && p[k] !== '') {
        code = p[k];
        break;
      }
    }

    const normalize = (s) => (s == null ? '' : String(s).trim().toUpperCase());
    const labelMap = {
      'PENDIENTE': 'Pendiente',
      'PREASIGNADO': 'Preasignado',
      'EN EVALUACIÓN': 'En evaluación',
      'EN EVALUACION': 'En evaluación',
      'EVALUADO': 'Evaluado',
      'ENVIADO': 'Enviado',
      'SUBMITTED': 'Enviado',
      'REVISADO': 'Revisado',
      'APROBADO': 'Aprobado',
      'RECHAZADO': 'Rechazado'
    };

    const norm = normalize(code);
    const label = labelMap[norm] || (code ? String(code) : null);
    return { code, label };
  };

  const backendStatus = extractBackendStatus(project);
  const getInitials = (name) => {
    if (!name) return 'PR';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Cargar líneas de investigación al montar el componente
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoadingLines(true);
        const lines = await researchService.getAll();
        const opts = Array.isArray(lines)
          ? lines.map(r => ({ 
              id: Number(r.id), 
              nombre: r.nombre,
              descripcion: r.descripcion 
            })).filter(o => o.nombre)
          : [];
        if (mounted) {
          setResearchOptions(opts);
          console.log('📚 [ProjectCard] Líneas cargadas:', opts);
        }
      } catch (error) {
        console.error('❌ [ProjectCard] Error cargando líneas:', error);
        if (mounted) setResearchOptions([]);
      } finally {
        if (mounted) setIsLoadingLines(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Resolver investigador principal si no viene el nombre completo
  useEffect(() => {
    let mounted = true;
    const resolveInvestigator = async () => {
      try {
        const invName = project?.investigadorPrincipal || project?.investigadorNombre || project?.investigador_principal || null;
        if (invName) {
          if (mounted) setResolvedInvestigatorName(typeof invName === 'string' ? invName : (invName.nombre || `${invName.nombre || ''} ${invName.apellido || ''}`.trim()));
          return;
        }

        // detectar posibles IDs en distintos campos (string/number/object)
        const invIdCandidate = project?.investigadorId || project?.investigador_id || project?.investigador?.id || project?.investigador || null;
        const normalizeId = (val) => {
          if (val == null) return null;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const m = val.match(/(\d+)/);
            if (m) return Number(m[1]);
            const asNum = Number(val);
            return isNaN(asNum) ? val : asNum;
          }
          if (typeof val === 'object' && val !== null) return val.id || val.identificacion || null;
          return val;
        };

        const invId = normalizeId(invIdCandidate);
        if (invId) {
          console.log(`🔎 [ProjectCard] Intentando resolver investigador con ID: ${invId}`);
          let u = null;
          // Priorizar obtener como evaluando (el investigador puede ser un evaluando)
          try {
            u = await userService.getEvaluandoById(invId);
            console.log('🔍 [ProjectCard] Resultado getEvaluandoById:', u);
          } catch (e) {
            console.log('🟠 [ProjectCard] getEvaluandoById falló:', e?.message || e);
            u = null;
          }

          if (!u) {
            try {
              u = await userService.getEvaluadorById(invId);
              console.log('🔍 [ProjectCard] Resultado getEvaluadorById:', u);
            } catch (e) {
              console.log('🟠 [ProjectCard] getEvaluadorById falló:', e?.message || e);
              u = null;
            }
          }

          if (!u) {
            try {
              u = await userService.getAdminById(invId);
              console.log('🔍 [ProjectCard] Resultado getAdminById:', u);
            } catch (e) {
              console.log('🟠 [ProjectCard] getAdminById falló:', e?.message || e);
              u = null;
            }
          }

          if (!mounted) return;
          console.log('🔎 [ProjectCard] Usuario resuelto final (u):', u);
          const resolved = u ? `${u.nombre || u.name || ''}${u.apellido ? ' ' + u.apellido : ''}`.trim() : null;
          if (mounted) setResolvedInvestigatorName(resolved || null);
        }
      } catch (err) {
        console.error('Error resolviendo investigador en ProjectCard:', err);
      }
    };
    resolveInvestigator();
    return () => { mounted = false; };
  }, [project]);

  // Función mejorada para obtener líneas de investigación
  const getResearchLines = () => {
    // 1. Si ya vienen los nombres mapeados desde el servicio
    if (project?.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      console.log('✅ [ProjectCard] Usando lineasInvestigacionNames:', project.lineasInvestigacionNames);
      return project.lineasInvestigacionNames.join(', ');
    }

    // 2. Si vienen objetos completos con nombre
    if (project?.lineasInvestigacion && Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
      const names = project.lineasInvestigacion
        .map(li => li?.nombre || li?.name)
        .filter(Boolean);
      if (names.length > 0) {
        console.log('✅ [ProjectCard] Usando lineasInvestigacion objetos:', names);
        return names.join(', ');
      }
    }

    // 3. Buscar IDs en diferentes posibles claves
    const possibleKeys = [
      'lineasInvestigacionIds',
      'lineasIds', 
      'lineas_investigacion',
      'lineasInvestigacion',
      'lineas'
    ];

    let lineIds = null;
    for (const key of possibleKeys) {
      if (project?.[key]) {
        lineIds = project[key];
        console.log(`🔍 [ProjectCard] IDs encontrados en '${key}':`, lineIds);
        break;
      }
    }

    if (!lineIds) {
      console.warn('⚠️ [ProjectCard] No se encontraron líneas de investigación');
      return '-';
    }

    // Normalizar a array de IDs
    let idsArray = [];
    if (Array.isArray(lineIds)) {
      idsArray = lineIds.map(id => {
        if (typeof id === 'object' && id !== null) {
          return id.id || id.identificacion;
        }
        return id;
      }).filter(Boolean);
    } else if (typeof lineIds === 'string') {
      idsArray = lineIds.split(/,|;/).map(s => s.trim()).filter(Boolean);
    } else {
      idsArray = [lineIds];
    }

    console.log('🔢 [ProjectCard] IDs normalizados:', idsArray);

    // Si no hay researchOptions cargadas aún
    if (isLoadingLines) {
      return 'Cargando líneas...';
    }

    if (researchOptions.length === 0) {
      console.warn('⚠️ [ProjectCard] researchOptions vacío, mostrando IDs');
      return idsArray.join(', ');
    }

    // Mapear IDs a nombres
    const names = idsArray.map(id => {
      const idNum = Number(id);
      const line = researchOptions.find(opt => Number(opt.id) === idNum);
      if (line) {
        console.log(`✅ [ProjectCard] ID ${id} → ${line.nombre}`);
        return line.nombre;
      }
      console.warn(`⚠️ [ProjectCard] ID ${id} no encontrado`);
      return `ID: ${id}`;
    });

    return names.length > 0 ? names.join(', ') : '-';
  };

  // Función mejorada para formatear nivel de estudios
  const formatNivelEstudios = (nivel) => {
    if (!nivel) return '-';

    // Si es objeto, extraer el valor
    if (typeof nivel === 'object' && nivel !== null) {
      nivel = nivel.nombre || nivel.name || nivel.id || nivel.value;
    }

    const nivelStr = String(nivel).trim();
    
    // Mapeo de IDs numéricos a nombres
    const nivelMap = {
      '1': 'Pregrado',
      '2': 'Técnico',
      '3': 'Tecnólogo',
      '4': 'Profesional',
      '5': 'Especialización',
      '6': 'Maestría',
      '7': 'Doctorado',
      '8': 'Postdoctorado'
    };

    // Si es un ID numérico
    if (nivelMap[nivelStr]) {
      return nivelMap[nivelStr];
    }

    // Si es texto, normalizar
    const code = nivelStr.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const textMap = {
      'PREGRADO': 'Pregrado',
      'TECNICO': 'Técnico',
      'TECNOLOGO': 'Tecnólogo',
      'PROFESIONAL': 'Profesional',
      'ESPECIALIZACION': 'Especialización',
      'MAESTRIA': 'Maestría',
      'DOCTORADO': 'Doctorado',
      'POSTDOCTORADO': 'Postdoctorado'
    };

    return textMap[code] || nivelStr;
  };

  const getSpecificObjectives = () => {
    const obj = project.objetivosEspecificos || project.objetivoEspecifico || project.objetivos || null;
    if (!obj) return null;

    if (Array.isArray(obj)) {
      return obj
        .map(item => {
          if (!item) return null;
          if (typeof item === 'string') return item.trim();
          if (typeof item === 'object') {
            return item.nombre || item.texto || item.descripcion || item.value || JSON.stringify(item);
          }
          return String(item);
        })
        .filter(Boolean);
    }

    if (typeof obj === 'string') {
      let parts = obj.split(/\r?\n|;|\|/).map(p => p.trim()).filter(Boolean);
      if (parts.length <= 1 && obj.indexOf(',') !== -1) {
        parts = obj.split(',').map(p => p.trim()).filter(Boolean);
      }
      return parts.length > 0 ? parts : [obj.trim()];
    }

    return [String(obj)];
  };
  
  const specificObjectives = getSpecificObjectives();

  const getFileIcon = (fileName, tipoMime, tipo) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const mime = tipoMime?.toLowerCase();
    const fileType = tipo?.toLowerCase();
    
    if (fileType?.includes('pdf') || ext === 'pdf' || mime?.includes('pdf')) {
      return <FaFilePdf className="file-icon-pdf" />;
    }
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx' || mime?.includes('spreadsheet') || mime?.includes('excel')) {
      return <FaFileExcel className="file-icon-excel" />;
    }
    if (fileType?.includes('word') || ext === 'doc' || ext === 'docx' || mime?.includes('word')) {
      return <FaFileWord className="file-icon-word" />;
    }
    if (fileType?.includes('image') || ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || mime?.includes('image')) {
      return <FaFileImage className="file-icon-image" />;
    }
    if (fileType?.includes('zip') || ext === 'zip' || ext === 'rar' || mime?.includes('zip') || mime?.includes('archive')) {
      return <FaFileArchive className="file-icon-archive" />;
    }
    
    return <FaFileAlt className="file-icon-default" />;
  };

  const getFileName = (archivo) => {
    return archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre';
  };

  const canOpenInBrowser = (archivo) => {
    const ext = archivo.nombreArchivo?.split('.').pop()?.toLowerCase();
    const mime = archivo.tipoMime?.toLowerCase();
    const fileType = archivo.tipo?.toLowerCase();
    
    const viewableTypes = ['pdf', 'image', 'text', 'html'];
    const viewableExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'txt', 'html', 'htm'];
    
    return viewableTypes.some(type => 
      fileType?.includes(type) || mime?.includes(type)
    ) || viewableExts.includes(ext);
  };

  const handleOpenFile = async (archivo) => {
    try {
      if (canOpenInBrowser(archivo) && archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
      } else {
        await handleDownloadFile(archivo);
      }
    } catch (error) {
      console.error('Error abriendo archivo:', error);
      await handleDownloadFile(archivo);
    }
  };

  const handleDownloadFile = async (archivo) => {
    try {
      let downloadUrl = archivo.urlArchivo;
      let filename = getFileName(archivo);

      if (!downloadUrl || !canOpenInBrowser(archivo)) {
        const response = await projectService.downloadFile(archivo.id);
        const blob = response?.data || response;
        
        downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          if (downloadUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(downloadUrl);
          }
        }, 10000);
      } else {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error descargando archivo:', error);
      
      if (archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
      } else {
        alert('Error al descargar el archivo: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const getFileActionText = (archivo) => {
    return canOpenInBrowser(archivo) ? 'Abrir archivo' : 'Descargar archivo';
  };

  return (
    <div className="project-admin-project-card"> 
      <div className="project-admin-card-header">
        <div className="project-admin-user-avatar">
          <span>{getInitials(resolvedInvestigatorName || project.investigadorPrincipal)}</span>
        </div>
        <div className="project-admin-user-meta">
          <h3 className="project-admin-project-title">{project.titulo}</h3>
          <div className="project-admin-project-investigator">
            <small>Investigador: </small>
            <strong>{resolvedInvestigatorName || project.investigadorPrincipal || project.investigador || '—'}</strong>
          </div>
        </div>
        <div className="project-admin-status-indicator">
          <span className={`project-admin-status-badge ${getStatusClass(backendStatus.label || 'Enviado')}`}>
            {backendStatus.label || 'Enviado'}
          </span>
          {backendStatus.code && backendStatus.code !== backendStatus.label && (
            <small className="project-admin-status-code" style={{display: 'block', fontSize: '0.75rem', color: '#6b7280'}}>
              ({String(backendStatus.code)})
            </small>
          )}
        </div>
      </div>

      <div className="project-admin-card-body">
        {project.evaluadorAsignado && (
          <div className="project-admin-info-group">
            <label>Evaluador Asignado:</label>
            <p>
              <FaUserCheck className="project-admin-inline-icon" />
              {project.evaluadorAsignado}
            </p>
          </div>
        )}

        <div className="project-admin-info-group">
          <label>Resumen:</label>
          <p className="project-admin-project-summary">
            {project.resumen ? (
              project.resumen.length > 100 
                ? `${project.resumen.substring(0, 100)}...` 
                : project.resumen
            ) : 'No hay resumen disponible'}
          </p>
        </div>

        <div className="project-admin-info-group">
          <label>Palabras Clave:</label>
          {project.palabrasClave ? (
            <div className="project-admin-project-keywords">
              {project.palabrasClave.split(',').slice(0, 3).map((keyword, index) => (
                <span key={index} className="project-admin-project-keyword-badge">
                  {keyword.trim()}
                </span>
              ))}
              {project.palabrasClave.split(',').length > 3 && (
                <span className="project-admin-project-keyword-more">
                  +{project.palabrasClave.split(',').length - 3}
                </span>
              )}
            </div>
          ) : (
            <p>-</p>
          )}
        </div>

        {(project.objetivoGeneral || specificObjectives) && (
          <div className="project-admin-info-group project-admin-project-objectives">
            {project.objetivoGeneral && (
              <>
                <label>Objetivo General:</label>
                <p className="project-admin-project-objective-general">{project.objetivoGeneral}</p>
              </>
            )}

            {specificObjectives && (
              <>
                <label>Objetivos Específicos:</label>
                <ul className="project-admin-project-objective-list">
                  {specificObjectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="project-admin-info-group">
          <label>Justificación:</label>
          <p className="project-justification">
            {project.justificacion ? (
              project.justificacion.length > 150
                ? `${project.justificacion.substring(0, 150)}...`
                : project.justificacion
            ) : 'No hay justificación disponible'}
          </p>
        </div>

        <div className="project-admin-info-group">
          <label>Nivel de Estudios:</label>
          <p>{formatNivelEstudios(project.nivelEstudios)}</p>
        </div>

        <div className="project-admin-info-group">
          <label>Líneas de Investigación:</label>
          <p className="project-admin-research-lines">{getResearchLines()}</p>
        </div>

        <div className="project-admin-info-group">
          <label>
            <FaPaperclip className="project-admin-inline-icon" />
            Archivos Adjuntos ({project.totalArchivos || archivos.length})
          </label>
          {archivos.length > 0 ? (
            <div className="project-admin-files-list">
              {archivos.slice(0, 3).map((archivo, index) => (
                <div key={archivo.id || index} className="project-admin-file-item">
                  <div className="project-admin-file-info">
                    <span className="project-admin-file-icon">
                      {getFileIcon(archivo.nombreArchivo, archivo.tipoMime, archivo.tipo)}
                    </span>
                    <div className="project-admin-file-details">
                      <span className="project-admin-file-name">
                        {getFileName(archivo)}
                      </span>
                    </div>
                  </div>
                  <div className="project-admin-file-actions">
                    <button 
                      className="project-admin-btn-icon project-admin-btn-open" 
                      onClick={() => handleOpenFile(archivo)} 
                      title={getFileActionText(archivo)}
                    >
                      <FaExternalLinkAlt />
                    </button>
                    
                  </div>
                </div>
              ))}
              {archivos.length > 3 && (
                <div className="project-admin-file-more">
                  +{archivos.length - 3} archivos más
                </div>
              )}
            </div>
          ) : (
            <p className="no-files">No hay archivos adjuntos</p>
          )}
        </div>
      </div>

      <div className="project-admin-card-footer">
        <div className="project-admin-action-buttons">
          <button 
            className="project-admin-btn-icon project-admin-btn-edit" 
            onClick={() => onEditProject(project)}
            title="Editar proyecto"
          >
            <FaEdit />
          </button>
          <button 
            className="project-admin-btn-icon project-admin-project-btn-view" 
            onClick={() => onViewDetails(project)}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          {project.estado === 'Evaluado' && (
            <button 
              className="project-admin-btn-icon project-admin-project-btn-review" 
              onClick={() => onReviewEvaluation(project.id)}
              title="Revisar evaluación"
            >
              <FaFileAlt />
            </button>
          )}
        </div>
        <div className="project-admin-registration-date">
          Creado: {formatDate(project.fechaEnvio)}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;