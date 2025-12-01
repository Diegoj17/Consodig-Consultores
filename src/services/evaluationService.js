import projectApi from '../api/ProjectAxios';
import notificationService from './notificationService';

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
      const acceptedWithTotals = await Promise.all((allAccepted || []).map(ev => this.enrichEvaluationWithTotals(ev)));
      
      const filtered = acceptedWithTotals.filter(evaluation => {
        const progress = this.calculateProgress(evaluation);
        console.log('getInProgressEvaluations: evaluating id=', evaluation?.id, 'itemsKeys=',
          evaluation && (evaluation.items ? 'items' : (evaluation.criterios ? 'criterios' : 'no-items')),
          'itemsLen=', (evaluation && (evaluation.items || evaluation.criterios) ? (evaluation.items || evaluation.criterios).length : 0),
          'progress=', progress);
        // Considerar "en progreso" cualquier evaluación ACEPTADA con avance (>0) aunque esté al 100%,
        // ya que solo pasa a COMPLETADA cuando el backend cambia el estado.
        return progress > 0;
      });

      // Si el backend devolvió vacío (mismatch de estados), intentar obtener todas y filtrar por progreso
      if (!filtered || filtered.length === 0) {
        try {
          console.warn('getInProgressEvaluations: no se encontraron ACEPTADA con progreso, intentando GET /evaluaciones');
          const resp = await projectApi.get(`${this.basePath}`);
          console.log('getInProgressEvaluations: GET /evaluaciones response length=', Array.isArray(resp.data) ? resp.data.length : 'n/a');
          console.log('getInProgressEvaluations: GET /evaluaciones response preview=', resp.data);
          const all = resp.data || [];
          // Intentar enriquecer evaluaciones sin items pidiendo la evaluación completa por id
          const enriched = await Promise.all(all.map(async (ev) => {
            try {
              const itemsPresent = (ev.items && ev.items.length > 0) || (ev.criterios && ev.criterios.length > 0) || (ev.itemsEvaluados && ev.itemsEvaluados.length > 0);
              if (!itemsPresent && ev.id) {
                try {
                  // Pedir la evaluación completa; el backend suele exponer GET /evaluaciones/{id}
                  const r = await projectApi.get(`${this.basePath}/${ev.id}`);
                  const full = r.data || r;
                  // El backend puede devolver los items en distintos nombres
                  if (full.items && Array.isArray(full.items)) ev.items = full.items;
                  else if (full.itemsEvaluados && Array.isArray(full.itemsEvaluados)) ev.items = full.itemsEvaluados;
                  else if (full.itemEvaluados && Array.isArray(full.itemEvaluados)) ev.items = full.itemEvaluados;
                  else if (full.itemEvaluado && Array.isArray(full.itemEvaluado)) ev.items = full.itemEvaluado;
                  else if (full.criterios && Array.isArray(full.criterios)) ev.items = full.criterios;
                } catch (err) {
                  // no fatal, continuar
                  console.warn('getInProgressEvaluations: no se pudieron obtener detalles para evaluacion', ev.id, err?.message || err);
                }
              }
            } catch {
              // ignore per-eval errors
            }
            return await this.enrichEvaluationWithTotals(ev);
          }));

          const fallback = enriched.filter(ev => {
            const p = this.calculateProgress(ev);
            return p > 0;
          });

          // Si aún no encontramos nada, devolver fallback vacío para que el llamador lo sepa
          return fallback;
        } catch (err) {
          console.warn('getInProgressEvaluations: fallback GET /evaluaciones falló', err);
        }
      }

      return filtered;
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
      // Loguear la respuesta RAW del backend como string para evitar que la consola
      // muestre objetos que luego cambian al expandir (snapshot fijo).
      try {
        console.log('✅ Respuesta de evaluaciones completadas (raw):', JSON.stringify(response.data, null, 2));
      } catch {
        // Fallback si stringify falla por circular refs
        console.log('✅ Respuesta de evaluaciones completadas (raw, fallback):', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo evaluaciones completadas:', error);
      console.error('📡 Detalles del error:', error.response?.data);
      throw error;
    }
  }

  // Calcular progreso basado en items calificados
  calculateProgress(evaluation) {
    // Soportar múltiples nombres posibles que el backend pueda usar para la lista de items
    const items = evaluation.criterios
      || evaluation.items
      || evaluation.itemsEvaluados
      || evaluation.itemEvaluados
      || evaluation.itemEvaluado
      || evaluation.items_evaluados
      || evaluation.item_evaluados
      || evaluation.itemsEvaluado
      || [];
    if (!items || items.length === 0) return 0;

    const isItemCompleted = (item) => {
      if (!item) return false;

      // posibles campos donde el backend puede guardar la nota/puntuación
      const possibleScoreFields = [
        'calificacion', 'valor', 'puntuacion', 'score', 'nota', 'mark', 'marks', 'notaFinal', 'nota_final'
      ];

      for (const f of possibleScoreFields) {
        const v = item[f];
        if (typeof v === 'number' && v > 0) return true;
        if (typeof v === 'string' && !isNaN(Number(v)) && Number(v) > 0) return true;
      }

      // flags booleanas
      if (item.calificado || item.evaluado || item.graded || item.completed) return true;

      return false;
    };

    const completedItems = items.filter(isItemCompleted).length;
    const totalItemsCount = this.extractTotalItemsCount(evaluation) || (items?.length || 0);
    if (!totalItemsCount || totalItemsCount <= 0) return 0;

    const ratio = Math.min(1, completedItems / totalItemsCount);
    return Math.round(ratio * 100);
  }

  extractTotalItemsCount(evaluation) {
    if (!evaluation) return null;

    const numericCandidates = [
      evaluation.totalItems,
      evaluation.total_items,
      evaluation.totalItemCount,
      evaluation.itemCount,
      evaluation.totalFormatItems,
      evaluation.itemsCount,
      evaluation.itemsAsignadosCount,
      evaluation.numeroItems,
      evaluation.cantidadItems,
      evaluation.formato?.totalItems,
      evaluation.formato?.itemsCount,
      evaluation.formato?.cantidadItems
    ];

    const numericMatch = numericCandidates.find(v => typeof v === 'number' && v > 0);
    if (numericMatch) return numericMatch;

    const arrayCandidates = [
      evaluation.itemsAsignados,
      evaluation.itemsEsperados,
      evaluation.itemsDefinidos,
      evaluation.itemsFormato,
      evaluation.items_formato,
      evaluation.itemFormato,
      evaluation.criteriosAsignados,
      evaluation.criteriosDefinidos,
      evaluation.criterios,
      evaluation.formato?.items,
      evaluation.formato?.itemsFormato,
      evaluation.formato?.criterios
    ];

    for (const candidate of arrayCandidates) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate.length;
      }
    }

    return null;
  }

  extractItemsCollection(source) {
    if (!source) return null;
    const candidates = [
      source.items,
      source.itemsFormato,
      source.itemFormatos,
      source.item_formato,
      source.itemFormato,
      source.criterios
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    return null;
  }

  async enrichEvaluationWithTotals(evaluation) {
    if (!evaluation) return evaluation;

    const existingTotal = this.extractTotalItemsCount(evaluation);
    if (existingTotal) {
      evaluation.totalItems = existingTotal;
      return evaluation;
    }

    const formatId = evaluation.formatoId || evaluation.formato?.id;
    if (!formatId) return evaluation;

    try {
      const resp = await projectApi.get(`/formatos/${formatId}`);
      const format = resp.data || resp;
      const itemsCollection = this.extractItemsCollection(format);
      if (Array.isArray(itemsCollection)) {
        evaluation.totalItems = itemsCollection.length;
        console.log('enrichEvaluationWithTotals: format fetched, formatId=', formatId, 'totalItems=', evaluation.totalItems);
      } else {
        // intentar detectar arrays dentro del objeto de formato
        const alt = this.extractItemsCollection(format);
        if (Array.isArray(alt)) {
          evaluation.totalItems = alt.length;
          console.log('enrichEvaluationWithTotals: format fetched (alt), formatId=', formatId, 'totalItems=', evaluation.totalItems);
        }
      }
    } catch (err) {
      console.warn('enrichEvaluationWithTotals: no se pudo obtener formato', formatId, err?.message || err);
    }

    return evaluation;
  }

  async getEvaluationsByStatus(status) {
    try {
      const url = `${this.basePath}/estado/${status}`;
      console.log('evaluationService.getEvaluationsByStatus: requesting', url);
      const response = await projectApi.get(url);
      console.log('evaluationService.getEvaluationsByStatus: response length=', Array.isArray(response.data) ? response.data.length : 'n/a');
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo evaluaciones por estado ${status}:`, error);
      throw error;
    }
  }

  // Obtener evaluaciones validadas (validada === true)
  async getValidatedEvaluations() {
    try {
      console.log('🔄 Solicitando evaluaciones validadas (backend no expone endpoint específico, se filtra localmente)');
      const response = await projectApi.get(`${this.basePath}`);
      const all = response.data || [];
      const validated = (all || []).filter(ev => ev.validada === true || ev.validada === 'true' || ev.validada === 1);
      console.log('✅ Evaluaciones validadas encontradas:', validated.length);
      return validated;
    } catch (error) {
      console.error('❌ Error obteniendo evaluaciones validadas:', error);
      throw error;
    }
  }

  // Asignar una evaluación a un evaluador
  async assignEvaluation(asignDto) {
    try {
      console.log('🟡 [evaluationService] Asignando evaluación:', asignDto);
      const response = await projectApi.post(`${this.basePath}/asignar`, asignDto);
      console.log('✅ [evaluationService] Evaluación asignada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [evaluationService] Error asignando evaluación:', error);
      throw error;
    }
  }

  // Aceptar evaluación (cambia estado de ASIGNADA a ACEPTADA)
  async acceptEvaluation(id) {
    try {
      console.log(`🟡 [evaluationService] Aceptando evaluación: ${id}`);
      const response = await projectApi.put(`${this.basePath}/${id}/aceptar`);
      console.log(`✅ [evaluationService] Evaluación aceptada: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [evaluationService] Error aceptando evaluación ${id}:`, error);
      throw error;
    }
  }

  // Rechazar evaluación
  async rejectEvaluation(id, reason = '') {
    try {
      console.log(`🟡 [evaluationService] Rechazando evaluación: ${id}`, { reason });
      const data = reason ? { motivo: reason } : null;
      const response = await projectApi.put(`${this.basePath}/${id}/rechazar`, data);
      console.log(`✅ [evaluationService] Evaluación rechazada: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [evaluationService] Error rechazando evaluación ${id}:`, error);
      throw error;
    }
  }

  // Finalizar evaluación (cambia estado a COMPLETADA)
  async finishEvaluation(id, evaluationData) {
    try {
      console.log(`🟡 [evaluationService] Finalizando evaluación: ${id}`, evaluationData);
      const response = await projectApi.put(`${this.basePath}/${id}/finalizar`, evaluationData);
      console.log(`✅ [evaluationService] Evaluación finalizada: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [evaluationService] Error finalizando evaluación ${id}:`, error);
      throw error;
    }
  }

  // Calificar items individuales
  async gradeItem(evaluationId, itemData) {
    try {
      console.log(`🟡 [evaluationService] Calificando ítem para evaluación: ${evaluationId}`, itemData);
      const response = await projectApi.post(`${this.basePath}/${evaluationId}/items`, itemData);
      console.log(`✅ [evaluationService] Ítem calificado para evaluación: ${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [evaluationService] Error calificando ítem para evaluación ${evaluationId}:`, error);
      throw error;
    }
  }

  async editEvaluation(evaluationId, itemsEditados) {
    try {
      console.log('🟡 [evaluationService] Editando evaluación:', evaluationId, itemsEditados);
      
      // Validar que itemsEditados sea un array
      if (!Array.isArray(itemsEditados)) {
        throw new Error('Los datos de edición deben ser un array');
      }

      // Validar que cada item tenga la estructura correcta
      const isValidPayload = itemsEditados.every(item => 
        item && 
        typeof item.itemEvaluadoId !== 'undefined' &&
        typeof item.calificacion !== 'undefined' &&
        typeof item.observacion !== 'undefined'
      );

      if (!isValidPayload) {
        throw new Error('Estructura de datos de edición inválida');
      }

      console.log('📤 Enviando payload al backend:', itemsEditados);
      
      const response = await projectApi.put(`${this.basePath}/${evaluationId}/editar`, itemsEditados);
      console.log('✅ [evaluationService] Evaluación editada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [evaluationService] Error editando evaluación:', error);
      console.error('📡 Detalles del error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Validar una evaluación (POST /evaluaciones/{id}/validar)
  async validateEvaluation(id, adminId) {
    try {
      console.log(`🟡 [evaluationService] Validando evaluación: ${id}`, { adminId });
      // El backend espera `adminId` como parámetro de consulta (RequestParam). Si está presente,
      // adjuntarlo a la URL; si no, llamar sin parámetro.
      let url = `${this.basePath}/${id}/validar`;
      if (adminId !== null && adminId !== undefined) {
        const qp = new URLSearchParams({ adminId: String(adminId) }).toString();
        url = `${url}?${qp}`;
      }
      const resp = await projectApi.post(url);
      console.log(`✅ [evaluationService] Evaluación validada: ${id}`, resp.data || resp);
      return resp.data || resp;
    } catch (error) {
      console.error(`❌ [evaluationService] Error validando evaluación ${id}:`, error);
      throw error;
    }
  }

  // Invalidar una evaluación (POST /evaluaciones/{id}/invalidar) — dto puede contener motivoInvalidacion y otros campos
  async invalidateEvaluation(id, dto) {
    try {
      console.log(`🟡 [evaluationService] Invalidando evaluación: ${id}`, dto);
      const resp = await projectApi.post(`${this.basePath}/${id}/invalidar`, dto || {});
      console.log(`✅ [evaluationService] Evaluación invalidada: ${id}`, resp.data || resp);
      return resp.data || resp;
    } catch (error) {
      console.error(`❌ [evaluationService] Error invalidando evaluación ${id}:`, error);
      throw error;
    }
  }

  // Obtener evaluación por id
  async getById(id) {
    try {
      console.log(`🟡 [evaluationService] Obteniendo evaluación por ID: ${id}`);
      const resp = await projectApi.get(`${this.basePath}/${id}`);
      console.log(`✅ [evaluationService] Evaluación obtenida: ${id}`);
      return resp.data || resp;
    } catch (error) {
      console.error(`❌ [evaluationService] Error obteniendo evaluación por id ${id}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS MEJORADOS CON NOTIFICACIONES ==========

  /**
   * Asignar evaluación y crear notificación CON REMITENTE
   * @param {Object} asignDto - Datos de asignación { proyectoId, formatoId, evaluadorId, tiempoLimiteHoras }
   * @param {number} adminId - ID del administrador que asigna (OBLIGATORIO)
   * @returns {Promise<Object>} Evaluación asignada
   */
  async assignEvaluationWithNotification(asignDto, adminId) {
    try {
      console.log('🟡 [evaluationService] Asignando evaluación con notificación y remitente:', { asignDto, adminId });

      // ✅ Validar que adminId tenga valor
      if (adminId === null || adminId === undefined) {
        throw new Error('Debe iniciar sesión como administrador para asignar evaluaciones.');
      }

      // Adjuntar el remitente (admin) al payload que va al backend
      const payload = { ...(asignDto || {}), adminId };

      // 1. Asignar la evaluación
      const evaluacionAsignada = await this.assignEvaluation(payload);
      
      console.log('✅ [evaluationService] Evaluación asignada:', evaluacionAsignada);

      // 2. Crear notificación para el evaluador CON REMITENTE
      if (evaluacionAsignada && asignDto.evaluadorId) {
        const evaluacionId = evaluacionAsignada.id || evaluacionAsignada.evaluacionId;
        const proyectoId = evaluacionAsignada.proyectoId || asignDto.proyectoId;
        
        console.log('📨 [evaluationService] Creando notificación con:', {
          evaluacionId,
          proyectoId,
          evaluadorId: asignDto.evaluadorId,
          adminId
        });
        
        await notificationService.createEvaluationAssignedNotification(
          evaluacionId,
          proyectoId,
          asignDto.evaluadorId,
          adminId // ✅ ID del admin como remitente (no será null)
        );
        
        console.log('✅ [evaluationService] Notificación creada con remitente:', adminId);
      } else {
        console.warn('⚠️ [evaluationService] No se pudo crear notificación - datos incompletos:', {
          evaluacionAsignada,
          evaluadorId: asignDto.evaluadorId
        });
      }

      return evaluacionAsignada;
    } catch (error) {
      console.error('❌ [evaluationService] Error asignando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Aceptar evaluación y crear notificación
   * @param {number} id - ID de la evaluación
   * @param {number} evaluadorId - ID del evaluador que acepta
   * @param {number} adminId - ID del administrador que recibirá la notificación
   * @returns {Promise<Object>} Evaluación aceptada
   */
  async acceptEvaluationWithNotification(id, evaluadorId, adminId) {
    try {
      console.log('🟡 [evaluationService] Aceptando evaluación con notificación:', { id, evaluadorId, adminId });

      // 1. Aceptar la evaluación
      const evaluacionAceptada = await this.acceptEvaluation(id);

      // 2. Crear notificación para el admin
      if (evaluacionAceptada) {
        await notificationService.createEvaluationAcceptedNotification(
          id,
          evaluacionAceptada.proyectoId,
          adminId,
          evaluadorId // ✅ ID del evaluador como remitente
        );
        
        console.log('✅ [evaluationService] Notificación de aceptación creada');
      }

      return evaluacionAceptada;
    } catch (error) {
      console.error('❌ [evaluationService] Error aceptando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Rechazar evaluación y crear notificación
   * @param {number} id - ID de la evaluación
   * @param {number} evaluadorId - ID del evaluador que rechaza
   * @param {number} adminId - ID del administrador que recibirá la notificación
   * @param {string} motivo - Motivo del rechazo
   * @returns {Promise<Object>} Evaluación rechazada
   */
  async rejectEvaluationWithNotification(id, evaluadorId, adminId, motivo = '') {
    try {
      console.log('🟡 [evaluationService] Rechazando evaluación con notificación:', { id, evaluadorId, adminId, motivo });

      // 1. Rechazar la evaluación
      const evaluacionRechazada = await this.rejectEvaluation(id, motivo);

      // 2. Crear notificación para el admin
      if (evaluacionRechazada) {
        await notificationService.createEvaluationRejectedNotification(
          id,
          evaluacionRechazada.proyectoId,
          adminId,
          evaluadorId, // ✅ ID del evaluador como remitente
          motivo
        );
        
        console.log('✅ [evaluationService] Notificación de rechazo creada');
      }

      return evaluacionRechazada;
    } catch (error) {
      console.error('❌ [evaluationService] Error rechazando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Finalizar evaluación y crear notificación
   * @param {number} id - ID de la evaluación
   * @param {Object} evaluationData - Datos de la evaluación finalizada
   * @param {number} evaluadorId - ID del evaluador que finaliza
   * @param {number} adminId - ID del administrador que recibirá la notificación
   * @returns {Promise<Object>} Evaluación finalizada
   */
  async finishEvaluationWithNotification(id, evaluationData, evaluadorId, adminId) {
    try {
      console.log('🟡 [evaluationService] Finalizando evaluación con notificación:', { id, evaluadorId, adminId });

      // 1. Finalizar la evaluación
      const evaluacionFinalizada = await this.finishEvaluation(id, evaluationData);

      // 2. Crear notificación para el admin
      if (evaluacionFinalizada) {
        await notificationService.createEvaluationCompletedNotification(
          id,
          evaluacionFinalizada.proyectoId,
          adminId,
          evaluadorId // ✅ ID del evaluador como remitente
        );
        
        console.log('✅ [evaluationService] Notificación de finalización creada');
      }

      return evaluacionFinalizada;
    } catch (error) {
      console.error('❌ [evaluationService] Error finalizando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Validar evaluación y crear notificación
   * @param {number} id - ID de la evaluación
   * @param {number} adminId - ID del administrador que valida
   * @param {number} evaluadorId - ID del evaluador que recibirá la notificación
   * @returns {Promise<Object>} Evaluación validada
   */
  async validateEvaluationWithNotification(id, adminId, evaluadorId) {
    try {
      console.log('🟡 [evaluationService] Validando evaluación con notificación:', { id, adminId, evaluadorId });

      // 1. Validar la evaluación (pasar adminId para que el backend registre el remitente)
      const evaluacionValidada = await this.validateEvaluation(id, adminId);

      // 2. Crear notificación para el evaluador
      if (evaluacionValidada) {
        await notificationService.createEvaluationValidatedNotification(
          id,
          evaluacionValidada.proyectoId,
          evaluadorId,
          adminId // ✅ ID del admin como remitente
        );
        
        console.log('✅ [evaluationService] Notificación de validación creada');
      }

      return evaluacionValidada;
    } catch (error) {
      console.error('❌ [evaluationService] Error validando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Invalidar evaluación y crear notificación
   * @param {number} id - ID de la evaluación
   * @param {Object} dto - Datos de invalidación
   * @param {number} adminId - ID del administrador que invalida
   * @param {number} evaluadorId - ID del evaluador que recibirá la notificación
   * @returns {Promise<Object>} Evaluación invalidada
   */
  async invalidateEvaluationWithNotification(id, dto, adminId, evaluadorId) {
    try {
      console.log('🟡 [evaluationService] Invalidando evaluación con notificación:', { id, adminId, evaluadorId, dto });

      // 1. Invalidar la evaluación
      const evaluacionInvalidada = await this.invalidateEvaluation(id, dto);

      // 2. Crear notificación para el evaluador
      if (evaluacionInvalidada) {
        await notificationService.createEvaluationInvalidatedNotification(
          id,
          evaluacionInvalidada.proyectoId,
          evaluadorId,
          adminId, // ✅ ID del admin como remitente
          dto.motivoInvalidacion
        );
        
        console.log('✅ [evaluationService] Notificación de invalidación creada');
      }

      return evaluacionInvalidada;
    } catch (error) {
      console.error('❌ [evaluationService] Error invalidando evaluación con notificación:', error);
      throw error;
    }
  }

  /**
   * Método de prueba para crear notificación de asignación
   * @param {number} evaluadorId - ID del evaluador
   * @param {number} adminId - ID del admin
   * @returns {Promise<Object>} Resultado de la prueba
   */
  async testNotificationSystem(evaluadorId, adminId) {
    try {
      console.log('🧪 [evaluationService] Probando sistema de notificaciones:', { evaluadorId, adminId });
      
      const testData = {
        proyectoId: 999,
        formatoId: 999,
        evaluadorId: evaluadorId,
        tiempoLimiteHoras: 24
      };

      // Usar el método que incluye notificación
      const resultado = await this.assignEvaluationWithNotification(testData, adminId);
      
      console.log('✅ [evaluationService] Prueba de notificación completada');
      return resultado;
    } catch (error) {
      console.error('❌ [evaluationService] Error en prueba de notificación:', error);
      throw error;
    }
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;