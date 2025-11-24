export const AsignarEvaluacionDTO = (proyectoId, formatoId, evaluadorId, tiempoLimiteHoras) => ({
  proyectoId,
  formatoId,
  evaluadorId,
  tiempoLimiteHoras
});

export const CalificarItemDTO = (itemId, puntuacion, comentarios) => ({
  itemId,
  puntuacion,
  comentarios
});