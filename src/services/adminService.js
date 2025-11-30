// Este módulo se mantiene por compatibilidad pero delega en `userService`.
import userService from './userService';

export const adminService = {
  getAdminById: (id) => userService.getAdminById(id),
  updateAdmin: (id, payload) => userService.updateAdmin(id, payload),
};
