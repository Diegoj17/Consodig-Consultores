import React from 'react';
import { FaPlay } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/InProgressEvaluations.css';

const InProgressEvaluations = ({ evaluations = [], onContinue }) => {
  if (!evaluations || evaluations.length === 0) return null;

  return (
    <div className="inprogress-evaluations">
      <div className="section-header">
        <h3>Evaluaciones en Progreso</h3>
      </div>

      <div className="inprogress-list">
        {evaluations.map(ev => (
          <div key={ev.id} className="inprogress-item">
            <div className="inprogress-main">
              <h4 className="inprogress-title">{ev.project}</h4>
              {ev.formato && <span className="inprogress-format">{ev.formato}</span>}
              <p className="inprogress-evaluando">Evaluando: {ev.evaluando}</p>
              {ev.dueDate && <p className="inprogress-due">Vence: {ev.dueDate}</p>}
            </div>

            <div className="inprogress-controls">
              <div className="inprogress-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${ev.progress || 0}%` }}></div>
                </div>
                <span className="progress-text">{ev.progress || 0}%</span>
              </div>

              <button className="btn-continue" onClick={() => onContinue(ev.id)}>
                <FaPlay /> Continuar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InProgressEvaluations;
