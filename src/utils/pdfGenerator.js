import jsPDF from 'jspdf';
import 'jspdf-autotable';
import evaluationFormatService from '../services/evaluationFormatService';
import { researchService } from '../services/researchService';
import { projectService } from '../services/projectService';

// Configuración de estilos mejorada - Paleta profesional
const COLORS = {
  primary: '#007bbf',
  primaryLight: '#4da8da',
  primaryDark: '#005a8d',
  secondary: '#ff6b6b',
  accent: '#27ae60',
  textDark: '#2d3748',
  textMedium: '#4a5568',
  textLight: '#718096',
  backgroundLight: '#f8fafc',
  backgroundLighter: '#fefefe',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#27ae60',
  warning: '#f59e0b',
  error: '#e53e3e'
};

// Sistema de tipografía mejorado
const TYPOGRAPHY = {
  family: {
    primary: 'helvetica',
    bold: 'helvetica',
    italic: 'helvetica'
  },
  size: {
    title: 22,
    subtitle: 14,
    section: 16,
    subsection: 13,
    body: 10,
    small: 9,
    caption: 8,
    tableHead: 10,
    tableBody: 9,
    metric: 18,
    metricLabel: 9
  },
  spacing: {
    tight: 1.0,
    normal: 1.4,
    loose: 1.8
  }
};

// Configuración de layout
const LAYOUT = {
  margin: 15,
  gutter: 12,
  card: {
    padding: 10,
    borderRadius: 5,
    shadow: 0.3
  },
  section: {
    spacing: 20,
    headerHeight: 22
  }
};

// Helper functions mejorados
const formatListValue = (value, fallback = 'No disponible') => {
  if (value == null) return fallback;
  const arr = Array.isArray(value)
    ? value
    : (typeof value === 'string'
        ? value.split(/[,;\n]+/).map((part) => part.trim()).filter(Boolean)
        : [value]);
  const normalized = arr.map((item) => {
    if (typeof item === 'string') return item;
    if (item == null) return null;
    if (typeof item === 'object') {
      return item.nombre || item.name || item.titulo || item.title || item.descripcion || item.value || null;
    }
    return String(item);
  }).filter(Boolean);
  return normalized.length ? normalized.join(', ') : fallback;
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

const formatDateRange = (start, end) => {
  const hasStart = Boolean(start);
  const hasEnd = Boolean(end);
  if (!hasStart && !hasEnd) return 'No especificado';
  const startLabel = hasStart ? formatDate(start) : 'Sin inicio';
  const endLabel = hasEnd ? formatDate(end) : 'Sin fin';
  return `${startLabel} - ${endLabel}`;
};

const humanizeLabel = (label = '') => label
  .toString()
  .replace(/[_-]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^\w/, (match) => match.toUpperCase());

const formatRichValue = (value) => {
  if (value == null || value === '') return 'No disponible';
  if (Array.isArray(value)) return formatListValue(value);
  if (value instanceof Date) return formatDate(value.toISOString());
  if (typeof value === 'number') return value.toLocaleString('es-ES');
  if (typeof value === 'object') {
    const maybeRange = value.start || value.end || value.desde || value.hasta;
    if (maybeRange) {
      return formatDateRange(value.start || value.desde, value.end || value.hasta);
    }
    const objectSummary = Object.entries(value)
      .map(([key, val]) => `${humanizeLabel(key)}: ${formatListValue(val)}`)
      .join(' | ');
    return objectSummary || 'No disponible';
  }
  return value.toString();
};

const drawKeyValueTable = (doc, rows, startY, pageWidth, margin) => {
  if (!rows.length) return startY;

  doc.autoTable({
    startY,
    body: rows.map(({ label, value }) => ([
      { content: label, styles: { fontStyle: 'bold', textColor: COLORS.textDark } },
      { content: value, styles: { textColor: COLORS.textMedium } }
    ])),
    tableWidth: pageWidth - 2 * margin,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      font: TYPOGRAPHY.family.primary,
      fontSize: TYPOGRAPHY.size.tableBody,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      lineColor: COLORS.borderLight,
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 8
    },
    alternateRowStyles: {
      fillColor: COLORS.backgroundLight
    },
    columnStyles: {
      0: { cellWidth: 52, cellPadding: { left: 5, right: 5 }, overflow: 'linebreak' },
      1: { cellWidth: pageWidth - 2 * margin - 52, cellPadding: { left: 5, right: 5 }, overflow: 'linebreak' }
    }
  });

  return doc.lastAutoTable.finalY + 10;
};

const drawEvaluationsOverview = (doc, evaluations, startY, pageWidth, margin) => {
  if (!evaluations.length) return startY;

  doc.autoTable({
    startY,
    head: [[
      { content: '#', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'Proyecto', styles: { fontStyle: 'bold' } },
      { content: 'Evaluador', styles: { fontStyle: 'bold' } },
      { content: 'Estado', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'Calificación', styles: { fontStyle: 'bold', halign: 'center' } }
    ]],
    body: evaluations.map((evaluation) => ([
      { content: evaluation.index.toString(), styles: { halign: 'center' } },
      truncateText(evaluation.projectInfo.titulo, 55),
      truncateText(evaluation.evalInfo.evaluador, 30),
      { content: evaluation.status, styles: { halign: 'center', fontSize: 9 } },
      { content: evaluation.evalInfo.calificacionTotal?.toString() || 'N/D', styles: { halign: 'center', fontStyle: 'bold' } }
    ])),
    theme: 'grid',
    tableWidth: pageWidth - 2 * margin,
    margin: { left: margin, right: margin },
    styles: {
      font: TYPOGRAPHY.family.primary,
      fontSize: TYPOGRAPHY.size.tableBody,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      lineColor: COLORS.border,
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 8
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: COLORS.backgroundLight
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: (pageWidth - 2 * margin) * 0.40 },
      2: { cellWidth: (pageWidth - 2 * margin) * 0.22 },
      3: { cellWidth: (pageWidth - 2 * margin) * 0.13, halign: 'center' },
      4: { cellWidth: (pageWidth - 2 * margin) * 0.15, halign: 'center' }
    }
  });

  return doc.lastAutoTable.finalY + 15;
};

