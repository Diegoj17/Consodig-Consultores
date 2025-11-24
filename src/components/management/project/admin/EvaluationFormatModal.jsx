import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaSave, FaFileContract, FaList, 
  FaPlus, FaTrash, FaEdit, FaInfoCircle 
} from 'react-icons/fa';
import '../../../../styles/management/project/admin/EvaluationFormatModal.css';
import Modal from '../../../common/Modal';

const EvaluationFormatModal = ({ 
  format, 
  onClose, 
  onSave, 
  onDelete,
  mode = 'view', // 'view', 'edit', 'create'
  isSubmitting = false 
}) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    areaConocimiento: '',
    institucion: '',
    estado: 'active'
  });
  const [criterios, setCriterios] = useState([]);
  const [changesMade, setChangesMade] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null
  });

  // Inicializar datos
  useEffect(() => {
    if (format) {
      setFormData({
        nombre: format.nombre || '',
        descripcion: format.descripcion || '',
        areaConocimiento: format.areaConocimiento || '',
        institucion: format.institucion || '',
        estado: format.estado || 'active'
      });
      
      // Simular criterios (en una implementación real vendrían del backend)
      if (format.criterios) {
        const simulatedCriterios = Array.from({ length: format.criterios }, (_, index) => ({
          id: index + 1,
          nombre: `Criterio ${index + 1}`,
          descripcion: `Descripción del criterio ${index + 1}`,
          peso: Math.floor(100 / format.criterios),
          tipo: 'calificacion'
        }));
        setCriterios(simulatedCriterios);
      }
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        descripcion: '',
        areaConocimiento: '',
        institucion: '',
        estado: 'active'
      });
      setCriterios([]);
    }
    
    setIsEditing(mode === 'edit' || mode === 'create');
    setChangesMade(false);
    setFormErrors({});
  }, [format, mode]);

  // Bloquear scroll del body mientras el modal esté abierto
  useEffect(() => {
    // when component mounted (modal open)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
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

  const handleCriterioChange = (index, field, value) => {
    const updatedCriterios = [...criterios];
    updatedCriterios[index] = {
      ...updatedCriterios[index],
      [field]: value
    };
    setCriterios(updatedCriterios);
    setChangesMade(true);
  };

  const addCriterio = () => {
    const newCriterio = {
      id: criterios.length + 1,
      nombre: '',
      descripcion: '',
      peso: 0,
      tipo: 'calificacion'
    };
    setCriterios([...criterios, newCriterio]);
    setChangesMade(true);
  };

  const removeCriterio = (index) => {
    const updatedCriterios = criterios.filter((_, i) => i !== index);
    setCriterios(updatedCriterios);
    setChangesMade(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre?.trim()) {
      errors.nombre = 'El nombre del formato es obligatorio';
    }
    
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 30) {
      errors.descripcion = 'La descripción debe tener al menos 30 caracteres';
    }
    
    if (!formData.areaConocimiento?.trim()) {
      errors.areaConocimiento = 'El área de conocimiento es obligatoria';
    }

    if (criterios.length === 0) {
      errors.criterios = 'Debe agregar al menos un criterio';
    }

    // Validar que la suma de valores sea 100
    const totalPeso = criterios.reduce((sum, criterio) => sum + (parseInt(criterio.peso) || 0), 0);
    if (totalPeso !== 100) {
      errors.pesoTotal = `La suma de los valores debe ser 100% (actual: ${totalPeso}%)`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
  if (!validateForm()) {
    return;
  }

  if (onSave) {
    const payload = {
      ...formData,
      items: criterios, // ← Cambia 'criterios' por 'items'
      criterios: criterios.length,
      pesoTotal: criterios.reduce((sum, criterio) => sum + (parseInt(criterio.peso) || 0), 0)
    };
    
    console.log('📤 Enviando payload:', payload);
    onSave(payload, mode === 'create' ? 'create' : 'edit');
  }
};

  const handleDelete = () => {
    setConfirmState({
      open: true,
      type: 'warning',
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este formato? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        if (onDelete) onDelete(format.id);
      }
    });
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
        }
      });
      return;
    }
    setIsEditing(!isEditing);
    setChangesMade(false);
  };

  // Mostrar inputs en modo 'view' como en 'create' (pero deshabilitados si no está en edición)
  const showFormInputs = isEditing || mode === 'view';

  if (!format && mode !== 'create') return null;

  return (
    <div className="evaluation-format-modal-overlay" onClick={handleCancel}>
      <div className="evaluation-format-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="evaluation-format-modal-header">
          <div className="evaluation-format-modal-title-section">
            <div>
              <h3>
                {mode === 'create' ? 'Nuevo Formato de Evaluación' : formData.nombre}
              </h3>
              <div className="evaluation-format-modal-subtitle">
                <span className={`evaluation-format-status evaluation-format-status--${formData.estado}`}>
                  {formData.estado === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="evaluation-format-modal-header-actions">
            {mode !== 'create' && (
              <>
                <button 
                  className={`evaluation-format-modal-btn-icon ${isEditing ? 'btn-cancel' : 'btn-edit'}`}
                  onClick={handleToggleEdit}
                  disabled={isSubmitting}
                >
                  <FaEdit />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
                
                {!isEditing && onDelete && (
                  <button 
                    className="evaluation-format-modal-btn-icon btn-delete"
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
              className="evaluation-format-modal-close" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="evaluation-format-modal-body">
          <form className="evaluation-format-modal-form">
            {/* Información Básica */}
            <div className="evaluation-format-modal-section">
              <div className="evaluation-format-modal-section-header">
                <FaInfoCircle className="evaluation-format-modal-section-icon" />
                <h3>Información Básica</h3>
              </div>
              
              <div className="evaluation-format-modal-section-content">
                <div className="evaluation-format-modal-form-row">
                  <div className="evaluation-format-modal-form-group">
                    <label className="evaluation-format-modal-form-label evaluation-format-modal-form-label-required">
                      Nombre del Formato
                    </label>
                    {showFormInputs ? (
                      <>
                        <input
                          type="text"
                          className={`evaluation-format-modal-form-input ${formErrors.nombre ? 'evaluation-format-modal-input-error' : ''}`}
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          placeholder="Ingrese el nombre del formato de evaluación..."
                          disabled={!isEditing || isSubmitting}
                        />
                        {formErrors.nombre && (
                          <span className="evaluation-format-modal-error-text">{formErrors.nombre}</span>
                        )}
                      </>
                    ) : (
                      <p className="evaluation-format-modal-readonly-text">{formData.nombre}</p>
                    )}
                  </div>

                </div>

                <div className="evaluation-format-modal-form-group">
                  <label className="evaluation-format-modal-form-label evaluation-format-modal-form-label-required">
                    Descripción
                  </label>
                  {showFormInputs ? (
                    <>
                      <textarea
                        className={`evaluation-format-modal-form-textarea ${formErrors.descripcion ? 'evaluation-format-modal-input-error' : ''}`}
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Describa el propósito y alcance de este formato de evaluación..."
                        rows="3"
                        disabled={!isEditing || isSubmitting}
                      />
                      <div className="evaluation-format-modal-char-count">
                        {formData.descripcion?.length || 0} caracteres
                        {formData.descripcion?.length < 30 && (
                          <span className="evaluation-format-modal-char-count--warning"> (mínimo 30 caracteres)</span>
                        )}
                      </div>
                      {formErrors.descripcion && (
                        <span className="evaluation-format-modal-error-text">{formErrors.descripcion}</span>
                      )}
                    </>
                  ) : (
                    <p className="evaluation-format-modal-readonly-text">{formData.descripcion}</p>
                  )}
                </div>

                <div className="evaluation-format-modal-form-row">
                  <div className="evaluation-format-modal-form-group">
                    <label className="evaluation-format-modal-form-label evaluation-format-modal-form-label-required">
                      Área de Conocimiento
                    </label>
                    {showFormInputs ? (
                      <>
                        <input
                          type="text"
                          className={`evaluation-format-modal-form-input ${formErrors.areaConocimiento ? 'evaluation-format-modal-input-error' : ''}`}
                          value={formData.areaConocimiento}
                          onChange={(e) => handleInputChange('areaConocimiento', e.target.value)}
                          placeholder="Área de conocimiento (ej: Ciencias Sociales, Ingeniería...)"
                          disabled={!isEditing || isSubmitting}
                        />
                        {formErrors.areaConocimiento && (
                          <span className="evaluation-format-modal-error-text">{formErrors.areaConocimiento}</span>
                        )}
                      </>
                    ) : (
                      <p className="evaluation-format-modal-readonly-text">{formData.areaConocimiento || 'No especificado'}</p>
                    )}
                  </div>

                  <div className="evaluation-format-modal-form-group">
                    <label className="evaluation-format-modal-form-label">
                      Institución
                    </label>
                    {showFormInputs ? (
                      <input
                        type="text"
                        className="evaluation-format-modal-form-input"
                        value={formData.institucion}
                        onChange={(e) => handleInputChange('institucion', e.target.value)}
                        placeholder="Institución asociada al formato..."
                        disabled={!isEditing || isSubmitting}
                      />
                    ) : (
                      <p className="evaluation-format-modal-readonly-text">{formData.institucion || 'No especificado'}</p>
                    )}
                  </div>

                  <div className="evaluation-format-modal-form-group">
                    <label className="evaluation-format-modal-form-label">
                      Estado
                    </label>
                    {showFormInputs ? (
                      <select
                        className="evaluation-format-modal-form-input"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                        disabled={!isEditing || isSubmitting}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    ) : (
                      <p className="evaluation-format-modal-readonly-text">
                        <span className={`evaluation-format-status-badge evaluation-format-status-badge--${formData.estado}`}>
                          {formData.estado === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Criterios de Evaluación */}
            <div className="evaluation-format-modal-section">
              <div className="evaluation-format-modal-section-header">
                <FaList className="evaluation-format-modal-section-icon" />
                <h3>Criterios de Evaluación</h3>
                {isEditing && (
                  <button 
                    type="button"
                    className="evaluation-format-modal-btn-add"
                    onClick={addCriterio}
                    disabled={isSubmitting}
                  >
                    <FaPlus />
                    Agregar Criterio
                  </button>
                )}
              </div>
              
              <div className="evaluation-format-modal-section-content">
                {formErrors.criterios && (
                  <div className="evaluation-format-modal-error-banner">
                    {formErrors.criterios}
                  </div>
                )}

                {formErrors.pesoTotal && (
                  <div className="evaluation-format-modal-error-banner">
                    {formErrors.pesoTotal}
                  </div>
                )}

                {criterios.length === 0 ? (
                  <div className="evaluation-format-modal-empty-criterios">
                    <FaList className="evaluation-format-modal-empty-icon" />
                    <p>No hay criterios definidos</p>
                    {isEditing && (
                      <p>Haz clic en "Agregar Criterio" para comenzar</p>
                    )}
                  </div>
                ) : (
                  <div className="evaluation-format-modal-criterios-list">
                    {criterios.map((criterio, index) => (
                      <div key={index} className="evaluation-format-modal-criterio-item">
                        <div className="evaluation-format-modal-criterio-header">
                          <span className="evaluation-format-modal-criterio-number">
                            Criterio {index + 1}
                          </span>
                          {isEditing && (
                            <button
                              type="button"
                              className="evaluation-format-modal-btn-remove"
                              onClick={() => removeCriterio(index)}
                              disabled={isSubmitting}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        
                        <div className="evaluation-format-modal-form-row">
                          <div className="evaluation-format-modal-form-group">
                            <label className="evaluation-format-modal-form-label">
                              Nombre del Criterio
                            </label>
                            {showFormInputs ? (
                              <input
                                type="text"
                                className="evaluation-format-modal-form-input"
                                value={criterio.nombre}
                                onChange={(e) => handleCriterioChange(index, 'nombre', e.target.value)}
                                placeholder="Ej: Calidad Metodológica, Originalidad..."
                                disabled={!isEditing || isSubmitting}
                              />
                            ) : (
                              <p className="evaluation-format-modal-readonly-text">{criterio.nombre}</p>
                            )}
                          </div>

                          <div className="evaluation-format-modal-form-group">
                            <label className="evaluation-format-modal-form-label">
                              Valor (%)
                            </label>
                            {showFormInputs ? (
                              <input
                                type="number"
                                className="evaluation-format-modal-form-input"
                                value={criterio.peso}
                                onChange={(e) => handleCriterioChange(index, 'peso', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                disabled={!isEditing || isSubmitting}
                              />
                            ) : (
                              <p className="evaluation-format-modal-readonly-text">{criterio.peso}%</p>
                            )}
                          </div>
                        </div>

                        <div className="evaluation-format-modal-form-group">
                          <label className="evaluation-format-modal-form-label">
                            Descripción
                          </label>
                          {showFormInputs ? (
                            <textarea
                              className="evaluation-format-modal-form-textarea"
                              value={criterio.descripcion}
                              onChange={(e) => handleCriterioChange(index, 'descripcion', e.target.value)}
                              placeholder="Describa en qué consiste este criterio de evaluación..."
                              rows="2"
                              disabled={!isEditing || isSubmitting}
                            />
                          ) : (
                            <p className="evaluation-format-modal-readonly-text">{criterio.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen de Valores */}
                {criterios.length > 0 && (
                  <div className="evaluation-format-modal-peso-summary">
                    <div className="evaluation-format-modal-peso-total">
                      <strong>Total de criterios: {criterios.length}</strong>
                    </div>
                    <div className="evaluation-format-modal-peso-total">
                      <strong>
                        Suma de valores: {criterios.reduce((sum, criterio) => sum + (parseInt(criterio.peso) || 0), 0)}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="evaluation-format-modal-footer">
          <div className="evaluation-format-modal-footer-actions">
            <button 
              className="evaluation-format-modal-btn-secondary" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isEditing ? 'Cancelar' : 'Cerrar'}
            </button>
            
            <div className="evaluation-format-modal-primary-actions">
              {isEditing && (
                <button 
                  className="evaluation-format-modal-btn-primary"
                  onClick={handleSave}
                  disabled={isSubmitting || (!changesMade && mode !== 'create')}
                >
                  <FaSave />
                  {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Formato' : 'Guardar Cambios'}
                </button>
              )}
            </div>
          </div>
          
          {changesMade && isEditing && (
            <div className="evaluation-format-modal-unsaved-changes">
              <FaInfoCircle className="evaluation-format-modal-unsaved-icon" />
              Tienes cambios sin guardar
            </div>
          )}
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
  );
};

export default EvaluationFormatModal;