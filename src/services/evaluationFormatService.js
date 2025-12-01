// src/services/evaluationFormatService.js
import projectApi from '../api/ProjectAxios';

class EvaluationFormatService {
  
  // Obtener todos los formatos
  async getAllFormats() {
    try {
      console.log('🔄 Obteniendo todos los formatos...');
      const response = await projectApi.get('/formatos');
      console.log('✅ Formatos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching formats:', error);
      throw this.handleError(error);
    }
  }

  // Obtener un formato por ID
  async getFormatById(id) {
    try {
      const response = await projectApi.get(`/formatos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching format ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Crear un nuevo formato
  async createFormat(formatData) {
    try {
      console.log('📤 Creando formato con datos:', formatData);
      
      const payload = this.adaptToBackendFormat(formatData);
      console.log('📦 Payload adaptado para backend:', payload);
      
      const response = await projectApi.post('/formatos', payload);
      console.log('✅ Formato creado exitosamente:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating format:', error);
      console.error('Detalles del error:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Actualizar un formato existente
  async updateFormat(id, formatData) {
    try {
      console.log('🔄 Actualizando formato:', id, formatData);
      const payload = this.adaptToBackendFormat(formatData);
      const response = await projectApi.put(`/formatos/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating format ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Eliminar un formato
  async deleteFormat(id) {
    try {
      console.log('🗑️ Eliminando formato:', id);
      await projectApi.delete(`/formatos/${id}`);
      return { success: true, message: 'Formato eliminado correctamente' };
    } catch (error) {
      console.error(`Error deleting format ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Cambiar estado del formato (activar/desactivar)
  async toggleFormatStatus(id, activo) {
    try {
      console.log('🔘 Cambiando estado del formato:', id, activo);
      const response = await projectApi.put(`/formatos/${id}/estado?activo=${activo}`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling format status ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Adaptar datos del frontend al formato del backend
  adaptToBackendFormat(frontendData) {
    console.log('🔄 Adaptando datos frontend->backend:', frontendData);
    const backendData = {
      nombre: frontendData.nombre?.trim() || '',
      descripcion: frontendData.descripcion?.trim() || '',
      institucion: frontendData.institucion?.trim() || 'Sistema',
      activo: frontendData.estado === 'active',
      // Mapear items y conservar referencia al criterio si existe (criterioId)
      items: frontendData.items?.map((item, index) => ({
        nombre: (item.nombre || '').trim() || `Ítem ${index + 1}`,
        descripcion: (item.descripcion || '').trim() || '',
        peso: parseInt(item.peso) || 0,
        criterioId: item.criterioId || (item.criterio && item.criterio.id) || null
      })) || []
    };

    console.log('📦 Datos adaptados para backend:', backendData);
    return backendData;
  }

  // Adaptar datos del backend al formato del frontend
  adaptToFrontendFormat(backendData) {
    console.log('🔄 Adaptando datos backend->frontend:', backendData);
    
    const frontendData = {
      id: backendData.id,
      nombre: backendData.nombre,
      descripcion: backendData.descripcion,
      areaConocimiento: backendData.areaConocimiento || 'General',
      institucion: backendData.institucion,
      estado: backendData.activo ? 'active' : 'inactive',
      criterios: backendData.items?.length || 0,
      pesoTotal: backendData.items?.reduce((sum, item) => sum + (item.peso || 0), 0) || 0,
      fechaCreacion: backendData.fechaCreacion || new Date().toISOString(),
      creadoPor: backendData.creadoPor || 'Sistema',
      // Para el modal de edición
      items: backendData.items?.map((item, index) => ({
        id: item.id || index + 1,
        nombre: item.nombre,
        descripcion: item.descripcion,
        peso: item.peso,
        tipo: 'calificacion',
        criterioId: item.criterio?.id || item.criterioId || null,
        criterioNombre: item.criterioNombre || (item.criterio && item.criterio.nombre) || null
      })) || []
    };

    console.log('📦 Datos adaptados para frontend:', frontendData);
    return frontendData;
  }

  // Manejo de errores mejorado
  handleError(error) {
    console.error('🔴 Error completo:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`📊 Status: ${status}`, data);
      
      let message = 'Error del servidor';
      
      if (data && typeof data === 'string') {
        message = data;
      } else if (data && data.message) {
        message = data.message;
      } else if (data && data.error) {
        message = data.error;
      }
      
      switch (status) {
        case 400:
          message = `Datos inválidos: ${message}`;
          break;
        case 401:
          message = 'No autorizado. Por favor, inicie sesión nuevamente.';
          break;
        case 403:
          message = 'No tiene permisos para realizar esta acción.';
          break;
        case 404:
          message = 'Recurso no encontrado.';
          break;
        case 409:
          message = 'Conflicto: ' + (message || 'El recurso ya existe.');
          break;
        case 500:
          message = 'Error interno del servidor. Por favor, intente más tarde.';
          break;
        default:
          message = `Error ${status}: ${message}`;
      }
      
      return new Error(message);
      
    } else if (error.request) {
      // La request fue hecha pero no se recibió respuesta
      console.error('🔴 No se recibió respuesta del servidor:', error.request);
      return new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      
    } else {
      // Algo pasó al configurar la request
      console.error('🔴 Error de configuración:', error.message);
      return new Error('Error de configuración: ' + error.message);
    }
  }
}

export default new EvaluationFormatService();