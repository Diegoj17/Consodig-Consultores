import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaEdit, 
  FaEye,
  FaCheck, 
  FaTimes,
  FaLock,
  FaTag,
  FaPaperclip,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaExternalLinkAlt,
  FaUserCheck,
  FaListOl
} from 'react-icons/fa';
import '../../../../styles/management/project/evaluador/EvaluatorProjectCard.css';
import Modal from '../../../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../../../services/projectService';
import { profileService } from '../../../../services/profileService';
import { researchService } from '../../../../services/researchService';

const EvaluatorProjectCard = ({
  project,
  onEvaluate,
  onAccept,
  onReject,
}) => {
  const [researchOptions, setResearchOptions] = useState([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);

  const getStatusVariant = (estado) => {
    const variants = {
      'Preasignado': 'pending',
      'En evaluación': 'active',
      'Evaluado': 'completed',
      'Rechazado': 'rejected'
    };
    return variants[estado] || 'pending';
  };

  const isUrgent = project.deadline && new Date(project.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isOverdue = project.deadline && new Date(project.deadline) < new Date();
  const navigate = useNavigate();

  const [showDocsModal, setShowDocsModal] = useState(false);
  const [checkingDocs, setCheckingDocs] = useState(false);

  const checkRequiredDocuments = async () => {
    try {
      setCheckingDocs(true);
      const profile = await profileService.getProfile();

      // Buscar posibles ubicaciones de documentos en la respuesta
      const candidates = [
        profile,
        profile?.documents,
        profile?.documentos,
        profile?.archivos,
        profile?.files,
        profile?.uploads,
        profile?.user,
        profile?.user?.documents,
        profile?.user?.archivos
      ];

      // Tipos requeridos según EvaluatorDocumentsUpload
      const requiredKeys = ['cedula', 'titulos', 'cuentaBancaria'];

      // Función para comprobar presencia en un objeto o array
      const hasAllIn = (obj) => {
        if (!obj) return false;

        // Si es array, buscar objetos que representen archivos por key/name/type
        if (Array.isArray(obj)) {
          const keysFound = new Set();
          obj.forEach(item => {
            if (!item) return;
            const k = item.tipo || item.type || item.name || item.key || item.documentType || item.tipoDocumento;
            if (k) keysFound.add(String(k).toLowerCase());
          });
          return requiredKeys.every(r => keysFound.has(r.toLowerCase()));
        }

        // Si es objeto, comprobar claves directas
        const lowerKeys = Object.keys(obj).map(k => k.toLowerCase());
        if (requiredKeys.every(r => lowerKeys.includes(r.toLowerCase()))) return requiredKeys.every(r => Boolean(obj[r]));

        // A veces las claves están dentro de sub-objetos
        return requiredKeys.every(r => {
          const v = obj[r] ?? obj[camelCase(r)] ?? obj[toSnake(r)];
          return Boolean(v);
        });
      };

      // helpers
      function camelCase(s){ return s.replace(/_([a-z])/g, g=>g[1].toUpperCase()); }
      function toSnake(s){ return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`); }

      for (const cand of candidates) {
        if (!cand) continue;
        if (hasAllIn(cand)) {
          setCheckingDocs(false);
          return true;
        }
      }

      setCheckingDocs(false);
      return false;
    } catch (error) {
      console.warn('Error comprobando documentos:', error);
      setCheckingDocs(false);
      // Si hay error, no permitir bypass; mostrar modal
      return false;
    }
  };

  // Cargar líneas de investigación
  useEffect(() => {
    let mounted = true;
    const loadResearchLines = async () => {
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
        console.error('❌ [EvaluatorProjectCard] Error cargando líneas:', error);
        if (mounted) setResearchOptions([]);
      } finally {
        if (mounted) setIsLoadingLines(false);
      }
    };
    loadResearchLines();
    return () => { mounted = false; };
  }, []);

  // ✅ FUNCIÓN CORREGIDA - Obtener líneas de investigación como STRING
  const getResearchLines = () => {
    // 1. Si ya vienen los nombres como array de strings
    if (project?.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      return project.lineasInvestigacionNames.join(', ');
    }

    // 2. Si vienen objetos completos, extraer solo los nombres
    if (project?.lineasInvestigacion && Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
      const names = project.lineasInvestigacion
        .map(li => {
          if (typeof li === 'string') return li;
          if (typeof li === 'object' && li !== null) {
            return li.nombre || li.name;
          }
          return null;
        })
        .filter(Boolean);
      
      if (names.length > 0) return names.join(', ');
    }

    // 3. Buscar IDs y mapearlos
    const possibleKeys = [
      'lineasInvestigacionIds',
      'lineasIds', 
      'lineas_investigacion',
      'lineas'
    ];

    let lineIds = null;
    for (const key of possibleKeys) {
      if (project?.[key]) {
        lineIds = project[key];
        break;
      }
    }

    if (!lineIds) return '-';

    // Normalizar a array
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

    if (isLoadingLines) return 'Cargando líneas...';
    if (researchOptions.length === 0) return idsArray.join(', ');

    // Mapear IDs a nombres
    const names = idsArray.map(id => {
      const idNum = Number(id);
      const line = researchOptions.find(opt => Number(opt.id) === idNum);
      return line ? line.nombre : `ID: ${id}`;
    });

    return names.length > 0 ? names.join(', ') : '-';
  };

  // ✅ FUNCIÓN CORREGIDA - Obtener líneas como ARRAY para badges
  const getResearchLinesArray = () => {
    // 1. Si ya vienen los nombres como array de strings
    if (project?.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      return project.lineasInvestigacionNames;
    }

    // 2. Si vienen objetos completos, extraer solo los nombres
    if (project?.lineasInvestigacion && Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
      const names = project.lineasInvestigacion
        .map(li => {
          if (typeof li === 'string') return li;
          if (typeof li === 'object' && li !== null) {
            return li.nombre || li.name;
          }
          return null;
        })
        .filter(Boolean);
      
      if (names.length > 0) return names;
    }

    return [];
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

    if (nivelMap[nivelStr]) return nivelMap[nivelStr];

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

  // Función para obtener objetivos específicos
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

  // Funciones para manejo de archivos
  const archivos = project.archivos || [];

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
      // Prefer to fetch the file and force download via a blob, this avoids browsers opening it in a new tab.
      if (downloadUrl) {
        try {
          const resp = await fetch(downloadUrl, { method: 'GET', credentials: 'include' });
          if (resp.ok) {
            const blob = await resp.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => {
              if (blobUrl.startsWith('blob:')) window.URL.revokeObjectURL(blobUrl);
            }, 10000);
            return;
          }
          // if fetch failed (e.g., CORS) fallthrough to server-side download
        } catch (err) {
          console.warn('fetch directo fallo, intentando fallback por API:', err);
        }
      }

      // Fallback: request the file via backend service (streams the file) when we have archivo.id
      if (archivo.id) {
        const response = await projectService.downloadFile(archivo.id);
        const blob = response?.data || response;
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          if (blobUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(blobUrl);
          }
        }, 10000);
      } else if (downloadUrl) {
        // Last resort: create link to url and let browser decide (may open in new tab if cross-origin)
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
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

  const getFileType = (archivo) => {
    if (archivo.tipo) return archivo.tipo;
    
    const ext = archivo.nombreArchivo?.split('.').pop()?.toLowerCase();
    const typeMap = {
      'pdf': 'PDF',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'doc': 'Word',
      'docx': 'Word',
      'jpg': 'Imagen',
      'jpeg': 'Imagen',
      'png': 'Imagen',
      'gif': 'Imagen',
      'zip': 'Zip',
      'rar': 'RAR',
      'txt': 'Texto'
    };
    
    return typeMap[ext] || 'Archivo';
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

  // ✅ Obtener líneas como array para el header
  const lineasArray = getResearchLinesArray();

  return (
    <div className={`evaluator-project-card evaluator-project-card--${getStatusVariant(project.estado)}`}>
      {/* Header con avatar y estado */}
      <div className="evaluator-project-header">
        <div className="evaluator-user-avatar">
          <span>{getInitials(project.investigadorPrincipal)}</span>
        </div>
        <div className="evaluator-title-section">
          <h3 className="evaluator-project-title">{project.titulo}</h3>
          {/* ✅ CORREGIDO - Renderizar líneas como strings */}
          {lineasArray && lineasArray.length > 0 && (
            <div className="evaluator-project-lines">
              {lineasArray.slice(0, 2).map((linea, index) => (
                <span key={index} className="evaluator-project-line-tag">
                  <FaTag className="tag-icon" />
                  {String(linea)}
                </span>
              ))}
              {lineasArray.length > 2 && (
                <span className="evaluator-project-line-more">
                  +{lineasArray.length - 2} más
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="evaluator-project-status-container">
          <span className={`evaluator-project-status evaluator-status-${project.estado.toLowerCase().replace(' ', '-')}`}>
            {project.estado}
          </span>
          {isUrgent && !isOverdue && (
            <span className="evaluator-urgent-badge">
              <FaClock className="urgent-icon" />
              Urgente
            </span>
          )}
          {isOverdue && (
            <span className="evaluator-overdue-badge">
              <FaClock className="overdue-icon" />
              Vencido
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo con toda la información del proyecto */}
      <div className="evaluator-project-body">
        {/* Resumen */}
        <div className="evaluator-project-section">
          <label className="evaluator-section-label">Resumen del Proyecto</label>
          <p className="evaluator-section-content">{project.resumen || 'No hay resumen disponible'}</p>
        </div>

        {/* Palabras clave */}
        <div className="evaluator-project-section">
          <label className="evaluator-section-label">
            <FaTag className="section-icon" />
            Palabras Clave
          </label>
          {project.palabrasClave ? (
            <div className="evaluator-keywords-list">
              {project.palabrasClave.split(',').slice(0, 5).map((keyword, index) => (
                <span key={index} className="evaluator-keyword-badge">
                  {keyword.trim()}
                </span>
              ))}
              {project.palabrasClave.split(',').length > 5 && (
                <span className="evaluator-keyword-more">
                  +{project.palabrasClave.split(',').length - 5}
                </span>
              )}
            </div>
          ) : (
            <p className="evaluator-section-content">No especificadas</p>
          )}
        </div>

        {/* Objetivos */}
        {(project.objetivoGeneral || specificObjectives) && (
          <div className="evaluator-project-section">
            <label className="evaluator-section-label">
              <FaListOl className="section-icon" />
              Objetivos del Proyecto
            </label>
            {project.objetivoGeneral && (
              <div className="evaluator-objective-group">
                <strong>Objetivo General:</strong>
                <p className="evaluator-section-content">{project.objetivoGeneral}</p>
              </div>
            )}
            {specificObjectives && (
              <div className="evaluator-objective-group">
                <strong>Objetivos Específicos:</strong>
                <ul className="evaluator-objective-list">
                  {specificObjectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Justificación */}
        {project.justificacion && (
          <div className="evaluator-project-section">
            <label className="evaluator-section-label">Justificación</label>
            <p className="evaluator-section-content">
              {project.justificacion.length > 200 
                ? `${project.justificacion.substring(0, 200)}...` 
                : project.justificacion
              }
            </p>
          </div>
        )}

        {/* Líneas de investigación */}
        <div className="evaluator-project-section">
          <label className="evaluator-section-label">Líneas de Investigación</label>
          <p className="evaluator-section-content">{getResearchLines()}</p>
        </div>

        {/* Nivel de estudios */}
        {project.nivelEstudios && (
          <div className="evaluator-project-section">
            <label className="evaluator-section-label">Nivel de Estudios</label>
            <p className="evaluator-section-content">{formatNivelEstudios(project.nivelEstudios)}</p>
          </div>
        )}

        {/* Notificación de evaluación anónima */}
        {project.isBlind && (
          <div className="evaluator-blind-notice">
            <FaLock className="blind-icon" />
            Evaluación Anónima (Doble Ciego)
          </div>
        )}

        {/* Archivos adjuntos */}
        {archivos.length > 0 && (
          <div className="evaluator-project-section">
            <label className="evaluator-section-label">
              <FaPaperclip className="section-icon" />
              Archivos Adjuntos ({archivos.length})
            </label>
            <div className="evaluator-files-list">
              {archivos.slice(0, 3).map((archivo, index) => (
                <div key={archivo.id || index} className="evaluator-file-item">
                  <div className="evaluator-file-info">
                    <span className="evaluator-file-icon">
                      {getFileIcon(archivo.nombreArchivo, archivo.tipoMime, archivo.tipo)}
                    </span>
                    <div className="evaluator-file-details">
                      <span className="evaluator-file-name">
                        {getFileName(archivo)}
                      </span>
                      <span className="evaluator-file-type">
                        {getFileType(archivo)}
                      </span>
                    </div>
                  </div>
                  <div className="evaluator-file-actions">
                    <button 
                      className="evaluator-btn-icon evaluator-btn-open" 
                      onClick={() => handleOpenFile(archivo)} 
                      title={canOpenInBrowser(archivo) ? 'Abrir archivo' : 'Descargar archivo'}
                    >
                      <FaExternalLinkAlt />
                    </button>
                  </div>
                </div>
              ))}
              {archivos.length > 3 && (
                <div className="evaluator-file-more">
                  +{archivos.length - 3} archivos más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="evaluator-project-meta">
          <div className="evaluator-meta-item">
            <FaCalendarAlt className="meta-icon" />
            <div className="evaluator-meta-content">
              <span className="evaluator-meta-label">Fecha de envío</span>
              <span className="evaluator-meta-value">{project.fechaEnvio}</span>
            </div>
          </div>
          
          {project.deadline && (
            <div className="evaluator-meta-item">
              <FaClock className={`meta-icon ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`} />
              <div className="evaluator-meta-content">
                <span className="evaluator-meta-label">Plazo de evaluación</span>
                <span className={`evaluator-meta-value deadline ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`}>
                  {project.deadline}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="evaluator-project-actions">
        {project.estado === 'Preasignado' ? (
          <>
            <button
              className="evaluator-btn evaluator-btn-accept"
              onClick={async () => {
                try {
                  const ok = await checkRequiredDocuments();
                  if (ok) {
                    if (typeof onAccept === 'function') onAccept(project.evaluacionId);
                  } else {
                    setShowDocsModal(true);
                  }
                } catch {
                  // en caso de error, mostrar modal para que el usuario decida
                  setShowDocsModal(true);
                }
              }}
              disabled={checkingDocs}
            >
              <FaCheck className="btn-icon" />
              Aceptar Evaluación
            </button>
            <button
              className="evaluator-btn evaluator-btn-reject"
              onClick={() => onReject(project.evaluacionId)}
            >
              <FaTimes className="btn-icon" />
              Rechazar
            </button>
          </>
        ) : project.estado === 'En evaluación' ? (
          <>
            <button
              className="evaluator-btn evaluator-btn-evaluate"
              onClick={() => onEvaluate(project)}
            >
              <FaEdit className="btn-icon" />
              Evaluar Proyecto
            </button>
          </>
        ) : (
          <>
            <button
              className="evaluator-btn evaluator-btn-view"
              onClick={() => onEvaluate(project)}
            >
              <FaEye className="btn-icon" />
              Ver Evaluación
            </button>
          </>
        )}
      </div>
      {/* Modal: solicitar subida de documentos antes de evaluar */}
      <Modal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        type="warning"
        title="Antes de aceptar"
        message={"Debe subir los documentos requeridos para iniciar la evaluación. ¿Desea ir a la sección 'Mis Documentos' ahora?"}
        confirmText="Continuar sin subir"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowDocsModal(false);
          // Llamar al handler original para aceptar la evaluación
          if (typeof onAccept === 'function') onAccept(project.evaluacionId);
        }}
      >
        <div style={{ marginTop: '0.5rem' }}>
          <button
            className="evaluator-btn evaluator-btn-primary"
            onClick={() => {
              setShowDocsModal(false);
              navigate('/evaluador/documents');
            }}
            style={{ marginRight: '0.5rem' }}
          >
            Ir a Mis Documentos
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EvaluatorProjectCard;