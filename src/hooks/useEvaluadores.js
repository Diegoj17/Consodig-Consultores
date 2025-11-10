import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useEvaluadores = (initialFilters = {}) => {
  const [evaluadores, setEvaluadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchEvaluadores = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const evaluadoresData = await userService.getEvaluadores(currentFilters);
      setEvaluadores(evaluadoresData);
    } catch (err) {
      setError(err.message || 'Error al cargar evaluadores');
      console.error('Error fetching evaluadores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createEvaluador = async (userData) => {
    try {
      setError(null);
      const result = await userService.createEvaluador(userData);
      await fetchEvaluadores();
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Error al crear evaluador';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateEvaluador = async (id, userData) => {
    try {
      setError(null);
      const result = await userService.updateEvaluador(id, userData);
      await fetchEvaluadores();
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar evaluador';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteEvaluador = async (userId) => {
    try {
      setError(null);
      await userService.deactivateEvaluador(userId);
      await fetchEvaluadores();
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar evaluador';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const toggleStatus = async (userId) => {
    try {
      setError(null);
      await userService.toggleEvaluadorStatus(userId);
      await fetchEvaluadores();
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
    fetchEvaluadores();
  }, [fetchEvaluadores]);

  return {
    evaluadores,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    fetchEvaluadores,
    createEvaluador,
    updateEvaluador,
    deleteEvaluador,
    toggleStatus
  };
};