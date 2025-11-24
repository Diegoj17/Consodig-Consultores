import React from 'react';
import { FaUserCheck, FaCheck, FaTimes, FaClock, FaChartBar, FaStar, FaCalendarCheck } from 'react-icons/fa';
import '../../../../styles/management/project/admin/HistoryStats.css';

const HistoryStats = ({ evaluatorsHistory, timeFilter }) => {
  // Calcular estadísticas generales
  const getTotalEvaluators = () => {
    return evaluatorsHistory.length;
  };

  const getTotalAssignments = () => {
    return evaluatorsHistory.reduce((sum, e) => sum + e.asignados, 0);
  };

  const getTotalCompleted = () => {
    return evaluatorsHistory.reduce((sum, e) => sum + e.completados, 0);
  };

  const getTotalViolations = () => {
    return evaluatorsHistory.reduce((sum, e) => sum + e.incumplimientos, 0);
  };

  // Calcular tasas de cumplimiento
  const getCompletionRate = () => {
    const total = getTotalAssignments();
    const completed = getTotalCompleted();
    return total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  };

  const getViolationRate = () => {
    const total = getTotalAssignments();
    const violations = getTotalViolations();
    return total > 0 ? ((violations / total) * 100).toFixed(1) : 0;
  };

  // Calcular promedio de tiempo
  const getAverageTime = () => {
    const times = evaluatorsHistory.map(e => parseInt(e.tiempoPromedio));
    const validTimes = times.filter(time => !isNaN(time));
    return validTimes.length > 0 
      ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(1) + ' días'
      : 'N/A';
  };

  // Evaluadores destacados
  const getTopPerformers = () => {
    return evaluatorsHistory.filter(e => {
      const ratio = e.completados / e.asignados;
      return ratio >= 0.9 && e.incumplimientos === 0;
    }).length;
  };

  // Eficiencia general
  const getEfficiencyScore = () => {
    const completionRate = parseFloat(getCompletionRate());
    const violationRate = parseFloat(getViolationRate());
    
    // Ponderación: 70% tasa de completado, 30% tasa de no incumplimientos
    const score = (completionRate * 0.7) + ((100 - violationRate) * 0.3);
    return Math.min(100, Math.max(0, score)).toFixed(0);
  };

  // Proyectos pendientes (asignados - completados)
  const getPendingAssignments = () => {
    return evaluatorsHistory.reduce((sum, e) => sum + (e.asignados - e.completados), 0);
  };

  // Tasa de éxito por evaluador
  const getAverageSuccessRate = () => {
    const rates = evaluatorsHistory.map(e => (e.completados / e.asignados) * 100);
    const validRates = rates.filter(rate => !isNaN(rate));
    return validRates.length > 0 
      ? (validRates.reduce((a, b) => a + b, 0) / validRates.length).toFixed(1)
      : 0;
  };

  return (
    <div className="history-stats-container">
      <div className="history-stats-header">
        <div className="history-stats-title">
          <h2>Métricas de Desempeño</h2>
          <p>Consulta el historial y cumplimiento de plazos de los evaluadores del sistema</p>
        </div>
        <div className="history-stats-filter-info">
          <span className="filter-badge">
            Período: {timeFilter === 'all' ? 'Todos los tiempos' : 
                     timeFilter === '30days' ? 'Últimos 30 días' :
                     timeFilter === '90days' ? 'Últimos 90 días' : 'Último año'}
          </span>
        </div>
      </div>

      <div className="history-stats-grid">
        {/* Estadísticas principales */}
        <div className="history-stat-card">
          <div className="history-stat-icon total-evaluators">
            <FaUserCheck />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getTotalEvaluators()}</span>
            <span className="history-stat-label">Total Evaluadores</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon total-assignments">
            <FaChartBar />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getTotalAssignments()}</span>
            <span className="history-stat-label">Total Asignaciones</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon completed">
            <FaCheck />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getTotalCompleted()}</span>
            <span className="history-stat-label">Completados</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon violations">
            <FaTimes />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getTotalViolations()}</span>
            <span className="history-stat-label">Incumplimientos</span>
          </div>
        </div>

        {/* Métricas de rendimiento */}
        <div className="history-stat-card">
          <div className="history-stat-icon completion-rate">
            <FaCalendarCheck />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getCompletionRate()}%</span>
            <span className="history-stat-label">Tasa de Cumplimiento</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon violation-rate">
            <FaTimes />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getViolationRate()}%</span>
            <span className="history-stat-label">Tasa de Incumplimiento</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon average-time">
            <FaClock />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getAverageTime()}</span>
            <span className="history-stat-label">Tiempo Promedio</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon efficiency">
            <FaStar />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getEfficiencyScore()}%</span>
            <span className="history-stat-label">Eficiencia General</span>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="history-stat-card">
          <div className="history-stat-icon top-performers">
            <FaStar />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getTopPerformers()}</span>
            <span className="history-stat-label">Top Performers</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon pending">
            <FaClock />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getPendingAssignments()}</span>
            <span className="history-stat-label">Pendientes Actuales</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon success-rate">
            <FaChartBar />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">{getAverageSuccessRate()}%</span>
            <span className="history-stat-label">Éxito Promedio</span>
          </div>
        </div>

        <div className="history-stat-card performance-indicator">
          <div className="history-stat-icon overall">
            <FaChartBar />
          </div>
          <div className="history-stat-info">
            <span className="history-stat-number">
              {getCompletionRate() >= 90 ? 'Excelente' :
               getCompletionRate() >= 80 ? 'Bueno' :
               getCompletionRate() >= 70 ? 'Regular' : 'Necesita Mejora'}
            </span>
            <span className="history-stat-label">Desempeño General</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryStats;