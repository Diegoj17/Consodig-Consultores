import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { researchService } from '../services/researchService';
import { projectService } from '../services/projectService';
import evaluationFormatService from '../services/evaluationFormatService';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return 'Fecha inválida';
  }
};

const safe = (v) => (v == null || v === '') ? 'N/A' : v;

// Paleta tomada del tema (EvaluatorPages.css)
const PALETTE = {
  primary: '#007bbf',
  primaryDark: '#005a8d',
  textDark: '#000000',
  textLight: '#6b7280',
  bgLight: '#f8fafc',
  border: '#e2e8f0'
};

const resolveProjectLines = async (evaluation) => {
  const p = evaluation.proyecto || evaluation.project || {};
  try {
    const allLineas = await researchService.getAll();
    const normalized = projectService.normalizeProject(p || {}, allLineas || []);
    if (Array.isArray(normalized.lineasInvestigacionNames) && normalized.lineasInvestigacionNames.length > 0) {
      return normalized.lineasInvestigacionNames.join(', ');
    }
    if (Array.isArray(normalized.lineasInvestigacion) && normalized.lineasInvestigacion.length > 0) {
      return normalized.lineasInvestigacion.map(l => l.nombre || l.name).filter(Boolean).join(', ');
    }
  } catch (e) {
    console.warn('No se pudieron normalizar líneas de investigación', e);
  }
  const dirs = p.lineasInvestigacion || p.lineas || p.lineas_investigacion || p.lineasIds || p.lineasInvestigacionNames;
  if (!dirs) return 'N/A';
  if (Array.isArray(dirs)) {
    const names = dirs.map(l => {
      if (!l) return null;
      if (typeof l === 'string') return l;
      return l.nombre || l.name || l.titulo || l.title || (l.id ? String(l.id) : null);
    }).filter(Boolean);
    return names.length ? names.join(', ') : 'N/A';
  }
  return String(dirs || 'N/A');
};

const resolveNivelEstudios = async (evaluation) => {
  const p = evaluation.proyecto || evaluation.project || {};
  try {
    const allLineas = await researchService.getAll();
    const normalized = projectService.normalizeProject(p || {}, allLineas || []);
    if (normalized && normalized.nivelEstudios) return normalized.nivelEstudios;
  } catch (e) {
    console.warn('No se pudo normalizar nivel de estudios', e);
  }
  const nivel = p.nivelEstudios || p.nivel || p.nivelId || p.nivel_estudio || evaluation.nivel || null;
  if (!nivel) return 'N/A';
  if (typeof nivel === 'object') return nivel.nombre || nivel.name || String(nivel.id || nivel.value || 'N/A');
  return String(nivel);
};

// Helpers kept lean to avoid eslint unused warnings

