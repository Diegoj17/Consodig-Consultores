// components/management/project/admin/EvaluationReviewModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTimes, FaCheck, FaEdit, FaFileAlt, FaUser, FaCalendar, 
  FaClipboardList, FaSave, FaUndo, FaEye, FaComment,
  FaExclamationTriangle, FaInfoCircle, FaCalculator,
  FaAlignLeft, FaListAlt, FaHashtag
} from 'react-icons/fa';
import Modal from '../../../common/Modal';
import '../../../../styles/management/project/admin/EvaluationReviewModal.css';

import evaluationService from '../../../../services/evaluationService';
import { evaluadorService } from '../../../../services/evaluadorService';
import researchService from '../../../../services/researchService';
import { useAuth } from '../../../../contexts/AuthContext';

const EvaluationReviewModal = ({ 
  evaluation, 
  onClose, 
  onApprove, 
  onEditEvaluation 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [editingItems, setEditingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [_observacionGeneral, set_ObservacionGeneral] = useState('');
  
  // Estados para el modal de confirmación
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState('success');
  // Modal de confirmación/confirm dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  // Mensaje inline (no bloquear con modal)
  const [inlineMessage, setInlineMessage] = useState(null);

  // Estados principales
  const [itemsEditados, setItemsEditados] = useState([]);
  const [modifiedCount, setModifiedCount] = useState(0);
  const [groupedCriteria, setGroupedCriteria] = useState([]);
  // estado para inputs temporales de score (permitir cadena vacía mientras el usuario escribe)
  const [scoreInputs, setScoreInputs] = useState({});

  // Inicializar estados cuando la evaluación cambia
  
  // Función para construir los grupos de criterios
  const buildCriteriaGroups = useCallback((items) => {
    if (!items || items.length === 0) {
      setGroupedCriteria([]);
      return;
    }

    // Intentar obtener la estructura de criterios desde el formato asociado a la evaluación
    const formatCriterios = (
      evaluation?.formato?.criterios || evaluation?.formato?.items || evaluation?.evaluationFormat?.criterios ||
      evaluation?.evaluationFormat?.items || evaluation?.format?.criterios || evaluation?.format?.items || null
    );

    // Si el formato trae una lista de criterios o una lista de items del formato, usarla como fuente canónica
    if (Array.isArray(formatCriterios) && formatCriterios.length > 0) {
      // Detectar si los elementos representan criterios (cada elemento tiene subitems) o items de formato (tienen campo criterioNombre)
      const looksLikeFormatItems = formatCriterios.some(fc => fc.criterioNombre || fc.item_formato_id || fc.itemFormatoId || fc.nombre);

      // Función auxiliar para obtener posible id de itemFormato que identifique a un item del formato
      // Preferir campos que indiquen vínculo con el formato (itemFormatoId, item_formato_id, etc),
      // y en último recurso usar `id`.
      const extractFormatItemId = (it) => (
        it.itemFormatoId || it.item_formato_id || it.formatoItemId || it.item_formato || it.itemFormato?.id || it.formatoId || it.formato_item_id || it.id || null
      );

      if (looksLikeFormatItems) {
        // Agrupar por criterioNombre cuando los items del formato traen ese campo
        const criteriaMap = new Map();
        const itemToCritMap = new Map();
        const formatItemById = new Map();

        formatCriterios.forEach((fi) => {
          const fid = extractFormatItemId(fi);
          const cname = (fi.criterioNombre || fi.criterio?.nombre || fi.criterioNombre?.trim && fi.criterioNombre.trim())
            ? String(fi.criterioNombre || fi.criterio?.nombre).trim()
            : (fi.criterio?.id ? `Criterio ${fi.criterio.id}` : (fi.criterioId ? `Criterio ${fi.criterioId}` : 'Sin Criterio'));

          const groupKey = `crit:${cname}`;
          if (!criteriaMap.has(groupKey)) {
            criteriaMap.set(groupKey, { id: groupKey, nombre: cname, items: [] });
          }

          // Mapear el item de formato al criterio (por id de item de formato)
          if (fid != null) {
            itemToCritMap.set(String(fid), groupKey);
            formatItemById.set(String(fid), fi);
          }
          // También guardar el propio item en el grupo si se quiere mostrar la definición del item
          // (No empujamos aquí; empujaremos los items reales de evaluación más abajo)
        });

        // DEBUG: mostrar mapeos entre itemFormatoId -> criterio y metadata del formato
        try {
          console.debug('[EvaluationReviewModal] formatItemById:', Array.from(formatItemById.entries()));
          console.debug('[EvaluationReviewModal] itemToCritMap:', Array.from(itemToCritMap.entries()));
        } catch {
          // noop
        }

        // Asignar cada item de la evaluación al criterio correspondiente (si se encuentra)
        const unassigned = [];
        items.forEach((item) => {
          const fmtId = extractFormatItemId(item);
          let assigned = false;

          if (fmtId != null && itemToCritMap.has(String(fmtId))) {
            const critKey = itemToCritMap.get(String(fmtId));
            const fmtItem = formatItemById.get(String(fmtId));
            // Fusionar metadatos del item de formato con el item evaluado para mostrar nombre/desc
            const merged = {
              ...item,
              nombre: fmtItem?.nombre ?? item.nombre,
              descripcion: fmtItem?.descripcion ?? item.descripcion,
              itemFormatoId: fmtId,
              formatoItem: fmtItem
            };
            criteriaMap.get(critKey).items.push(merged);
            assigned = true;
          }

          if (!assigned) {
            // intentar asignar por item.criterio.nombre
            const cname = item.criterio?.nombre || item.criterioNombre || item.nombreCriterio || null;
            if (cname) {
              const key = `crit:${String(cname).trim()}`;
              if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: String(cname).trim(), items: [] });
              criteriaMap.get(key).items.push(item);
              assigned = true;
            }
          }

          if (!assigned) {
            unassigned.push(item);
          }
        });

        // Si hay items no asignados, colocarlos en un grupo "Sin Criterio"
        if (unassigned.length > 0) {
          const key = 'crit:Sin Criterio';
          if (!criteriaMap.has(key)) criteriaMap.set(key, { id: key, nombre: 'Sin Criterio', items: [] });
          unassigned.forEach(it => criteriaMap.get(key).items.push(it));
        }

        const groups = Array.from(criteriaMap.values()).filter(g => g.items && g.items.length > 0);
        groups.sort((a,b) => String(a.nombre).localeCompare(String(b.nombre)));
        setGroupedCriteria(groups);
        return;
      }

      // Si llegamos aquí, formatCriterios parece representar criterios con subitems
      const criteriaMap = new Map();
      formatCriterios.forEach((crit) => {
        const cid = crit.id ?? crit.criterioId ?? crit.criterio_id ?? crit.nombre ?? (`criterio-${Math.random()}`);
        const cname = crit.nombre || crit.titulo || crit.descripcion || `Criterio ${cid}`;
        criteriaMap.set(String(cid), { id: cid, nombre: String(cname), items: [] , criterioObj: crit });
        // Si el criterio trae sus items dentro (ej. crit.items), los mapeamos por id
      });

      // Mapear items de formato a criterio por id interno si están presentes
      const itemToCritMap = new Map();
      const formatItemById = new Map();
      formatCriterios.forEach((crit) => {
        const critItems = crit.items || crit.item_formato || crit.items_formato || [];
        if (Array.isArray(critItems) && critItems.length > 0) {
          critItems.forEach(fi => {
            const fid = fi.id || fi.itemFormatoId || fi.item_formato_id || null;
            if (fid != null) {
              itemToCritMap.set(String(fid), String(crit.id ?? crit.nombre ?? crit));
              formatItemById.set(String(fid), fi);
            }
          });
        }
      });

      // DEBUG: mostrar mapeos cuando formato define criterios con subitems
      try {
        console.debug('[EvaluationReviewModal] formatItemById (criteria-mode):', Array.from(formatItemById.entries()));
        console.debug('[EvaluationReviewModal] itemToCritMap (criteria-mode):', Array.from(itemToCritMap.entries()));
      } catch {
        // noop
      }

      // Asignar cada item de la evaluación al criterio correspondiente (si se encuentra), si no, buscar por item.criterio
      const unassigned = [];
      items.forEach((item) => {
        const fmtId = extractFormatItemId(item);
        let assigned = false;

        if (fmtId != null && itemToCritMap.has(String(fmtId))) {
          const critKey = String(itemToCritMap.get(String(fmtId)));
          const fmtItem = formatItemById.get(String(fmtId));
          if (criteriaMap.has(critKey)) {
            const merged = {
              ...item,
              nombre: fmtItem?.nombre ?? item.nombre,
              descripcion: fmtItem?.descripcion ?? item.descripcion,
              itemFormatoId: fmtId,
              formatoItem: fmtItem
            };
            criteriaMap.get(critKey).items.push(merged);
            assigned = true;
          }
        }

        if (!assigned) {
          // intentar asignar por item.criterio.id
          const critCandidateId = item.criterio?.id || item.criterioId || item.criterio_id || item.criterio?.criterioId || null;
          if (critCandidateId && criteriaMap.has(String(critCandidateId))) {
            criteriaMap.get(String(critCandidateId)).items.push(item);
            assigned = true;
          }
        }

        if (!assigned) {
          unassigned.push(item);
        }
      });

      // Si hay items no asignados, colocarlos en grupos fallback por nombre
      const groups = Array.from(criteriaMap.values());
      if (unassigned.length > 0) {
        const fallbackMap = new Map();
        unassigned.forEach((item) => {
          const cname = item.criterio?.nombre || item.criterioNombre || item.nombreCriterio || item.criterio?.descripcion || 'Sin Criterio';
          const key = `fallback:${String(cname)}`;
          if (!fallbackMap.has(key)) fallbackMap.set(key, { id: key, nombre: String(cname), items: [] });
          fallbackMap.get(key).items.push(item);
        });
        groups.push(...Array.from(fallbackMap.values()));
      }

      // filtrar grupos vacíos y ordenar
      const finalGroups = groups.filter(g => Array.isArray(g.items) && g.items.length > 0);
      finalGroups.sort((a,b) => String(a.nombre).localeCompare(String(b.nombre)));
      setGroupedCriteria(finalGroups);
      return;
    }

    // Si no hay formato con criterios disponibles, usar el agrupado por item.criterio como antes
    const groupsMap = new Map();

    // Convertir el Map a array
    const groups = Array.from(groupsMap.values());
    
    // Si no hay criterios agrupados, crear un grupo por defecto
    if (groups.length === 0 && items.length > 0) {
      setGroupedCriteria([{
        id: 'default',
        nombre: 'Items de Evaluación',
        items: items
      }]);
    } else {
      // Ordenar grupos por nombre para consistencia visual
      groups.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
      setGroupedCriteria(groups);
    }
  }, [evaluation]);

  // Inicializar estados cuando la evaluación cambia
  useEffect(() => {
    if (evaluation) {
      console.log('📥 Evaluación recibida en modal:', evaluation);
      setObservacionGeneral(evaluation.observacionGeneral || '');
      
      // Mapear items con información del formato
      const initialItems = evaluation.items?.map((item, index) => {
        // Buscar el item correspondiente en el formato
        const formatoItem = evaluation.formato?.items?.find(
          fmtItem => fmtItem.id === item.itemFormatoId
        );
        
        console.log(`📋 Item ${index}:`, item);
        console.log(`📝 Formato item encontrado:`, formatoItem);
        
        return {
          itemEvaluadoId: item.id,
          calificacion: item.calificacion || 0,
          observacion: item.observacion || '',
          peso: formatoItem?.peso || 100,
          itemFormatoId: item.itemFormatoId,
          itemOriginal: { ...item },
          formatoItem: formatoItem
        };
      }) || [];
      
      console.log('🔄 Items inicializados:', initialItems);
      setItemsEditados(initialItems);
      setModifiedCount(0);

      // Inicializar scoreInputs con los valores actuales (como strings)
      const initialScores = {};
      (evaluation.items || []).forEach(item => {
        initialScores[String(item.id || item.itemEvaluadoId || item.itemFormatoId || Math.random())] = String(item.calificacion ?? 0);
      });
      setScoreInputs(initialScores);

      // Construir agrupación de criterios inmediatamente
      buildCriteriaGroups(evaluation.items || []);
    }
  }, [evaluation, buildCriteriaGroups]);

  // Cuando activamos modo edición, asegurarnos de que scoreInputs reflejen itemsEditados
  useEffect(() => {
    if (editingItems) {
      const map = {};
      (itemsEditados || []).forEach(it => {
        const id = String(it.itemEvaluadoId || it.id || it.itemFormatoId || Math.random());
        map[id] = (typeof it.calificacion !== 'undefined' && it.calificacion !== null) ? String(it.calificacion) : '';
      });
      setScoreInputs(map);
    }
  }, [editingItems, itemsEditados]);

  // Resolver nombre del evaluador por ID y normalizar la fecha mostrada
  useEffect(() => {
    let mounted = true;
    const resolveEvaluator = async () => {
      if (!evaluation) return;
      const id = evaluation.evaluadorId || evaluation.evaluatorId || evaluation.evaluador?.id || evaluation.evaluador?.userId || null;
      if (!id) {
        setResolvedEvaluatorName(evaluation.evaluatorName || evaluation.evaluador?.nombre || 'Evaluador no disponible');
      } else {
        try {
          const data = await evaluadorService.getEvaluadorById(id);
          if (!mounted) return;
          const name = data?.nombre ? `${data.nombre}${data.apellido ? ' ' + data.apellido : ''}` : data?.fullName || data?.nombreCompleto || evaluation?.evaluatorName || 'Evaluador no disponible';
          setResolvedEvaluatorName(name);
        } catch (err) {
          console.warn('Error resolviendo evaluador en modal:', err);
          setResolvedEvaluatorName(evaluation.evaluatorName || evaluation.evaluador?.nombre || 'Evaluador no disponible');
        }
      }

      const date = evaluation.fechaCompletado || evaluation.fechaFinalizacion || evaluation.fecha || evaluation.fechaAceptacion || evaluation.fechaAsignacion || null;
      setResolvedDate(date ? new Date(date).toLocaleString() : null);
    };

    resolveEvaluator();
    return () => { mounted = false; };
  }, [evaluation]);

  const showModalMessage = (message, type = 'success') => {
    setSuccessMessage(message);
    setModalType(type);
    setShowSuccessModal(true);
  };

  // FUNCIÓN CORREGIDA PARA OBTENER LA DESCRIPCIÓN DEL ITEM
  const getItemDescription = (item) => {
    // Buscar en el item del formato primero
    if (item.formatoItem?.descripcion) {
      return item.formatoItem.descripcion;
    }
    
    // Buscar en diferentes ubicaciones posibles
    const description = 
      item.criterio?.descripcion || 
      item.descripcion || 
      item.criterioDescripcion ||
      item.itemDescripcion ||
      'Sin descripción disponible';
    
    console.log('🔍 Buscando descripción para item:', item.id, 'Resultado:', description);
    return description;
  };

  // FUNCIÓN CORREGIDA PARA OBTENER EL NOMBRE DEL ITEM
  const getItemName = (item) => {
    // Buscar en el item del formato primero
    if (item.formatoItem?.nombre) {
      return item.formatoItem.nombre;
    }
    
    return item.criterio?.nombre || item.nombre || `Item ${item.id || 'N/A'}`;
  };

  // FUNCIÓN CORREGIDA PARA OBTENER EL PESO DEL ITEM
  const getItemWeight = (item) => {
    return item.formatoItem?.peso || item.peso || 100;
  };

  // CALCULAR PUNTAJE TOTAL CORREGIDO - USAR calificacionTotal DEL BACKEND
  const calculateTotalScore = () => {
    // Usar directamente el calificacionTotal del backend que es 100
    if (evaluation.calificacionTotal !== undefined && evaluation.calificacionTotal !== null) {
      console.log('🎯 Usando calificacionTotal del backend:', evaluation.calificacionTotal);
      return evaluation.calificacionTotal;
    }
    
    // Solo calcular si no existe en el backend
    if (itemsEditados.length === 0) return 0;
    
    const total = itemsEditados.reduce((sum, item) => sum + (item.calificacion || 0), 0);
    const average = Math.round(total / itemsEditados.length);
    console.log('🧮 CalificacionTotal calculado:', average);
    return average;
  };

  // CALCULAR PROMEDIO CORREGIDO - DEBE SER EL MISMO QUE TOTAL
  const calculateAverageScore = () => {
    return calculateTotalScore();
  };

  // OBTENER PUNTAJE MÁXIMO
  const calculateMaxPossibleScore = () => {
    return 100;
  };

  const handleSubmitObservation = async () => {
    if (observation.trim()) {
      try {
        const project = evaluation?.proyecto || evaluation?.project || {};

        // Si ya vienen nombres, usarlos
        if (Array.isArray(project.lineasInvestigacionNames) && project.lineasInvestigacionNames.length > 0) {
          if (!mounted) return;
          setLineasNamesResolved(project.lineasInvestigacionNames.join(', '));
          return;
        }

        // Si vienen objetos con nombre, extraerlos
        if (Array.isArray(project.lineasInvestigacion) && project.lineasInvestigacion.length > 0) {
          const names = project.lineasInvestigacion.map(l => l?.nombre || l?.name || l?.titulo).filter(Boolean);
          if (names.length > 0) {
            if (!mounted) return;
            setLineasNamesResolved(names.join(', '));
            return;
          }
        }

        // Si vienen IDs, mapear usando researchService
        const ids = project.lineasInvestigacionIds || project.lineasIds || project.lineas || null;
        if (Array.isArray(ids) && ids.length > 0) {
          const all = await researchService.getAll();
          if (!mounted) return;
          const resolved = ids.map(id => {
            const found = all.find(r => String(r.id) === String(id) || String(r.identificacion) === String(id));
            return found ? (found.nombre || found.name) : null;
          }).filter(Boolean);
          setLineasNamesResolved(resolved.length ? resolved.join(', ') : null);
          return;
        }

        // Fallback: asegurarnos de mostrar 'N/A' si no hay datos
        setLineasNamesResolved(null);
      } catch (err) {
        console.warn('Error resolviendo líneas de investigación:', err);
        if (!mounted) return;
        setLineasNamesResolved(null);
      }
    };

    resolveLineNames();
    return () => { mounted = false; };
  }, [evaluation?.proyecto, evaluation?.project]);

  // Helper para abrir archivos del proyecto en nueva pestaña
  const openProjectFile = (archivo) => {
    if (!archivo) {
      showModalMessage('Archivo inválido', 'error');
      return;
    }
    const possibleUrl = archivo.urlArchivo || archivo.url_archivo || archivo.url || archivo.urlArchivoRaw || archivo.url_raw;
    if (!possibleUrl) {
      showModalMessage('No hay URL pública disponible para este archivo', 'error');
      return;
    }

    const hasPdfExt = /\.pdf($|\?)/i.test(possibleUrl);
    const isPdfMime = archivo.tipoMime && archivo.tipoMime.toLowerCase().includes('pdf');
    const urlToOpen = !hasPdfExt && isPdfMime ? `${possibleUrl}.pdf` : possibleUrl;

    const newWin = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    if (!newWin) {
      window.open(possibleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      const editFn = (typeof onEditEvaluation === 'function') ? onEditEvaluation : evaluationService.editEvaluation.bind(evaluationService);
      // Ejecutar la edición y usar la respuesta si el servicio la devuelve
      const result = await editFn(evaluation.id, itemsEditados);
      // Si el servicio devolvió la evaluación actualizada, lo usamos; si no, construimos una versión local
      const updatedEvaluation = (result && (result.items !== undefined)) ? result : { ...evaluation, items: itemsEditados };

      // Actualizar itemsEditados con los valores retornados por el backend (o los locales)
      const updatedItemsList = (updatedEvaluation.items || []).map(item => ({
        itemEvaluadoId: item.id,
        calificacion: item.calificacion || 0,
        observacion: item.observacion || '',
        peso: item.criterio?.peso || item.peso || 100,
        itemOriginal: { ...item }
      }));
      setItemsEditados(updatedItemsList);
      setModifiedCount(0);

      // Normalizar inputs de puntuación
      const newScoreInputs = {};
      (updatedEvaluation.items || []).forEach(item => {
        newScoreInputs[String(item.id || item.itemEvaluadoId || item.itemFormatoId || Math.random())] = String(item.calificacion ?? 0);
      });
      setScoreInputs(newScoreInputs);

      // Reconstruir agrupación de criterios con los items actualizados
      buildCriteriaGroups(updatedEvaluation.items || []);

      setEditingItems(false);
      // Si el padre está manejando la edición (se pasó onEditEvaluation), dejar que el padre muestre el mensaje.
      if (typeof onEditEvaluation !== 'function') {
        showModalMessage('✅ Cambios guardados correctamente');
      }

      // Notificar inmediatamente a listeners externos que la evaluación fue actualizada
      try {
        window.dispatchEvent(new CustomEvent('evaluationUpdated', { detail: updatedEvaluation }));
      } catch {
        // noop
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      // Si el padre maneja la edición, re-lanzar para que el padre maneje el error/modal
      if (typeof onEditEvaluation === 'function') {
        throw error;
      } else {
        showModalMessage('❌ Error al guardar los cambios', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    const revertedItems = evaluation.items?.map((item, index) => {
      const formatoItem = evaluation.formato?.items?.find(
        fmtItem => fmtItem.id === item.itemFormatoId
      );
      
      return {
        itemEvaluadoId: item.id,
        calificacion: item.calificacion || 0,
        observacion: item.observacion || '',
        peso: formatoItem?.peso || 100,
        itemFormatoId: item.itemFormatoId,
        itemOriginal: { ...item },
        formatoItem: formatoItem
      };
    }) || [];
    
    setItemsEditados(revertedItems);
    setEditingItems(false);
    setModifiedCount(0);
    showInline('Cambios cancelados', 'info', 2500);
  };

  // Actualiza la calificación
  const updateItemScore = (itemEvaluadoId, newScore) => {
    const updatedItems = [...itemsEditados];
    const idx = updatedItems.findIndex(it => String(it.itemEvaluadoId) === String(itemEvaluadoId));
    const safeScore = Math.max(0, Math.min(parseInt(newScore) || 0, 100));
    if (idx === -1) {
      updatedItems.push({ itemEvaluadoId, calificacion: safeScore, observacion: '' });
    } else {
      updatedItems[idx].calificacion = safeScore;
    }
    setItemsEditados(updatedItems);

    const count = updatedItems.reduce((acc, it) => {
      const orig = (evaluation.items || []).find(o => String(o.id) === String(it.itemEvaluadoId));
      if (!orig) return acc;
      if ((Number(it.calificacion) || 0) !== (Number(orig.calificacion) || 0) || (it.observacion || '') !== (orig.observacion || '')) return acc + 1;
      return acc;
    }, 0);
    setModifiedCount(count);
  };

  const updateItemObservation = (itemEvaluadoId, newObservation) => {
    const updatedItems = [...itemsEditados];
    const idx = updatedItems.findIndex(it => String(it.itemEvaluadoId) === String(itemEvaluadoId));
    if (idx === -1) {
      updatedItems.push({ itemEvaluadoId, calificacion: 0, observacion: newObservation });
    } else {
      updatedItems[idx].observacion = newObservation;
    }
    setItemsEditados(updatedItems);

    const count = updatedItems.reduce((acc, it) => {
      const orig = (evaluation.items || []).find(o => String(o.id) === String(it.itemEvaluadoId));
      if (!orig) return acc;
      if ((Number(it.calificacion) || 0) !== (Number(orig.calificacion) || 0) || (it.observacion || '') !== (orig.observacion || '')) return acc + 1;
      return acc;
    }, 0);
    setModifiedCount(count);
  };

  const hasChanges = () => {
    return itemsEditados.some((item, index) => {
      const originalItem = evaluation.items?.[index];
      return item.calificacion !== (originalItem?.calificacion || 0) ||
             item.observacion !== (originalItem?.observacion || '');
    });
  };

  // Acción real de aprobación (se invoca desde el modal de confirmación)
  const handleApproveAction = async () => {
    try {
      if (typeof onApprove === 'function') {
        // Delegar al padre: el padre se encargará de mostrar mensajes y recargar la lista
        await onApprove(evaluation.id);
      } else {
        // Si no se pasa onApprove, usar el servicio local para validar la evaluación
        const adminId = user?.id || user?.userId || user?.usuarioId || user?.user_id || null;
        await evaluationService.validateEvaluation(evaluation.id, adminId);
        // Mostrar mensaje local cuando no hay padre
        showModalMessage('✅ Evaluación aprobada correctamente');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (error) {
      console.error('Error aprobando evaluación:', error);
      if (typeof onApprove === 'function') {
        // Dejar que el padre maneje el error
        throw error;
      } else {
        showModalMessage('❌ Error al aprobar la evaluación', 'error');
      }
    }
  };

  const handleApprove = () => {
    setConfirmMessage('¿Está seguro de que desea aprobar esta evaluación?');
    setConfirmAction(() => async () => {
      setShowConfirmModal(false);
      await handleApproveAction();
    });
    setShowConfirmModal(true);
  };

  const getStatusBadge = () => {
    const status = evaluation.estado?.toUpperCase();
    switch (status) {
      case 'COMPLETADA':
        return <span className="status-badge status-completed">Completada</span>;
      case 'APROBADA':
        return <span className="status-badge status-approved">Aprobada</span>;
      case 'CAMBIOS_SOLICITADOS':
        return <span className="status-badge status-changes-requested">Cambios Solicitados</span>;
      default:
        return <span className="status-badge status-unknown">{evaluation.estado || 'Desconocido'}</span>;
    }
  };

  // Función para obtener el color basado en el score
  const getScoreColorClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-poor';
    return 'score-fail';
  };

  const totalScore = calculateTotalScore();
  const averageScore = calculateAverageScore();
  const maxScore = calculateMaxPossibleScore();
  // Aceptar proyecto tal como viene del backend (raw) — soportar claves `project` y `proyecto`.
  const projectData = evaluation?.project || evaluation?.proyecto || {};

  console.log('📊 Resumen de puntuaciones:', {
    totalScore,
    averageScore,
    maxScore,
    backendCalificacionTotal: evaluation.calificacionTotal,
    itemsCount: evaluation.items?.length,
    itemsEditadosCount: itemsEditados.length
  });

  return (
    <>
      <div className="evaluation-review-modal-overlay">
        {inlineMessage && (
          <div className={`inline-message inline-message-${inlineMessage.type}`} role="status">
            <div className="inline-message-content">{inlineMessage.text}</div>
            <button className="inline-message-close" onClick={() => setInlineMessage(null)} aria-label="Cerrar mensaje">×</button>
          </div>
        )}
        <div className="evaluation-review-modal">
          
          {/* Header */}
          <div className="evaluation-review-modal-header">
            <div className="evaluation-review-modal-title-section">
              <h3>
                <FaClipboardList className="evaluation-review-modal-title-icon" />
                Revisar Evaluación
              </h3>
              <div className="evaluation-review-modal-subtitle">
                <span className="evaluation-review-investigator">
                  <FaUser className="evaluation-inline-icon" />
                  {evaluation.evaluatorName || 'Evaluador no disponible'}
                </span>
                <span className="evaluation-review-id">
                  <FaHashtag className="evaluation-inline-icon" />
                  ID: {evaluation.id}
                </span>
                <span className="evaluation-review-date">
                  <FaCalendar className="evaluation-inline-icon" />
                  {evaluation.fechaFinalizacion ? new Date(evaluation.fechaFinalizacion).toLocaleDateString() : 'Fecha no disponible'}
                </span>
              </div>
            </div>
            <div className="evaluation-review-modal-header-actions">
              {getStatusBadge()}
              {editingItems && modifiedCount > 0 && (
                <div className="editing-summary-badge" style={{ marginRight: '8px', color: '#fff', fontWeight: 600 }}>
                  Edición: {modifiedCount} cambio{modifiedCount > 1 ? 's' : ''}
                </div>
              )}
              <button className="evaluation-review-modal-close" onClick={handleCloseRequest}>
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="evaluation-review-modal-tabs">
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => safeSetActiveTab('details')}
            >
              <FaEye /> Detalles
            </button>
            <button 
              className={`evaluation-review-modal-tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => safeSetActiveTab('items')}
            >
              <FaListAlt /> Items ({evaluation.items?.length || 0})
            </button>
          </div>

          {/* Body */}
          <div className="evaluation-review-modal-body">
            
            {/* Tab: Detalles */}
            {activeTab === 'details' && (
              <div className="evaluation-review-details">
                <div className="evaluation-review-project-info">
                  <h4>Información del Proyecto</h4>
                  <div className="evaluation-review-detail-grid">
                    <div className="evaluation-review-detail-item">
                      <strong>Título:</strong>
                      <span className="project-title">{evaluation.proyecto?.titulo || 'Proyecto no disponible'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Proyecto ID:</strong>
                      <span className="project-id">{evaluation.proyecto?.id || 'N/A'}</span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Formato:</strong>
                      <span>{evaluation.formato?.nombre || 'N/A'}</span>
                    </div>
                    
                    {/* PUNTUACIÓN TOTAL - CORREGIDA */}
                    <div className="evaluation-review-detail-item highlight-score">
                      <strong>
                        <FaCalculator className="evaluation-inline-icon" />
                        Puntuación Total:
                      </strong>
                      <span className={`evaluation-review-score total-score ${getScoreColorClass(totalScore)}`}>
                        {totalScore} / {maxScore}
                      </span>
                    </div>
                    
                    {/* PROMEDIO - CORREGIDO */}
                    <div className="evaluation-review-detail-item highlight-score">
                      <strong>
                        <FaCalculator className="evaluation-inline-icon" />
                        Promedio:
                      </strong>
                      <span className={`evaluation-review-score average-score ${getScoreColorClass(averageScore)}`}>
                        {averageScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="evaluation-review-summary">
                  <h4>Resumen de Evaluación</h4>
                  <div className="evaluation-review-stats">
                    <div className="evaluation-review-detail-item">
                      <strong>Puntuación Total:</strong>
                      <span className={`evaluation-review-score total-score ${getScoreColorClass(totalScore)}`}>
                        {totalScore} / {maxScore} Puntos
                      </span>
                    </div>

                    <div className="evaluation-review-detail-item">
                      <strong>Promedio:</strong>
                      <span className={`evaluation-review-score average-score ${getScoreColorClass(averageScore)}`}>
                        {averageScore}%
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Items Evaluados:</span>
                      <span className="stat-value">
                        {evaluation.items?.filter(item => item.calificacion > 0).length || 0} / {evaluation.items?.length || 0}
                      </span>
                    </div>
                    <div className="evaluation-review-stat">
                      <span className="stat-label">Fecha Completada:</span>
                      <span className="stat-value">
                        {evaluation.fechaFinalizacion ? new Date(evaluation.fechaFinalizacion).toLocaleString() : 'No disponible'}
                      </span>
                    </div>
                    
                    {/* Información del cálculo */}
                    <div className="evaluation-review-stat full-width calculation-info">
                      <span className="stat-label">Información del Cálculo:</span>
                      <div className="calculation-details">
                        <small>
                          Calificación total del backend: <strong>{evaluation.calificacionTotal}</strong> | 
                          Items calificados: <strong>{evaluation.items?.length}</strong> | 
                          Sistema: <strong>0-100 puntos</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Items Evaluados - CORREGIDO */}
            {activeTab === 'items' && (
              <div className="evaluation-review-items">
                <div className="evaluation-review-items-header">
                  <h4>
                    <FaListAlt className="evaluation-inline-icon" />
                    Items de Evaluación ({evaluation.items?.length || 0})
                  </h4>
                  <div className="evaluation-review-items-actions">
                    {!editingItems ? (
                      <button 
                        className="evaluation-review-edit-btn"
                        onClick={() => setEditingItems(true)}
                      >
                        <FaEdit /> Editar Items
                      </button>
                    ) : (
                      <div className="evaluation-review-edit-controls">
                        <span className="editing-badge">Modo Edición</span>
                        <button 
                          onClick={handleCancelEdits} 
                          className="evaluation-review-cancel-btn"
                          disabled={saving}
                        >
                          <FaUndo /> Cancelar
                        </button>
                        <button 
                          onClick={handleSaveEdits} 
                          className="evaluation-review-save-btn"
                          disabled={saving || !hasChanges()}
                        >
                          <FaSave /> 
                          {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="evaluation-review-items-list">
                  {itemsEditados.map((editedItem, index) => {
                    const originalItem = evaluation.items?.[index];
                    const isChanged = editedItem && (
                      editedItem.calificacion !== (originalItem?.calificacion || 0) ||
                      editedItem.observacion !== (originalItem?.observacion || '')
                    );

                    const itemName = getItemName(editedItem);
                    const itemDescription = getItemDescription(editedItem);
                    const itemWeight = getItemWeight(editedItem);

                    console.log(`📝 Renderizando item ${index}:`, {
                      itemName,
                      itemDescription,
                      itemWeight,
                      formatoItem: editedItem.formatoItem
                    });

                    return (
                      <div key={editedItem.itemEvaluadoId} className={`evaluation-review-item ${isChanged ? 'item-changed' : ''}`}>
                        <div className="evaluation-review-item-header">
                          <h5>{itemName}</h5>
                          <div className="evaluation-review-item-meta">
                            {itemWeight && itemWeight !== 100 && (
                              <span className="evaluation-review-item-weight">
                                Peso: {itemWeight}%
                              </span>
                            )}
                            <span className="evaluation-review-item-id">
                              ID: {editedItem.itemFormatoId}
                            </span>
                            {isChanged && editingItems && (
                              <span className="evaluation-review-item-changed-badge">Modificado</span>
                            )}
                          </div>
                        </div>
                        
                        {/* DESCRIPCIÓN - CORREGIDA */}
                        <div className="evaluation-review-item-description-container">
                          <FaAlignLeft className="evaluation-review-description-icon" />
                          <div className="evaluation-review-item-description-content">
                            <label className="evaluation-review-description-label">Descripción:</label>
                            <p className="evaluation-review-item-description">
                              {itemDescription}
                            </p>
                          </div>
                        </div>

                        <div className="evaluation-review-item-controls">
                          <div className="evaluation-review-item-score">
                            <label>Calificación (0-100 puntos):</label>
                            {editingItems ? (
                              <div className="score-input-container">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editedItem.calificacion || 0}
                                  onChange={(e) => updateItemScore(index, e.target.value)}
                                  className="evaluation-review-score-input"
                                />
                                <span className="score-range">/ 100</span>
                              </div>
                            ) : (
                              <span className="evaluation-review-item-score-value">
                                {editedItem.calificacion || 0} / 100
                              </span>
                            )}
                          </div>

                          <div className="evaluation-review-item-observation">
                            <label>Observación del Evaluador:</label>
                            {editingItems ? (
                              <textarea
                                value={editedItem.observacion || ''}
                                onChange={(e) => updateItemObservation(index, e.target.value)}
                                placeholder="Agregar o modificar observación..."
                                rows="3"
                                className="evaluation-review-observation-textarea"
                              />
                            ) : (
                              <div className="evaluation-review-observation-display">
                                {editedItem.observacion || 'Sin observaciones'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="evaluation-criterion-items">
                        {criterionGroup.items.map((originalItem, itemIndex) => {
                          const editedItem = itemsEditados.find(it => 
                            String(it.itemEvaluadoId) === String(originalItem.id)
                          );
                          
                          const isChanged = editedItem && (
                            (Number(editedItem.calificacion) || 0) !== (Number(originalItem.calificacion) || 0) ||
                            (editedItem.observacion || '') !== (originalItem.observacion || '')
                          );

                          const itemDescription = getItemDescription(originalItem);
                          const itemWeight = getItemWeight(originalItem);

                          return (
                            <div 
                              key={originalItem.id || `item-${itemIndex}`} 
                              className={`evaluation-review-item ${isChanged ? 'item-changed' : ''}`}
                            >
                              <div className="evaluation-review-item-header">
                                <h5>{originalItem.nombre || `Item ${itemIndex + 1}`}</h5>
                                <div className="evaluation-review-item-meta">
                                  {itemWeight && itemWeight !== 100 && (
                                    <span className="evaluation-review-item-weight">Peso: {itemWeight}%</span>
                                  )}
                                  {isChanged && editingItems && (
                                    <span className="evaluation-review-item-changed-badge">Modificado</span>
                                  )}
                                </div>
                              </div>

                              <div className="evaluation-review-item-description-container">
                                <div className="evaluation-review-item-description-content">
                                  <label className="evaluation-review-description-label">Descripción:</label>
                                  <p className="evaluation-review-item-description">{itemDescription}</p>
                                </div>
                              </div>

                              <div className="evaluation-review-item-controls">
                                <div className="evaluation-review-item-score">
                                  <label>Calificación (0-100 puntos):</label>
                                  {editingItems ? (
                                    <div className="score-input-container">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={
                                          // permitir campo vacío mientras se escribe usando scoreInputs
                                          scoreInputs[String(originalItem.id)] !== undefined
                                            ? scoreInputs[String(originalItem.id)]
                                            : ((editedItem && typeof editedItem.calificacion !== 'undefined') ? String(editedItem.calificacion) : (originalItem.calificacion != null ? String(originalItem.calificacion) : ''))
                                        }
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setScoreInputs(prev => ({ ...prev, [String(originalItem.id)]: v }));
                                        }}
                                        onBlur={() => {
                                          const raw = scoreInputs[String(originalItem.id)];
                                          const numeric = (raw === '' || raw === undefined) ? 0 : Math.max(0, Math.min(100, parseInt(raw) || 0));
                                          // actualizar el estado numérico real
                                          updateItemScore(originalItem.id, numeric);
                                          // normalizar el input a la versión numérica
                                          setScoreInputs(prev => ({ ...prev, [String(originalItem.id)]: String(numeric) }));
                                        }}
                                        className="evaluation-review-score-input"
                                      />
                                      <span className="score-range">/ 100 puntos</span>
                                    </div>
                                  ) : (
                                    <span className="evaluation-review-item-score-value">
                                      {originalItem.calificacion || 0} / 100 puntos
                                    </span>
                                  )}
                                </div>

                                <div className="evaluation-review-item-observation">
                                  <label>Observación del Evaluador:</label>
                                  {editingItems ? (
                                    <textarea
                                      value={editedItem?.observacion ?? originalItem.observacion ?? ''}
                                      onChange={(e) => updateItemObservation(originalItem.id, e.target.value)}
                                      placeholder="Agregar o modificar observación..."
                                      rows="3"
                                      className="evaluation-review-observation-textarea"
                                    />
                                  ) : (
                                    <div className="evaluation-review-observation-display">
                                      {originalItem.observacion || 'Sin observaciones'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Observaciones por Item */}
                <div className="evaluation-review-item-observations">
                  <h5>Observaciones por Item</h5>
                  {evaluation.items?.filter(item => item.observacion).length > 0 ? (
                    <div className="evaluation-review-item-observations-list">
                      {evaluation.items
                        .filter(item => item.observacion)
                        .map((item, index) => (
                          <div key={item.id} className="evaluation-review-item-observation">
                            <strong>{getItemName({...item, formatoItem: evaluation.formato?.items?.find(fmt => fmt.id === item.itemFormatoId)})}:</strong>
                            <p>{item.observacion}</p>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="evaluation-review-modal-footer">
            <div className="evaluation-review-modal-footer-actions">
              {editingItems ? (
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
                  <button
                    className="evaluation-review-cancel-btn"
                    onClick={handleCancelEdits}
                    disabled={saving}
                  >
                    <FaUndo /> Cancelar
                  </button>
                  <button
                    className="evaluation-review-save-btn"
                    onClick={handleSaveEdits}
                    disabled={saving || !hasChanges()}
                  >
                    <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={handleApprove}
                    className="evaluation-review-btn-approve"
                    disabled={saving}
                    style={{ background: '#10b981', border: 'none', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px' }}
                  >
                    <FaCheck style={{ marginRight: '6px' }} /> Aprobar
                  </button>
                  <button 
                    onClick={handleCloseRequest} 
                    className="evaluation-review-btn-close"
                    disabled={saving}
                    style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '0.5rem 0.75rem', borderRadius: '6px' }}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación (usar el footer integrado del componente Modal para evitar duplicados) */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar"
        type="warning"
        size="sm"
        message={confirmMessage || '¿Confirma esta acción?'}
        onConfirm={async () => {
          try {
            // Cerrar inmediatamente el modal de confirmación para evitar solapamiento
            setShowConfirmModal(false);
            if (typeof confirmAction === 'function') await confirmAction();
          } catch (err) {
            console.error('Error ejecutando acción de confirmación:', err);
            showModalMessage('❌ Error ejecutando la acción', 'error');
          }
        }}
        confirmText="Confirmar"
        cancelText="Cancelar"
        showCancel={true}
      />
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={
          modalType === 'success' ? 'Éxito' :
          modalType === 'error' ? 'Error' :
          modalType === 'warning' ? 'Advertencia' : 'Información'
        }
        type={modalType}
        size="sm"
      >
        <div className="modal-message-content">
          <div className={`modal-message-icon modal-message-${modalType}`}>
            {modalType === 'success' && <FaCheck />}
            {modalType === 'error' && <FaExclamationTriangle />}
            {modalType === 'warning' && <FaExclamationTriangle />}
            {modalType === 'info' && <FaInfoCircle />}
          </div>
          <p className="modal-message-text">{successMessage}</p>
          <div className="modal-actions">
            <button 
              className="btn-primary" 
              onClick={() => setShowSuccessModal(false)}
              autoFocus
            >
              <FaCheck /> Aceptar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EvaluationReviewModal;
