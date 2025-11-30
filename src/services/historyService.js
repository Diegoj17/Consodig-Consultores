import projectApi from '../api/ProjectAxios';
import { evaluationService } from './evaluationService';
import { userService } from './userService';

export const historyService = {
  // Obtener historial completo de evaluadores con métricas reales
  async getEvaluatorsHistory(timeFilter = 'all') {
    try {
      console.log('🔄 [historyService] Obteniendo historial real de evaluadores...');
      
      // Obtener todos los evaluadores activos
      const evaluadores = await userService.getEvaluadores();
      console.log('📊 [historyService] Evaluadores obtenidos:', evaluadores.length);
      
      // Obtener todas las evaluaciones completadas
      const evaluacionesCompletadas = await evaluationService.getCompletedEvaluations();
      console.log('📊 [historyService] Evaluaciones completadas:', evaluacionesCompletadas.length);
      
      // Obtener todas las evaluaciones para contar asignaciones totales
      const todasLasEvaluaciones = await this.getAllEvaluations();
      
      // Calcular métricas para cada evaluador
      const historial = await Promise.all(
        evaluadores.map(async (evaluador) => {
          return await this.calculateEvaluatorMetrics(evaluador, evaluacionesCompletadas, todasLasEvaluaciones, timeFilter);
        })
      );
      
      console.log('✅ [historyService] Historial calculado:', historial);
      return historial.filter(item => item !== null);
      
    } catch (error) {
      console.error('❌ [historyService] Error obteniendo historial:', error);
      throw error;
    }
  },

  // Obtener todas las evaluaciones
  async getAllEvaluations() {
    try {
      const response = await projectApi.get('/evaluaciones');
      return response.data;
    } catch (error) {
      console.error('❌ [historyService] Error obteniendo todas las evaluaciones:', error);
      return [];
    }
  },

  // Calcular métricas específicas para un evaluador
  async calculateEvaluatorMetrics(evaluador, evaluacionesCompletadas, todasLasEvaluaciones, timeFilter) {
    try {
      // Filtrar evaluaciones de este evaluador (completadas)
      const evaluacionesCompletadasDelEvaluador = evaluacionesCompletadas.filter(evaluacion => 
        evaluacion.evaluador?.id === evaluador.id || evaluacion.evaluadorId === evaluador.id
      );
      
      // Filtrar todas las evaluaciones asignadas a este evaluador
      const todasLasEvaluacionesDelEvaluador = todasLasEvaluaciones.filter(evaluacion => 
        evaluacion.evaluador?.id === evaluador.id || evaluacion.evaluadorId === evaluador.id
      );
      
      console.log(`📊 [historyService] Evaluaciones del evaluador ${evaluador.nombre}:`, {
        completadas: evaluacionesCompletadasDelEvaluador.length,
        total: todasLasEvaluacionesDelEvaluador.length
      });
      
      if (todasLasEvaluacionesDelEvaluador.length === 0) {
        return null;
      }

      // Calcular métricas
      let asignados = todasLasEvaluacionesDelEvaluador.length;
      let completados = evaluacionesCompletadasDelEvaluador.length;
      let incumplimientos = 0;
      let tiempoTotal = 0;
      let ultimaEvaluacion = null;

      evaluacionesCompletadasDelEvaluador.forEach(evaluacion => {
        // Verificar incumplimiento
        if (evaluacion.fechaLimite && evaluacion.fechaCompletado) {
          const fechaLimite = new Date(evaluacion.fechaLimite);
          const fechaCompletado = new Date(evaluacion.fechaCompletado);
          if (fechaCompletado > fechaLimite) {
            incumplimientos++;
          }
        }
        
        // Calcular tiempo de evaluación
        if (evaluacion.fechaAsignacion && evaluacion.fechaCompletado) {
          const inicio = new Date(evaluacion.fechaAsignacion);
          const fin = new Date(evaluacion.fechaCompletado);
          const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
          tiempoTotal += dias;
        }
        
        // Actualizar última evaluación
        if (!ultimaEvaluacion || new Date(evaluacion.fechaCompletado) > new Date(ultimaEvaluacion)) {
          ultimaEvaluacion = evaluacion.fechaCompletado;
        }
      });

      const tiempoPromedio = completados > 0 
        ? `${(tiempoTotal / completados).toFixed(1)} días`
        : '0 días';

      return {
        id: evaluador.id,
        nombre: `${evaluador.nombre} ${evaluador.apellido || ''}`.trim(),
        perfil: evaluador.afiliacionInstitucional || 'Sin afiliación',
        avatar: this.generateAvatar(evaluador.nombre, evaluador.apellido),
        asignados,
        completados,
        incumplimientos,
        tiempoPromedio,
        ultimaEvaluacion: ultimaEvaluacion || 'N/A',
        especialidades: evaluador.lineasInvestigacion?.map(linea => linea.nombre || linea) || ['Sin especialidades'],
        email: evaluador.email,
        nivelEducativo: evaluador.nivelEducativo
      };
      
    } catch (error) {
      console.error(`❌ [historyService] Error calculando métricas para ${evaluador.nombre}:`, error);
      return null;
    }
  },

  // Obtener estadísticas generales
  async getGeneralStats(timeFilter = 'all') {
    try {
      const evaluatorsHistory = await this.getEvaluatorsHistory(timeFilter);
      
      const totalEvaluadores = evaluatorsHistory.length;
      const totalAdaptaciones = evaluatorsHistory.reduce((sum, item) => sum + item.asignados, 0);
      const totalCompletados = evaluatorsHistory.reduce((sum, item) => sum + item.completados, 0);
      const totalIncumplimientos = evaluatorsHistory.reduce((sum, item) => sum + item.incumplimientos, 0);
      
      const tasaCumplimiento = totalAdaptaciones > 0 
        ? ((totalCompletados / totalAdaptaciones) * 100).toFixed(1)
        : '0';
      
      const tasaIncumplimiento = totalAdaptaciones > 0 
        ? ((totalIncumplimientos / totalAdaptaciones) * 100).toFixed(1)
        : '0';
      
      // Calcular tiempo promedio general
      const tiempos = evaluatorsHistory
        .map(item => parseFloat(item.tiempoPromedio))
        .filter(tiempo => !isNaN(tiempo));
      
      const tiempoPromedioGeneral = tiempos.length > 0 
        ? `${(tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1)} días`
        : '0 días';
      
      // Calcular eficiencia general
      const eficienciaGeneral = totalAdaptaciones > 0 
        ? ((totalCompletados / totalAdaptaciones) * 100).toFixed(1)
        : '0';
      
      // Encontrar top performers (más del 90% de cumplimiento y menos de 6 días promedio)
      const topPerformers = evaluatorsHistory.filter(item => {
        const ratio = item.completados / item.asignados;
        const tiempo = parseFloat(item.tiempoPromedio);
        return ratio >= 0.9 && tiempo <= 6;
      }).length;
      
      // Proyectos actuales (evaluaciones en progreso)
      const proyectosActuales = await this.getCurrentProjectsCount();
      
      return {
        totalEvaluadores,
        totalAdaptaciones,
        totalCompletados: totalCompletados,
        totalIncumplimientos,
        tasaCumplimiento: `${tasaCumplimiento}%`,
        tasaIncumplimiento: `${tasaIncumplimiento}%`,
        tiempoPromedio: tiempoPromedioGeneral,
        eficienciaGeneral: `${eficienciaGeneral}%`,
        topPerformers,
        proyectosActuales,
        desempenioGeneral: this.getPerformanceRating(parseFloat(eficienciaGeneral))
      };
      
    } catch (error) {
      console.error('❌ [historyService] Error obteniendo estadísticas generales:', error);
      throw error;
    }
  },

  // Obtener cantidad de proyectos actuales (evaluaciones en progreso)
  async getCurrentProjectsCount() {
    try {
      const evaluacionesEnProgreso = await evaluationService.getInProgressEvaluations();
      return evaluacionesEnProgreso.length;
    } catch (error) {
      console.error('❌ [historyService] Error obteniendo proyectos actuales:', error);
      return 0;
    }
  },

  // Generar avatar desde nombre
  generateAvatar(nombre, apellido = '') {
    if (!nombre) return 'EU';
    const inicialNombre = nombre[0] || '';
    const inicialApellido = apellido[0] || '';
    return `${inicialNombre}${inicialApellido}`.toUpperCase() || 'EU';
  },

  // Calificar desempeño general
  getPerformanceRating(eficiencia) {
    if (eficiencia >= 90) return 'Excelente';
    if (eficiencia >= 80) return 'Bueno';
    if (eficiencia >= 70) return 'Regular';
    return 'Necesita mejora';
  },

  // Obtener proyectos que han sido evaluados (agrupar por proyecto)
  async getEvaluatedProjects(timeFilter = 'all') {
    try {
      console.log('🔄 [historyService] Obteniendo proyectos evaluados...');
      const evaluaciones = await this.getAllEvaluations();

      // Filtrar solo evaluaciones que parecen completadas (tienen fecha de finalización o calificación)
      const evaluacionesCompletadas = evaluaciones.filter(ev => ev.fecha_finalizacion || ev.fechaFinalizacion || ev.calificacion_total || ev.calificacionTotal || ev.calificacion);

      const projectsMap = new Map();

      evaluacionesCompletadas.forEach(ev => {
        const projectObj = ev.proyecto || ev.project || null;
        const projectId = projectObj?.id ?? ev.proyecto_id ?? ev.proyectoId ?? ev.projectId ?? `p-${ev.id}`;
        const projectTitle = projectObj?.titulo || projectObj?.name || ev.tituloProyecto || `Proyecto ${projectId}`;

        const score = ev.calificacion_total ?? ev.calificacionTotal ?? ev.calificacion ?? null;
        const evaluatorId = ev.evaluador_id ?? ev.evaluadorId ?? ev.evaluador?.id ?? ev.evaluador ?? null;
        const evaluatorName = ev.evaluador?.nombre || ev.evaluadorNombre || ev.evaluador || null;
        const dateRaw = ev.fecha_finalizacion || ev.fechaFinalizacion || ev.fechaCompletado || ev.fecha;

        if (!projectsMap.has(projectId)) {
          projectsMap.set(projectId, {
            id: projectId,
            titulo: projectTitle,
            resumen: projectObj?.resumen || projectObj?.descripcion || ev.resumen || '',
            archivos: projectObj?.archivos || [],
            evaluacionesCount: 1,
            evaluadores: evaluatorId ? [{ id: evaluatorId, nombre: evaluatorName }] : [],
            scores: score !== null ? [Number(score)] : [],
            lastEvaluation: dateRaw || null
          });
        } else {
          const entry = projectsMap.get(projectId);
          entry.evaluacionesCount += 1;
          if (evaluatorId) {
            const exists = entry.evaluadores.find(e => String(e.id) === String(evaluatorId));
            if (!exists) entry.evaluadores.push({ id: evaluatorId, nombre: evaluatorName });
          }
          if (score !== null) entry.scores.push(Number(score));
          if (dateRaw) {
            const currentTs = entry.lastEvaluation ? new Date(entry.lastEvaluation).getTime() : 0;
            const candidateTs = new Date(dateRaw).getTime();
            if (!isNaN(candidateTs) && candidateTs > currentTs) entry.lastEvaluation = dateRaw;
          }
        }
      });

      const projects = Array.from(projectsMap.values()).map(p => ({
        ...p,
        averageScore: p.scores.length ? Math.round(p.scores.reduce((a,b)=>a+b,0)/p.scores.length) : null,
        lastEvaluationFormatted: p.lastEvaluation ? new Date(p.lastEvaluation).toLocaleString() : 'N/A'
      }));

      console.log('✅ [historyService] Proyectos evaluados:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ [historyService] Error obteniendo proyectos evaluados:', error);
      return [];
    }
  },
};

export default historyService;