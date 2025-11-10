import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useEvaluandos = (initialFilters = {}) => {
  const [evaluandos, setEvaluandos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchEvaluandos = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const evaluandosData = await userService.getEvaluandos(currentFilters);
      setEvaluandos(evaluandosData);
    } catch (err) {
      setError(err.message || 'Error al cargar evaluandos');
      console.error('Error fetching evaluandos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createEvaluando = async (userData) => {
    try {
      setError(null);
      const result = await userService.createEvaluando(userData);
      await fetchEvaluandos();
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Error al crear evaluando';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateEvaluando = async (id, userData) => {
    try {
      setError(null);
      const result = await userService.updateEvaluando(id, userData);
      await fetchEvaluandos();
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar evaluando';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteEvaluando = async (userId) => {
    try {
      setError(null);
      await userService.deactivateEvaluando(userId);
      await fetchEvaluandos();
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar evaluando';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const toggleStatus = async (userId) => {
    try {
      setError(null);
      await userService.toggleEvaluandoStatus(userId);
      await fetchEvaluandos();
    } catch (err) {
      const errorMsg = err.message || 'Error al cambiar estado';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Actualizar filtros y recargar datos
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    fetchEvaluandos();
  }, [fetchEvaluandos]);

  return {
    evaluandos,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    fetchEvaluandos,
    createEvaluando,
    updateEvaluando,
    deleteEvaluando,
    toggleStatus
  };
};