const formatScoreValue = (value, decimals = 1, fallback = '0.0') => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(decimals) : fallback;
};

// Funciones para resolver datos del proyecto (como en generateEvaluationPdf)
const resolveProjectLines = async (project) => {
  if (!project) return 'No disponible';
  try {
    const allLineas = await researchService.getAll();
    const normalized = projectService.normalizeProject(project, allLineas || []);
    if (Array.isArray(normalized.lineasInvestigacionNames) && normalized.lineasInvestigacionNames.length > 0) {
      return normalized.lineasInvestigacionNames.join(', ');
    }
    if (Array.isArray(normalized.lineasInvestigacion) && normalized.lineasInvestigacion.length > 0) {
      return normalized.lineasInvestigacion.map(l => l.nombre || l.name).filter(Boolean).join(', ');
    }
  } catch (e) {
    console.warn('No se pudieron normalizar líneas de investigación', e);
  }
  const dirs = project.lineasInvestigacion || project.lineas || project.lineas_investigacion || project.lineasIds || project.lineasInvestigacionNames;
  if (!dirs) return 'No disponible';
  if (Array.isArray(dirs)) {
    const names = dirs.map(l => {
      if (!l) return null;
      if (typeof l === 'string') return l;
      return l.nombre || l.name || l.titulo || l.title || (l.id ? String(l.id) : null);
    }).filter(Boolean);
    return names.length ? names.join(', ') : 'No disponible';
  }
  return String(dirs || 'No disponible');
};

const resolveNivelEstudios = async (project) => {
  if (!project) return 'No disponible';
  try {
    const allLineas = await researchService.getAll();
    const normalized = projectService.normalizeProject(project, allLineas || []);
    if (normalized && normalized.nivelEstudios) return normalized.nivelEstudios;
  } catch (e) {
    console.warn('No se pudo normalizar nivel de estudios', e);
  }
  const nivel = project.nivelEstudios || project.nivel || project.nivelId || project.nivel_estudio || null;
  if (!nivel) return 'No disponible';
  if (typeof nivel === 'object') return nivel.nombre || nivel.name || String(nivel.id || nivel.value || 'No disponible');
  return String(nivel);
};

const resolveFormatoInfo = async (evalData) => {
  const formatId = evalData?.formato?.id || evalData?.formatoId || evalData?.formato_id;
  let formatoNombre = evalData?.formato?.nombre || evalData?.formatoNombre || '';
  let formatoDescripcion = evalData?.formato?.descripcion || '';
  let formatItems = evalData?.formato?.items || evalData?.formato?.item_formato || [];

  if (formatId && (!formatoNombre || formatItems.length === 0)) {
    try {
      const fmt = await evaluationFormatService.getFormatById(formatId);
      if (fmt) {
        formatoNombre = formatoNombre || fmt.nombre || fmt.name || '';
        formatoDescripcion = formatoDescripcion || fmt.descripcion || fmt.description || '';
        formatItems = fmt.items || fmt.item_formato || formatItems;
      }
    } catch (err) {
      console.warn('No se pudo obtener formato:', err);
    }
  }

  return { formatoNombre, formatoDescripcion, formatItems };
};

// Función para dibujar tarjetas con diseño moderno
const drawMetricCard = (doc, x, y, width, height, metric) => {
  // Fondo con gradiente sutil
  doc.setFillColor(COLORS.backgroundLighter);
  doc.roundedRect(x, y, width, height, LAYOUT.card.borderRadius, LAYOUT.card.borderRadius, 'F');
  
  // Borde sutil
  doc.setDrawColor(COLORS.borderLight);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, height, LAYOUT.card.borderRadius, LAYOUT.card.borderRadius, 'S');
  
  // Línea de acento superior
  doc.setDrawColor(metric.color);
  doc.setLineWidth(2);
  doc.line(x, y, x + width, y);
  
  // Valor de la métrica
  doc.setFontSize(TYPOGRAPHY.size.metric);
  doc.setFont(TYPOGRAPHY.family.bold, 'bold');
  doc.setTextColor(metric.color);
  doc.text(metric.value.toString(), x + width / 2, y + height / 2 - 3, { align: 'center' });
  
  // Label
  doc.setFontSize(TYPOGRAPHY.size.caption);
  doc.setFont(TYPOGRAPHY.family.primary, 'normal');
  doc.setTextColor(COLORS.textMedium);
  const labelLines = doc.splitTextToSize(metric.label, width - 4);
  doc.text(labelLines[0] || metric.label, x + width / 2, y + height / 2 + 8, { align: 'center', maxWidth: width - 4 });
};

// Función para dibujar secciones con headers elegantes
const drawSectionHeader = (doc, x, y, width, title, subtitle = '') => {
  // Título principal
  doc.setFontSize(TYPOGRAPHY.size.section);
  doc.setFont(TYPOGRAPHY.family.bold, 'bold');
  doc.setTextColor(COLORS.textDark);
  const titleLines = doc.splitTextToSize(title, width);
  doc.text(titleLines[0] || title, x, y);
  
  // Línea decorativa
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(1.5);
  doc.line(x, y + 2, x + 40, y + 2);
  
  // Subtítulo opcional
  if (subtitle) {
    doc.setFontSize(TYPOGRAPHY.size.small);
    doc.setFont(TYPOGRAPHY.family.primary, 'normal');
    doc.setTextColor(COLORS.textLight);
    const subtitleLines = doc.splitTextToSize(subtitle, width);
    doc.text(subtitleLines[0] || subtitle, x, y + 8);
  }
  
  return y + (subtitle ? 15 : 10);
};

