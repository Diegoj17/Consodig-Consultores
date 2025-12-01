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

const ProjectCardEvaluando = ({ project, onViewDetails, onView, onEdit }) => {
  const [researchOptions, setResearchOptions] = useState([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);
  const [resolvedInvestigatorName, setResolvedInvestigatorName] = useState(null);

  const archivos = project.archivos || [];

  const getStatusClass = (estado) => {
    const statusMap = {
      'Pendiente': 'project-admin-status-pending',
      'Preasignado': 'project-admin-status-preasigned',
      'En evaluación': 'project-admin-status-evaluation',
      'Evaluado': 'project-admin-status-evaluated',
      'Enviado': 'project-admin-status-pending'
    };
    return statusMap[estado] || 'project-admin-status-default';
  };

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

  // Obtener estado tal como viene del backend (soporta varias claves posibles)
  const extractBackendStatus = (p) => {
    const possibleKeys = ['estado', 'estadoProyecto', 'estado_proyecto', 'status', 'estadoActual', 'estado_sistema', 'state', 'estadoSistema', 'estado_db'];
    let code = null;
    for (const k of possibleKeys) {
      if (p && p[k] != null && p[k] !== '') {
        code = p[k];
        break;
      }
    }

    // Normalizar y mapear a etiquetas legibles
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
  const displayedStatus = backendStatus.label;

  // Obtener fecha de creación (variantes posibles)
  const creationDateRaw = project?.fechaCreacion || project?.createdAt || project?.fechaEnvio || project?.created_at || project?.fecha_creacion || project?.fecha || project?.created || null;
  const creationDate = creationDateRaw ? formatDate(creationDateRaw) : null;

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
        }
      } catch (error) {
        console.error('Error cargando líneas:', error);
        if (mounted) setResearchOptions([]);
      } finally {
        if (mounted) setIsLoadingLines(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Resolver investigador principal
  useEffect(() => {
    let mounted = true;
    const resolveInvestigator = async () => {
      try {
        const invName = project?.investigadorPrincipal || project?.investigadorNombre || project?.investigador_principal || null;
        if (invName) {
          if (mounted) setResolvedInvestigatorName(typeof invName === 'string' ? invName : (invName.nombre || `${invName.nombre || ''} ${invName.apellido || ''}`.trim()));
          return;
        }

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
          let u = null;
          try {
            u = await userService.getEvaluandoById(invId);
          } catch {
            u = null;
          }

          if (!u) {
            try {
              u = await userService.getEvaluadorById(invId);
            } catch {
              u = null;
            }
          }

          if (!u) {
            try {
              u = await userService.getAdminById(invId);
            } catch {
              u = null;
            }
          }

          if (!mounted) return;
          const resolved = u ? `${u.nombre || u.name || ''}${u.apellido ? ' ' + u.apellido : ''}`.trim() : null;
          if (mounted) setResolvedInvestigatorName(resolved || null);
        }
      } catch (err) {
        console.error('Error resolviendo investigador:', err);
      }
    };
    resolveInvestigator();
    return () => { mounted = false; };
  }, [project]);

  // Función para obtener líneas de investigación
  const getResearchLines = () => {
    if (project?.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      return project.lineasInvestigacionNames.join(', ');
    }

    if (project?.lineasInvestigacion && Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
      const names = project.lineasInvestigacion
        .map(li => li?.nombre || li?.name)
        .filter(Boolean);
      if (names.length > 0) {
        return names.join(', ');
      }
    }

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
        break;
      }
    }

    if (!lineIds) {
      return '-';
    }

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

    if (isLoadingLines) {
      return 'Cargando líneas...';
    }

    if (researchOptions.length === 0) {
      return idsArray.join(', ');
    }

    const names = idsArray.map(id => {
      const idNum = Number(id);
      const line = researchOptions.find(opt => Number(opt.id) === idNum);
      return line ? line.nombre : `ID: ${id}`;
    });

    return names.length > 0 ? names.join(', ') : '-';
  };

  // Función para formatear nivel de estudios
  const formatNivelEstudios = (nivel) => {
    if (!nivel) return '-';

    if (typeof nivel === 'object' && nivel !== null) {
      nivel = nivel.nombre || nivel.name || nivel.id || nivel.value;
    }

    const nivelStr = String(nivel).trim();
    
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

    if (nivelMap[nivelStr]) {
      return nivelMap[nivelStr];
    }

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
        </div>
        <div className="project-admin-status-indicator">
          <span className={`project-admin-status-badge ${getStatusClass(displayedStatus || 'Enviado')}`}>
            {displayedStatus || 'Enviado'}
          </span>
          {backendStatus.code && backendStatus.code !== displayedStatus && (
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
          {/** Editar (abrir modal en modo edición) */}
          <button 
            className="project-admin-btn-icon project-admin-btn-edit" 
            onClick={() => onEdit && onEdit(project)}
            title="Editar proyecto"
          >
            <FaEdit />
          </button>

          <button 
            className="project-admin-btn-icon project-admin-project-btn-view" 
            onClick={() => (onView || onViewDetails) && (onView || onViewDetails)(project)}
            title="Ver detalles"
          >
            <FaEye />
          </button>
        </div>
        <div className="project-admin-registration-date">
          Creado: {creationDate || '—'}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardEvaluando;