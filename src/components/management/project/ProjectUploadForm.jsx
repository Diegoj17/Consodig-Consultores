import React, { useState } from 'react';
import '../../../styles/management/project/ProjectUploadForm.css';

const ProjectUploadForm = ({ onSubmit, onShowModal }) => {
  const [projectForm, setProjectForm] = useState({
    titulo: '',
    resumen: '',
    palabrasClave: '',
    objetivoGeneral: '',
    objetivosEspecificos: '',
    justificacion: '',
    investigadorPrincipal: '',
    archivoExcel: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setProjectForm(prev => ({
        ...prev,
        archivoExcel: file
      }));
    } else {
      onShowModal('error', 'Por favor seleccione un archivo Excel válido (.xlsx)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!projectForm.titulo || !projectForm.resumen || !projectForm.palabrasClave || 
        !projectForm.objetivoGeneral || !projectForm.objetivosEspecificos || 
        !projectForm.justificacion || !projectForm.investigadorPrincipal) {
      onShowModal('error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    onSubmit(projectForm);
    
    setProjectForm({
      titulo: '',
      resumen: '',
      palabrasClave: '',
      objetivoGeneral: '',
      objetivosEspecificos: '',
      justificacion: '',
      investigadorPrincipal: '',
      archivoExcel: null
    });
  };

  return (
    <div className="upload-form-container">
      <h2 className="upload-form-title">Registrar Nuevo Proyecto</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        
        <div className="upload-form-group">
          <label className="upload-form-label">Título *</label>
          <input
            type="text"
            name="titulo"
            value={projectForm.titulo}
            onChange={handleInputChange}
            className="upload-form-input"
            placeholder="Ingrese el título del proyecto"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Resumen del Proyecto *</label>
          <textarea
            name="resumen"
            value={projectForm.resumen}
            onChange={handleInputChange}
            className="upload-form-textarea"
            placeholder="Describa brevemente el proyecto"
            rows="4"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Palabras Clave *</label>
          <input
            type="text"
            name="palabrasClave"
            value={projectForm.palabrasClave}
            onChange={handleInputChange}
            className="upload-form-input"
            placeholder="Ingrese palabras clave separadas por comas"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Objetivo General *</label>
          <textarea
            name="objetivoGeneral"
            value={projectForm.objetivoGeneral}
            onChange={handleInputChange}
            className="upload-form-textarea"
            placeholder="Describa el objetivo general del proyecto"
            rows="3"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Objetivos Específicos *</label>
          <textarea
            name="objetivosEspecificos"
            value={projectForm.objetivosEspecificos}
            onChange={handleInputChange}
            className="upload-form-textarea"
            placeholder="Liste los objetivos específicos (uno por línea)"
            rows="5"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Justificación *</label>
          <textarea
            name="justificacion"
            value={projectForm.justificacion}
            onChange={handleInputChange}
            className="upload-form-textarea"
            placeholder="Justifique la importancia del proyecto"
            rows="4"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Investigador Principal *</label>
          <input
            type="text"
            name="investigadorPrincipal"
            value={projectForm.investigadorPrincipal}
            onChange={handleInputChange}
            className="upload-form-input"
            placeholder="Nombre del investigador principal"
            required
          />
        </div>

        <div className="upload-form-group">
          <label className="upload-form-label">Archivo Excel (Opcional)</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="upload-form-file"
          />
          <span className="upload-form-hint">Formato permitido: .xlsx</span>
        </div>

        <button type="submit" className="upload-form-submit">
          Enviar Proyecto
        </button>
      </form>
    </div>
  );
};

export default ProjectUploadForm;