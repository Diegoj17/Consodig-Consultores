import React from 'react';
import { FaUserTie, FaChartLine, FaStar } from 'react-icons/fa';
import '../../styles/reports/EvaluatorReportsSummary.css';

const EvaluatorReportsSummary = ({ summary }) => {
  return (
    <div className="evaluator-reports-summary-metrics">
      <div className="evaluator-reports-summary-card">
        <div className="evaluator-reports-summary-icon">
          <FaUserTie />
        </div>
        <div className="evaluator-reports-summary-info">
          <h3>Total Evaluadores</h3>
          <div className="evaluator-reports-summary-value">{summary.totalEvaluators}</div>
          <div className="evaluator-reports-summary-subtext">{summary.activeEvaluators} activos</div>
        </div>
      </div>

      <div className="evaluator-reports-summary-card">
        <div className="evaluator-reports-summary-icon">
          <FaChartLine />
        </div>
        <div className="evaluator-reports-summary-info">
          <h3>Calificación Promedio</h3>
          <div className="evaluator-reports-summary-value">{summary.averageRating}/5.0</div>
          <div className="evaluator-reports-summary-subtext">General del sistema</div>
        </div>
      </div>

      <div className="evaluator-reports-summary-card">
        <div className="evaluator-reports-summary-icon">
          <FaStar />
        </div>
        <div className="evaluator-reports-summary-info">
          <h3>Evaluaciones Totales</h3>
          <div className="evaluator-reports-summary-value">{summary.totalEvaluations}</div>
          <div className="evaluator-reports-summary-subtext">Completadas</div>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorReportsSummary;