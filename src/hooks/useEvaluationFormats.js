import { useState, useEffect, useCallback } from 'react';
import EvaluationFormatService from '../services/evaluationFormatService';

export const useEvaluationFormats = () => {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper para normalizar mensajes de error
  const extractErrorMessage = (err) => {
    if (!err) return 'Error desconocido';
    if (typeof err === 'string') return err;
    return err.message || (err.response && err.response.data && err.response.data.message) || JSON.stringify(err);
  };

  // Cargar todos los formatos
  const loadFormats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando formatos desde el backend...');
      const backendFormats = await EvaluationFormatService.getAllFormats();
      console.log('✅ Formatos recibidos del backend:', backendFormats);

      const adaptedFormats = Array.isArray(backendFormats)
        ? backendFormats.map(format => EvaluationFormatService.adaptToFrontendFormat(format)).filter(Boolean)
        : [];

      setFormats(adaptedFormats);
      console.log(`📊 ${adaptedFormats.length} formatos cargados`);
      return adaptedFormats;
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('❌ Error cargando formatos:', msg, err);
      setError(msg);

      // Si es 404, puede ser que no hay formatos
      if (msg.includes('404') || msg.toLowerCase().includes('no encontrado') || msg.toLowerCase().includes('not found')) {
        console.log('📭 No hay formatos, iniciando con lista vacía');
        setFormats([]);
        setError(null);
        return [];
      }

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo formato
  const createFormat = async (formatData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📝 Creando formato con datos:', formatData);
      const newFormat = await EvaluationFormatService.createFormat(formatData);
      const adaptedFormat = EvaluationFormatService.adaptToFrontendFormat(newFormat);
      setFormats(prev => [...prev, adaptedFormat]);
      console.log('✅ Formato creado exitosamente:', adaptedFormat);
      return adaptedFormat;
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('❌ Error creando formato:', msg, err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar formato
  const updateFormat = async (id, formatData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔁 Actualizando formato:', id, formatData);
      const updatedFormat = await EvaluationFormatService.updateFormat(id, formatData);
      const adaptedFormat = EvaluationFormatService.adaptToFrontendFormat(updatedFormat);
      setFormats(prev => prev.map(f => (f.id === id ? adaptedFormat : f)));
      console.log('✅ Formato actualizado:', adaptedFormat);
      return adaptedFormat;
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('❌ Error actualizando formato:', msg, err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar formato
  const deleteFormat = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Eliminando formato:', id);
      await EvaluationFormatService.deleteFormat(id);
      setFormats(prev => prev.filter(f => f.id !== id));
      console.log('✅ Formato eliminado:', id);
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('❌ Error eliminando formato:', msg, err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado del formato
  const toggleFormatStatus = async (id, activo) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔀 Cambiando estado del formato:', id, activo);
      const resp = await EvaluationFormatService.toggleFormatStatus(id, activo);
      // Intentar obtener la representación actualizada del backend
      const adapted = resp ? EvaluationFormatService.adaptToFrontendFormat(resp) : null;
      setFormats(prev => prev.map(f => (f.id === id ? (adapted || { ...f, estado: activo ? 'active' : 'inactive' }) : f)));
      console.log('✅ Estado actualizado para formato', id, '->', activo);
      return adapted || true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('❌ Error cambiando estado del formato:', msg, err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar formatos al inicializar
  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  return {
    formats,
    loading,
    error,
    loadFormats,
    createFormat,
    updateFormat,
    deleteFormat,
    toggleFormatStatus
  };
};