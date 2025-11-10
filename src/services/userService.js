// src/services/userService.js
import api from "../api/Axios";

const extractEmail = (raw, fallback = "") =>
  typeof raw === "string" ? raw : (raw?.email || raw?.correo || fallback);

export const userService = {
  async getEvaluadores(filters = {}) {
    const { data } = await api.get("/evaluadores");
    let evaluadores = await Promise.all(
      (data || []).map(async (evaluador) => {
        try {
          // Obtener email
          const resp = await api.get(`/auth/email/${evaluador.id}`);
          const email = extractEmail(resp.data, evaluador.email || "");
          
          // Obtener líneas de investigación
          let lineasInvestigacion = [];
          try {
            const lineasResp = await api.get(`/evaluadores/${evaluador.id}/lineas-investigacion`);
            lineasInvestigacion = lineasResp.data || [];
          } catch (e) {
            console.error(`Error obteniendo líneas para evaluador ${evaluador.id}:`, e);
          }
          
          return { 
            ...evaluador, 
            email,
            lineasInvestigacion // ← AQUÍ SE CARGAN LAS LÍNEAS
          };
        } catch (e) {
          console.error(`Account ${evaluador.id}:`, e);
          return { 
            ...evaluador, 
            email: evaluador.email || "", 
            lineasInvestigacion: [] 
          };
        }
      })
    );

    // filtros
    if (filters.search) {
      const q = filters.search.toLowerCase();
      evaluadores = evaluadores.filter((e) =>
        [e.nombre, e.apellido, e.email, e.afiliacionInstitucional]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q))
      );
    }
    if (filters.status && filters.status !== "all") {
      const map = { active: "ACTIVO", inactive: "INACTIVO" };
      evaluadores = evaluadores.filter((e) => e.estado === map[filters.status]);
    }

    // normalizar
    return evaluadores.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      email: e.email,
      afiliacionInstitucional: e.afiliacionInstitucional,
      cvlac: e.cvlac,
      googleScholar: e.googleScholar,
      orcid: e.orcid,
      nivelEducativo: e.nivelEducativo,
      lineasInvestigacion: e.lineasInvestigacion, // ← SE INCLUYEN LAS LÍNEAS
      estado: e.estado || "ACTIVO",
      role: "evaluador",
      registrationDate: e.fechaRegistro || e.registrationDate || new Date().toISOString(),
    }));
  },

  async getEvaluandos(filters = {}) {
    const { data } = await api.get("/evaluandos");
    let evaluandos = await Promise.all(
      (data || []).map(async (ev) => {
        try {
          const resp = await api.get(`/auth/email/${ev.id}`);
          const email = extractEmail(resp.data, ev.email || "");
          
          // Obtener líneas de investigación para evaluandos también
          let lineasInvestigacion = [];
          try {
            const lineasResp = await api.get(`/evaluandos/${ev.id}/lineas-investigacion`);
            lineasInvestigacion = lineasResp.data || [];
          } catch (e) {
            console.error(`Error obteniendo líneas para evaluando ${ev.id}:`, e);
          }
          
          return { 
            ...ev, 
            email,
            lineasInvestigacion // ← AQUÍ SE CARGAN LAS LÍNEAS
          };
        } catch (e) {
          console.error(`Account ${ev.id}:`, e);
          return { 
            ...ev, 
            email: ev.email || "", 
            lineasInvestigacion: [] 
          };
        }
      })
    );

    if (filters.search) {
      const q = filters.search.toLowerCase();
      evaluandos = evaluandos.filter((e) =>
        [e.nombre, e.email].filter(Boolean).some((v) => v.toLowerCase().includes(q))
      );
    }
    if (filters.status && filters.status !== "all") {
      const map = { active: "ACTIVO", inactive: "INACTIVO" };
      evaluandos = evaluandos.filter((e) => e.estado === map[filters.status]);
    }

    return evaluandos.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      email: e.email,
      telefono: e.telefono,
      nivelEducativo: e.nivelEstudios || e.nivelEducativo,
      lineasInvestigacion: e.lineasInvestigacion, // ← SE INCLUYEN LAS LÍNEAS
      estado: e.estado,
      role: "evaluando",
      registrationDate: e.fechaRegistro || e.registrationDate || new Date().toISOString(),
    }));
  },

  async getEvaluadorById(id) {
    const { data: evaluador } = await api.get(`/evaluadores/${id}`);
    try {
      const { data } = await api.get(`/auth/email/${id}`);
      evaluador.email = extractEmail(data, evaluador.email);
    } catch {}
    
    // Cargar líneas de investigación para el evaluador específico
    try {
      const { data: lineas } = await api.get(`/evaluadores/${id}/lineas-investigacion`);
      evaluador.lineasInvestigacion = lineas || [];
    } catch (e) {
      console.error(`Error obteniendo líneas para evaluador ${id}:`, e);
      evaluador.lineasInvestigacion = [];
    }
    
    return evaluador;
  },

  async getEvaluandoById(id) {
    const { data: evaluando } = await api.get(`/evaluandos/${id}`);
    try {
      const { data } = await api.get(`/auth/email/${id}`);
      evaluando.email = extractEmail(data, evaluando.email);
    } catch { }
    
    // Cargar líneas de investigación para el evaluando específico
    try {
      const { data: lineas } = await api.get(`/evaluandos/${id}/lineas-investigacion`);
      evaluando.lineasInvestigacion = lineas || [];
    } catch (e) {
      console.error(`Error obteniendo líneas para evaluando ${id}:`, e);
      evaluando.lineasInvestigacion = [];
    }
    
    return evaluando;
  },

  async createEvaluador(userData) {
    console.log("🟡 Enviando datos para crear evaluador:", userData);
    
    const payload = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      afiliacionInstitucional: userData.afiliacionInstitucional,
      cvlac: userData.cvlac,
      googleScholar: userData.googleScholar,
      orcid: userData.orcid,
      nivelEducativo: userData.nivelEducativo,
      lineasInvestigacion: userData.lineasInvestigacion, // string legacy
      lineasInvestigacionIds: userData.lineaInvestigacionIds || [], // Asegurar que sea array
      password: userData.password,
      estado: "ACTIVO",
    };
    
    console.log("🟢 Payload final:", payload);
    const { data } = await api.post("/evaluadores", payload);
    return data;
  },

  async createEvaluando(userData) {
    console.log("🟡 Enviando datos para crear evaluando:", userData);
    
    const payload = {
      nombre: userData.nombre,
      telefono: userData.telefono,
      email: userData.email,
      nivelEducativo: userData.nivelEducativo,
      lineasInvestigacion: userData.lineasInvestigacion, // string legacy
      lineaInvestigacionIds: userData.lineaInvestigacionIds || [], // Asegurar que sea array
      password: userData.password,
      estado: "ACTIVO",
    };
    
    console.log("🟢 Payload final:", payload);
    const { data } = await api.post("/evaluandos", payload);
    return data;
  },

  async updateEvaluador(id, userData) {
  console.log("🟡 Actualizando evaluador ID:", id, "Datos:", userData);
  console.log("🟡 LineasInvestigacionIds recibidos:", userData.lineasInvestigacionIds);
  
  const payload = {
    nombre: userData.nombre,
    apellido: userData.apellido,
    email: userData.email,
    afiliacionInstitucional: userData.afiliacionInstitucional,
    cvlac: userData.cvlac,
    googleScholar: userData.googleScholar,
    orcid: userData.orcid,
    nivelEducativo: userData.nivelEducativo,
    lineasInvestigacion: userData.lineasInvestigacion,
    lineasInvestigacionIds: userData.lineasInvestigacionIds || [], // ← Asegurar que no sea undefined
    ...(userData.password && { password: userData.password }),
  };
  
  console.log("🟢 Payload final para backend:", payload);
  const { data } = await api.put(`/evaluadores/${id}`, payload);
  return data;
},

  async updateEvaluando(id, userData) {
    console.log("🟡 Actualizando evaluando ID:", id, "Datos:", userData);
    
    const payload = {
      nombre: userData.nombre,
      telefono: userData.telefono,
      email: userData.email,
      nivelEducativo: userData.nivelEducativo,
      lineasInvestigacion: userData.lineasInvestigacion, // string legacy
      lineasInvestigacionIds: userData.lineaInvestigacionIds || [], // Asegurar que sea array
      ...(userData.password && { password: userData.password }),
    };
    
    console.log("🟢 Payload final:", payload);
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },

  async toggleEvaluadorStatus(id) {
    const evaluador = await this.getEvaluadorById(id);
    const nuevoEstado = evaluador.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    
    const payload = {
      ...evaluador,
      estado: nuevoEstado
    };
    
    console.log(`🔄 Cambiando estado del evaluador ${id} a: ${nuevoEstado}`);
    const { data } = await api.put(`/evaluadores/${id}`, payload);
    return data;
  },

  async toggleEvaluandoStatus(id) {
    const evaluando = await this.getEvaluandoById(id);
    const nuevoEstado = evaluando.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    
    const payload = {
      ...evaluando,
      estado: nuevoEstado
    };
    
    console.log(`🔄 Cambiando estado del evaluando ${id} a: ${nuevoEstado}`);
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },

  async deactivateEvaluador(id) {
    console.log(`🔴 Desactivando evaluador: ${id}`);
    const { data } = await api.put(`/evaluadores/${id}/deactivate`);
    return data;
  },

  async deactivateEvaluando(id) {
    console.log(`🔴 Desactivando evaluando: ${id}`);
    const { data } = await api.put(`/evaluandos/${id}/deactivate`);
    return data;
  },

  async activateEvaluador(id) {
    const evaluador = await this.getEvaluadorById(id);
    const payload = {
      ...evaluador,
      estado: "ACTIVO"
    };
    
    console.log(`🟢 Activando evaluador: ${id}`);
    const { data } = await api.put(`/evaluadores/${id}`, payload);
    return data;
  },

  async activateEvaluando(id) {
    const evaluando = await this.getEvaluandoById(id);
    const payload = {
      ...evaluando,
      estado: "ACTIVO"
    };
    
    console.log(`🟢 Activando evaluando: ${id}`);
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },
};
export default userService;