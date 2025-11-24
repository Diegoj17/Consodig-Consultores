import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaDownload, FaUser, FaCalendar, FaFileAlt, 
  FaInfoCircle, FaTag, FaUniversity, FaBullseye,
  FaFilePdf, FaFileExcel, FaExternalLinkAlt, FaPaperclip,
  FaCheckCircle, FaSync, FaHistory, FaFileWord
} from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { projectService } from '../../../../services/projectService';
import Modal from '../../../common/Modal';
import '../../../../styles/management/project/evaluador/EvaluatorProjectModal.css';

const EvaluatorProjectModal = ({ 
  project, 
  onClose,
  onDownloadFile,
  onOpenFile
}) => {
  const [projectFiles, setProjectFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null
  });

  // Cargar archivos del proyecto cuando se abre el modal
  useEffect(() => {
    const loadProjectFiles = async () => {
      if (project?.id) {
        setLoadingFiles(true);
        try {
          console.log('🟡 [EvaluatorProjectModal] Cargando archivos del proyecto:', project.id);
          const files = await projectService.getProjectFiles(project.id);
          console.log('🟢 [EvaluatorProjectModal] Archivos cargados:', files);
          setProjectFiles(files);
        } catch (error) {
          console.error('❌ [EvaluatorProjectModal] Error cargando archivos:', error);
          setProjectFiles([]);
        } finally {
          setLoadingFiles(false);
        }
      }
    };

    loadProjectFiles();
  }, [project]);

  // Función para mapear estados del backend a estados legibles
  const getEstadoProyecto = () => {
    const estado = project.estado || project.evaluacionEstado;
    
    const estadoMap = {
      'COMPLETADA': 'Completada',
      'COMPLETADO': 'Completado', 
      'ACEPTADA': 'En evaluación',
      'ASIGNADA': 'Asignada',
      'EN_EVALUACION': 'En evaluación',
      'EVALUADO': 'Evaluado',
      'PENDIENTE': 'Pendiente',
      'RECHAZADA': 'Rechazada'
    };
    
    return estadoMap[estado] || estado || '—';
  };

  // Función para obtener el color del estado
  const getEstadoColor = () => {
    const estado = project.estado || project.evaluacionEstado;
    
    if (estado === 'COMPLETADA' || estado === 'COMPLETADO' || estado === 'EVALUADO') {
      return 'completado';
    } else if (estado === 'ACEPTADA' || estado === 'EN_EVALUACION') {
      return 'en-evaluacion';
    } else if (estado === 'ASIGNADA' || estado === 'PENDIENTE') {
      return 'asignada';
    } else if (estado === 'RECHAZADA') {
      return 'rechazada';
    }
    
    return 'default';
  };

  const getFileIcon = (archivo) => {
    const ext = archivo.nombreArchivo?.split('.').pop()?.toLowerCase();
    const mime = archivo.tipoMime?.toLowerCase();
    const fileType = archivo.tipo?.toLowerCase();
    
    if (fileType?.includes('pdf') || ext === 'pdf' || mime?.includes('pdf')) {
      return <FaFilePdf className="evaluator-file-icon-pdf" />;
    }
    if (fileType?.includes('excel') || ext === 'xls' || ext === 'xlsx' || mime?.includes('spreadsheet') || mime?.includes('excel')) {
      return <FaFileExcel className="evaluator-file-icon-excel" />;
    }
    if (fileType?.includes('word') || ext === 'doc' || ext === 'docx' || mime?.includes('word')) {
      return <FaFileWord className="evaluator-file-icon-word" />;
    }
    return <FaFileAlt className="evaluator-file-icon-default" />;
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

  const handleDownloadFile = async (archivo) => {
    if (onDownloadFile) {
      onDownloadFile(archivo);
    } else {
      try {
        let downloadUrl = archivo.urlArchivo;
        let filename = archivo.nombreArchivo || archivo.nombre || 'archivo';

        if (!downloadUrl) {
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
          }, 1000 * 10);
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
        console.error('❌ [EvaluatorProjectModal] Error descargando archivo:', error);
        
        if (archivo.urlArchivo) {
          window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
        } else {
          alert('Error al descargar el archivo: ' + (error.message || 'Error desconocido'));
        }
      }
    }
  };

  const handleOpenFile = async (archivo) => {
    if (onOpenFile) {
      onOpenFile(archivo);
    } else {
      try {
        if (archivo.urlArchivo) {
          window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
        } else {
          await handleDownloadFile(archivo);
        }
      } catch (error) {
        console.error('❌ [EvaluatorProjectModal] Error abriendo archivo:', error);
        await handleDownloadFile(archivo);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para descargar el proyecto completo en PDF
  const handleDownloadPDF = async () => {
    try {
      console.log('🟡 [EvaluatorProjectModal] Generando PDF del proyecto...');
      
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${project.titulo || 'Proyecto de Investigación'}</h1>
            <p><strong>ID:</strong> ${project.id} | <strong>Fecha de creación:</strong> ${formatDate(project.fechaCreacion)}</p>
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
                ${project.nivelEstudios || 'No especificado'}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Estado:</span><br>
                ${getEstadoProyecto()}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">ID Evaluación:</span><br>
                ${project.evaluacionId || 'No aplica'}
              </div>
            </div>
            
            <div class="metadata-item">
              <span class="metadata-label">Líneas de Investigación:</span><br>
              ${project.lineasInvestigacionNames && project.lineasInvestigacionNames.length > 0 
                ? project.lineasInvestigacionNames.map(nombre => `<span class="keyword">${nombre}</span>`).join('') 
                : 'No especificadas'}
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
            ${project.objetivosEspecificos 
              ? project.objetivosEspecificos.split('\n').map(o => `<div class="objective-item">• ${o}</div>`).join('') 
              : '<p>No se han definido objetivos específicos.</p>'}
          </div>

          <div class="section">
            <h2>Justificación</h2>
            <p>${project.justificacion || 'No se ha proporcionado una justificación.'}</p>
          </div>

          ${projectFiles.length > 0 ? `
          <div class="section">
            <h2>Archivos Adjuntos (${projectFiles.length})</h2>
            <div class="file-list">
              ${projectFiles.map(archivo => `
                <div class="file-item">
                  <strong>${archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre'}</strong><br>
                  <small>Tipo: ${getFileType(archivo)} | Tamaño: ${archivo.tamanio || 'N/A'} | Fecha: ${formatDate(archivo.fechaSubida)}</small>
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
      printWindow.onload = () => {
        printWindow.print();
      };

    } catch (error) {
      console.error('❌ [EvaluatorProjectModal] Error generando PDF:', error);
      alert('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
    }
  };


  if (!project) return null;

  return (
    <div className="evaluator-project-modal-overlay" onClick={onClose}>
      <div className="evaluator-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="evaluator-project-modal-header">
          <div className="evaluator-project-modal-title-section">
            <div>
              <h3>{project.titulo}</h3>
              <div className="evaluator-project-modal-subtitle">
                <span className="evaluator-project-id">ID: {project.id}</span>
                {project.evaluacionId && (
                  <span className="evaluator-evaluation-id">
                    <FaHistory className="evaluator-inline-icon" />
                    Evaluación ID: {project.evaluacionId}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="evaluator-project-modal-header-actions">
            <button 
              className="evaluator-project-modal-close" 
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="evaluator-project-modal-body">
          <div className="evaluator-project-modal-form">
            {/* Sección de Información Básica */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaInfoCircle className="evaluator-project-modal-section-icon" />
                <h3>Información Básica</h3>
              </div>
              
              <div className="evaluator-project-modal-section-content">
                <div className="evaluator-project-modal-form-row">
                  <div className="evaluator-project-modal-form-group">
                    <label className="evaluator-project-modal-form-label">
                      Nivel de Estudios
                    </label>
                    <p className="evaluator-project-modal-readonly-text">
                      <MdSchool className="evaluator-inline-icon" />
                      {project.nivelEstudios || '—'}
                    </p>
                  </div>

                  <div className="evaluator-project-modal-form-group">
                    <label className="evaluator-project-modal-form-label">
                      Líneas de Investigación
                    </label>
                    <div className="evaluator-project-modal-keywords">
                      {project.lineasInvestigacionNames && project.lineasInvestigacionNames.length > 0 ? (
                        project.lineasInvestigacionNames.map((nombre, index) => (
                          <span key={index} className="evaluator-project-modal-keyword-badge">{nombre}</span>
                        ))
                      ) : (
                        <p className="evaluator-project-modal-readonly-text">No hay líneas seleccionadas</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="evaluator-project-modal-form-row">
                  <div className="evaluator-project-modal-form-group">
                    <label className="evaluator-project-modal-form-label">
                      Estado del Proyecto
                    </label>
                    <div className={`evaluator-project-modal-status evaluator-project-modal-status-${getEstadoColor()}`}>
                      <FaCheckCircle className="evaluator-inline-icon" />
                      {getEstadoProyecto()}
                    </div>
                  </div>

                  <div className="evaluator-project-modal-form-group">
                    <label className="evaluator-project-modal-form-label">
                      Fecha de Creación
                    </label>
                    <p className="evaluator-project-modal-readonly-text">
                      <FaCalendar className="evaluator-inline-icon" />
                      {formatDate(project.fechaCreacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Resumen */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaInfoCircle className="evaluator-project-modal-section-icon" />
                <h3>Resumen del Proyecto</h3>
              </div>
              <div className="evaluator-project-modal-section-content">
                <p className="evaluator-project-modal-readonly-text">{project.resumen}</p>
              </div>
            </div>

            {/* Sección de Palabras Clave */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaTag className="evaluator-project-modal-section-icon" />
                <h3>Palabras clave</h3>
              </div>
              <div className="evaluator-project-modal-section-content">
                <div className="evaluator-project-modal-keywords">
                  {project.palabrasClave ? (
                    project.palabrasClave.split(',').map((k, i) => (
                      <span key={i} className="evaluator-project-modal-keyword-badge">{k.trim()}</span>
                    ))
                  ) : (
                    <p className="evaluator-project-modal-readonly-text">No hay palabras clave definidas.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Objetivos */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaBullseye className="evaluator-project-modal-section-icon" />
                <h3>Objetivos del Proyecto</h3>
              </div>
              <div className="evaluator-project-modal-section-content">
                <div className="evaluator-project-modal-objectives-row">
                  <label className="evaluator-project-modal-objective-label">
                    Objetivo General
                  </label>
                  <div className="evaluator-project-modal-objective-field">
                    <p className="evaluator-project-modal-readonly-text">{project.objetivoGeneral || 'No especificado'}</p>
                  </div>
                </div>

                <div className="evaluator-project-modal-objectives-row">
                  <label className="evaluator-project-modal-objective-label">
                    Objetivos Específicos
                  </label>
                  <div className="evaluator-project-modal-objective-field">
                    <div className="evaluator-project-modal-objectives-list">
                      {project.objetivosEspecificos ? (
                        project.objetivosEspecificos.split('\n').map((o, i) => (
                          <div key={i} className="evaluator-project-modal-objective-item">• {o}</div>
                        ))
                      ) : (
                        <p className="evaluator-project-modal-readonly-text">No se han definido objetivos específicos.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Justificación */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaInfoCircle className="evaluator-project-modal-section-icon" />
                <h3>Justificación</h3>
              </div>
              <div className="evaluator-project-modal-section-content">
                <p className="evaluator-project-modal-readonly-text">{project.justificacion || 'No se ha proporcionado una justificación.'}</p>
              </div>
            </div>

            {/* Sección de Archivos */}
            <div className="evaluator-project-modal-section">
              <div className="evaluator-project-modal-section-header">
                <FaPaperclip className="evaluator-project-modal-section-icon" />
                <h3>Archivos del Proyecto</h3>
                {loadingFiles && (
                  <span className="evaluator-project-modal-loading-files">
                    <FaSync className="evaluator-spinning" /> Cargando archivos...
                  </span>
                )}
              </div>
              <div className="evaluator-project-modal-section-content">
                {projectFiles.length > 0 ? (
                  <div className="evaluator-project-modal-files-list">
                    <h4>Archivos adjuntos ({projectFiles.length})</h4>
                    {projectFiles.map((archivo) => (
                      <div key={archivo.id} className="evaluator-project-modal-file-item">
                        <div className="evaluator-project-modal-file-info">
                          <span className="evaluator-project-modal-file-icon">
                            {getFileIcon(archivo)}
                          </span>
                          <div className="evaluator-project-modal-file-details">
                            <span className="evaluator-project-modal-file-name">
                              {archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre'}
                            </span>
                            <span className="evaluator-project-modal-file-type">
                              {getFileType(archivo)}
                              {archivo.tipoMime && ` • ${archivo.tipoMime}`}
                            </span>
                          </div>
                        </div>
                        <div className="evaluator-project-modal-file-actions">
                          <button 
                            className="evaluator-project-modal-btn-icon evaluator-project-modal-btn-open" 
                            onClick={() => handleOpenFile(archivo)} 
                            title="Abrir archivo"
                          >
                            <FaExternalLinkAlt />
                          </button>
                          <button 
                            className="evaluator-project-modal-btn-icon evaluator-project-modal-btn-download" 
                            onClick={() => handleDownloadFile(archivo)} 
                            title="Descargar archivo"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="evaluator-project-modal-no-files">
                    <FaFileAlt className="evaluator-project-modal-no-files-icon" />
                    <p>No hay archivos adjuntos a este proyecto.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="evaluator-project-modal-footer">
          <div className="evaluator-project-modal-footer-actions">
            <button 
              className="evaluator-project-modal-btn-secondary" 
              onClick={onClose}
            >
              Cerrar
            </button>
            
            <div className="evaluator-project-modal-primary-actions">
              <button 
                className="evaluator-project-modal-btn-download evaluator-project-modal-btn-pdf"
                onClick={handleDownloadPDF}
              >
                <FaFilePdf />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={confirmState.open}
          onClose={() => setConfirmState(prev => ({ ...prev, open: false }))}
          type={confirmState.type}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => {
            if (typeof confirmState.onConfirm === 'function') {
              confirmState.onConfirm();
            } else {
              setConfirmState(prev => ({ ...prev, open: false }));
            }
          }}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          showCancel={true}
        />
      </div>
    </div>
  );
};

export default EvaluatorProjectModal;