import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaSave, FaFileContract, FaList, 
  FaPlus, FaTrash, FaEdit, FaInfoCircle 
} from 'react-icons/fa';
import '../../../../styles/management/project/admin/EvaluationFormatModal.css';
import Modal from '../../../common/Modal';
import criterioService from '../../../../services/criterioService';

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
    institucion: '',
    estado: 'active'
  });
  const [criterios, setCriterios] = useState([]);
  const [criteriosCatalog, setCriteriosCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
        institucion: format.institucion || '',
        estado: format.estado || 'active'
      });
      
      // Simular criterios (en una implementación real vendrían del backend)
      // Si vienen items agrupamos por criterio para mostrar criterios con sus items
      if (format.items && Array.isArray(format.items)) {
        const grouped = {};
        format.items.forEach((item, idx) => {
          const key = item.criterioId || item.criterioNombre || item.criterio?.id || item.criterio?.nombre || `tmp-${idx}`;
          if (!grouped[key]) {
            grouped[key] = {
              id: item.criterio?.id || item.criterioId || null,
              nombre: item.criterioNombre || (item.criterio && item.criterio.nombre) || `Criterio ${Object.keys(grouped).length + 1}`,
              items: []
            };
          }
          grouped[key].items.push({
            id: item.id || `tmp-item-${idx}`,
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            peso: item.peso || 0,
            criterioId: item.criterio?.id || item.criterioId || null,
            criterioNombre: item.criterioNombre || (item.criterio && item.criterio.nombre) || null
          });
        });
        setCriterios(Object.values(grouped));
      }
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        descripcion: '',
        institucion: '',
        estado: 'active'
      });
      setCriterios([]);
    }
    
    setIsEditing(mode === 'edit' || mode === 'create');
    setChangesMade(false);
    setFormErrors({});
  }, [format, mode]);

  // Cargar catálogo de criterios para búsqueda
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await criterioService.getAll();
        if (!mounted) return;
        setCriteriosCatalog(all || []);
      } catch (e) {
        console.error('No se pudieron obtener criterios para búsqueda', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const results = criteriosCatalog.filter(c => (c.nombre || '').toLowerCase().includes(q));
    setSearchResults(results);
  }, [searchQuery, criteriosCatalog]);

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
    const updated = [...criterios];
    updated[index] = { ...updated[index], [field]: value };
    setCriterios(updated);
    setChangesMade(true);
  };

  const addCriterio = () => {
    const newCriterio = {
      id: `tmp-${Date.now()}`,
      nombre: '',
      items: []
    };
    setCriterios(prev => [...prev, newCriterio]);
    setChangesMade(true);
  };

  const addItemToCriterio = (criterioIndex) => {
    const newItem = {
      id: `tmp-item-${Date.now()}`,
      nombre: '',
      descripcion: '',
      peso: ''
    };
    const updated = [...criterios];
    updated[criterioIndex].items = [...(updated[criterioIndex].items || []), newItem];
    setCriterios(updated);
    setChangesMade(true);
  };

  const handleItemChange = (criterioIndex, itemIndex, field, value) => {
    const updated = [...criterios];
    const current = updated[criterioIndex].items[itemIndex] || {};
    let newVal = value;
    if (field === 'peso') {
      // Allow empty string while typing, otherwise normalize to integer between 0-100
      if (value === '' || value === null || typeof value === 'undefined') {
        newVal = '';
      } else {
        const parsed = parseInt(String(value).replace(/^0+(?=\d)/, ''), 10);
        if (Number.isNaN(parsed)) {
          newVal = '';
        } else {
          newVal = Math.max(0, Math.min(100, parsed));
        }
      }
    }

    const item = { ...current, [field]: newVal };
    updated[criterioIndex].items[itemIndex] = item;
    setCriterios(updated);
    setChangesMade(true);
  };

  const removeItemFromCriterio = (criterioIndex, itemIndex) => {
    const updated = [...criterios];
    updated[criterioIndex].items = updated[criterioIndex].items.filter((_, i) => i !== itemIndex);
    setCriterios(updated);
    setChangesMade(true);
  };

  const addExistingCriterio = async (criterioObj) => {
    if (!criterioObj) return;
    // Evitar agregar el mismo criterio (por id)
    const exists = criterios.some(c => c.id && criterioObj.id && c.id === criterioObj.id);
    if (exists) return;
    // Añadir sólo el criterio (id + nombre). NO traer ni adjuntar sus ítems aquí.
    const clone = {
      id: criterioObj.id,
      nombre: criterioObj.nombre || '',
      items: []
    };
    setCriterios(prev => [...prev, clone]);
    setSearchQuery('');
    setSearchResults([]);
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
    
    // ya no se requiere 'areaConocimiento' según DTO del backend

    if (criterios.length === 0) {
      errors.criterios = 'Debe agregar al menos un criterio con items';
    }

    // Validar que cada criterio tenga al menos un item
    criterios.forEach((c, idx) => {
      if (!c.items || c.items.length === 0) {
        errors[`criterio_${idx}`] = `El criterio "${c.nombre || `#${idx+1}`}" debe tener al menos un ítem`;
      }
    });

    // Validar que la suma de valores de TODOS los items sea 100
    const totalPeso = criterios.reduce((sum, criterio) => sum + (criterio.items ? criterio.items.reduce((s, it) => s + (parseInt(it.peso) || 0), 0) : 0), 0);
    if (totalPeso !== 100) {
      errors.pesoTotal = `La suma de los valores debe ser 100% (actual: ${totalPeso}%)`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Antes de crear el formato: crear en el backend los criterios nuevos (con id temporal tmp-...)
    const criteriosCopy = criterios.map(c => ({ ...c }));
    try {
      for (let i = 0; i < criteriosCopy.length; i++) {
        const c = criteriosCopy[i];
        if (!c.id || (typeof c.id === 'string' && String(c.id).startsWith('tmp-'))) {
          // Asegurar nombre por defecto
          const nombreC = (c.nombre && String(c.nombre).trim()) ? c.nombre : `Criterio ${i + 1}`;
          const created = await criterioService.create({ nombre: nombreC });
          if (created && created.id) {
            c.id = created.id;
            // actualizar items para referenciar el nuevo id
            if (c.items && c.items.length > 0) {
              c.items = c.items.map(it => ({ ...it, criterioId: created.id }));
            }
          } else {
            throw new Error('No se pudo crear el criterio en el servidor');
          }
        }
      }
    } catch (err) {
      console.error('Error creando criterios necesarios antes de guardar formato', err);
      setConfirmState({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron crear los criterios necesarios. Intente de nuevo.',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        onConfirm: () => setConfirmState(prev => ({ ...prev, open: false }))
      });
      return;
    }

    if (onSave) {
      // Aplanar items y adjuntar referencia al criterio (c.id ya estará creado o será un id numérico existente).
      let flattened = criteriosCopy.flatMap((c) => (c.items || []).map((it) => ({
        nombre: it.nombre,
        descripcion: it.descripcion,
        peso: Number.isFinite(Number(it.peso)) ? parseInt(it.peso, 10) : 0,
        criterioId: (typeof c.id === 'number') ? c.id : (c.id && String(c.id).startsWith('tmp-') ? undefined : c.id)
      })));

      // Asignar nombres por defecto si están vacíos, numerando globalmente
      flattened = flattened.map((it, idx) => ({
        ...it,
        nombre: (it.nombre && String(it.nombre).trim()) ? it.nombre : `Ítem ${idx + 1}`
      }));

      const payload = {
        id: format?.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        institucion: formData.institucion,
        estado: formData.estado,
        items: flattened
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

  const getGlobalItemIndex = (cIdx, iIdx) => {
    let count = 0;
    for (let i = 0; i < cIdx; i++) {
      count += (criterios[i].items || []).length;
    }
    return count + iIdx + 1;
  };

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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="evaluation-format-modal-search">
                      <input
                        type="text"
                        className="evaluation-format-modal-form-input"
                        placeholder="Buscar criterio existente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {searchQuery && searchResults.length > 0 && (
                        <ul className="evaluation-format-modal-search-results">
                          {searchResults.map(r => (
                            <li key={r.id}>
                              <button
                                type="button"
                                className="evaluation-format-modal-search-result-btn"
                                onClick={() => addExistingCriterio(r)}
                                disabled={isSubmitting}
                              >
                                {r.nombre}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      className="evaluation-format-modal-btn-add"
                      onClick={addCriterio}
                      disabled={isSubmitting}
                    >
                      <FaPlus />
                      Agregar Criterio
                    </button>
                  </div>
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
                      <p>Usa la búsqueda para agregar un criterio existente o haz clic en "Agregar Criterio"</p>
                    )}
                  </div>
                ) : (
                  <div className="evaluation-format-modal-criterios-list">
                    {criterios.map((criterio, cIdx) => (
                      <div key={criterio.id || cIdx} className="evaluation-format-modal-criterio-item">
                        <div className="evaluation-format-modal-criterio-header">
                          <span className="evaluation-format-modal-criterio-number">Criterio {cIdx + 1}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="evaluation-format-modal-btn-remove"
                              onClick={() => removeCriterio(cIdx)}
                              disabled={isSubmitting}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>

                        <div className="evaluation-format-modal-form-group">
                          <label className="evaluation-format-modal-form-label">Nombre del Criterio</label>
                          {showFormInputs ? (
                            <input
                              type="text"
                              className="evaluation-format-modal-form-input"
                              value={criterio.nombre}
                              onChange={(e) => handleCriterioChange(cIdx, 'nombre', e.target.value)}
                              placeholder="Nombre del criterio"
                              disabled={!isEditing || isSubmitting}
                            />
                          ) : (
                            <p className="evaluation-format-modal-readonly-text">{criterio.nombre}</p>
                          )}
                          {formErrors[`criterio_${cIdx}`] && (
                            <div className="evaluation-format-modal-error-text">{formErrors[`criterio_${cIdx}`]}</div>
                          )}
                        </div>

                        {/* Items dentro del criterio */}
                        <div className="evaluation-format-modal-criterio-items">
                          {(criterio.items || []).length === 0 ? (
                            <div className="evaluation-format-modal-empty-items">No hay ítems en este criterio</div>
                          ) : (
                            (criterio.items || []).map((item, iIdx) => (
                              <div key={item.id || iIdx} className="evaluation-format-modal-item-row">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ flex: 1 }} className="evaluation-format-modal-form-group">
                                    <label className="evaluation-format-modal-form-label">Ítem {getGlobalItemIndex(cIdx, iIdx)}</label>
                                    <input
                                      type="text"
                                      className="evaluation-format-modal-form-input"
                                      value={item.nombre}
                                      onChange={(e) => handleItemChange(cIdx, iIdx, 'nombre', e.target.value)}
                                      placeholder="Texto de la pregunta / enunciado del ítem"
                                      disabled={!isEditing || isSubmitting}
                                    />
                                  </div>

                                  {isEditing && (
                                    <div style={{ marginLeft: 8 }}>
                                      <button
                                        type="button"
                                        className="evaluation-format-modal-btn-remove"
                                        onClick={() => removeItemFromCriterio(cIdx, iIdx)}
                                        disabled={isSubmitting}
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="evaluation-format-modal-form-group" style={{ marginTop: 12 }}>
                                  <label className="evaluation-format-modal-form-label">Valor (%)</label>
                                  <input
                                    type="number"
                                    className="evaluation-format-modal-form-input"
                                    value={item.peso === '' || item.peso === null || typeof item.peso === 'undefined' ? '' : item.peso}
                                    onChange={(e) => handleItemChange(cIdx, iIdx, 'peso', e.target.value)}
                                    min="0"
                                    max="100"
                                    step="1"
                                    disabled={!isEditing || isSubmitting}
                                  />
                                </div>

                                <div className="evaluation-format-modal-form-group" style={{ flex: 1, marginTop: 12 }}>
                                  <label className="evaluation-format-modal-form-label">Descripción</label>
                                  <textarea
                                    className="evaluation-format-modal-form-textarea"
                                    value={item.descripcion}
                                    onChange={(e) => handleItemChange(cIdx, iIdx, 'descripcion', e.target.value)}
                                    rows="2"
                                    disabled={!isEditing || isSubmitting}
                                  />
                                </div>
                              </div>
                            ))
                          )}

                          {isEditing && (
                            <div className="evaluation-format-modal-add-item-row" style={{ marginTop: 8 }}>
                              <button
                                type="button"
                                className="evaluation-format-modal-btn-add"
                                onClick={() => addItemToCriterio(cIdx)}
                                disabled={isSubmitting}
                              >
                                <FaPlus /> Agregar Ítem
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen de valores por ítems */}
                {criterios.length > 0 && (
                  <div className="evaluation-format-modal-peso-summary">
                    <div className="evaluation-format-modal-peso-total">
                      <strong>Total de criterios: {criterios.length}</strong>
                    </div>
                    <div className="evaluation-format-modal-peso-total">
                      <strong>
                        Suma de valores: {criterios.reduce((sum, c) => sum + ((c.items || []).reduce((s, it) => s + (parseInt(it.peso) || 0), 0)), 0)}%
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