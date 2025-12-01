export const AsignarEvaluacionDTO = (proyectoId, formatoId, evaluadorId, tiempoLimiteHoras, adminId) => ({
  proyectoId,
  formatoId,
  evaluadorId,
  tiempoLimiteHoras,
  adminId
});

export const CalificarItemDTO = (itemId, puntuacion, comentarios) => ({
  itemId,
  puntuacion,
  comentarios
});