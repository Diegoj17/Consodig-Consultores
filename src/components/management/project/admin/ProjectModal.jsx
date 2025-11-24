import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, FaDownload, FaUser, FaCalendar, FaFileAlt, 
  FaInfoCircle, FaEdit, FaSave, FaTrash, FaCheck, FaClock,
  FaUserCheck, FaTag, FaUniversity, FaBullseye, FaUpload,
  FaFilePdf, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaSync,
  FaExternalLinkAlt, FaPaperclip
} from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { researchService } from '../../../../services/researchService';
import { projectService } from '../../../../services/projectService';
import '../../../../styles/management/project/admin/ProjectModal.css';
import Modal from '../../../common/Modal';

const ProjectModal = ({ 
  project, 
  onClose, 
  onSave, 
  onDelete,
  mode = 'view', // 'view', 'edit', 'create'
  isSubmitting = false 
}) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    palabrasClave: '',
    objetivoGeneral: '',
    objetivosEspecificos: '',
    justificacion: '',
    nivelEstudios: '',
    investigadorPrincipal: '',
    lineasInvestigacionIds: []
  });
  
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectFiles, setProjectFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await projectService.getAll();
        setAvailableProjects(projects);
        
        if (project && mode === 'edit') {
          setSelectedProjectId(project.id);
        }
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      }
    };

    if (mode === 'edit' || mode === 'create') {
      loadProjects();
    }
  }, [project, mode]);

  // Cargar archivos del proyecto cuando se abre en modo edición o vista
  useEffect(() => {
    const loadProjectFiles = async () => {
      if ((mode === 'edit' || mode === 'view') && project?.id) {
        setLoadingFiles(true);
        try {
          console.log('🟡 [ProjectModal] Cargando archivos del proyecto:', project.id);
          const files = await projectService.getProjectFiles(project.id);
          console.log('🟢 [ProjectModal] Archivos cargados:', files);
          setProjectFiles(files);
        } catch (error) {
          console.error('❌ [ProjectModal] Error cargando archivos:', error);
          setProjectFiles([]);
        } finally {
          setLoadingFiles(false);
        }
      }
    };

    loadProjectFiles();
  }, [project, mode]);

  const [changesMade, setChangesMade] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [researchOptions, setResearchOptions] = useState([]);
  const [nivelEstudiosOptions, setNivelEstudiosOptions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({
    pdf: null,
    excel: null
  });
  const [uploadStatus, setUploadStatus] = useState({
    pdf: { status: 'idle', message: '' },
    excel: { status: 'idle', message: '' }
  });
  const [uploading, setUploading] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null
  });

  useEffect(() => {
    console.log('🔍 ProjectModal Upload State:', {
      projectId: project?.id,
      mode,
      selectedFiles,
      uploadStatus,
      uploading,
      projectFiles
    });
  }, [project, mode, selectedFiles, uploadStatus, uploading, projectFiles]);

  const fileInputRef = useRef({ pdf: null, excel: null });
  const linesRef = useRef(null);
  const [showLinesDropdown, setShowLinesDropdown] = useState(false);

  // Cargar opciones de nivel de estudios y líneas de investigación
  useEffect(() => {
  const loadOptions = async () => {
    try {
      // Obtener niveles de estudio desde el servicio de proyectos (que ahora usa userService)
      const niveles = await projectService.getNivelesEstudio();
      setNivelEstudiosOptions(niveles);

      // Obtener líneas de investigación desde researchService (que usa el servicio de usuarios)
      const lineas = await researchService.getAll();
      console.log('🔍 [ProjectModal] Líneas de investigación cargadas:', lineas);
      
      const opts = Array.isArray(lineas) 
        ? lineas.map((r) => ({ 
            id: Number(r.id), 
            nombre: r.nombre || r.nombreLinea || 'Sin nombre'
          })).filter(o => o.id && o.nombre)
        : [];
      
      console.log('🟢 [ProjectModal] Opciones procesadas:', opts);
      setResearchOptions(opts);
    } catch (error) {
      console.error('❌ [ProjectModal] Error cargando opciones:', error);
      setResearchOptions([]);
    }
  };

  loadOptions();
}, []);

  // Inicializar formData cuando cambia el proyecto o el modo
  useEffect(() => {
    if (project) {
      console.log('🔍 [ProjectModal] Inicializando con proyecto:', project);
      
      // Extraer IDs de líneas de investigación de diferentes formatos posibles
      let lineasIds = [];
      if (project.lineasInvestigacionIds && project.lineasInvestigacionIds.length > 0) {
        lineasIds = project.lineasInvestigacionIds.map(id => Number(id));
      } else if (project.lineasInvestigacion && project.lineasInvestigacion.length > 0) {
        lineasIds = project.lineasInvestigacion
          .map(li => li.id || li.lineaInvestigacionId)
          .filter(id => id != null)
          .map(id => Number(id));
      } else if (project.lineaInvestigacionIds) {
        lineasIds = project.lineaInvestigacionIds.map(id => Number(id));
      }

      console.log('🟢 [ProjectModal] IDs de líneas extraídos:', lineasIds);

      setFormData({
        titulo: project.titulo || '',
        resumen: project.resumen || '',
        palabrasClave: project.palabrasClave || '',
        objetivoGeneral: project.objetivoGeneral || '',
        objetivosEspecificos: project.objetivoEspecifico || project.objetivosEspecificos || '',
        justificacion: project.justificacion || '',
        nivelEstudios: project.nivelEstudios || '',
        investigadorPrincipal: project.investigadorPrincipal || '',
        lineasInvestigacionIds: lineasIds
      });

      // Inicializar también selectedLineIds
      setSelectedLineIds(lineasIds);
    } else if (mode === 'create') {
      setFormData({
        titulo: '',
        resumen: '',
        palabrasClave: '',
        objetivoGeneral: '',
        objetivosEspecificos: '',
        justificacion: '',
        nivelEstudios: '',
        investigadorPrincipal: '',
        lineasInvestigacionIds: []
      });
      setSelectedLineIds([]);
    }
    
    setIsEditing(mode === 'edit' || mode === 'create');
    setChangesMade(false);
    setFormErrors({});
    setSelectedFiles({ pdf: null, excel: null });
    setUploadStatus({
      pdf: { status: 'idle', message: '' },
      excel: { status: 'idle', message: '' }
    });
  }, [project, mode]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (linesRef.current && !linesRef.current.contains(e.target)) {
        setShowLinesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setChangesMade(true);
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const [selectedLineIds, setSelectedLineIds] = useState([]);

  // Sincronizar selectedLineIds con formData.lineasInvestigacionIds
  useEffect(() => {
    if (formData.lineasInvestigacionIds) {
      setSelectedLineIds(formData.lineasInvestigacionIds);
    }
  }, [formData.lineasInvestigacionIds]);

  const handleLineaInvestigacionToggle = (lineaId) => {
    const numericId = Number(lineaId);
    setSelectedLineIds(prev => {
      const isSelected = prev.includes(numericId);
      const next = isSelected 
        ? prev.filter(id => id !== numericId) 
        : [...prev, numericId];
      
      console.log('🔄 [ProjectModal] Líneas actualizadas:', {
        lineaId: numericId,
        wasSelected: isSelected,
        newSelection: next
      });

      // Actualizar formData
      setFormData(prevForm => ({ 
        ...prevForm, 
        lineasInvestigacionIds: next 
      }));
      
      setChangesMade(true);
      return next;
    });
  };

  const selectedLineNames = researchOptions
    .filter(opt => selectedLineIds.includes(opt.id))
    .map(opt => opt.nombre);

  const handleFileSelect = async (fileType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (fileType === 'pdf' && file.type !== 'application/pdf') {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: 'Por favor selecciona un archivo PDF válido' }
      }));
      return;
    }
    
    if (fileType === 'excel' && !file.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)' }
      }));
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: 'El archivo no puede ser mayor a 10MB' }
      }));
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    setUploadStatus(prev => ({
      ...prev,
      [fileType]: { status: 'selected', message: `${file.name} seleccionado` }
    }));

    setChangesMade(true);
  };

  const handleUploadFile = async (fileType) => {
    const file = selectedFiles[fileType];
    if (!file) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: 'No hay archivo seleccionado' }
      }));
      return;
    }

    if (mode === 'create') {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { 
          status: 'error', 
          message: 'Guarda el proyecto primero para subir archivos. El proyecto necesita un ID.' 
        }
      }));
      return;
    }

    if (!project?.id) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: 'Error: El proyecto no tiene ID válido' }
      }));
      return;
    }

    setUploading(true);
    setUploadStatus(prev => ({
      ...prev,
      [fileType]: { status: 'uploading', message: 'Subiendo archivo...' }
    }));

    try {
      console.log(`🟡 [ProjectModal] Subiendo archivo ${fileType} para proyecto ${project.id}`);
      const uploadedFile = await projectService.uploadFile(project.id, file);
      console.log(`🟢 [ProjectModal] Archivo ${fileType} subido:`, uploadedFile);
      
      // Recargar la lista de archivos después de subir
      const files = await projectService.getProjectFiles(project.id);
      setProjectFiles(files);
      
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { 
          status: 'success', 
          message: `✅ ${file.name} subido correctamente` 
        }
      }));

      // Limpiar después de éxito
      setTimeout(() => {
        setSelectedFiles(prev => ({ ...prev, [fileType]: null }));
        setUploadStatus(prev => ({
          ...prev,
          [fileType]: { status: 'idle', message: '' }
        }));
        if (fileInputRef.current[fileType]) {
          fileInputRef.current[fileType].value = '';
        }
      }, 3000);

    } catch (error) {
      console.error(`❌ [ProjectModal] Error subiendo archivo ${fileType}:`, error);
      
      let userMessage = 'Error al subir el archivo';
      if (error.message.includes('HTTP 413')) {
        userMessage = 'El archivo es demasiado grande (máximo 10MB)';
      } else if (error.message.includes('HTTP 415')) {
        userMessage = 'Tipo de archivo no soportado';
      } else if (error.message.includes('HTTP 404')) {
        userMessage = 'Proyecto no encontrado';
      } else if (error.message.includes('HTTP 500')) {
        userMessage = 'Error del servidor al procesar el archivo';
      } else {
        userMessage = error.message || 'Error de conexión';
      }
      
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', message: userMessage }
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (archivoId) => {
    setConfirmState({
      open: true,
      type: 'warning',
      title: 'Eliminar archivo',
      message: '¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          console.log('🟡 [ProjectModal] Eliminando archivo:', archivoId);
          await projectService.deleteFile(archivoId);
          console.log('🟢 [ProjectModal] Archivo eliminado');
          
          // Recargar la lista de archivos
          if (project?.id) {
            const files = await projectService.getProjectFiles(project.id);
            setProjectFiles(files);
          }
        } catch (error) {
          console.error('❌ [ProjectModal] Error eliminando archivo:', error);
          alert('Error al eliminar el archivo: ' + (error.message || 'Error desconocido'));
        } finally {
          setConfirmState(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleDownloadFile = async (archivo) => {
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
      console.error('❌ [ProjectModal] Error descargando archivo:', error);
      
      if (archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
      } else {
        alert('Error al descargar el archivo: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const handleOpenFile = async (archivo) => {
    try {
      if (archivo.urlArchivo) {
        window.open(archivo.urlArchivo, '_blank', 'noopener,noreferrer');
      } else {
        await handleDownloadFile(archivo);
      }
    } catch (error) {
      console.error('❌ [ProjectModal] Error abriendo archivo:', error);
      await handleDownloadFile(archivo);
    }
  };

  const getFileIcon = (archivo) => {
    const ext = archivo.nombreArchivo?.split('.').pop()?.toLowerCase();
    const mime = archivo.tipoMime?.toLowerCase();
    const fileType = archivo.tipo?.toLowerCase();
    
    if (fileType?.includes('pdf') || ext === 'pdf' || mime?.includes('pdf')) {
      return <FaFilePdf className="file-icon-pdf" />;
    }
    if (fileType?.includes('excel') || ext === 'xls' || ext === 'xlsx' || mime?.includes('spreadsheet') || mime?.includes('excel')) {
      return <FaFileExcel className="file-icon-excel" />;
    }
    return <FaFileAlt className="file-icon-default" />;
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.titulo?.trim()) {
      errors.titulo = 'El título es obligatorio';
    }
    
    if (!formData.resumen?.trim()) {
      errors.resumen = 'El resumen es obligatorio';
    } else if (formData.resumen.length < 50) {
      errors.resumen = 'El resumen debe tener al menos 50 caracteres';
    }
    
    if (!formData.objetivoGeneral?.trim()) {
      errors.objetivoGeneral = 'El objetivo general es obligatorio';
    }

    if (!formData.nivelEstudios) {
      errors.nivelEstudios = 'El nivel de estudios es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
  if (!validateForm()) {
    return;
  }

  if (onSave) {
    // Asegurar que nivelEstudios sea enviado como string (el backend lo convertirá a número)
    const nivelEstudiosValue = formData.nivelEstudios;
    
    // Asegurar que lineasInvestigacionIds sea un array de números
    const lineasInvestigacionIdsValue = Array.isArray(selectedLineIds) 
      ? selectedLineIds.map(id => Number(id)).filter(id => !isNaN(id))
      : [];

    const payload = {
      titulo: formData.titulo,
      resumen: formData.resumen,
      palabrasClave: formData.palabrasClave,
      objetivoGeneral: formData.objetivoGeneral,
      objetivoEspecifico: formData.objetivosEspecificos,
      justificacion: formData.justificacion,
      nivelEstudios: nivelEstudiosValue, // Enviar como string (ej: "PREGRADO")
      lineasInvestigacionIds: lineasInvestigacionIdsValue // Enviar como array de números
    };

    console.log('🟡 [ProjectModal] Enviando payload al backend:', payload);
    onSave(payload, mode === 'create' ? 'create' : 'edit');
  }
};

  const handleDelete = () => {
    setConfirmState({
      open: true,
      type: 'warning',
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        if (onDelete) onDelete(project.id);
      }
    });
  };

  const handleDownload = () => {
    const headers = ['Título', 'Resumen', 'Palabras Clave', 'Objetivo General', 'Objetivos Específicos', 'Justificación', 'Nivel de Estudios', 'Investigador Principal'];
    const values = [
      formData.titulo || '',
      formData.resumen || '',
      formData.palabrasClave || '',
      formData.objetivoGeneral || '',
      (formData.objetivosEspecificos || '').replace(/\r?\n/g, ' | '),
      formData.justificacion || '',
      formData.nivelEstudios || '',
      formData.investigadorPrincipal || ''
    ];
    
    const csv = `${headers.join(',')}\n${values.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(formData.titulo || 'proyecto')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    if (changesMade) {
      setConfirmState({
        open: true,
        type: 'warning',
        title: 'Cambios sin guardar',
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas cancelar?',
        confirmText: 'Sí, cancelar',
        cancelText: 'Seguir editando',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, open: false }));
          onClose();
        }
      });
      return;
    }
    onClose();
  };

  const handleToggleEdit = () => {
    if (isEditing && changesMade) {
      setConfirmState({
        open: true,
        type: 'warning',
        title: 'Cambios sin guardar',
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir del modo edición?',
        confirmText: 'Salir',
        cancelText: 'Seguir editando',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, open: false }));
          setIsEditing(false);
          setChangesMade(false);
          if (project) {
            // Reconstruir los IDs de líneas de investigación
            let lineasIds = [];
            if (project.lineasInvestigacionIds && project.lineasInvestigacionIds.length > 0) {
              lineasIds = project.lineasInvestigacionIds.map(id => Number(id));
            } else if (project.lineasInvestigacion && project.lineasInvestigacion.length > 0) {
              lineasIds = project.lineasInvestigacion
                .map(li => li.id || li.lineaInvestigacionId)
                .filter(id => id != null)
                .map(id => Number(id));
            }

            setFormData({
              titulo: project.titulo || '',
              resumen: project.resumen || '',
              palabrasClave: project.palabrasClave || '',
              objetivoGeneral: project.objetivoGeneral || '',
              objetivosEspecificos: project.objetivoEspecifico || project.objetivosEspecificos || '',
              justificacion: project.justificacion || '',
              nivelEstudios: project.nivelEstudios || '',
              investigadorPrincipal: project.investigadorPrincipal || '',
              lineasInvestigacionIds: lineasIds
            });
            setSelectedLineIds(lineasIds);
          }
        }
      });
      return;
    }
    setIsEditing(!isEditing);
    setChangesMade(false);
  };

  const getUploadStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="status-success" />;
      case 'error':
        return <FaExclamationTriangle className="status-error" />;
      case 'uploading':
        return <FaSync className="status-uploading spinning" />;
      case 'selected':
        return <FaCheckCircle className="status-selected" />;
      default:
        return null;
    }
  };

  if (!project && mode !== 'create') return null;

  return (
    <div className="project-modal-overlay" onClick={handleCancel}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <div className="project-modal-title-section">
            <FaFileAlt className="project-modal-title-icon" />
            <div>
              <h3>
                {mode === 'create' ? 'Nuevo Proyecto' : formData.titulo}
              </h3>
              {!isEditing && project && (
                <div className="project-modal-subtitle">
                  <span className="project-modal-investigator">
                    <FaUser className="inline-icon" />
                    Investigador: {formData.investigadorPrincipal || '—'}
                  </span>
                  <span className="project-id">ID: {project.id}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="project-modal-header-actions">
            {mode !== 'create' && (
              <>
                <button 
                  className={`project-modal-btn-icon ${isEditing ? 'btn-cancel' : 'btn-edit'}`}
                  onClick={handleToggleEdit}
                  disabled={isSubmitting || uploading}
                >
                  <FaEdit />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
                
                {!isEditing && onDelete && (
                  <button 
                    className="project-modal-btn-icon btn-delete"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    <FaTrash />
                    Eliminar
                  </button>
                )}
              </>
            )}
            
            <button 
              className="project-modal-close" 
              onClick={handleCancel}
              disabled={isSubmitting || uploading}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="project-modal-body">
          <form className="project-modal-form">
            {/* Sección de Información Básica */}
            <div className="project-modal-section">
              <div className="project-modal-section-header">
                <FaInfoCircle className="project-modal-section-icon" />
                <h3>Información Básica</h3>
              </div>
              
              <div className="project-modal-section-content">
                <div className="project-modal-form-row">
                  <div className="project-modal-form-group">
                    <label className="project-modal-form-label project-modal-form-label-required">
                      Título del Proyecto
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          className={`project-modal-form-input ${formErrors.titulo ? 'project-modal-input-error' : ''}`}
                          value={formData.titulo}
                          onChange={(e) => handleInputChange('titulo', e.target.value)}
                          placeholder="Ingrese el título del proyecto..."
                          rows="2"
                          disabled={isSubmitting || uploading}
                        />
                        {formErrors.titulo && (
                          <span className="project-modal-error-text">{formErrors.titulo}</span>
                        )}
                      </>
                    ) : (
                      <p className="project-modal-readonly-text">{formData.titulo}</p>
                    )}
                  </div>
                </div>

                <div className="project-modal-form-row">
                  <div className="project-modal-form-group">
                    <label className="project-modal-form-label project-modal-form-label-required">
                      Nivel de Estudios
                    </label>
                    {isEditing ? (
                      <>
                        <div className="project-modal-input-wrapper">
                          <MdSchool className="project-modal-input-icon" />
                          <select
                            className={`project-modal-form-input with-icon ${formErrors.nivelEstudios ? 'project-modal-input-error' : ''}`}
                            value={formData.nivelEstudios}
                            onChange={(e) => handleInputChange('nivelEstudios', e.target.value)}
                            disabled={isSubmitting || uploading}
                          >
                            <option value="">Seleccionar nivel</option>
                            {nivelEstudiosOptions.map(nivel => (
                              <option key={nivel} value={nivel}>{nivel}</option>
                            ))}
                          </select>
                        </div>
                        {formErrors.nivelEstudios && (
                          <span className="project-modal-error-text">{formErrors.nivelEstudios}</span>
                        )}
                      </>
                    ) : (
                      <p className="project-modal-readonly-text">{formData.nivelEstudios || '—'}</p>
                    )}
                  </div>

                  <div className="project-modal-form-group">
                    <label className="project-modal-form-label">
                      Líneas de Investigación
                    </label>
                    {isEditing ? (
                      <div ref={linesRef} className="multi-select" aria-expanded={showLinesDropdown}>
                        <button
                          type="button"
                          className={`project-modal-form-input multi-select__control ${selectedLineNames.length === 0 ? 'placeholder' : ''}`}
                          onClick={() => setShowLinesDropdown(s => !s)}
                          disabled={isSubmitting || uploading}
                          aria-haspopup="listbox"
                        >
                          {selectedLineNames.length === 0 ? (
                            <span className="multi-select__placeholder">Seleccionar líneas</span>
                          ) : (
                            <div className="multi-select__chips">
                              {selectedLineNames.map((n) => (
                                <span key={n} className="multi-select__chip">{n}</span>
                              ))}
                            </div>
                          )}
                        </button>

                        {showLinesDropdown && (
                          <div className="multi-select__dropdown" role="listbox">
                            {researchOptions.length > 0 ? (
                              researchOptions.map((opt) => (
                                <label key={opt.id} className="multi-select__option">
                                  <input
                                    type="checkbox"
                                    checked={selectedLineIds.includes(opt.id)}
                                    onChange={() => handleLineaInvestigacionToggle(opt.id)}
                                    disabled={isSubmitting || uploading}
                                  />
                                  <span className="multi-select__option-label">{opt.nombre}</span>
                                </label>
                              ))
                            ) : (
                              <div className="multi-select__no-options">
                                No hay líneas de investigación disponibles
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="project-modal-keywords">
                        {selectedLineNames.length > 0 ? (
                          selectedLineNames.map((nombre, index) => (
                            <span key={index} className="project-modal-keyword-badge">{nombre}</span>
                          ))
                        ) : (
                          <p className="project-modal-readonly-text">No hay líneas seleccionadas</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Resumen */}
            <div className="project-modal-section">
              <div className="project-modal-section-header">
                <FaInfoCircle className="project-modal-section-icon" />
                <h3>Resumen del Proyecto</h3>
              </div>
              <div className="project-modal-section-content">
                {isEditing ? (
                  <>
                    <textarea
                      className={`project-modal-form-textarea ${formErrors.resumen ? 'project-modal-input-error' : ''}`}
                      value={formData.resumen}
                      onChange={(e) => handleInputChange('resumen', e.target.value)}
                      placeholder="Describa brevemente el proyecto, su contexto y propósito..."
                      rows="4"
                      disabled={isSubmitting || uploading}
                    />
                    <div className="project-modal-char-count">
                      {formData.resumen?.length || 0} caracteres
                      {formData.resumen?.length < 50 && (
                        <span className="project-modal-char-count--warning"> (mínimo 50 caracteres)</span>
                      )}
                    </div>
                    {formErrors.resumen && (
                      <span className="project-modal-error-text">{formErrors.resumen}</span>
                    )}
                  </>
                ) : (
                  <p className="project-modal-readonly-text">{formData.resumen}</p>
                )}
              </div>
            </div>

            {/* Sección de Palabras Clave */}
            <div className="project-modal-section">
              <div className="project-modal-section-header">
                <FaTag className="project-modal-section-icon" />
                <h3>Palabras clave</h3>
              </div>
              <div className="project-modal-section-content">
                {isEditing ? (
                  <input
                    type="text"
                    className="project-modal-form-input"
                    value={formData.palabrasClave}
                    onChange={(e) => handleInputChange('palabrasClave', e.target.value)}
                    placeholder="Ingrese palabras separadas por comas, p.ej. IA, salud, energía"
                    disabled={isSubmitting || uploading}
                  />
                ) : (
                  <div className="project-modal-keywords">
                    {formData.palabrasClave ? (
                      formData.palabrasClave.split(',').map((k, i) => (
                        <span key={i} className="project-modal-keyword-badge">{k.trim()}</span>
                      ))
                    ) : (
                      <p className="project-modal-readonly-text">No hay palabras clave definidas.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Objetivos */}
            <div className="project-modal-section">
              <div className="project-modal-section-header">
                <FaBullseye className="project-modal-section-icon" />
                <h3>Objetivos del Proyecto</h3>
              </div>
              <div className="project-modal-section-content">
                <div className="project-modal-objectives-row">
                  <label className="project-modal-objective-label project-modal-form-label-required">
                    Objetivo General
                  </label>
                  <div className="project-modal-objective-field">
                    {isEditing ? (
                      <>
                        <textarea
                          className={`project-modal-form-textarea ${formErrors.objetivoGeneral ? 'project-modal-input-error' : ''}`}
                          value={formData.objetivoGeneral}
                          onChange={(e) => handleInputChange('objetivoGeneral', e.target.value)}
                          placeholder="Defina el objetivo principal del proyecto..."
                          rows="3"
                          disabled={isSubmitting || uploading}
                        />
                        {formErrors.objetivoGeneral && (
                          <span className="project-modal-error-text">{formErrors.objetivoGeneral}</span>
                        )}
                      </>
                    ) : (
                      <p className="project-modal-readonly-text">{formData.objetivoGeneral || 'No especificado'}</p>
                    )}
                  </div>
                </div>

                <div className="project-modal-objectives-row">
                  <label className="project-modal-objective-label">
                    Objetivos Específicos
                  </label>
                  <div className="project-modal-objective-field">
                    {isEditing ? (
                      <textarea
                        className="project-modal-form-textarea project-modal-form-textarea--large"
                        value={formData.objetivosEspecificos}
                        onChange={(e) => handleInputChange('objetivosEspecificos', e.target.value)}
                        placeholder="Escribe cada objetivo específico en una línea separada..."
                        rows="6"
                        disabled={isSubmitting || uploading}
                      />
                    ) : (
                      <div className="project-modal-objectives-list">
                        {formData.objetivosEspecificos ? (
                          formData.objetivosEspecificos.split('\n').map((o, i) => (
                            <div key={i} className="project-modal-objective-item">• {o}</div>
                          ))
                        ) : (
                          <p className="project-modal-readonly-text">No se han definido objetivos específicos.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Justificación */}
            <div className="project-modal-section">
              <div className="project-modal-section-header">
                <FaInfoCircle className="project-modal-section-icon" />
                <h3>Justificación</h3>
              </div>
              <div className="project-modal-section-content">
                {isEditing ? (
                  <textarea
                    className="project-modal-form-textarea"
                    value={formData.justificacion}
                    onChange={(e) => handleInputChange('justificacion', e.target.value)}
                    placeholder="Explique la importancia y relevancia del proyecto..."
                    rows="3"
                    disabled={isSubmitting || uploading}
                  />
                ) : (
                  <p className="project-modal-readonly-text">{formData.justificacion || 'No se ha proporcionado una justificación.'}</p>
                )}
              </div>
            </div>

            {/* Sección de Archivos - Siempre visible en modo vista y edición */}
            {(mode === 'view' || mode === 'edit') && (
              <div className="project-modal-section">
                <div className="project-modal-section-header">
                  <FaPaperclip className="project-modal-section-icon" />
                  <h3>Archivos del Proyecto</h3>
                  {loadingFiles && (
                    <span className="project-modal-loading-files">
                      <FaSync className="spinning" /> Cargando archivos...
                    </span>
                  )}
                </div>
                <div className="project-modal-section-content">
                  {/* Archivos existentes */}
                  {projectFiles.length > 0 ? (
                    <div className="project-modal-files-list">
                      <h4>Archivos existentes ({projectFiles.length})</h4>
                      {projectFiles.map((archivo) => (
                        <div key={archivo.id} className="project-modal-file-item">
                          <div className="project-modal-file-info">
                            <span className="project-modal-file-icon">
                              {getFileIcon(archivo)}
                            </span>
                            <div className="project-modal-file-details">
                              <span className="project-modal-file-name">
                                {archivo.nombreArchivo || archivo.nombre || 'Archivo sin nombre'}
                              </span>
                              <span className="project-modal-file-type">
                                {getFileType(archivo)}
                                {archivo.tipoMime && ` • ${archivo.tipoMime}`}
                                {archivo.tipo && ` • ${archivo.tipo}`}
                              </span>
                            </div>
                          </div>
                          <div className="project-modal-file-actions">
                            <button 
                              className="project-modal-btn-icon project-modal-btn-open" 
                              onClick={() => handleOpenFile(archivo)} 
                              title="Abrir archivo"
                            >
                              <FaExternalLinkAlt />
                            </button>
                            <button 
                              className="project-modal-btn-icon project-modal-btn-download" 
                              onClick={() => handleDownloadFile(archivo)} 
                              title="Descargar archivo"
                            >
                              <FaDownload />
                            </button>
                            {isEditing && (
                              <button 
                                className="project-modal-btn-icon project-modal-btn-delete" 
                                onClick={() => handleDeleteFile(archivo.id)} 
                                title="Eliminar archivo"
                                disabled={uploading}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="project-modal-no-files">
                      <FaFileAlt className="project-modal-no-files-icon" />
                      <p>No hay archivos adjuntos a este proyecto.</p>
                    </div>
                  )}

                  {/* Subida de nuevos archivos (solo en edición) */}
                  {isEditing && (
                    <div className="project-modal-upload-section">
                      <h4>Subir nuevos archivos</h4>
                      <div className="project-modal-form-row">
                        {/* PDF Upload */}
                        <div className="project-modal-form-group">
                          <label className="project-modal-form-label">
                            <FaFilePdf className="inline-icon" />
                            Documento PDF
                          </label>
                          <div className="project-modal-file-upload">
                            <input
                              type="file"
                              ref={el => fileInputRef.current.pdf = el}
                              onChange={(e) => handleFileSelect('pdf', e)}
                              accept=".pdf"
                              className="project-modal-file-input"
                              id="pdf-upload"
                              disabled={isSubmitting || uploading}
                            />
                            <label htmlFor="pdf-upload" className="project-modal-file-label">
                              <FaUpload className="project-modal-file-icon" />
                              {selectedFiles.pdf ? selectedFiles.pdf.name : 'Seleccionar archivo PDF'}
                            </label>
                            
                            {selectedFiles.pdf && (
                              <div className="project-modal-file-actions">
                                <button
                                  type="button"
                                  className="project-modal-btn-upload"
                                  onClick={() => handleUploadFile('pdf')}
                                  disabled={uploading || isSubmitting}
                                >
                                  <FaUpload />
                                  Subir PDF
                                </button>
                              </div>
                            )}
                            
                            {uploadStatus.pdf.message && (
                              <div className={`project-modal-upload-status ${uploadStatus.pdf.status}`}>
                                {getUploadStatusIcon(uploadStatus.pdf.status)}
                                <span>{uploadStatus.pdf.message}</span>
                              </div>
                            )}
                          </div>
                          <p className="project-modal-form-hint">
                            Suba el documento principal del proyecto en formato PDF (máx. 10MB)
                          </p>
                        </div>

                        {/* Excel Upload */}
                        <div className="project-modal-form-group">
                          <label className="project-modal-form-label">
                            <FaFileExcel className="inline-icon" />
                            Excel con Investigador Principal
                          </label>
                          <div className="project-modal-file-upload">
                            <input
                              type="file"
                              ref={el => fileInputRef.current.excel = el}
                              onChange={(e) => handleFileSelect('excel', e)}
                              accept=".xlsx,.xls"
                              className="project-modal-file-input"
                              id="excel-upload"
                              disabled={isSubmitting || uploading}
                            />
                            <label htmlFor="excel-upload" className="project-modal-file-label">
                              <FaUpload className="project-modal-file-icon" />
                              {selectedFiles.excel ? selectedFiles.excel.name : 'Seleccionar archivo Excel'}
                            </label>
                            
                            {selectedFiles.excel && (
                              <div className="project-modal-file-actions">
                                <button
                                  type="button"
                                  className="project-modal-btn-upload"
                                  onClick={() => handleUploadFile('excel')}
                                  disabled={uploading || isSubmitting}
                                >
                                  <FaUpload />
                                  Subir Excel
                                </button>
                              </div>
                            )}
                            
                            {uploadStatus.excel.message && (
                              <div className={`project-modal-upload-status ${uploadStatus.excel.status}`}>
                                {getUploadStatusIcon(uploadStatus.excel.status)}
                                <span>{uploadStatus.excel.message}</span>
                              </div>
                            )}
                          </div>
                          <p className="project-modal-form-hint">
                            Suba el Excel que identifica al investigador principal (máx. 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="project-modal-footer">
          <div className="project-modal-footer-actions">
            <button 
              className="project-modal-btn-secondary" 
              onClick={handleCancel}
              disabled={isSubmitting || uploading}
            >
              {isEditing ? 'Cancelar' : 'Cerrar'}
            </button>
            
            <div className="project-modal-primary-actions">
              {mode !== 'create' && (
                <button 
                  className="project-modal-btn-download" 
                  onClick={handleDownload}
                  disabled={isSubmitting || uploading}
                >
                  <FaDownload />
                  Descargar
                </button>
              )}
              
              {isEditing && (
                <button 
                  className="project-modal-btn-primary"
                  onClick={handleSave}
                  disabled={isSubmitting || uploading || (!changesMade && mode !== 'create')}
                >
                  <FaSave />
                  {isSubmitting ? 'Guardando...' : uploading ? 'Subiendo...' : mode === 'create' ? 'Crear Proyecto' : 'Guardar Cambios'}
                </button>
              )}
            </div>
          </div>
          
          {changesMade && isEditing && (
            <div className="project-modal-unsaved-changes">
              <FaInfoCircle className="project-modal-unsaved-icon" />
              Tienes cambios sin guardar
            </div>
          )}
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

export default ProjectModal;