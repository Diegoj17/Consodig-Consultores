// Este módulo se mantiene por compatibilidad pero delega en `userService`.
import userService from './userService';

export const evaluadorService = {
  getEvaluadorById: (id) => userService.getEvaluadorById(id),
  updateEvaluador: (id, payload) => userService.updateEvaluador(id, payload),
};
