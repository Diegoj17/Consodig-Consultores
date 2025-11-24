import React from 'react';
import '../../../../styles/management/project/evaluador/EvaluatorCriterio.css';

const EvaluatorCriterio = ({ criterios, onCriterioChange  }) => {

  const handleScoreChange = (criterioId, score) => {
    onCriterioChange(criterioId, 'calificacion', parseInt(score));
  };

  const handleCommentsChange = (criterioId, comments) => {
    onCriterioChange(criterioId, 'comentarios', comments);
  };

  return (
    <div className="evaluator-criteria-section">
      {criterios.map((criterio, index) => (
        <div key={criterio.id} className="evaluator-criterion">
          <div className="evaluator-criterion-header">
            <div className="evaluator-criterion-title">
              <h4>{index + 1}. {criterio.nombre}</h4>
              <span className="evaluator-criterion-weight">Peso: {criterio.peso}%</span>
            </div>
            <div className="evaluator-criterion-score">
              <span className="evaluator-score-display">
                {criterio.calificacion} / 100
              </span>
            </div>
          </div>

          <div className="evaluator-criterion-description">
            <FaInfoCircle className="evaluator-info-icon" />
            <p>{criterio.descripcion}</p>
          </div>

          <div className="evaluator-criterion-controls">
            <div className="evaluator-score-input">
              <label>Calificación:</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={criterio.calificacion}
                onChange={(e) => handleScoreChange(criterio.id, e.target.value)}
                className="evaluator-range"
              />
              <div className="evaluator-range-labels">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div className="evaluator-criterion-comments">
              <label>Comentarios específicos:</label>
              <textarea
                rows="3"
                placeholder="Observaciones específicas para este criterio..."
                value={criterio.comentarios}
                onChange={(e) => handleCommentsChange(criterio.id, e.target.value)}
                className="evaluator-comments-textarea"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default EvaluatorCriterio;