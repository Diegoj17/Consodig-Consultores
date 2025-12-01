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
      // esperar que el backend exponga un endpoint para asignaciones
      // POST /evaluaciones/asignar { proyectoId, formatoId, evaluadorId, tiempoLimiteHoras }
      const response = await projectApi.post(`${this.basePath}/asignar`, asignDto);
      return response.data;
    } catch (error) {
      console.error('Error asignando evaluación:', error);
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

  async editEvaluation(evaluationId, itemsEditados) {
    try {
      console.log('🔄 Editando evaluación:', evaluationId, itemsEditados);
      
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
      console.log('✅ Evaluación editada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error editando evaluación:', error);
      console.error('📡 Detalles del error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Validar una evaluación (POST /evaluaciones/{id}/validar)
  async validateEvaluation(id) {
    try {
      const resp = await projectApi.post(`${this.basePath}/${id}/validar`);
      console.log('✅ Evaluación validada:', resp.data || resp);
      return resp.data || resp;
    } catch (error) {
      console.error('❌ Error validando evaluación:', error);
      throw error;
    }
  }

  // Invalidar una evaluación (POST /evaluaciones/{id}/invalidar) — dto puede contener motivoInvalidacion y otros campos
  async invalidateEvaluation(id, dto) {
    try {
      const resp = await projectApi.post(`${this.basePath}/${id}/invalidar`, dto || {});
      console.log('✅ Evaluación invalidada:', resp.data || resp);
      return resp.data || resp;
    } catch (error) {
      console.error('❌ Error invalidando evaluación:', error);
      throw error;
    }
  }

  // Obtener evaluación por id
  async getById(id) {
    try {
      const resp = await projectApi.get(`${this.basePath}/${id}`);
      return resp.data || resp;
    } catch (error) {
      console.error('Error obteniendo evaluación por id:', id, error);
      throw error;
    }
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;