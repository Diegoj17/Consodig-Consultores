import projectApi from '../api/ProjectAxios';

export const EVALUATION_STATUS = {
  ASIGNADA: 'ASIGNADA',
  ACEPTADA: 'ACEPTADA', 
  RECHAZADA: 'RECHAZADA',
  COMPLETADA: 'COMPLETADA'
};

class EvaluationService {
  constructor() {
    this.basePath = '/evaluaciones';
  }

  // Obtener evaluaciones pendientes (ACEPTADA con 0% completado)
  async getPendingEvaluations() {
    try {
      const allAccepted = await this.getEvaluationsByStatus(EVALUATION_STATUS.ACEPTADA);
      
      return allAccepted.filter(evaluation => {
        const progress = this.calculateProgress(evaluation);
        return progress === 0; // 0% completado
      });
    } catch (error) {
      console.error('Error obteniendo evaluaciones pendientes:', error);
      throw error;
    }
  }

  // Obtener evaluaciones en progreso (ACEPTADA con 1-99% completado)
  async getInProgressEvaluations() {
    try {
      const allAccepted = await this.getEvaluationsByStatus(EVALUATION_STATUS.ACEPTADA);
      
      return allAccepted.filter(evaluation => {
        const progress = this.calculateProgress(evaluation);
        return progress > 0 && progress < 100; // 1-99% completado
      });
    } catch (error) {
      console.error('Error obteniendo evaluaciones en progreso:', error);
      throw error;
    }
  }

  // Obtener evaluaciones completadas (COMPLETADA)
  async getCompletedEvaluations() {
  try {
    console.log('🔄 Solicitando evaluaciones completadas...');
    const response = await projectApi.get(`${this.basePath}/estado/COMPLETADA`);
    console.log('✅ Respuesta de evaluaciones completadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo evaluaciones completadas:', error);
    console.error('📡 Detalles del error:', error.response?.data);
    throw error;
  }
}

  // Calcular progreso basado en items calificados
  calculateProgress(evaluation) {
    const items = evaluation.criterios || evaluation.items || [];
    if (items.length === 0) return 0;
    
    const completedItems = items.filter(item => 
      item.calificacion > 0 || item.calificado
    ).length;
    
    return Math.round((completedItems / items.length) * 100);
  }

  async getEvaluationsByStatus(status) {
    try {
      const response = await projectApi.get(`${this.basePath}/estado/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo evaluaciones por estado ${status}:`, error);
      throw error;
    }
  }

  // Aceptar evaluación (cambia estado de ASIGNADA a ACEPTADA)
  async acceptEvaluation(id) {
    try {
      const response = await projectApi.put(`${this.basePath}/${id}/aceptar`);
      return response.data;
    } catch (error) {
      console.error('Error aceptando evaluación:', error);
      throw error;
    }
  }

  // Rechazar evaluación
  async rejectEvaluation(id, reason = '') {
    try {
      const data = reason ? { motivo: reason } : null;
      const response = await projectApi.put(`${this.basePath}/${id}/rechazar`, data);
      return response.data;
    } catch (error) {
      console.error('Error rechazando evaluación:', error);
      throw error;
    }
  }

  // Finalizar evaluación (cambia estado a COMPLETADA)
  async finishEvaluation(id, evaluationData) {
    try {
      const response = await projectApi.put(`${this.basePath}/${id}/finalizar`, evaluationData);
      return response.data;
    } catch (error) {
      console.error('Error finalizando evaluación:', error);
      throw error;
    }
  }

  // Calificar items individuales
  async gradeItem(evaluationId, itemData) {
    try {
      const response = await projectApi.post(`${this.basePath}/${evaluationId}/items`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error calificando ítem:', error);
      throw error;
    }
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;