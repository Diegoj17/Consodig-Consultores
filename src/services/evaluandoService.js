// Este módulo se mantiene por compatibilidad pero delega en `userService`.
import userService from './userService';

export const evaluandoService = {
  getEvaluandoById: (id) => userService.getEvaluandoById(id),
  updateEvaluando: (id, payload) => userService.updateEvaluando(id, payload),
};