export async function generateEvaluationPdf(evaluation) {
  // Construir contenedor imprimible
  const container = document.createElement('div');
  container.style.width = '900px';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.background = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = '16px';
  container.style.lineHeight = '1.4';
  container.style.position = 'fixed';
  container.style.left = '-9999px';

  // Resolver metadatos que requieren llamadas async (nivel y líneas)
  const nivelStr = await resolveNivelEstudios(evaluation);
  const lineasStr = await resolveProjectLines(evaluation);

  // Estilos inline para look profesional (usa paleta del sistema)
  container.innerHTML = `
    <div style="max-width:900px;margin:0 auto;">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="/img/logo.png" alt="Consodig" style="height:60px;object-fit:contain;" />
          <div>
            <h1 style="margin:0;font-size:22px;color:${PALETTE.primary};font-weight:600;">Reporte de Evaluación</h1>
            <div style="color:${PALETTE.textLight};font-size:16px;">Resumen completo de proyecto y evaluación</div>
          </div>
        </div>
        <div style="text-align:right;color:${PALETTE.textLight};font-size:16px;">Generado: ${formatDate(new Date().toISOString())}</div>
      </header>

      <section style="border-radius:8px;padding:18px;margin-bottom:20px;background:linear-gradient(180deg,${PALETTE.bgLight},#ffffff);box-shadow:0 1px 4px rgba(13,38,63,0.04);">
        <h2 style="margin:0 0 8px 0;color:${PALETTE.primaryDark};font-size:20px;font-weight:600;">Información del Proyecto</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:16px;color:${PALETTE.textDark};">
          <div><strong>Título:</strong><div>${safe(evaluation.proyecto?.titulo || evaluation.project?.title || evaluation.proyecto?.title)}</div></div>
          <div><strong>Resumen:</strong><div>${safe(evaluation.proyecto?.resumen || evaluation.project?.resumen || evaluation.proyecto?.abstract)}</div></div>
          <div><strong>Objetivo General:</strong><div>${safe(evaluation.proyecto?.objetivoGeneral || evaluation.project?.objetivoGeneral)}</div></div>
          <div><strong>Palabras Clave:</strong><div>${safe(Array.isArray(evaluation.proyecto?.palabrasClave) ? evaluation.proyecto.palabrasClave.join(', ') : (evaluation.proyecto?.palabrasClave || evaluation.project?.keywords || 'N/A'))}</div></div>
          <div><strong>Nivel de Estudios:</strong><div>${safe(nivelStr)}</div></div>
          <div><strong>Líneas de Investigación:</strong><div>${safe(lineasStr)}</div></div>
        </div>
      </section>

      <section style="border-radius:8px;padding:18px;margin-bottom:20px;background:#fff;box-shadow:0 1px 4px rgba(13,38,63,0.04);">
        <h2 style="margin:0 0 8px 0;color:${PALETTE.primaryDark};font-size:20px;font-weight:600;">Información de la Evaluación</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:16px;color:${PALETTE.textDark};">
          <div><strong>Formato:</strong><div>${safe(evaluation.formato?.nombre || evaluation.evaluationFormat?.name || '')}</div></div>
          <div><strong>Descripción Formato:</strong><div>${safe(evaluation.formato?.descripcion || evaluation.evaluationFormat?.description || '')}</div></div>
          <div><strong>Calificación Final:</strong><div style="font-size:20px;color:${PALETTE.primary};padding-top:6px;font-weight:600;">${safe(String(evaluation.calificacionTotal ?? evaluation.finalScore ?? evaluation.score ?? 0))}%</div></div>
          <div><strong>Fechas:</strong>
            <div>Asignada: ${formatDate(evaluation.fechaAsignacion)}</div>
            <div>Aceptada: ${formatDate(evaluation.fechaAceptacion)}</div>
            <div>Completada: ${formatDate(evaluation.fechaFinalizacion)}</div>
          </div>
        </div>
      </section>

      <!-- La tabla de criterios será añadida con jspdf-autotable (más profesional y compacta) -->

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidthMm = (canvas.width * 0.264583); // px to mm approx (1px ≈ 0.264583 mm)
    const imgHeightMm = (canvas.height * 0.264583);

    const margin = 10;
    const availableWidth = pageWidth - margin * 2;
    const ratio = availableWidth / imgWidthMm;
    const renderHeight = imgHeightMm * ratio;

    if (renderHeight < pageHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, renderHeight);
    } else {
      // multipage
      let remainingHeight = imgHeightMm;
      let position = 0;
      const imgHeightPerPage = (pageHeight - margin * 2) / ratio;
      while (remainingHeight > 0) {
        const canvasPage = document.createElement('canvas');
        canvasPage.width = canvas.width;
        canvasPage.height = Math.min(canvas.height - position, imgHeightPerPage * (96 / 25.4) * ratio);
        const ctx = canvasPage.getContext('2d');
        ctx.drawImage(canvas, 0, position, canvas.width, canvasPage.height, 0, 0, canvas.width, canvasPage.height);
        const pageData = canvasPage.toDataURL('image/png');
        const pageRenderHeight = (canvasPage.height * 0.264583) * ratio;
        if (position > 0) pdf.addPage();
        pdf.addImage(pageData, 'PNG', margin, margin, availableWidth, pageRenderHeight);
        remainingHeight -= (canvasPage.height * 0.264583);
        position += canvasPage.height;
      }
    }

    // Ahora generar tabla de criterios con jspdf-autotable
    const groups = (Array.isArray(evaluation.items) && evaluation.items.length > 0) ? (function(){
      const items = evaluation.items;
      const m = new Map();
      items.forEach(it => {
        const cname = it.criterio?.nombre || it.criterioNombre || it.criterio_nombre || 'Sin Criterio';
        const key = String(cname);
        if (!m.has(key)) m.set(key, []);
        m.get(key).push(it);
      });
      return Array.from(m.entries()).map(([nombre, items]) => ({ nombre, items }));
    })() : [];

    // Prepare rows: [Criterio, Ítem, Descripción, Observaciones, Calificación]
    // Si faltan descripciones, intentar obtenerlas desde el formato usando el servicio
    let formatItems = [];
    const formatId = evaluation.formato?.id || evaluation.formatoId || evaluation.formato_id || evaluation.evaluationFormat?.id || evaluation.evaluationFormat?.formatoId;
    const hasItemsArray = Array.isArray(evaluation.items) && evaluation.items.length > 0;
    if (hasItemsArray) {
      const missingDesc = evaluation.items.some(it => !it?.descripcion || String(it.descripcion).trim() === '' || it.descripcion === 'Descripción no disponible');
      if (missingDesc && formatId) {
        try {
          const fmt = (evaluation.formato && Array.isArray(evaluation.formato.items) && evaluation.formato) || await evaluationFormatService.getFormatById(formatId);
          formatItems = fmt?.items || fmt?.item_formato || [];
        } catch (err) {
          console.warn('No se pudo obtener formato para descripciones:', err);
        }
      }
    }

    const rows = [];
    groups.forEach(g => {
      const criterioNombre = (g.nombre && g.nombre !== 'Sin Criterio') ? g.nombre : (evaluation.formato?.criterios?.[0]?.criterioNombre || evaluation.formato?.items?.[0]?.criterioNombre || 'Sin Criterio');
      g.items.forEach((it, idx) => {
        const itemName = it.nombre || it.titulo || it.title || it.name || (`Ítem ${idx + 1}`);
        // Preferir la descripción del ítem; si falta, usar la del formato (por id o por índice)
        let descripcion = it.descripcion || it.desc || it.description || '';
        if ((!descripcion || descripcion === 'Descripción no disponible') && formatItems && formatItems.length > 0) {
          const byId = formatItems.find(fi => fi.id === it.itemFormatoId || fi.item_formato_id === it.itemFormatoId || fi.id === it.itemEvaluadoId || fi.id === it.item_id || fi.nombre === it.nombre || fi.nombre === it.titulo);
          const byIndex = formatItems[idx];
          descripcion = (byId && (byId.descripcion || byId.descripcionItem || byId.descripcion_formato)) || (byIndex && (byIndex.descripcion || byIndex.descripcionItem || byIndex.descripcion_formato)) || descripcion || '';
        }

        const observ = it.comentarios || it.observacion || it.observaciones || it.notes || '';
        const score = String(it.calificacion ?? it.valor ?? it.puntuacion ?? it.score ?? 0) + '%';
        rows.push([criterioNombre, itemName, descripcion, observ, score]);
      });
    });

    // If header image already occupies most of the page, start table after it
    const startY = margin + renderHeight + 6;

    // Hacer que la tabla ocupe exactamente el mismo ancho útil que la imagen/encabezado
    const tableWidth = availableWidth;

    pdf.autoTable({
      startY: startY,
      tableWidth: tableWidth,
      margin: { left: margin, right: margin },
      head: [[ 'Criterio', 'Ítem', 'Descripción', 'Observaciones', 'Calificación' ]],
      body: rows,
      // Tabla más compacta: fuente pequeña, padding reducido y ajuste por líneas
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: PALETTE.primary, textColor: 255, halign: 'center', font: 'helvetica', fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [250,250,250] },
      // Columnas proporcionales al ancho total, descripción es la más ancha
      columnStyles: {
        0: { cellWidth: Math.round(tableWidth * 0.14) },
        1: { cellWidth: Math.round(tableWidth * 0.12) },
        // Reducida ligeramente: descripción 42% -> antes 46%
        2: { cellWidth: Math.round(tableWidth * 0.42) },
        3: { cellWidth: Math.round(tableWidth * 0.18) },
        // Aumentada para que la calificación se vea mejor (14% en lugar de 10%)
        4: { cellWidth: Math.round(tableWidth * 0.14), halign: 'right' }
      },
      bodyStyles: { valign: 'top', minCellHeight: 5, font: 'helvetica', fontSize: 9 },
      didDrawPage: function () {
        // footer en cada página
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(PALETTE.textLight);
        pdf.text('Consodig Consultores — Reporte generado automáticamente', margin, pageHeight - 10);
        pdf.text('Profesional • Elegante • Innovador', pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
    });

    const fileName = `reporte_evaluacion_${(evaluation.proyecto?.titulo || evaluation.project?.title || 'proyecto').toString().replace(/[^a-z0-9]+/gi,'_').toLowerCase()}.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error('Error generando PDF', err);
    throw err;
  } finally {
    // cleanup
    document.body.removeChild(container);
  }
}

export default generateEvaluationPdf;
