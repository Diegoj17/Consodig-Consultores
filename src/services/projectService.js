import projectApi from "../api/ProjectAxios";
import { researchService } from './researchService';
import { userService } from './userService'; // ✅ Importar userService

export const projectService = {
  async getAll() {
    try {
      const { data } = await projectApi.get("/proyectos");
      console.log("🟢 [projectService] Proyectos obtenidos (crudos):", data);
      
      const cleanedData = this.cleanCircularReferences(data);
      console.log("🟢 [projectService] Proyectos limpiados:", cleanedData);
      
      // Obtener todas las líneas de investigación desde el servicio de usuarios
      const allResearchLines = await researchService.getAll();
      console.log("🟢 [projectService] Líneas disponibles:", allResearchLines);
      
      // Mapear proyectos con nombres de líneas y normalizar nivel de estudios
      const projectsWithLineNames = cleanedData.map(project => {
        return this.normalizeProject(project, allResearchLines);
      });
      
      console.log("🟢 [projectService] Proyectos mapeados:", projectsWithLineNames);
      return projectsWithLineNames;
      
    } catch (error) {
      console.error("❌ [projectService] Error obteniendo proyectos:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { data } = await projectApi.get(`/proyectos/${id}`);
      console.log("🟢 [projectService] Proyecto obtenido:", data);
      
      const cleanedData = this.cleanCircularReferences(data);
      
      // Obtener líneas de investigación para mapear
      const allResearchLines = await researchService.getAll();
      
      const projectWithLineNames = this.normalizeProject(cleanedData, allResearchLines);
      
      console.log("🟢 [projectService] Proyecto con líneas mapeadas:", projectWithLineNames);
      return projectWithLineNames;
      
    } catch (error) {
      console.error("❌ [projectService] Error obteniendo proyecto:", error);
      throw error;
    }
  },

  // Función centralizada para normalizar un proyecto
  normalizeProject(project, allResearchLines = []) {
    // Extraer y normalizar líneas de investigación
    const { lineIds, lineObjects, lineNames } = this.extractResearchLines(project, allResearchLines);
    
    // Normalizar nivel de estudios
    const nivelEstudios = this.normalizeNivelEstudios(project);
    
    return {
      ...project,
      lineasInvestigacionIds: lineIds,
      lineasInvestigacion: lineObjects,
      lineasInvestigacionNames: lineNames,
      nivelEstudios: nivelEstudios,
      archivos: this.cleanArchivos(project.archivos)
    };
  },

  // Función para extraer y normalizar líneas de investigación
  extractResearchLines(project, allResearchLines = []) {
    // Buscar posibles claves que contengan líneas de investigación
    const candidateLineKeys = [
      'lineasInvestigacionIds',
      'lineasIds',
      'lineas_investigacion_ids',
      'lineas_investigacion',
      'lineas',
      'lineasInvestigacion',
      'lineasId',
      'lineasInvestigacionId'
    ];

    let rawLineVal = null;
    let foundKey = null;
    
    for (const k of candidateLineKeys) {
      if (project && project[k] !== undefined && project[k] !== null) {
        rawLineVal = project[k];
        foundKey = k;
        console.log(`🔍 [projectService] Líneas encontradas en '${k}':`, rawLineVal);
        break;
      }
    }

    // Inicializar valores por defecto
    let lineIds = [];
    let lineObjects = [];
    let lineNames = [];

    if (!rawLineVal) {
      console.warn('⚠️ [projectService] No se encontraron líneas de investigación en el proyecto');
      return { lineIds, lineObjects, lineNames };
    }

    // Normalizar rawLineVal a array de IDs
    if (Array.isArray(rawLineVal)) {
      lineIds = rawLineVal.map(item => {
        if (item === null || item === undefined) return null;
        if (typeof item === 'object') {
          // Si es un objeto completo con nombre, guardarlo
          if (item.nombre || item.name) {
            lineObjects.push({
              id: item.id || item.identificacion,
              nombre: item.nombre || item.name,
              descripcion: item.descripcion || ''
            });
          }
          return item.id || item.identificacion || item.nombre || item.name;
        }
        return item;
      }).filter(id => id !== null && id !== undefined);
    } else if (typeof rawLineVal === 'string') {
      // Detectar si es una cadena serializada de Java
      if (/\b0x?ACED\b/i.test(rawLineVal) || /ac ed|aced/i.test(rawLineVal)) {
        const found = rawLineVal.match(/\b\d+\b/g) || [];
        lineIds = [...new Set(found.map(f => Number(f)).filter(n => !isNaN(n)))];
        console.log('🔧 [projectService] IDs extraídos de serialización Java:', lineIds);
      } else {
        lineIds = rawLineVal.split(/,|;|\||\n/).map(s => s.trim()).filter(Boolean);
      }
    } else if (typeof rawLineVal === 'object') {
      if (rawLineVal.id || rawLineVal.identificacion) {
        lineIds = [rawLineVal.id || rawLineVal.identificacion];
        if (rawLineVal.nombre || rawLineVal.name) {
          lineObjects.push({
            id: rawLineVal.id || rawLineVal.identificacion,
            nombre: rawLineVal.nombre || rawLineVal.name,
            descripcion: rawLineVal.descripcion || ''
          });
        }
      }
    } else {
      lineIds = [rawLineVal];
    }

    console.log('🔢 [projectService] IDs normalizados:', lineIds);

    // Si no tenemos objetos completos, mapear IDs a objetos usando allResearchLines
    if (lineObjects.length === 0 && lineIds.length > 0 && allResearchLines.length > 0) {
      lineObjects = lineIds.map(id => {
        const idNum = Number(id);
        const line = allResearchLines.find(rl => Number(rl.id) === idNum);
        
        if (line) {
          console.log(`✅ [projectService] ID ${id} mapeado a: ${line.nombre}`);
          return {
            id: line.id,
            nombre: line.nombre,
            descripcion: line.descripcion || ''
          };
        }
        
        console.warn(`⚠️ [projectService] ID ${id} no encontrado en líneas disponibles`);
        return {
          id: id,
          nombre: `Línea ${id}`,
          descripcion: ''
        };
      });
    }

    // Generar nombres desde los objetos
    lineNames = lineObjects.map(obj => obj.nombre).filter(Boolean);

    // Si ya venían nombres en el proyecto, usarlos preferentemente
    if (project.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
      lineNames = project.lineasInvestigacionNames;
      console.log('✅ [projectService] Usando lineasInvestigacionNames del proyecto');
    }

    console.log('📋 [projectService] Resultado final:', {
      lineIds,
      lineObjects,
      lineNames
    });

    return { lineIds, lineObjects, lineNames };
  },

  // Función para normalizar nivel de estudios
  normalizeNivelEstudios(project) {
    // Buscar en múltiples posibles claves
    const possibleKeys = [
      'nivelEstudios',
      'nivel',
      'nivelEstudio',
      'nivel_estudios',
      'nivelEducativo'
    ];

    let nivel = null;
    for (const key of possibleKeys) {
      if (project && project[key] !== undefined && project[key] !== null) {
        nivel = project[key];
        break;
      }
    }

    if (!nivel) {
      console.warn('⚠️ [projectService] No se encontró nivel de estudios');
      return null;
    }

    // Si es un objeto, extraer el valor
    if (typeof nivel === 'object' && nivel !== null) {
      nivel = nivel.nombre || nivel.name || nivel.id || nivel.value;
    }

    // Si es un ID numérico o string numérico, devolver el texto correspondiente
    const nivelNum = Number(nivel);
    const idToTextMap = {
      1: 'PREGRADO',
      2: 'TECNICO',
      3: 'TECNOLOGO',
      4: 'PROFESIONAL',
      5: 'ESPECIALIZACION',
      6: 'MAESTRIA',
      7: 'DOCTORADO',
      8: 'POSTDOCTORADO'
    };

    if (!isNaN(nivelNum) && nivelNum >= 1 && nivelNum <= 8) {
      console.log(`✅ [projectService] Nivel de estudios ID ${nivelNum} convertido a texto: ${idToTextMap[nivelNum]}`);
      return idToTextMap[nivelNum];
    }

    // Si es texto, normalizar y devolver versión en mayúsculas sin acentos
    const nivelStr = String(nivel).trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Mapear alias de texto a texto canónico (por si vienen con tildes o variantes)
    const canonicalMap = {
      'PREGRADO': 'PREGRADO',
      'TECNICO': 'TECNICO',
      'TECNOLOGO': 'TECNOLOGO',
      'PROFESIONAL': 'PROFESIONAL',
      'ESPECIALIZACION': 'ESPECIALIZACION',
      'MAESTRIA': 'MAESTRIA',
      'DOCTORADO': 'DOCTORADO',
      'POSTDOCTORADO': 'POSTDOCTORADO'
    };

    if (canonicalMap[nivelStr]) {
      return canonicalMap[nivelStr];
    }

    console.warn(`⚠️ [projectService] Nivel de estudios no reconocido: ${nivel} — devolviendo valor original`);
    return nivel;
  },

  // Función para limpiar referencias circulares
  cleanCircularReferences(data) {
    if (!data) return data;
    
    try {
      const jsonString = JSON.stringify(data, (key, value) => {
        if (key === 'proyecto' && value && typeof value === 'object') {
          return { id: value.id };
        }
        return value;
      });
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("⚠️ [projectService] Error limpiando referencias, usando datos originales:", error);
      return data;
    }
  },

  // Función específica para limpiar archivos
  cleanArchivos(archivos) {
    if (!archivos || !Array.isArray(archivos)) return [];
    
    return archivos.map(archivo => ({
      id: archivo.id,
      urlArchivo: archivo.urlArchivo,
      nombreArchivo: archivo.nombreArchivo,
      nombre: archivo.nombreArchivo || archivo.nombre,
      tipoMime: archivo.tipoMime,
      tipo: archivo.tipo,
      proyectoId: archivo.proyecto?.id || archivo.proyectoId
    }));
  },

  // Función para obtener archivos de un proyecto
  async getProjectFiles(projectId) {
    try {
      console.log("🟡 [projectService] Obteniendo archivos del proyecto:", projectId);
      
      const { data } = await projectApi.get(`/proyectos/${projectId}/archivos`);
      console.log("🟢 [projectService] Archivos obtenidos:", data);
      
      return this.cleanArchivos(data);
    } catch (error) {
      console.error("❌ [projectService] Error obteniendo archivos del proyecto:", {
        projectId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 404) {
        return [];
      }
      
      let errorMessage = 'Error al obtener los archivos del proyecto';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async create(projectData) {
  console.log("🟡 [projectService] Creando proyecto:", projectData);
  
  // CORREGIR: Cambiar nivelEstudios → nivelEstudio
  const payload = {
    titulo: projectData.titulo,
    resumen: projectData.resumen,
    palabrasClave: projectData.palabrasClave,
    objetivoGeneral: projectData.objetivoGeneral,
    objetivoEspecifico: projectData.objetivoEspecifico,
    justificacion: projectData.justificacion,
    nivelEstudio: projectData.nivelEstudios, // ✅ CORREGIDO: nivelEstudios → nivelEstudio
    lineasInvestigacionIds: projectData.lineasInvestigacionIds || []
  };

  console.log("🟢 [projectService] Payload corregido:", payload);
  
  try {
    const { data } = await projectApi.post("/proyectos", payload);
    console.log("🟢 [projectService] Proyecto creado:", data);
    
    const allResearchLines = await researchService.getAll();
    return this.normalizeProject(data, allResearchLines);
  } catch (error) {
    console.error("❌ [projectService] Error creando proyecto:", error);
    throw error;
  }
},

async update(id, projectData) {
  console.log("🟡 [projectService] Actualizando proyecto:", id, projectData);
  
  // CORREGIR: Cambiar nivelEstudios → nivelEstudio
  const payload = {
    titulo: projectData.titulo,
    resumen: projectData.resumen,
    palabrasClave: projectData.palabrasClave,
    objetivoGeneral: projectData.objetivoGeneral,
    objetivoEspecifico: projectData.objetivoEspecifico,
    justificacion: projectData.justificacion,
    nivelEstudio: projectData.nivelEstudios, // ✅ CORREGIDO: nivelEstudios → nivelEstudio
    lineasInvestigacionIds: projectData.lineasInvestigacionIds || []
  };

  console.log("🟢 [projectService] Payload corregido para actualizar:", payload);
  
  try {
    const { data } = await projectApi.put(`/proyectos/${id}`, payload);
    console.log("🟢 [projectService] Proyecto actualizado exitosamente:", data);
    
    const allResearchLines = await researchService.getAll();
    return this.normalizeProject(data, allResearchLines);
  } catch (error) {
    console.error("❌ [projectService] Error actualizando proyecto:", error);
    console.error("❌ [projectService] Response data:", error.response?.data);
    throw error;
  }
},

  async delete(id) {
    try {
      const { data } = await projectApi.delete(`/proyectos/${id}`);
      console.log("🟢 [projectService] Proyecto eliminado:", id);
      return data;
    } catch (error) {
      console.error("❌ [projectService] Error eliminando proyecto:", error);
      throw error;
    }
  },

  // ✅ NUEVO: Obtener niveles de estudio desde el servicio de usuarios
  async getNivelesEstudio() {
    try {
      // Obtener algunos evaluadores para extraer los niveles disponibles
      const evaluadores = await userService.getEvaluadores();
      const niveles = [...new Set(evaluadores.map(e => e.nivelEducativo).filter(Boolean))];
      
      console.log("🟢 [projectService] Niveles de estudio disponibles:", niveles);
      return niveles;
    } catch (error) {
      console.error("❌ [projectService] Error obteniendo niveles de estudio:", error);
      // Devolver valores por defecto
      return ['PREGRADO', 'TECNICO', 'TECNOLOGO', 'PROFESIONAL', 'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO', 'POSTDOCTORADO'];
    }
  },

  async uploadFile(proyectoId, file) {
    try {
      console.log("🟡 [projectService] Subiendo archivo:", {
        proyectoId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      const formData = new FormData();
      formData.append("file", file);
      
      console.log("🟡 [projectService] FormData preparado");

      const response = await projectApi.post(`/archivos/${proyectoId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log("🟢 [projectService] Archivo subido exitosamente:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ [projectService] Error subiendo archivo:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al subir el archivo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async downloadFile(archivoId) {
    try {
      console.log("🟡 [projectService] Descargando archivo:", archivoId);
      
      const endpointsToTry = [
        `/archivos/${archivoId}/download`,
        `/archivos/download/${archivoId}`,
        `/archivos/${archivoId}`
      ];

      for (const ep of endpointsToTry) {
        try {
          const response = await projectApi.get(ep, { responseType: 'blob' });
          console.log("🟢 [projectService] Archivo descargado exitosamente desde:", ep);
          return response;
        } catch (err) {
          const status = err?.response?.status;
          if (status && status === 404) {
            console.warn(`⚠️ [projectService] Endpoint ${ep} no existe (404), probando siguiente...`);
            continue;
          }
          console.error(`❌ [projectService] Error descargando desde ${ep}:`, err);
          throw err;
        }
      }

      const notFoundError = { 
        archivoId, 
        message: 'Archivo no encontrado (404 en endpoints probados)', 
        status: 404 
      };
      console.error('❌ [projectService] Error descargando archivo:', notFoundError);
      throw notFoundError;
    } catch (error) {
      console.error("❌ [projectService] Error descargando archivo:", {
        archivoId,
        message: error?.message || error,
        response: error?.response,
        status: error?.status || error?.response?.status
      });

      let errorMessage = 'Error al descargar el archivo';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  async deleteFile(archivoId) {
    try {
      console.log("🟡 [projectService] Eliminando archivo:", archivoId);
      
      const { data } = await projectApi.delete(`/archivos/${archivoId}`);
      console.log("🟢 [projectService] Archivo eliminado exitosamente");
      
      return data;
    } catch (error) {
      console.error("❌ [projectService] Error eliminando archivo:", {
        archivoId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al eliminar el archivo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async checkConnection() {
    try {
      await projectApi.get("/proyectos");
      console.log("🟢 [projectService] Conexión verificada");
      return true;
    } catch (error) {
      console.error("❌ [projectService] Error de conexión:", error);
      return false;
    }
  }
};

export default projectService;