export const generateEvaluationPDF = async (pdfData) => {
  try {
    const doc = new jsPDF();
    
    // Configuración de página
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = LAYOUT.margin;
    let yPosition = margin;

    // Función mejorada para control de saltos de página
    const checkPageBreak = (requiredSpace = 50) => {
      if (yPosition + requiredSpace > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
        addFooter(doc, pageWidth, pageHeight, margin);
        return true;
      }
      return false;
    };

    // Función para agregar footer en cada página
    const addFooter = (doc, pageWidth, pageHeight, margin) => {
      const pageCount = doc.internal.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Línea separadora del footer
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        
        // Información del footer
        doc.setFontSize(TYPOGRAPHY.size.caption);
        doc.setFont(TYPOGRAPHY.family.primary, 'normal');
        doc.setTextColor(COLORS.textLight);
        
        // Texto izquierdo
        const leftText = doc.splitTextToSize('Sistema de Gestión de Proyectos', (pageWidth / 3) - margin - 5);
        doc.text(
          leftText[0] || 'Sistema de Gestión',
          margin,
          pageHeight - 18
        );
        
        // Centro - Información confidencial
        doc.text(
          'Confidencial',
          pageWidth / 2,
          pageHeight - 18,
          { align: 'center' }
        );
        
        // Derecha - Número de página
        doc.text(
          `Pág. ${i}/${pageCount}`,
          pageWidth - margin,
          pageHeight - 18,
          { align: 'right' }
        );
        
        // Línea inferior muy sutil
        const dateText = `${pdfData.generatedDate || new Date().toLocaleDateString('es-ES')}`;
        doc.text(
          dateText,
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' }
        );
      }
    };

    // ========== ENCABEZADO MEJORADO ==========
    // Logo o marca de agua institucional (puedes agregar un logo si lo tienes)
    doc.setFillColor(COLORS.primary);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 3, 3, 'F');
    
    // Título principal
    doc.setFontSize(TYPOGRAPHY.size.title);
    doc.setFont(TYPOGRAPHY.family.bold, 'bold');
    doc.setTextColor(255, 255, 255);
    const titleMaxWidth = pageWidth - 2 * margin - 10;
    const titleLines = doc.splitTextToSize('REPORTE DE EVALUACIONES', titleMaxWidth);
    doc.text(titleLines[0] || 'REPORTE DE EVALUACIONES', pageWidth / 2, yPosition + 15, { align: 'center', maxWidth: titleMaxWidth });
    
    // Subtítulo
    doc.setFontSize(TYPOGRAPHY.size.subtitle);
    doc.setFont(TYPOGRAPHY.family.primary, 'normal');
    doc.setTextColor(220, 220, 220);
    const subtitleMaxWidth = pageWidth - 2 * margin - 10;
    const subtitleLines = doc.splitTextToSize('Análisis Integral de Proyectos de Investigación', subtitleMaxWidth);
    doc.text(subtitleLines[0] || 'Análisis Integral', pageWidth / 2, yPosition + 25, { align: 'center', maxWidth: subtitleMaxWidth });
    
    // Fecha de generación
    doc.setFontSize(TYPOGRAPHY.size.small);
    doc.text(`Generado el: ${pdfData.generatedDate || new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition + 35, { align: 'center' });
    
    yPosition += 55;

    // Información general del reporte (filtros, periodos, etc.)
    const reportInfoRows = [];
    const appendObjectEntries = (source, prefix = '') => {
      if (source == null || source === '') return;

      const trimmedPrefix = prefix.replace(/\s+$/g, '');
      const aggregatedLabel = trimmedPrefix.replace(/[-:]+$/g, '').trim();

      if (Array.isArray(source)) {
        if (source.length) {
          reportInfoRows.push({
            label: aggregatedLabel || 'Listado',
            value: formatListValue(source)
          });
        }
        return;
      }

      if (typeof source !== 'object' || source instanceof Date) {
        reportInfoRows.push({
          label: aggregatedLabel || 'Dato',
          value: formatRichValue(source)
        });
        return;
      }

      Object.entries(source).forEach(([key, value]) => {
        if (
          value == null ||
          value === '' ||
          (typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            Object.keys(value).length === 0)
        ) {
          return;
        }
        reportInfoRows.push({
          label: `${prefix}${humanizeLabel(key)}`.trim(),
          value: formatRichValue(value)
        });
      });
    };

    const generatedBy = pdfData.generatedBy || pdfData.generatedByName || pdfData.user?.nombre || pdfData.user?.name;
    if (generatedBy) {
      reportInfoRows.push({ label: 'Generado por', value: formatRichValue(generatedBy) });
    }

    const responsibleOrg = pdfData.organization?.nombre || pdfData.organization?.name;
    if (responsibleOrg) {
      reportInfoRows.push({ label: 'Organización responsable', value: formatRichValue(responsibleOrg) });
    }

    const startPeriod = pdfData.period?.start || pdfData.period?.desde || pdfData.dateRange?.start || pdfData.dateRange?.desde;
    const endPeriod = pdfData.period?.end || pdfData.period?.hasta || pdfData.dateRange?.end || pdfData.dateRange?.hasta;
    const formattedPeriod = formatDateRange(startPeriod, endPeriod);
    if (formattedPeriod !== 'No especificado') {
      reportInfoRows.push({ label: 'Periodo analizado', value: formattedPeriod });
    }

    appendObjectEntries(pdfData.filters, 'Filtro - ');
    appendObjectEntries(pdfData.metadata, 'Meta - ');
    appendObjectEntries(pdfData.additionalInfo, 'Dato - ');

    if (Array.isArray(pdfData.tags) && pdfData.tags.length) {
      reportInfoRows.push({ label: 'Etiquetas', value: formatListValue(pdfData.tags) });
    }

    if (pdfData.notes) {
      reportInfoRows.push({ label: 'Notas del reporte', value: formatRichValue(pdfData.notes) });
    }

    if (reportInfoRows.length) {
      checkPageBreak(40 + reportInfoRows.length * 8);
      yPosition = drawSectionHeader(doc, margin, yPosition, pageWidth - 2 * margin,
        'INFORMACIÓN DEL REPORTE', 'Contexto general y filtros aplicados');
      yPosition += 6;
      yPosition = drawKeyValueTable(doc, reportInfoRows, yPosition, pageWidth, margin);
    }

    // ========== RESUMEN EJECUTIVO MEJORADO ==========
    checkPageBreak(100);
    yPosition = drawSectionHeader(doc, margin, yPosition, pageWidth - 2 * margin, 
      'RESUMEN EJECUTIVO', 'Métricas generales del proceso de evaluación');
    
    yPosition += 10;

    // Tarjetas de métricas mejoradas
    const metrics = [
      { 
        label: 'Proyectos Evaluados', 
        value: pdfData.summary?.totalProjects || 0,
        color: COLORS.primary
      },
      { 
        label: 'Total Evaluaciones', 
        value: pdfData.summary?.totalEvaluations || 0,
        color: COLORS.primaryLight
      },
      { 
        label: 'Calificación Promedio', 
        value: `${formatScoreValue(pdfData.summary?.overallAverage)}/5`,
        color: COLORS.accent
      },
      { 
        label: 'Tasa de Completitud', 
        value: `${pdfData.statistics?.completionRate || 0}%`,
        color: COLORS.secondary
      },
      { 
        label: 'Tiempo Promedio', 
        value: pdfData.statistics?.averageTime || 'N/D',
        color: COLORS.warning
      }
    ];

    const cardWidth = (pageWidth - 2 * margin - 20) / 3;
    const cardHeight = 42;
    let cardX = margin;
    let cardsInRow = 0;
    
    metrics.forEach((metric) => {
      if (cardsInRow === 3) {
        cardX = margin;
        yPosition += cardHeight + 10;
        cardsInRow = 0;
        checkPageBreak(cardHeight + 20);
      }

      drawMetricCard(doc, cardX, yPosition, cardWidth, cardHeight, metric);
      
      cardX += cardWidth + 7;
      cardsInRow++;
    });

    yPosition += cardHeight + 25;

    // Visión general de evaluaciones incluidas
    const evaluationEntries = Array.isArray(pdfData.evaluations) ? pdfData.evaluations : [];
    if (evaluationEntries.length) {
      checkPageBreak(70);
      yPosition = drawSectionHeader(doc, margin, yPosition, pageWidth - 2 * margin,
        'PANORAMA DE EVALUACIONES', 'Listado consolidado de las evaluaciones registradas');
      yPosition += 8;
      yPosition = drawEvaluationsOverview(doc, evaluationEntries.map((evaluation, index) => ({
        index: index + 1,
        projectInfo: { titulo: evaluation.project?.titulo || evaluation.project?.title || 'Sin título' },
        evalInfo: { evaluador: evaluation.evaluator?.nombre || evaluation.evaluator?.name || 'No disponible', calificacionTotal: evaluation.evaluation?.calificacionTotal || evaluation.evaluation?.finalScore || 'N/D' },
        status: evaluation.evaluation?.estado || 'Pendiente'
      })), yPosition, pageWidth, margin);
    }

    // ========== DISTRIBUCIÓN DE CALIFICACIONES MEJORADA ==========
    if (pdfData.statistics?.ratingDistribution) {
      checkPageBreak(80);
      yPosition = drawSectionHeader(doc, margin, yPosition, pageWidth - 2 * margin,
        'DISTRIBUCIÓN DE CALIFICACIONES', 'Análisis detallado de puntuaciones');
      
      yPosition += 10;

      const distributionData = Object.entries(pdfData.statistics.ratingDistribution)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([stars, count]) => {
          const percentage = ((count / (pdfData.summary?.totalEvaluations || 1)) * 100).toFixed(1);
          const starsDisplay = '★'.repeat(parseInt(stars)) + '☆'.repeat(5 - parseInt(stars));
          
          return [
            { content: starsDisplay, styles: { fontStyle: 'bold', textColor: COLORS.warning } },
            { content: count.toString(), styles: { halign: 'center' } },
            { content: `${percentage}%`, styles: { halign: 'center', fontStyle: 'bold' } }
          ];
        });

      doc.autoTable({
        startY: yPosition,
        head: [
          [
            { content: 'Calificación', styles: { 
              fillColor: COLORS.primary, 
              textColor: 255, 
              fontStyle: 'bold',
              fontSize: TYPOGRAPHY.size.tableHead,
              halign: 'center'
            }},
            { content: 'Cantidad', styles: { 
              fillColor: COLORS.primary, 
              textColor: 255, 
              fontStyle: 'bold',
              fontSize: TYPOGRAPHY.size.tableHead,
              halign: 'center'
            }},
            { content: 'Porcentaje', styles: { 
              fillColor: COLORS.primary, 
              textColor: 255, 
              fontStyle: 'bold',
              fontSize: TYPOGRAPHY.size.tableHead,
              halign: 'center'
            }}
          ]
        ],
        body: distributionData,
        theme: 'grid',
        styles: {
          fontSize: TYPOGRAPHY.size.tableBody,
          font: TYPOGRAPHY.family.primary,
          cellPadding: 4,
          lineColor: COLORS.border,
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: TYPOGRAPHY.size.tableHead,
          cellPadding: 5
        },
        bodyStyles: {
          textColor: COLORS.textDark,
          fontSize: TYPOGRAPHY.size.tableBody
        },
        alternateRowStyles: {
          fillColor: COLORS.backgroundLight
        },
        columnStyles: {
          0: { cellWidth: (pageWidth - 2 * margin) * 0.45, halign: 'center' },
          1: { cellWidth: (pageWidth - 2 * margin) * 0.25, halign: 'center' },
          2: { cellWidth: (pageWidth - 2 * margin) * 0.30, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 20;
    }

    // ========== EVALUACIONES DETALLADAS MEJORADAS ==========
    // Procesar evaluaciones
    const evaluationsWithData = await Promise.all(evaluationEntries.map(async (evaluation, index) => {
      const evalData = evaluation.evaluation || evaluation || {};
      let project = evaluation.project || evaluation.proyecto || evalData.project || evalData.proyecto || {};
      const projectId = project.id || evaluation.projectId || evaluation.proyectoId || evalData.projectId || evalData.proyectoId;

      const needsProjectFetch = projectId && (
        !project.resumen ||
        !project.objetivoGeneral ||
        (!project.lineasInvestigacion && !project.lineasInvestigacionNames && !project.researchLines) ||
        (!project.nivelEstudios && !project.nivel && !project.nivel_estudio)
      );

      if (needsProjectFetch) {
        try {
          const fullProject = await projectService.getById(projectId);
          project = { ...project, ...fullProject };
        } catch (err) {
          console.warn('No se pudo obtener proyecto completo para el PDF', projectId, err);
        }
      }

      if (!project.lineasInvestigacionNames && Array.isArray(project.lineasInvestigacion)) {
        const inferredNames = project.lineasInvestigacion
          .map((linea) => {
            if (!linea) return null;
            if (typeof linea === 'string') return linea;
            return linea.nombre || linea.name || linea.titulo || linea.title || null;
          })
          .filter(Boolean);
        if (inferredNames.length) {
          project.lineasInvestigacionNames = inferredNames;
        }
      }

      if (!project.nivelEstudios && project.nivelEstudio) {
        project.nivelEstudios = project.nivelEstudio;
      }

      const evaluator = evaluation.evaluator || evaluation.evaluador || {};
      
      // Resolver líneas de investigación y nivel de estudios usando los servicios
      const lineasInvestigacion = await resolveProjectLines(project);
      const nivelEstudios = await resolveNivelEstudios(project);
      
      // Obtener información del formato
      const formatoInfo = await resolveFormatoInfo(evalData);
      
      // Enriquecer items con descripciones desde el formato
      let enrichedItems = evalData.items || evaluation.items || [];
      const formatItems = formatoInfo.formatItems || [];
      
      if (enrichedItems.length > 0) {
        enrichedItems = enrichedItems.map((it, idx) => {
          let descripcion = it.descripcion || it.desc || it.description || '';
          
          // Si falta la descripción, buscarla en el formato
          if (!descripcion || descripcion === 'Descripción no disponible' || descripcion.trim() === '') {
            if (formatItems.length > 0) {
              // Buscar por ID
              const byId = formatItems.find(fi => 
                fi.id === it.itemFormatoId || 
                fi.item_formato_id === it.itemFormatoId || 
                fi.id === it.itemEvaluadoId || 
                fi.id === it.item_id || 
                fi.nombre === it.nombre || 
                fi.nombre === it.titulo
              );
              // O por índice
              const byIndex = formatItems[idx];
              descripcion = (byId && (byId.descripcion || byId.descripcionItem || byId.descripcion_formato)) || 
                           (byIndex && (byIndex.descripcion || byIndex.descripcionItem || byIndex.descripcion_formato)) || 
                           '';
            }
          }
          
          // También obtener el nombre del criterio si está disponible
          let criterioNombre = it.criterio?.nombre || it.criterioNombre || it.criterio_nombre || '';
          if (!criterioNombre && formatItems.length > 0) {
            const matchedItem = formatItems.find(fi => 
              fi.id === it.itemFormatoId || 
              fi.item_formato_id === it.itemFormatoId ||
              fi.nombre === it.nombre
            );
            criterioNombre = matchedItem?.criterio?.nombre || matchedItem?.criterioNombre || '';
          }
          
          return { ...it, descripcion, criterioNombre: criterioNombre || it.criterioNombre || 'General' };
        });
      }

      // Formatear palabras clave
      const palabrasClave = formatListValue(
        project.palabrasClave ||
        project.palabras_clave ||
        project.keywords ||
        project.tags ||
        project.keywordList ||
        []
      );

      return {
        index: index + 1,
        title: project.titulo || project.title || 'Sin título',
        status: evalData.estado || 'COMPLETADA',
        projectInfo: {
          titulo: project.titulo || project.title || project.nombre || 'No disponible',
          investigador: project.investigadorPrincipal?.nombre
            || project.investigadorPrincipal
            || project.principalInvestigator
            || project.investigador?.nombre
            || project.investigador
            || project.responsableProyecto
            || 'No disponible',
          nivelEstudios: nivelEstudios,
          lineasInvestigacion: lineasInvestigacion,
          palabrasClave,
          resumen: project.resumen
            || project.summary
            || project.abstract
            || project.descripcion
            || project.descripcionGeneral
            || 'Sin resumen disponible',
          objetivo: project.objetivoGeneral
            || project.objetivo_general
            || project.generalObjective
            || project.objetivo
            || project.goal
            || 'No disponible',
          metodologia: project.metodologia
            || project.methodology
            || project.metodo
            || project.metodologiaGeneral
            || project.metodologiaDescripcion
            || '',
          duracion: project.duracion
            || project.duration
            || project.tiempoEjecucion
            || project.plazo
            || '',
          presupuesto: project.presupuesto
            || project.presupuestoTotal
            || project.budget
            || project.costoTotal
            || ''
        },
        evalInfo: {
          evaluador: evaluator.nombre || evaluator.name || 'No disponible',
          email: evaluator.email || 'No disponible',
          formato: formatoInfo.formatoNombre || 'No disponible',
          formatoDescripcion: formatoInfo.formatoDescripcion || '',
          fechaAsignacion: formatDate(evalData.fechaAsignacion),
          fechaAceptacion: formatDate(evalData.fechaAceptacion),
          fechaFinalizacion: formatDate(evalData.fechaFinalizacion),
          calificacionTotal: evalData.calificacionTotal || evalData.finalScore || evalData.score || 'No disponible',
          tiempoEvaluacion: evaluation.metadata?.tiempoEvaluacion || evalData.tiempoEvaluacion || 'No disponible'
        },
        items: enrichedItems,
        observaciones: evalData.observaciones || evalData.observations || evalData.comentariosGenerales
      };
    }));

    // Generar contenido para cada evaluación
    for (const [evalIndex, evaluation] of evaluationsWithData.entries()) {
      checkPageBreak(150);
      
      // Header de evaluación con diseño mejorado
      doc.setFillColor(COLORS.backgroundLight);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
      
      doc.setFontSize(TYPOGRAPHY.size.subsection);
      doc.setFont(TYPOGRAPHY.family.bold, 'bold');
      doc.setTextColor(COLORS.primaryDark);
      const evalTitle = `EVALUACIÓN ${evaluation.index}: ${evaluation.title}`;
      const titleMaxWidth = pageWidth - 2 * margin - 55;
      const evalTitleLines = doc.splitTextToSize(evalTitle, titleMaxWidth);
      doc.text(evalTitleLines[0], margin + 10, yPosition + 12);
      
      // Badge de estado mejorado
      const status = evaluation.status;
      const statusColor = status === 'COMPLETADA' ? COLORS.success : COLORS.warning;
      
      doc.setFillColor(statusColor);
      const badgeWidth = 42;
      doc.roundedRect(pageWidth - margin - badgeWidth, yPosition + 8, badgeWidth, 13, 6, 6, 'F');
      doc.setFontSize(TYPOGRAPHY.size.caption);
      doc.setTextColor(255);
      doc.text(status.toUpperCase(), pageWidth - margin - badgeWidth / 2, yPosition + 16, { align: 'center' });
      
      yPosition += 40;

      // ========== INFORMACIÓN DEL PROYECTO EN TABLA ==========
      checkPageBreak(100);
      
      doc.setFontSize(TYPOGRAPHY.size.subsection);
      doc.setFont(TYPOGRAPHY.family.bold, 'bold');
      doc.setTextColor(COLORS.primaryDark);
      doc.text('INFORMACIÓN DEL PROYECTO', margin, yPosition);
      
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(1);
      doc.line(margin, yPosition + 2, margin + 45, yPosition + 2);
      
      yPosition += 10;

      // Tabla de información del proyecto
      const projectInfoRows = [
        { label: 'Título', value: evaluation.projectInfo.titulo },
        { label: 'Investigador Principal', value: evaluation.projectInfo.investigador },
        { label: 'Nivel de Estudios', value: evaluation.projectInfo.nivelEstudios },
        { label: 'Líneas de Investigación', value: evaluation.projectInfo.lineasInvestigacion },
        { label: 'Palabras Clave', value: evaluation.projectInfo.palabrasClave },
        { label: 'Objetivo General', value: evaluation.projectInfo.objetivo }
      ];

      // Agregar campos opcionales si existen
      if (evaluation.projectInfo.metodologia && evaluation.projectInfo.metodologia !== 'No disponible') {
        projectInfoRows.push({ label: 'Metodología', value: evaluation.projectInfo.metodologia });
      }
      if (evaluation.projectInfo.duracion && evaluation.projectInfo.duracion !== 'No disponible') {
        projectInfoRows.push({ label: 'Duración', value: evaluation.projectInfo.duracion });
      }
      if (evaluation.projectInfo.presupuesto && evaluation.projectInfo.presupuesto !== 'No disponible') {
        projectInfoRows.push({ label: 'Presupuesto', value: evaluation.projectInfo.presupuesto });
      }

      doc.autoTable({
        startY: yPosition,
        body: projectInfoRows.map(({ label, value }) => ([
          { content: label, styles: { fontStyle: 'bold', textColor: COLORS.textDark, fontSize: TYPOGRAPHY.size.tableBody } },
          { content: value, styles: { textColor: COLORS.textMedium, fontSize: TYPOGRAPHY.size.tableBody } }
        ])),
        tableWidth: pageWidth - 2 * margin,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
          font: TYPOGRAPHY.family.primary,
          fontSize: TYPOGRAPHY.size.tableBody,
          cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
          lineColor: COLORS.borderLight,
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          minCellHeight: 8
        },
        alternateRowStyles: {
          fillColor: COLORS.backgroundLight
        },
        columnStyles: {
          0: { cellWidth: 50, overflow: 'linebreak' },
          1: { cellWidth: pageWidth - 2 * margin - 50, overflow: 'linebreak' }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 8;

      // Resumen del proyecto en cuadro destacado
      checkPageBreak(55);
      
      doc.setFontSize(TYPOGRAPHY.size.body);
      doc.setFont(TYPOGRAPHY.family.bold, 'bold');
      doc.setTextColor(COLORS.primaryDark);
      doc.text('Resumen Ejecutivo:', margin, yPosition);
      yPosition += 5;

      const resumen = evaluation.projectInfo.resumen || 'Sin resumen disponible';
      const resumenLines = doc.splitTextToSize(resumen, pageWidth - 2 * margin - 12);
      const resumenHeight = Math.min(resumenLines.length * 4.5 + 12, 55);

      doc.setFillColor(250, 251, 252);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, resumenHeight, 3, 3, 'F');
      doc.setDrawColor(COLORS.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, resumenHeight, 3, 3, 'S');

      doc.setFontSize(TYPOGRAPHY.size.small);
      doc.setFont(TYPOGRAPHY.family.primary, 'normal');
      doc.setTextColor(COLORS.textMedium);
      const maxResumenLines = Math.floor((resumenHeight - 10) / 4.5);
      resumenLines.slice(0, maxResumenLines).forEach((line, index) => {
        doc.text(line, margin + 6, yPosition + 8 + (index * 4.5));
      });

      yPosition += resumenHeight + 12;

      // ========== INFORMACIÓN DE LA EVALUACIÓN EN TABLA ==========
      checkPageBreak(80);
      
      doc.setFontSize(TYPOGRAPHY.size.subsection);
      doc.setFont(TYPOGRAPHY.family.bold, 'bold');
      doc.setTextColor(COLORS.primaryDark);
      doc.text('INFORMACIÓN DE LA EVALUACIÓN', margin, yPosition);
      
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(1);
      doc.line(margin, yPosition + 2, margin + 50, yPosition + 2);
      
      yPosition += 10;

      const evalInfoRows = [
        { label: 'Evaluador', value: evaluation.evalInfo.evaluador },
        { label: 'Email', value: evaluation.evalInfo.email },
        { label: 'Formato de Evaluación', value: evaluation.evalInfo.formato },
        { label: 'Fecha Asignación', value: evaluation.evalInfo.fechaAsignacion },
        { label: 'Fecha Aceptación', value: evaluation.evalInfo.fechaAceptacion },
        { label: 'Fecha Finalización', value: evaluation.evalInfo.fechaFinalizacion },
        { label: 'Tiempo de Evaluación', value: evaluation.evalInfo.tiempoEvaluacion }
      ];

      // Agregar descripción del formato si existe
      if (evaluation.evalInfo.formatoDescripcion && evaluation.evalInfo.formatoDescripcion.trim()) {
        evalInfoRows.splice(3, 0, { label: 'Descripción Formato', value: evaluation.evalInfo.formatoDescripcion });
      }

      doc.autoTable({
        startY: yPosition,
        body: evalInfoRows.map(({ label, value }) => ([
          { content: label, styles: { fontStyle: 'bold', textColor: COLORS.textDark, fontSize: TYPOGRAPHY.size.tableBody } },
          { content: value, styles: { textColor: COLORS.textMedium, fontSize: TYPOGRAPHY.size.tableBody } }
        ])),
        tableWidth: pageWidth - 2 * margin,
        margin: { left: margin, right: margin },
        theme: 'plain',
        styles: {
          font: TYPOGRAPHY.family.primary,
          fontSize: TYPOGRAPHY.size.tableBody,
          cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
          lineColor: COLORS.borderLight,
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          minCellHeight: 8
        },
        alternateRowStyles: {
          fillColor: COLORS.backgroundLight
        },
        columnStyles: {
          0: { cellWidth: 50, overflow: 'linebreak' },
          1: { cellWidth: pageWidth - 2 * margin - 50, overflow: 'linebreak' }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Calificación Total Destacada
      checkPageBreak(35);
      
      const scoreBoxWidth = 80;
      const scoreBoxHeight = 28;
      const scoreBoxX = (pageWidth - scoreBoxWidth) / 2;
      
      doc.setFillColor(COLORS.backgroundLight);
      doc.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 5, 5, 'F');
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 5, 5, 'S');
      
      doc.setFontSize(TYPOGRAPHY.size.small);
      doc.setFont(TYPOGRAPHY.family.bold, 'bold');
      doc.setTextColor(COLORS.primaryDark);
      doc.text('CALIFICACIÓN TOTAL', scoreBoxX + scoreBoxWidth / 2, yPosition + 10, { align: 'center' });
      
      doc.setFontSize(TYPOGRAPHY.size.metric);
      doc.setTextColor(COLORS.accent);
      const totalScore = evaluation.evalInfo.calificacionTotal != null ? String(evaluation.evalInfo.calificacionTotal) : 'N/D';
      doc.text(totalScore, scoreBoxX + scoreBoxWidth / 2, yPosition + 22, { align: 'center' });

      yPosition += scoreBoxHeight + 15;

      // ========== CRITERIOS EVALUADOS MEJORADOS ==========
      if (evaluation.items && evaluation.items.length > 0) {
        checkPageBreak(60);
        
        doc.setFontSize(TYPOGRAPHY.size.subsection);
        doc.setFont(TYPOGRAPHY.family.bold, 'bold');
        doc.setTextColor(COLORS.primaryDark);
        doc.text('CRITERIOS DE EVALUACIÓN', margin, yPosition);
        
        doc.setDrawColor(COLORS.primary);
        doc.setLineWidth(1);
        doc.line(margin, yPosition + 2, margin + 45, yPosition + 2);
        
        doc.setFontSize(TYPOGRAPHY.size.small);
        doc.setFont(TYPOGRAPHY.family.primary, 'normal');
        doc.setTextColor(COLORS.textLight);
        doc.text('Desglose detallado por criterio e ítem', margin, yPosition + 8);
        
        yPosition += 15;

        // Agrupar items por criterio y crear filas con cabeceras de grupo
        const groupsMap = new Map();
        evaluation.items.forEach((item, idx) => {
          const criterioNombre = item.criterioNombre || item.criterio?.nombre || item.criterioNombre || item.criterio_nombre || 'General';
          const key = String(criterioNombre || 'General');
          if (!groupsMap.has(key)) groupsMap.set(key, []);
          groupsMap.get(key).push({ item, idx });
        });

        const groupedBody = [];
        for (const [criterio, items] of groupsMap.entries()) {
          // fila de encabezado de grupo (span across all cols)
          groupedBody.push([
            { content: criterio, colSpan: 5, styles: { fillColor: COLORS.primary, textColor: 255, fontStyle: 'bold', halign: 'left' } }
          ]);

          items.forEach(({ item, idx }) => {
            const itemName = item.nombre || item.titulo || item.title || `Ítem ${idx + 1}`;
            const descripcion = item.descripcion || item.desc || item.description || 'Sin descripción disponible';
            const observaciones = item.observacion || item.observaciones || item.comentarios || item.notes || '';
            const rawScore = item.calificacion ?? item.valor ?? item.score ?? item.puntuacion;
            const numericScore = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore);
            const showPercent = Number.isFinite(numericScore) && numericScore > 5;
            const scoreLabel = Number.isFinite(numericScore)
              ? `${numericScore.toFixed(1)}${showPercent ? '%' : ''}`
              : 'N/A';

            let scoreColor = COLORS.textDark;
            if (Number.isFinite(numericScore)) {
              const normalized = showPercent ? numericScore / 20 : numericScore;
              if (normalized >= 4) scoreColor = COLORS.success;
              else if (normalized >= 3) scoreColor = COLORS.warning;
              else scoreColor = COLORS.secondary;
            }

            groupedBody.push([
              { content: '', styles: { fontSize: TYPOGRAPHY.size.tableBody } },
              { content: itemName, styles: { fontStyle: 'bold', fontSize: TYPOGRAPHY.size.tableBody } },
              { content: descripcion, styles: { fontSize: TYPOGRAPHY.size.tableBody } },
              { content: observaciones, styles: { fontSize: TYPOGRAPHY.size.tableBody } },
              { content: scoreLabel, styles: { halign: 'center', fontStyle: 'bold', textColor: scoreColor } }
            ]);
          });
        }

        doc.autoTable({
          startY: yPosition,
          tableWidth: pageWidth - 2 * margin,
          margin: { left: margin, right: margin },
          head: [[ 
            { content: 'Criterio', styles: { fontStyle: 'bold', halign: 'center' } },
            { content: 'Ítem', styles: { fontStyle: 'bold', halign: 'left' } },
            { content: 'Descripción', styles: { fontStyle: 'bold', halign: 'left' } },
            { content: 'Observaciones', styles: { fontStyle: 'bold', halign: 'left' } },
            { content: 'Calif.', styles: { fontStyle: 'bold', halign: 'center' } }
          ]],
          body: groupedBody,
          theme: 'grid',
          styles: {
            font: TYPOGRAPHY.family.primary,
            fontSize: TYPOGRAPHY.size.tableBody,
            cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
            lineColor: COLORS.border,
            lineWidth: 0.1,
            valign: 'top',
            overflow: 'linebreak',
            minCellHeight: 10
          },
          didParseCell: function (data) {
            // Asegurar estilo para filas de grupo (colSpan)
            if (data.cell && data.cell.colSpan && data.cell.colSpan > 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.halign = 'left';
            }
          },
          headStyles: {
            fillColor: COLORS.primary,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: TYPOGRAPHY.size.tableHead,
            cellPadding: { top: 5, right: 3, bottom: 5, left: 3 }
          },
          bodyStyles: {
            textColor: COLORS.textDark,
            fontSize: TYPOGRAPHY.size.tableBody
          },
          alternateRowStyles: {
            fillColor: COLORS.backgroundLight
          },
          columnStyles: {
            0: { cellWidth: (pageWidth - 2 * margin) * 0.14, halign: 'left' },
            1: { cellWidth: (pageWidth - 2 * margin) * 0.12 },
            2: { cellWidth: (pageWidth - 2 * margin) * 0.36 },
            3: { cellWidth: (pageWidth - 2 * margin) * 0.26 },
            4: { cellWidth: (pageWidth - 2 * margin) * 0.12, halign: 'center' }
          }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // ========== OBSERVACIONES GENERALES MEJORADAS ==========
      if (evaluation.observaciones) {
        const observationLines = doc.splitTextToSize(evaluation.observaciones, pageWidth - 2 * margin - 12);
        const obsHeight = Math.min(observationLines.length * 4.2 + 16, 100);
        checkPageBreak(obsHeight + 30);
        yPosition = drawSectionHeader(doc, margin, yPosition, pageWidth - 2 * margin,
          'OBSERVACIONES GENERALES', 'Comentarios y recomendaciones finales');
        
        yPosition += 8;
        
        // Cuadro de observaciones con diseño mejorado
        doc.setFillColor(COLORS.backgroundLighter);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, obsHeight, 4, 4, 'F');
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, obsHeight, 4, 4, 'S');
        
        doc.setFontSize(TYPOGRAPHY.size.body);
        doc.setFont(TYPOGRAPHY.family.primary, 'normal');
        doc.setTextColor(COLORS.textMedium);
        const maxLines = Math.floor((obsHeight - 12) / 4.2);
        observationLines.slice(0, maxLines).forEach((line, index) => {
          doc.text(line, margin + 6, yPosition + 9 + (index * 4.2));
        });
        
        yPosition += obsHeight + 20;
      }

      // Separador entre evaluaciones (excepto la última)
      if (evalIndex < evaluationsWithData.length - 1) {
        checkPageBreak(30);
        doc.setDrawColor(COLORS.borderLight);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        doc.setFillColor(COLORS.primaryLight);
        doc.circle(pageWidth / 2, yPosition, 2, 'F');
        yPosition += 20;
      }
    }

    // ========== PIE DE PÁGINA FINAL ==========
    addFooter(doc, pageWidth, pageHeight, margin);

    // Guardar el PDF
    const fileName = `reporte-evaluaciones-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

// Función para exportar evaluación individual
export const generateIndividualEvaluationPDF = async (evaluationData) => {
  return generateEvaluationPDF({
    ...evaluationData,
    evaluations: [evaluationData],
    summary: {
      totalProjects: 1,
      totalEvaluations: 1,
      overallAverage: evaluationData.evaluation?.calificacionTotal || 0
    },
    generatedDate: new Date().toLocaleDateString('es-ES')
  });
};