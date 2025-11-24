import React from 'react';
import { FaPlus, FaEdit, FaEye, FaFileContract } from 'react-icons/fa';
import '../../../../styles/management/project/admin/EvaluationsTab.css';

const EvaluationsTab = () => {
  return (
    <div className="project-admin-evaluations-tab">
      <div className="project-admin-section-header">
        <h2>Formatos de Evaluación</h2>
        <p>Registra y edita formatos con criterios y valores específicos</p>
      </div>

      <button className="project-admin-btn-primary">
        <FaPlus />
        Nuevo Formato de Evaluación
      </button>

      <div className="project-admin-formats-list">
        <div className="project-admin-format-card">
          <div className="project-admin-format-card-header">
            <FaFileContract className="project-admin-format-icon" />
            <div>
              <h3>Formato General de Investigación</h3>
              <p className="project-admin-format-description">
                Evaluación estándar para proyectos de investigación científica con criterios de calidad académica
              </p>
            </div>
          </div>
          
          <div className="project-admin-format-meta">
            <span className="project-admin-meta-item">5 Criterios</span>
            <span className="project-admin-meta-item">Valor total: 100%</span>
            <span className="project-admin-meta-status project-admin-meta-status--active">Activo</span>
          </div>
          
          <div className="project-admin-format-actions">
            <button className="project-admin-btn-edit">
              <FaEdit />
              Editar
            </button>
            <button className="project-admin-btn-view">
              <FaEye />
              Ver Criterios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsTab;