import React, { useState } from 'react'
import { FaUpload, FaFilePdf, FaCheckCircle, FaTimes, FaIdCard, FaGraduationCap, FaUniversity, FaEye, FaTrash } from 'react-icons/fa'
import '../../../styles/documents/evaluador/EvaluatorDocumentsUpload.css'
import userService from '../../../services/userService'
import { useAuth } from '../../../contexts/AuthContext'

const EvaluatorDocumentsUpload = () => {
  const [documents, setDocuments] = useState({
    cedula: null,
    titulos: null,
    cuentaBancaria: null
  })

  const [uploadStatus, setUploadStatus] = useState({
    cedula: 'pending',
    titulos: 'pending',
    cuentaBancaria: 'pending'
  })

  const [previewFile, setPreviewFile] = useState(null)
  const { user } = useAuth() || {}

  // Cargar archivos ya subidos por el evaluador al montar
  React.useEffect(() => {
    const evaluatorId = user?.id || user?.userId || user?._id || null;
    if (!evaluatorId) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await userService.getEvaluadorArchivos(evaluatorId);
        if (!mounted || !resp) return;

        const newDocs = {};
        const newStatus = {};

        if (resp.fotocopiaUrl) {
          newDocs.cedula = { remoteUrl: resp.fotocopiaUrl, name: resp.fotocopiaUrl.split('/').pop(), remote: resp };
          newStatus.cedula = 'completed';
        }
        if (resp.certificadosUrl) {
          newDocs.titulos = { remoteUrl: resp.certificadosUrl, name: resp.certificadosUrl.split('/').pop(), remote: resp };
          newStatus.titulos = 'completed';
        }
        if (resp.cuentaBancariaUrl) {
          newDocs.cuentaBancaria = { remoteUrl: resp.cuentaBancariaUrl, name: resp.cuentaBancariaUrl.split('/').pop(), remote: resp };
          newStatus.cuentaBancaria = 'completed';
        }

        setDocuments(prev => ({ ...prev, ...newDocs }));
        setUploadStatus(prev => ({ ...prev, ...newStatus }));
      } catch (err) {
        console.debug('No se pudieron cargar archivos existentes del evaluador:', err?.message || err);
      }
    })();
    return () => { mounted = false };
  }, [user]);

  const documentTypes = {
    cedula: {
      label: 'Fotocopia de Cédula',
      description: 'Documento de identificación oficial vigente',
      icon: FaIdCard,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    titulos: {
      label: 'Certificado de Estudios',
      description: 'Fotocopia de títulos académicos y certificados',
      icon: FaGraduationCap,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    cuentaBancaria: {
      label: 'Certificado de Cuenta Bancaria',
      description: 'Documento bancario con datos de cuenta corriente',
      icon: FaUniversity,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  }

  const handleFileUpload = (documentType, file) => {
    if (!file) return

    const typeConfig = documentTypes[documentType]
    
    // Validar tamaño
    if (file.size > typeConfig.maxSize) {
      alert(`El archivo es demasiado grande. Tamaño máximo: ${typeConfig.maxSize / (1024 * 1024)}MB`)
      return
    }

    // Validar tipo
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!typeConfig.accept.includes(fileExtension) && !typeConfig.accept.includes(file.type)) {
      alert('Tipo de archivo no válido. Formatos aceptados: ' + typeConfig.accept)
      return
    }

    // Real upload via API
    setUploadStatus(prev => ({ ...prev, [documentType]: 'uploading' }))
    const payload = {
      fotocopiaDocumento: null,
      certificadosEstudios: null,
      certificadoCuentaBancaria: null
    }
    if (documentType === 'cedula') payload.fotocopiaDocumento = file
    if (documentType === 'titulos') payload.certificadosEstudios = file
    if (documentType === 'cuentaBancaria') payload.certificadoCuentaBancaria = file

    const evaluatorId = user?.id || user?.userId || user?._id || null

    if (!evaluatorId) {
      alert('No se pudo determinar el evaluador. Por favor inicie sesión.');
      setUploadStatus(prev => ({ ...prev, [documentType]: 'pending' }))
      return
    }

    userService.uploadEvaluadorArchivos(evaluatorId, payload)
      .then((resp) => {
        // actualizar estado con lo que devuelva el backend
        const now = new Date().toISOString()
        // extraer URL remota si el backend la devuelve
        const remoteUrl = resp?.fotocopiaUrl || resp?.certificadosUrl || resp?.cuentaBancariaUrl || resp?.fotocopia_url || resp?.certificados_url || resp?.cuenta_bancaria_url || null
        setDocuments(prev => ({
          ...prev,
          [documentType]: {
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: now,
            remote: resp,
            remoteUrl
          }
        }))
        setUploadStatus(prev => ({ ...prev, [documentType]: 'completed' }))
      })
      .catch((err) => {
        console.error('Error subiendo archivo:', err)
        alert('Error subiendo archivo: ' + (err?.message || err))
        setUploadStatus(prev => ({ ...prev, [documentType]: 'pending' }))
      })
  }

  const handleFileRemove = (documentType) => {
    setDocuments(prev => ({ ...prev, [documentType]: null }))
    setUploadStatus(prev => ({ ...prev, [documentType]: 'pending' }))
    setPreviewFile(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (documentType, e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFileUpload(documentType, file)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    if (bytes == null) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="evaluator-documents-status-icon evaluator-documents-completed" />
      case 'uploading':
        return <div className="evaluator-documents-status-loading" />
      case 'pending':
        return <FaUpload className="evaluator-documents-status-icon evaluator-documents-pending" />
      default:
        return <FaUpload className="evaluator-documents-status-icon evaluator-documents-pending" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'uploading':
        return 'Subiendo...'
      case 'pending':
        return 'Pendiente'
      default:
        return 'Pendiente'
    }
  }

  const handlePreview = (documentType) => {
    const doc = documents[documentType]
    if (!doc) return
    // Abrir URL remota si existe
    const remote = doc.remoteUrl || doc.remote?.fotocopiaUrl || doc.remote?.certificadosUrl || doc.remote?.cuentaBancariaUrl
    if (remote) {
      window.open(remote, '_blank')
      return
    }
    // Si hay archivo local, mostrar preview
    const file = doc.file
    if (file && file instanceof File) {
      setPreviewFile({ type: documentType, data: file, url: URL.createObjectURL(file) })
    }
  }

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url)
    }
    setPreviewFile(null)
  }

  return (
    <div className="evaluator-documents-upload">
      <div className="evaluator-documents-header">
        <p className="evaluator-documents-subtitle">
          Sube los documentos requeridos para poder realizar la evaluación aceptada
        </p>
      </div>

      <div className="evaluator-documents-grid">
        {Object.entries(documentTypes).map(([key, config]) => {
          const IconComponent = config.icon
          const document = documents[key]
          const status = uploadStatus[key]

          return (
            <div key={key} className="evaluator-documents-card">
              <div className="evaluator-documents-card-header">
                <div className="evaluator-documents-icon">
                  <IconComponent />
                </div>
                <div className="evaluator-documents-info">
                  <h3 className="evaluator-documents-card-title">{config.label}</h3>
                  <p className="evaluator-documents-card-description">{config.description}</p>
                </div>
                <div className="evaluator-documents-status">
                  {getStatusIcon(status)}
                  <span className={`evaluator-documents-status-text evaluator-documents-${status}`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>

              <div className="evaluator-documents-card-content">
                {document ? (
                  <div className="evaluator-documents-preview">
                    <div className="evaluator-documents-preview-info">
                      <FaFilePdf className="evaluator-documents-file-icon" />
                      <div className="evaluator-documents-file-details">
                        <span className="evaluator-documents-file-name">{document.name || document.remoteUrl?.split('/').pop() || ''}</span>
                        {document.size ? (
                          <span className="evaluator-documents-file-size">{formatFileSize(document.size)}</span>
                        ) : null}
                        <span className="evaluator-documents-file-date">
                          {(() => {
                            const raw = document.uploadDate || document.remote?.created_at || document.remote?.createdAt || document.remote?.createdAt;
                            if (!raw) return '';
                            // Normalizar formato 'YYYY-MM-DD HH:mm:ss' -> 'YYYY-MM-DDTHH:mm:ss' para Date
                            let s = String(raw);
                            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
                              s = s.replace(' ', 'T');
                            }
                            const d = new Date(s);
                            if (isNaN(d.getTime())) return '';
                            return 'Subido: ' + d.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="evaluator-documents-actions">
                        <button
                          className="evaluator-documents-btn-preview"
                          onClick={() => handlePreview(key)}
                          title="Vista previa"
                        >
                          <FaEye />
                        </button>
                      <button
                        className="evaluator-documents-btn-remove"
                        onClick={() => handleFileRemove(key)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="evaluator-documents-upload-area"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(key, e)}
                  >
                    <input
                      type="file"
                      id={`evaluator-documents-file-upload-${key}`}
                      accept={config.accept}
                      onChange={(e) => handleFileUpload(key, e.target.files[0])}
                      className="evaluator-documents-file-input"
                    />
                    <label htmlFor={`evaluator-documents-file-upload-${key}`} className="evaluator-documents-upload-label">
                      <FaUpload className="evaluator-documents-upload-icon" />
                      <span className="evaluator-documents-upload-text">
                        Arrastra un archivo o haz clic para seleccionar
                      </span>
                      <span className="evaluator-documents-upload-hint">
                        Formatos: {config.accept.replace(/\./g, ' ').toUpperCase()} 
                        • Máx: {config.maxSize / (1024 * 1024)}MB
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="evaluator-documents-preview-modal-overlay" onClick={closePreview}>
          <div className="evaluator-documents-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="evaluator-documents-preview-header">
              <h3 className="evaluator-documents-preview-title">
                Vista previa: {documentTypes[previewFile.type]?.label}
              </h3>
              <button className="evaluator-documents-preview-close" onClick={closePreview}>
                <FaTimes />
              </button>
            </div>
            <div className="evaluator-documents-preview-content">
              {previewFile.data.type.includes('image') ? (
                <img 
                  src={previewFile.url} 
                  alt="Preview" 
                  className="evaluator-documents-preview-image"
                />
              ) : (
                <div className="evaluator-documents-pdf-preview">
                  <FaFilePdf className="evaluator-documents-pdf-icon" />
                  <p>Vista previa no disponible para PDF</p>
                  <a 
                    href={previewFile.url} 
                    download={previewFile.data.name}
                    className="evaluator-documents-download-link"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default EvaluatorDocumentsUpload