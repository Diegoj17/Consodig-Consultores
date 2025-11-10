import api from "../api/Axios";

export const researchService = {
  async getAll() {
    const { data } = await api.get("/lineas-investigacion/list");
    // Protegemos el mapeo por si llega algo raro
    return Array.isArray(data)
      ? data
          .map((r) => ({
            id: r?.id ?? r?.identificacion ?? r?.identification ?? null,
            nombre: r?.nombre ?? "",
            descripcion: r?.descripcion ?? "",
          }))
          .filter((r) => r.nombre)
      : [];
  },
};

export default researchService;
