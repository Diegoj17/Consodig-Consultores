// components/admin/reports/EvaluatorPerformanceChart.jsx
import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import '../../../styles/components/admin/reports/EvaluatorPerformanceChart.css';

const EvaluatorPerformanceChart = ({ data }) => {
  const maxEvaluations = Math.max(...data.map(item => item.evaluations));
  const maxRating = 5;

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <h4>
          <FaChartLine /> Desempeño del Evaluador
        </h4>
        <p>Evolución mensual de evaluaciones y calificaciones</p>
      </div>
      
      <div className="chart-container">
        <div className="chart-y-axis">
          <div className="y-label">Evaluaciones</div>
          <div className="y-scale">
            {[maxEvaluations, Math.floor(maxEvaluations * 0.75), Math.floor(maxEvaluations * 0.5), Math.floor(maxEvaluations * 0.25), 0].map(value => (
              <div key={value} className="y-tick">{value}</div>
            ))}
          </div>
        </div>
        
        <div className="chart-content">
          <div className="chart-bars">
            {data.map((item, index) => (
              <div key={index} className="chart-bar-group">
                <div 
                  className="evaluation-bar"
                  style={{ height: `${(item.evaluations / maxEvaluations) * 100}%` }}
                  title={`${item.evaluations} evaluaciones`}
                >
                  <span className="bar-value">{item.evaluations}</span>
                </div>
                <div 
                  className="rating-line"
                  style={{ bottom: `${(item.averageRating / maxRating) * 100}%` }}
                  title={`Calificación: ${item.averageRating}`}
                >
                  <span className="line-value">{item.averageRating}</span>
                </div>
                <div className="month-label">{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color bar"></div>
          <span>Evaluaciones Completadas</span>
        </div>
        <div className="legend-item">
          <div className="legend-color line"></div>
          <span>Calificación Promedio</span>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorPerformanceChart;