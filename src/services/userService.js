// src/services/userService.js
import api from "../api/Axios";

const extractEmail = (raw, fallback = "") =>
  typeof raw === "string" ? raw : (raw?.email || raw?.correo || fallback);

export const userService = {
  async getEvaluadores(filters = {}) {
    console.log("🟡 [userService] Iniciando getEvaluadores...");
    
    try {
      const { data } = await api.get("/evaluadores");
      console.log("🟢 [userService] Respuesta cruda de /evaluadores:", data);
      
      let evaluadores = await Promise.all(
        (data || []).map(async (evaluador, index) => {
          console.log(`🔍 [userService] Procesando evaluador ${index}:`, evaluador);
          console.log(`🔍 [userService] lineasInvestigacionEvaluador:`, evaluador.lineasInvestigacionEvaluador);
          console.log(`🔍 [userService] lineasInvestigacion:`, evaluador.lineasInvestigacion);
          console.log(`🔍 [userService] Tipo de lineasInvestigacionEvaluador:`, typeof evaluador.lineasInvestigacionEvaluador);
          
          try {
            // Solo obtener email si es necesario
            const resp = await api.get(`/auth/email/${evaluador.id}`);
            const email = extractEmail(resp.data, evaluador.email || "");
            
            const evaluadorProcesado = { 
              ...evaluador, 
              email,
              // USAR EL CAMPO CORRECTO: lineasInvestigacionEvaluador
              lineasInvestigacion: evaluador.lineasInvestigacionEvaluador || evaluador.lineasInvestigacion || [] 
            };
            
            console.log(`✅ [userService] Evaluador ${index} procesado:`, evaluadorProcesado);
            return evaluadorProcesado;
            
          } catch (e) {
            console.error(`❌ [userService] Error en evaluador ${evaluador.id}:`, e);
            const evaluadorFallback = { 
              ...evaluador, 
              email: evaluador.email || "", 
              lineasInvestigacion: evaluador.lineasInvestigacionEvaluador || evaluador.lineasInvestigacion || [] 
            };
            console.log(`🟠 [userService] Evaluador ${index} fallback:`, evaluadorFallback);
            return evaluadorFallback;
          }
        })
      );

      console.log("📊 [userService] Evaluadores después de procesar:", evaluadores);

      // filtros
      if (filters.search) {
        const q = filters.search.toLowerCase();
        evaluadores = evaluadores.filter((e) =>
          [e.nombre, e.apellido, e.email, e.afiliacionInstitucional]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q))
        );
        console.log("🔍 [userService] Después de filtro search:", evaluadores);
      }
      
      if (filters.status && filters.status !== "all") {
        const map = { active: "ACTIVO", inactive: "INACTIVO" };
        evaluadores = evaluadores.filter((e) => e.estado === map[filters.status]);
        console.log("🔍 [userService] Después de filtro status:", evaluadores);
      }

      // normalizar
      const resultadoFinal = evaluadores.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        email: e.email,
        afiliacionInstitucional: e.afiliacionInstitucional,
        cvlac: e.cvlac,
        googleScholar: e.googleScholar,
        orcid: e.orcid,
        nivelEducativo: e.nivelEducativo,
        lineasInvestigacion: e.lineasInvestigacion, // ← ESTE AHORA TIENE LOS DATOS DE lineasInvestigacionEvaluador
        estado: e.estado || "ACTIVO",
        role: "evaluador",
        registrationDate: e.fechaRegistro || e.registrationDate || new Date().toISOString(),
      }));

      console.log("🎯 [userService] Resultado final normalizado:", resultadoFinal);
      console.log("🎯 [userService] Primer evaluador líneas investigación:", resultadoFinal[0]?.lineasInvestigacion);
      
      return resultadoFinal;
      
    } catch (error) {
      console.error("❌ [userService] Error en getEvaluadores:", error);
      return [];
    }
  },

  async getEvaluandos(filters = {}) {
    console.log("🟡 [userService] Iniciando getEvaluandos...");
    
    try {
      const { data } = await api.get("/evaluandos");
      console.log("🟢 [userService] Respuesta cruda de /evaluandos:", data);
      
      let evaluandos = await Promise.all(
        (data || []).map(async (ev, index) => {
          console.log(`🔍 [userService] Procesando evaluando ${index}:`, ev);
          console.log(`🔍 [userService] Líneas de investigación del evaluando ${index}:`, ev.lineasInvestigacionEvaluador || ev.lineasInvestigacion);
          
          try {
            const resp = await api.get(`/auth/email/${ev.id}`);
            const email = extractEmail(resp.data, ev.email || "");
            
            const evaluandoProcesado = { 
              ...ev, 
              email,
              lineasInvestigacion: ev.lineasInvestigacionEvaluador || ev.lineasInvestigacion || [] 
            };
            
            console.log(`✅ [userService] Evaluando ${index} procesado:`, evaluandoProcesado);
            return evaluandoProcesado;
            
          } catch (e) {
            console.error(`❌ [userService] Error en evaluando ${ev.id}:`, e);
            const evaluandoFallback = { 
              ...ev, 
              email: ev.email || "", 
              lineasInvestigacion: ev.lineasInvestigacionEvaluador || ev.lineasInvestigacion || [] 
            };
            console.log(`🟠 [userService] Evaluando ${index} fallback:`, evaluandoFallback);
            return evaluandoFallback;
          }
        })
      );

      console.log("📊 [userService] Evaluandos después de procesar:", evaluandos);

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

      const resultadoFinal = evaluandos.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        email: e.email,
        telefono: e.telefono,
        nivelEducativo: e.nivelEstudios || e.nivelEducativo,
        lineasInvestigacion: e.lineasInvestigacion,
        estado: e.estado,
        role: "evaluando",
        registrationDate: e.fechaRegistro || e.registrationDate || new Date().toISOString(),
      }));

      console.log("🎯 [userService] Resultado final evaluandos:", resultadoFinal);
      return resultadoFinal;
      
    } catch (error) {
      console.error("❌ [userService] Error en getEvaluandos:", error);
      return [];
    }
  },

  async getEvaluadorById(id) {
    console.log(`🟡 [userService] getEvaluadorById para ID: ${id}`);
    
    try {
      const { data: evaluador } = await api.get(`/evaluadores/${id}`);
      console.log(`🟢 [userService] Respuesta de /evaluadores/${id}:`, evaluador);
      console.log(`🔍 [userService] lineasInvestigacionEvaluador:`, evaluador.lineasInvestigacionEvaluador);
      
      try {
        const { data } = await api.get(`/auth/email/${id}`);
        evaluador.email = extractEmail(data, evaluador.email);
      } catch (emailError) {
        console.log(`🟠 [userService] Error obteniendo email:`, emailError);
      }
      
      // USAR EL CAMPO CORRECTO
      evaluador.lineasInvestigacion = evaluador.lineasInvestigacionEvaluador || evaluador.lineasInvestigacion || [];
      console.log(`✅ [userService] Evaluador final:`, evaluador);
      
      return evaluador;
      
    } catch (error) {
      console.error(`❌ [userService] Error en getEvaluadorById:`, error);
      throw error;
    }
  },

  // Obtener archivos/metadatos subidos por el evaluador
  async getEvaluadorArchivos(evaluadorId) {
    console.log(`🟡 [userService] getEvaluadorArchivos para ID: ${evaluadorId}`);
    try {
      const { data } = await api.get(`/evaluadores/${evaluadorId}/archivos`);
      console.log('🟢 [userService] Archivos recibidos (raw):', data);

      if (!data) return null;

      // Normalizar nombres de campos que pueden venir en snake_case desde el backend
      const normalize = (d) => ({
        id: d.id || d.ID || d.Id,
        fotocopiaUrl: d.fotocopiaUrl || d.fotocopia_url || d.fotocopia || null,
        fotocopiaPublicId: d.fotocopiaPublicId || d.fotocopia_public_id || d.fotocopiaPublicId || null,
        certificadosUrl: d.certificadosUrl || d.certificados_url || d.certificados || null,
        certificadosPublicId: d.certificadosPublicId || d.certificados_public_id || null,
        cuentaBancariaUrl: d.cuentaBancariaUrl || d.cuenta_bancaria_url || d.cuentaBancaria || null,
        cuentaBancariaPublicId: d.cuentaBancariaPublicId || d.cuenta_bancaria_public_id || null,
        created_at: d.created_at || d.createdAt || d.created || null,
        updated_at: d.updated_at || d.updatedAt || d.updated || null,
        evaluadorId: d.evaluadorId || d.evaluador_id || d.evaluadorId || null,
        // Mantener la estructura original en `remote` por si se necesita
        remote: d
      });

      const normalized = normalize(data);
      console.log('🟢 [userService] Archivos normalizados:', normalized);
      return normalized;
    } catch (error) {
      console.error('❌ [userService] Error en getEvaluadorArchivos:', error);
      throw error;
    }
  },

  // Subir/actualizar archivos de un evaluador (multipart)
  async uploadEvaluadorArchivos(evaluadorId, files = {}) {
    console.log(`🟡 [userService] uploadEvaluadorArchivos evaluador=${evaluadorId}`, files);
    try {
      const form = new FormData();
      // Adjuntar archivos reales si están presentes
      if (files.fotocopiaDocumento) form.append('fotocopiaDocumento', files.fotocopiaDocumento);
      if (files.certificadosEstudios) form.append('certificadosEstudios', files.certificadosEstudios);
      if (files.certificadoCuentaBancaria) form.append('certificadoCuentaBancaria', files.certificadoCuentaBancaria);

      const ensurePart = (key) => {
        // Si la clave ya está en el form, no hacemos nada
        if ([...form.keys()].includes(key)) return;
        // Añadir un Blob vacío con un nombre de archivo para que Spring lo vea como MultipartFile
        form.append(key, new Blob([], { type: 'application/octet-stream' }), 'empty');
        console.log(`🟡 [userService] Añadida parte vacía para '${key}' (placeholder)`);
      };

      ensurePart('fotocopiaDocumento');
      ensurePart('certificadosEstudios');
      ensurePart('certificadoCuentaBancaria');
      // Intento: usar POST por defecto (crear). No forzar 'Content-Type' — axios/Browser añadirá el boundary.
      // Si POST falla (p.ej. 400), intentar PUT como fallback (algunos backends esperan PUT para actualizar/crear).
      try {
        const { data } = await api.post(`/evaluadores/${evaluadorId}/archivos`, form);
        console.log('🟢 [userService] POST /evaluadores/{id}/archivos OK', data);
        return data;
      } catch (postErr) {
        console.warn('🟠 [userService] POST falló, intentando PUT. Error:', postErr?.response?.status, postErr?.response?.data || postErr.message);
        try {
          const { data } = await api.put(`/evaluadores/${evaluadorId}/archivos`, form);
          console.log('🟢 [userService] PUT /evaluadores/{id}/archivos OK', data);
          return data;
        } catch (putErr) {
          console.error('❌ [userService] PUT también falló:', putErr?.response?.status, putErr?.response?.data || putErr.message);
          // Re-lanzar el error original del POST para que el UI lo maneje (más probable causa de 400)
          throw postErr;
        }
      }
    } catch (error) {
      console.error('❌ [userService] Error en uploadEvaluadorArchivos:', error);
      throw error;
    }
  },

  // Aceptar un archivo de un evaluador (endpoint admin esperado)
  async acceptArchivo(evaluadorId, tipo) {
    console.log(`🟡 [userService] acceptArchivo evaluador=${evaluadorId} tipo=${tipo}`);
    try {
      // Intentar endpoint estandar en /evaluadores
      const { data } = await api.post(`/evaluadores/${evaluadorId}/archivos/${tipo}/aceptar`);
      return data;
    } catch (error) {
      console.error('❌ [userService] Error en acceptArchivo:', error);
      throw error;
    }
  },

  // Rechazar un archivo de un evaluador (endpoint admin esperado)
  async rejectArchivo(evaluadorId, tipo) {
    console.log(`🟡 [userService] rejectArchivo evaluador=${evaluadorId} tipo=${tipo}`);
    try {
      const { data } = await api.post(`/evaluadores/${evaluadorId}/archivos/${tipo}/rechazar`);
      return data;
    } catch (error) {
      console.error('❌ [userService] Error en rejectArchivo:', error);
      throw error;
    }
  },

  async getAdminById(id) {
    console.log(`🟡 [userService] getAdminById para ID: ${id}`);
    try {
      const { data: admin } = await api.get(`/admin/${id}`);
      console.log(`🟢 [userService] Respuesta de /admin/${id}:`, admin);
      return admin;
    } catch (error) {
      console.error(`❌ [userService] Error en getAdminById:`, error);
      throw error;
    }
  },

  async updateAdmin(id, userData) {
    console.log("🟡 [userService] Actualizando admin ID:", id, "Datos:", userData);
    try {
      const payload = {
        ...userData,
        ...(userData.password ? { password: userData.password } : {})
      };
      console.log("🟢 [userService] Payload final para backend (admin):", payload);
      const { data } = await api.put(`/admin/${id}`, payload);
      return data;
    } catch (error) {
      console.error("❌ [userService] Error en updateAdmin:", error);
      throw error;
    }
  },

  async getEvaluandoById(id) {
    console.log(`🟡 [userService] getEvaluandoById para ID: ${id}`);
    
    try {
      const { data: evaluando } = await api.get(`/evaluandos/${id}`);
      console.log(`🟢 [userService] Respuesta de /evaluandos/${id}:`, evaluando);
      console.log(`🔍 [userService] lineasInvestigacionEvaluador:`, evaluando.lineasInvestigacionEvaluador);
      
      try {
        const { data } = await api.get(`/auth/email/${id}`);
        evaluando.email = extractEmail(data, evaluando.email);
      } catch (emailError) {
        console.log(`🟠 [userService] Error obteniendo email para evaluando ${id}:`, emailError);
      }
      
      // USAR EL CAMPO CORRECTO
      evaluando.lineasInvestigacion = evaluando.lineasInvestigacionEvaluador || evaluando.lineasInvestigacion || [];
      console.log(`✅ [userService] Evaluando final:`, evaluando);
      
      return evaluando;
      
    } catch (error) {
      console.error(`❌ [userService] Error en getEvaluandoById:`, error);
      throw error;
    }
  },

  async createEvaluador(userData) {
    console.log("🟡 [userService] Enviando datos para crear evaluador:", userData);
    
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
      lineasInvestigacionIds: userData.lineaInvestigacionIds || [],
      password: userData.password,
      estado: "ACTIVO",
    };
    
    console.log("🟢 [userService] Payload final:", payload);
    const { data } = await api.post("/evaluadores", payload);
    return data;
  },

  async createEvaluando(userData) {
    console.log("🟡 [userService] Enviando datos para crear evaluando:", userData);
    
    const payload = {
      nombre: userData.nombre,
      telefono: userData.telefono,
      email: userData.email,
      nivelEducativo: userData.nivelEducativo,
      lineasInvestigacion: userData.lineasInvestigacion,
      lineaInvestigacionIds: userData.lineaInvestigacionIds || [],
      password: userData.password,
      estado: "ACTIVO",
    };
    
    console.log("🟢 [userService] Payload final:", payload);
    const { data } = await api.post("/evaluandos", payload);
    return data;
  },

  async updateEvaluador(id, userData) {
    console.log("🟡 [userService] Actualizando evaluador ID:", id, "Datos:", userData);
    
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
      lineasInvestigacionIds: userData.lineasInvestigacionIds || [],
      ...(userData.password && { password: userData.password }),
    };
    
    console.log("🟢 [userService] Payload final para backend:", payload);
    const { data } = await api.put(`/evaluadores/${id}`, payload);
    return data;
  },

  async updateEvaluando(id, userData) {
    console.log("🟡 [userService] Actualizando evaluando ID:", id, "Datos:", userData);
    
    const payload = {
      nombre: userData.nombre,
      telefono: userData.telefono,
      email: userData.email,
      nivelEducativo: userData.nivelEducativo,
      lineasInvestigacion: userData.lineasInvestigacion,
      lineasInvestigacionIds: userData.lineaInvestigacionIds || [],
      ...(userData.password && { password: userData.password }),
    };
    
    console.log("🟢 [userService] Payload final:", payload);
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },

  async toggleEvaluadorStatus(id) {
    console.log(`🔄 [userService] toggleEvaluadorStatus para ID: ${id}`);
    const evaluador = await this.getEvaluadorById(id);
    const nuevoEstado = evaluador.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    
    const payload = {
      ...evaluador,
      estado: nuevoEstado
    };
    
    console.log(`🔄 [userService] Cambiando estado del evaluador ${id} a: ${nuevoEstado}`);
    const { data } = await api.put(`/evaluadores/${id}`, payload);
    return data;
  },

  async toggleEvaluandoStatus(id) {
    console.log(`🔄 [userService] toggleEvaluandoStatus para ID: ${id}`);
    const evaluando = await this.getEvaluandoById(id);
    const nuevoEstado = evaluando.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    
    const payload = {
      ...evaluando,
      estado: nuevoEstado
    };
    
    console.log(`🔄 [userService] Cambiando estado del evaluando ${id} a: ${nuevoEstado}`);
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },

  async deactivateEvaluador(id) {
    console.log(`🔴 [userService] Desactivando evaluador: ${id}`);
    const { data } = await api.put(`/evaluadores/${id}/deactivate`);
    return data;
  },

  async deactivateEvaluando(id) {
    console.log(`🔴 [userService] Desactivando evaluando: ${id}`);
    const { data } = await api.put(`/evaluandos/${id}/deactivate`);
    return data;
  },

  async activateEvaluador(id) {
    console.log(`🟢 [userService] Activando evaluador: ${id}`);
    const evaluador = await this.getEvaluadorById(id);
    const payload = {
      ...evaluador,
      estado: "ACTIVO"
    };
    
    const { data } = await api.put(`/evaluadores/${id}`, payload);
    return data;
  },

  async activateEvaluando(id) {
    console.log(`🟢 [userService] Activando evaluando: ${id}`);
    const evaluando = await this.getEvaluandoById(id);
    const payload = {
      ...evaluando,
      estado: "ACTIVO"
    };
    
    const { data } = await api.put(`/evaluandos/${id}`, payload);
    return data;
  },
};

export default userService;