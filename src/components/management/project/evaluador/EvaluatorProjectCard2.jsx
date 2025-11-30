import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaCalendar, FaUserCheck, FaEye, FaFileAlt,
  FaPaperclip, FaFilePdf, FaFileExcel, FaExternalLinkAlt,
  FaFileWord, FaFileImage, FaFileArchive, FaStar, FaCheckCircle
} from 'react-icons/fa';
import '../../../../styles/management/project/evaluador/EvaluatorProjectCard2.css';
import { researchService } from '../../../../services/researchService';
import { projectService } from '../../../../services/projectService';
import EvaluatorProjectModal from './EvaluatorProjectModal';

const EvaluatorProjectCard2 = ({ project, onReviewEvaluation, showFull = false }) => {
  const [researchOptions, setResearchOptions] = useState([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const archivos = project.archivos || [];

  const getStatusClass = (estado) => {
    const statusMap = {
      'Pendiente': 'evaluator-project-card-2-status-pending',
      'Preasignado': 'evaluator-project-card-2-status-preasigned',
      'En evaluación': 'evaluator-project-card-2-status-evaluation',
      'Evaluado': 'evaluator-project-card-2-status-evaluated',
      'COMPLETADO': 'evaluator-project-card-2-status-completed',
      'COMPLETADA': 'evaluator-project-card-2-status-completed'
    };
    return statusMap[estado] || 'evaluator-project-card-2-status-default';
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
        console.error('❌ [EvaluatorProjectCard2] Error cargando líneas:', error);
        if (mounted) setResearchOptions([]);
      } finally {
        if (mounted) setIsLoadingLines(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Función para obtener líneas de investigación
  const getResearchLines = () => {
    if (project?.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      return project.lineasInvestigacionNames.join(', ');
    }

    if (project?.lineasInvestigacion && Array.isArray(project.lineasInvestigacion)) {
      const names = project.lineasInvestigacion
        .map(li => li?.nombre || li?.name)
        .filter(Boolean);
      return names.length > 0 ? names.join(', ') : '-';
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

  // Función para descargar el proyecto completo en PDF
  const handleDownloadPDF = async () => {
    try {
      console.log('🟡 [EvaluatorProjectCard2] Generando PDF del proyecto...');
      
      // Crear contenido HTML para el PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${project.titulo || 'Proyecto'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2c5aa0; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #2c5aa0; 
              margin: 0; 
              font-size: 24px;
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section h2 { 
              color: #2c5aa0; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
              font-size: 18px;
            }
            .metadata { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin-bottom: 20px;
            }
            .metadata-item { 
              margin-bottom: 8px;
            }
            .metadata-label { 
              font-weight: bold; 
              color: #555;
            }
            .keyword { 
              background: #e0f2fe; 
              color: #0369a1; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              margin-right: 5px; 
              display: inline-block;
            }
            .objective-item { 
              margin-bottom: 5px; 
              padding-left: 15px;
            }
            .file-list { 
              margin-top: 10px;
            }
            .file-item { 
              margin-bottom: 5px; 
              padding: 5px; 
              background: #f8f9fa; 
              border-radius: 4px;
            }
            @media print {
              body { 
                max-width: 100%; 
                padding: 15px;
              }
              .header h1 { 
                font-size: 20px;
              }
              .section h2 { 
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${project.titulo || 'Proyecto de Investigación'}</h1>
            <p><strong>Fecha de creación:</strong> ${formatDate(project.fechaCreacion || project.fechaEnvio)}</p>
          </div>

          <div class="section">
            <h2>Información Básica</h2>
            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Investigador Principal:</span><br>
                ${project.investigadorPrincipal || 'No especificado'}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Nivel de Estudios:</span><br>
                ${formatNivelEstudios(project.nivelEstudios)}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Estado:</span><br>
                ${project.estado || 'No especificado'}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">ID Evaluación:</span><br>
                ${project.evaluacionId || 'No aplica'}
              </div>
            </div>
            
              <div class="metadata-item">
                <span class="metadata-label">Líneas de Investigación:</span><br>
              ${getResearchLines()}
            </div>
          </div>

          <div class="section">
            <h2>Resumen</h2>
            <p>${project.resumen || 'No se ha proporcionado un resumen.'}</p>
          </div>

          <div class="section">
            <h2>Palabras Clave</h2>
            <p>
              ${project.palabrasClave 
                ? project.palabrasClave.split(',').map(k => `<span class="keyword">${k.trim()}</span>`).join('') 
                : 'No se han definido palabras clave.'}
            </p>
          </div>

          <div class="section">
            <h2>Objetivos</h2>
            <p><strong>Objetivo General:</strong><br>${project.objetivoGeneral || 'No especificado'}</p>
            
            <p><strong>Objetivos Específicos:</strong></p>
            ${specificObjectives 
              ? specificObjectives.map(o => `<div class="objective-item">• ${o}</div>`).join('') 
              : '<p>No se han definido objetivos específicos.</p>'}
          </div>

          <div class="section">
            <h2>Justificación</h2>
            <p>${project.justificacion || 'No se ha proporcionado una justificación.'}</p>
          </div>

          ${archivos.length > 0 ? `
          <div class="section">
            <h2>Archivos Adjuntos (${archivos.length})</h2>
            <div class="file-list">
              ${archivos.map(archivo => `
                <div class="file-item">
                  <strong>${getFileName(archivo)}</strong><br>
                  <small>Tipo: ${getFileType(archivo)}</small>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <p style="text-align: center; color: #666; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              Documento generado el ${new Date().toLocaleDateString('es-ES')} - Sistema de Evaluación de Proyectos
            </p>
          </div>
        </body>
        </html>
      `;

      // Crear ventana para imprimir/guardar como PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Esperar a que cargue el contenido y luego imprimir/guardar como PDF
      setTimeout(() => {
        printWindow.print();
        // Cerrar la ventana después de imprimir
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 500);

    } catch (error) {
      console.error('❌ [EvaluatorProjectCard2] Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
    }
  };

  const navigate = useNavigate();

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="evaluator-project-card-2"> 
        <div className="evaluator-project-card-2-header">
          <div className="evaluator-project-card-2-user-avatar">
            <span>{getInitials(project.investigadorPrincipal)}</span>
          </div>
          <div className="evaluator-project-card-2-user-meta">
            <h3 className="evaluator-project-card-2-project-title">{project.titulo}</h3>
          </div>
          <div className="evaluator-project-card-2-status-indicator">
            <span className={`evaluator-project-card-2-status-badge ${getStatusClass(project.estado)}`}>
              {project.estado}
            </span>
          </div>
        </div>

        <div className="evaluator-project-card-2-card-body">
          {project.evaluadorAsignado && (
            <div className="evaluator-project-card-2-info-group">
              <label>Evaluador Asignado:</label>
              <p>
                <FaUserCheck className="evaluator-project-card-2-inline-icon" />
                {project.evaluadorAsignado}
              </p>
            </div>
          )}

          <div className="evaluator-project-card-2-info-group">
            <label>Resumen:</label>
            <p className="evaluator-project-card-2-project-summary">
              {project.resumen ? (
                showFull ? project.resumen : (
                  project.resumen.length > 100 ? `${project.resumen.substring(0, 100)}...` : project.resumen
                )
              ) : 'No hay resumen disponible'}
            </p>
          </div>

          <div className="evaluator-project-card-2-info-group">
            <label>Palabras Clave:</label>
            {project.palabrasClave ? (
              <div className="evaluator-project-card-2-project-keywords">
                {project.palabrasClave.split(',').slice(0, 3).map((keyword, index) => (
                  <span key={index} className="evaluator-project-card-2-project-keyword-badge">
                    {keyword.trim()}
                  </span>
                ))}
                {project.palabrasClave.split(',').length > 3 && (
                  <span className="evaluator-project-card-2-project-keyword-more">
                    +{project.palabrasClave.split(',').length - 3}
                  </span>
                )}
              </div>
            ) : (
              <p>-</p>
            )}
          </div>

          {(project.objetivoGeneral || specificObjectives) && (
            <div className="evaluator-project-card-2-info-group evaluator-project-card-2-project-objectives">
              {project.objetivoGeneral && (
                <>
                  <label>Objetivo General:</label>
                  <p className="evaluator-project-card-2-project-objective-general">{project.objetivoGeneral}</p>
                </>
              )}

              {specificObjectives && (
                <>
                  <label>Objetivos Específicos:</label>
                  <ul className="evaluator-project-card-2-project-objective-list">
                    {specificObjectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <div className="evaluator-project-card-2-info-group">
            <label>Justificación:</label>
            <p className="evaluator-project-card-2-justification">
              {project.justificacion ? (
                showFull ? project.justificacion : (
                  project.justificacion.length > 150 ? `${project.justificacion.substring(0, 150)}...` : project.justificacion
                )
              ) : 'No hay justificación disponible'}
            </p>
          </div>

          <div className="evaluator-project-card-2-info-group">
            <label>Nivel de Estudios:</label>
            <p>{formatNivelEstudios(project.nivelEstudios)}</p>
          </div>

          <div className="evaluator-project-card-2-info-group">
            <label>Líneas de Investigación:</label>
            <p className="evaluator-project-card-2-research-lines">{getResearchLines()}</p>
          </div>

          <div className="evaluator-project-card-2-info-group">
            <label>
              <FaPaperclip className="evaluator-project-card-2-inline-icon" />
              Archivos Adjuntos ({project.totalArchivos || archivos.length})
            </label>
            {archivos.length > 0 ? (
              <div className="evaluator-project-card-2-files-list">
                {archivos.slice(0, showFull ? archivos.length : 3).map((archivo, index) => (
                  <div key={archivo.id || index} className="evaluator-project-card-2-file-item">
                    <div className="evaluator-project-card-2-file-info">
                      <span className="evaluator-project-card-2-file-icon">
                        {getFileIcon(archivo.nombreArchivo, archivo.tipoMime, archivo.tipo)}
                      </span>
                      <div className="evaluator-project-card-2-file-details">
                        <span className="evaluator-project-card-2-file-name">
                          {getFileName(archivo)}
                        </span>
                      </div>
                    </div>
                    <div className="evaluator-project-card-2-file-actions">
                      <button 
                        className="evaluator-project-card-2-btn-icon evaluator-project-card-2-btn-open" 
                        onClick={() => handleOpenFile(archivo)} 
                        title={canOpenInBrowser(archivo) ? 'Abrir archivo' : 'Descargar archivo'}
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </div>
                ))}
                {!showFull && archivos.length > 3 && (
                  <div className="evaluator-project-card-2-file-more">
                    +{archivos.length - 3} archivos más
                  </div>
                )}
              </div>
            ) : (
              <p className="evaluator-project-card-2-no-files">No hay archivos adjuntos</p>
            )}
          </div>
        </div>

        <div className="evaluator-project-card-2-card-footer">
          <div className="evaluator-project-card-2-action-buttons">
            {/* Botón para ver detalles */}
            <button 
              className="evaluator-project-card-2-btn-icon evaluator-project-card-2-project-btn-view" 
              onClick={handleViewDetails}
              title="Ver detalles completos"
            >
              <FaEye />
            </button>
            
            {/* Botón para descargar PDF */}
            <button 
              className="evaluator-project-card-2-btn-icon evaluator-project-card-2-project-btn-pdf" 
              onClick={handleDownloadPDF}
              title="Descargar proyecto en PDF"
            >
              <FaFilePdf />
            </button>
            
            {/* Botón para evaluar (solo en estado 'En evaluación') */}
            {project.estado === 'En evaluación' && (
              <button 
                className="evaluator-project-card-2-btn-icon evaluator-project-card-2-project-btn-evaluate" 
                onClick={() => navigate('/evaluador/evaluations/in-progress')}
                title="Continuar evaluación"
              >
                <FaStar />
              </button>
            )}
            
            {/* Botón para revisar evaluación (solo en estados completados) */}
            {(project.estado === 'Evaluado' || project.estado === 'COMPLETADO' || project.estado === 'COMPLETADA') && (
              <button 
                className="evaluator-project-card-2-btn-icon evaluator-project-card-2-project-btn-review" 
                onClick={() => onReviewEvaluation(project)}
                title="Revisar evaluación"
              >
                <FaCheckCircle />
              </button>
            )}
          </div>
          <div className="evaluator-project-card-2-registration-date">
            Creado: {formatDate(project.fechaEnvio)}
          </div>
        </div>
      </div>

      {showModal && (
        <EvaluatorProjectModal
          project={project}
          onClose={handleCloseModal}
          mode="view"
        />
      )}
    </>
  );
};

export default EvaluatorProjectCard2;