// src/services/criterioService.js
import projectApi from '../api/ProjectAxios';

class CriterioService {
  async getAll() {
    try {
      const response = await projectApi.get('/criterios');
      return response.data;
    } catch (error) {
      console.error('Error fetching criterios:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await projectApi.get(`/criterios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching criterio ${id}:`, error);
      throw error;
    }
  }

  async create(dto) {
    try {
      const response = await projectApi.post('/criterios', dto);
      return response.data;
    } catch (error) {
      console.error('Error creating criterio:', error);
      throw error;
    }
  }

  async update(id, dto) {
    try {
      const response = await projectApi.put(`/criterios/${id}`, dto);
      return response.data;
    } catch (error) {
      console.error(`Error updating criterio ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await projectApi.delete(`/criterios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting criterio ${id}:`, error);
      throw error;
    }
  }
}

export default new CriterioService();
