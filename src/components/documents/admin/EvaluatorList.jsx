import React from 'react';
import '../../../styles/documents/admin/EvaluatorList.css';

const EvaluatorList = ({ evaluadores = [], loading, error, selectedId, onSelect }) => {
  return (
    <div className="evaluator-list">
      <div className="list-header">
        <h3>Evaluadores</h3>
      </div>

      {loading && <div className="loading">Cargando evaluadores...</div>}
      {error && <div className="error">Error: {error}</div>}

      <ul>
        {(evaluadores || []).map(ev => (
          <li key={ev.id} className={`evaluator-item ${selectedId === ev.id ? 'selected' : ''}`} onClick={() => onSelect(ev)}>
            <div className="evaluator-main">
              <div className="name">{ev.nombre} {ev.apellido}</div>
              <div className="meta">{ev.email || ev.emailAddress || ''}</div>
            </div>
            <div className="status">{ev.estado || ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvaluatorList;
