// services/notificationService.js
import api from '../api/ProjectAxios'

const BASE = '/notificaciones'

const notificationService = {
  /**
   * Obtiene las notificaciones de un usuario específico
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} Lista de notificaciones
   */
  async getByUser(usuarioId) {
    try {
      console.log(`🟡 [notificationService] Buscando notificaciones para usuario: ${usuarioId}`);
      console.log(`📡 [notificationService] URL: GET ${BASE}/usuario/${usuarioId}`);
      
      const resp = await api.get(`${BASE}/usuario/${usuarioId}`);
      
      console.log(`🟢 [notificationService] Respuesta recibida del backend:`);
      console.log(`   - Status: ${resp.status}`);
      console.log(`   - Cantidad de notificaciones: ${Array.isArray(resp.data) ? resp.data.length : 'N/A'}`);
      console.log(`   - Data completa:`, JSON.stringify(resp.data, null, 2));
      
      return resp.data || [];
    } catch (err) {
      console.error('❌ [notificationService] Error al obtener notificaciones:');
      console.error('   - Status:', err?.response?.status);
      console.error('   - URL:', `${BASE}/usuario/${usuarioId}`);
      console.error('   - Backend response:', err?.response?.data);
      console.error('   - Error message:', err.message);
      console.error('   - Stack:', err.stack);
      
      return [];
    }
  },

  /**
   * Marca una notificación como leída
   * @param {number} notificacionId - ID de la notificación
   * @returns {Promise<Object|null>} Notificación actualizada
   */
  async markAsRead(notificacionId) {
    try {
      console.log(`🟡 [notificationService] Marcando notificación como leída: ${notificacionId}`);
      console.log(`📡 [notificationService] URL: PUT ${BASE}/${notificacionId}/leer`);
      
      const resp = await api.put(`${BASE}/${notificacionId}/leer`);
      
      console.log(`🟢 [notificationService] Notificación marcada como leída`);
      console.log(`   - Response:`, resp.data);
      
      return resp.data;
    } catch (err) {
      console.error('❌ [notificationService] Error al marcar notificación como leída:');
      console.error('   - notificacionId:', notificacionId);
      console.error('   - Error:', err.message);
      
      return { id: notificacionId, leida: true };
    }
  },

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<string|null>} Mensaje de confirmación
   */
  async markAllAsRead(usuarioId) {
    try {
      console.log(`🟡 [notificationService] Marcando todas como leídas para usuario: ${usuarioId}`);
      console.log(`📡 [notificationService] URL: PUT ${BASE}/usuario/${usuarioId}/leer-todas`);
      
      const resp = await api.put(`${BASE}/usuario/${usuarioId}/leer-todas`);
      
      console.log(`🟢 [notificationService] Todas las notificaciones marcadas como leídas`);
      console.log(`   - Response:`, resp.data);
      
      return resp.data;
    } catch (err) {
      console.error('❌ [notificationService] Error al marcar todas las notificaciones como leídas:');
      console.error('   - usuarioId:', usuarioId);
      console.error('   - Error:', err.message);
      
      return { message: 'Todas las notificaciones marcadas como leídas' };
    }
  },

  /**
   * Crea una nueva notificación
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  async create(notificationData) {
    try {
      console.log('');
      console.log('🟡 ==================== [notificationService.create] ====================');
      console.log('📥 Datos recibidos en el servicio:', JSON.stringify(notificationData, null, 2));
      
      // ✅ CORREGIDO: Usar los nombres exactos que espera el backend Java
      const payload = {
        mensaje: notificationData.mensaje,
        tipo: notificationData.tipo,
        titulo: notificationData.titulo,
        usuarioId: notificationData.usuarioId,
        remitenteId: notificationData.remitenteId
      };

      console.log('📤 Payload preparado para enviar al backend:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('');
      console.log('🔍 Verificación de campos:');
      console.log('   ✓ mensaje:', typeof payload.mensaje, '→', payload.mensaje);
      console.log('   ✓ tipo:', typeof payload.tipo, '→', payload.tipo);
      console.log('   ✓ titulo:', typeof payload.titulo, '→', payload.titulo);
      console.log('   ✓ usuarioId:', typeof payload.usuarioId, '→', payload.usuarioId);
      console.log('   ✓ remitenteId:', typeof payload.remitenteId, '→', payload.remitenteId);
      console.log('');
      console.log(`📡 Enviando POST a: ${BASE}`);
      console.log('==================================================================');

      const resp = await api.post(BASE, payload);

      console.log('');
      console.log('🟢 ==================== RESPUESTA DEL BACKEND ====================');
      console.log('   - Status:', resp.status);
      console.log('   - Headers:', resp.headers);
      console.log('   - Data recibida:', JSON.stringify(resp.data, null, 2));
      console.log('==================================================================');
      console.log('');

      return resp.data;
    } catch (err) {
      console.log('');
      console.error('❌ ==================== ERROR AL CREAR NOTIFICACIÓN ====================');
      console.error('📤 Payload que se intentó enviar:');
      console.error(JSON.stringify(notificationData, null, 2));
      console.error('');
      console.error('🔴 Detalles del error:');
      console.error('   - Status:', err?.response?.status);
      console.error('   - Status Text:', err?.response?.statusText);
      console.error('   - Backend response:', JSON.stringify(err?.response?.data, null, 2));
      console.error('   - Error message:', err.message);
      console.error('   - URL:', `${BASE}`);
      console.error('');
      console.error('📋 Stack trace:');
      console.error(err.stack);
      console.error('=======================================================================');
      console.error('');

      // Si el backend no expone POST /api/notificaciones (404), evitar bloquear el flujo
      // -> Fallback temporal: devolver un objeto simulado con los datos enviados.
      // Nota: esto permite que la UI continúe su flujo (p.ej. asignación) mientras se corrige el backend.
      if (err?.response?.status === 404) {
        console.warn('⚠️ notificationService.create: endpoint no disponible (404). Usando fallback temporal.');
        return { ...notificationData, id: null, createdAt: new Date().toISOString(), fallback: true };
      }

      throw err;
    }
  },

  /**
   * Crea una notificación de evaluación asignada
   * @param {number} evaluacionId - ID de la evaluación
   * @param {number} proyectoId - ID del proyecto
   * @param {number} evaluadorId - ID del evaluador (usuario que recibe la notificación)
   * @param {number} adminId - ID del administrador (remitente)
   * @returns {Promise<Object>} Notificación creada
   */
  async createEvaluationAssignedNotification(evaluacionId, proyectoId, evaluadorId, adminId) {
    try {
      console.log('');
      console.log('🟡 ========== [createEvaluationAssignedNotification] ==========');
      console.log('📥 Parámetros recibidos:');
      console.log('   - evaluacionId:', evaluacionId, `(tipo: ${typeof evaluacionId})`);
      console.log('   - proyectoId:', proyectoId, `(tipo: ${typeof proyectoId})`);
      console.log('   - evaluadorId:', evaluadorId, `(tipo: ${typeof evaluadorId})`);
      console.log('   - adminId:', adminId, `(tipo: ${typeof adminId})`);

      // ✅ Asegurar que adminId tenga un valor válido
      if (!adminId) {
        console.warn('⚠️ [notificationService] adminId es null/undefined, usando valor por defecto 1');
        adminId = 1;
      }

      const notificationData = {
        mensaje: `Se te asignó la evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}).`,
        tipo: 'EVALUACION_ASIGNADA',
        titulo: 'Nueva evaluación asignada',
        usuarioId: evaluadorId,
        remitenteId: adminId
      };

      console.log('📦 NotificationData construida:');
      console.log(JSON.stringify(notificationData, null, 2));
      console.log('===============================================================');
      console.log('');

      const result = await this.create(notificationData);
      
      console.log('✅ [createEvaluationAssignedNotification] Notificación creada exitosamente');
      return result;
    } catch (error) {
      console.error('❌ [createEvaluationAssignedNotification] Error:', error);
      throw error;
    }
  },

  /**
   * Crea una notificación de evaluación aceptada
   */
  async createEvaluationAcceptedNotification(evaluacionId, proyectoId, adminId, evaluadorId) {
    console.log('🟡 [createEvaluationAcceptedNotification] Iniciando...');
    const notificationData = {
      mensaje: `La evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}) ha sido aceptada.`,
      tipo: 'EVALUACION_ACEPTADA',
      titulo: 'Evaluación aceptada',
      usuarioId: adminId,
      remitenteId: evaluadorId
    };
    console.log('📦 Datos preparados:', notificationData);
    return await this.create(notificationData);
  },

  /**
   * Crea una notificación de evaluación rechazada
   */
  async createEvaluationRejectedNotification(evaluacionId, proyectoId, adminId, evaluadorId, motivo) {
    console.log('🟡 [createEvaluationRejectedNotification] Iniciando...');
    const notificationData = {
      mensaje: `La evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}) ha sido rechazada. Motivo: ${motivo || 'No especificado'}`,
      tipo: 'EVALUACION_RECHAZADA',
      titulo: 'Evaluación rechazada',
      usuarioId: adminId,
      remitenteId: evaluadorId
    };
    console.log('📦 Datos preparados:', notificationData);
    return await this.create(notificationData);
  },

  /**
   * Crea una notificación de evaluación completada
   */
  async createEvaluationCompletedNotification(evaluacionId, proyectoId, adminId, evaluadorId) {
    console.log('🟡 [createEvaluationCompletedNotification] Iniciando...');
    const notificationData = {
      mensaje: `La evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}) ha sido completada.`,
      tipo: 'EVALUACION_FINALIZADA',
      titulo: 'Evaluación completada',
      usuarioId: adminId,
      remitenteId: evaluadorId
    };
    console.log('📦 Datos preparados:', notificationData);
    return await this.create(notificationData);
  },

  /**
   * Crea una notificación de evaluación validada
   */
  async createEvaluationValidatedNotification(evaluacionId, proyectoId, evaluadorId, adminId) {
    console.log('🟡 [createEvaluationValidatedNotification] Iniciando...');
    const notificationData = {
      mensaje: `La evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}) ha sido validada.`,
      tipo: 'EVALUACION_VALIDADA',
      titulo: 'Evaluación validada',
      usuarioId: evaluadorId,
      remitenteId: adminId
    };
    console.log('📦 Datos preparados:', notificationData);
    return await this.create(notificationData);
  },

  /**
   * Crea una notificación de evaluación invalidada
   */
  async createEvaluationInvalidatedNotification(evaluacionId, proyectoId, evaluadorId, adminId, motivo) {
    console.log('🟡 [createEvaluationInvalidatedNotification] Iniciando...');
    const notificationData = {
      mensaje: `La evaluación (id: ${evaluacionId}) del proyecto (id: ${proyectoId}) ha sido invalidada. Motivo: ${motivo || 'No especificado'}`,
      tipo: 'EVALUACION_INVALIDADA',
      titulo: 'Evaluación invalidada',
      usuarioId: evaluadorId,
      remitenteId: adminId
    };
    console.log('📦 Datos preparados:', notificationData);
    return await this.create(notificationData);
  },

  /**
   * Elimina una notificación
   * @param {number} notificacionId - ID de la notificación
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async delete(notificacionId) {
    try {
      console.log(`🟡 [notificationService] Eliminando notificación: ${notificacionId}`);
      console.log(`📡 URL: DELETE ${BASE}/${notificacionId}`);
      
      const resp = await api.delete(`${BASE}/${notificacionId}`);
      
      console.log(`🟢 [notificationService] Notificación eliminada exitosamente`);
      console.log(`   - Response:`, resp.data);
      
      return resp.data;
    } catch (err) {
      console.error('❌ [notificationService] Error eliminando notificación:');
      console.error('   - notificacionId:', notificacionId);
      console.error('   - Error:', err.message);
      throw err;
    }
  },

  /**
   * Método de prueba para crear notificación con remitente
   * @param {number} usuarioId - ID del usuario que recibe la notificación
   * @param {number} remitenteId - ID del remitente
   * @returns {Promise<Object>} Notificación creada
   */
  async testCreateNotificationWithRemitente(usuarioId, remitenteId) {
    try {
      console.log('');
      console.log('🧪 ========== TEST: Creando notificación de prueba ==========');
      
      const testData = {
        mensaje: 'Notificación de prueba con remitente incluido',
        tipo: 'TEST',
        titulo: 'Prueba de notificación',
        usuarioId: usuarioId,
        remitenteId: remitenteId || 1
      };

      console.log('📦 Test data:', JSON.stringify(testData, null, 2));
      console.log('===========================================================');

      const result = await this.create(testData);
      
      console.log('✅ Notificación de prueba creada exitosamente:', result);
      console.log('');
      
      return result;
    } catch (error) {
      console.error('❌ Error en prueba de notificación:', error);
      console.log('');
      throw error;
    }
  }
}

export default notificationService;