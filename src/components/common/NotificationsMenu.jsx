// components/common/NotificationsMenu.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import '../../styles/common/NotificationsMenu.css';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';
import evaluationService from '../../services/evaluationService';

const iconForType = (type) => {
  switch ((type || '').toUpperCase()) {
    case 'EVALUACION_ASIGNADA':
    case 'EVALUACION_REASIGNADA':
    case 'MESSAGE':
      return <FaEnvelope />;
    case 'EVALUACION_FINALIZADA':
    case 'EVALUACION_VALIDADA':
    case 'SUCCESS':
      return <FaCheckCircle />;
    case 'EVALUACION_RECHAZADA':
    case 'EVALUACION_INVALIDADA':
    case 'ALERT':
      return <FaExclamationTriangle />;
    default:
      return <FaEnvelope />;
  }
};

const formatTime = (iso) => {
  if (!iso) return 'Recién';
  
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Recién';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `Hace ${diffWeeks} semana${diffWeeks !== 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extraer IDs del mensaje de notificación - versión mejorada
  const extractIdsFromMessage = (message) => {
    if (!message) return { proyectoId: null, evaluacionId: null };
    
    console.log('🔍 Extrayendo IDs del mensaje:', message);
    
    // Buscar patrones más flexibles
    const proyectoMatch = message.match(/proyecto\s*(?:id\s*:?\s*)?\(?(\d+)\)?/i) || 
                         message.match(/proyecto\s*#?(\d+)/i) ||
                         message.match(/del proyecto\s*\(?id:?\s*(\d+)\)?/i);
    
    const evaluacionMatch = message.match(/evaluaci[oó]n\s*(?:id\s*:?\s*)?\(?(\d+)\)?/i) || 
                           message.match(/evaluaci[oó]n\s*#?(\d+)/i) ||
                           message.match(/la evaluación\s*\(?id:?\s*(\d+)\)?/i);
    
    const result = {
      proyectoId: proyectoMatch ? parseInt(proyectoMatch[1]) : null,
      evaluacionId: evaluacionMatch ? parseInt(evaluacionMatch[1]) : null
    };
    
    console.log('📋 IDs extraídos:', result);
    return result;
  };

  // Enriquecer notificación con nombres reales
  const enrichNotification = useCallback(async (notification) => {
    try {
      console.log('🔄 Enriqueciendo notificación:', notification);
      
      // Extraer IDs del mensaje
      const { proyectoId, evaluacionId } = extractIdsFromMessage(notification.content);
      
      let proyectoNombre = null;
      let evaluacionNombre = null;

      // Obtener nombre del proyecto
      if (proyectoId) {
        try {
          console.log(`📁 Obteniendo proyecto ${proyectoId}`);
          const proyecto = await projectService.getById(proyectoId);
          proyectoNombre = proyecto?.titulo || proyecto?.nombre || `Proyecto ${proyectoId}`;
          console.log(`✅ Nombre del proyecto obtenido: ${proyectoNombre}`);
        } catch (err) {
          console.warn(`❌ No se pudo obtener proyecto ${proyectoId}:`, err);
          proyectoNombre = `Proyecto ${proyectoId}`;
        }
      }

      // Obtener nombre de la evaluación/formato
      if (evaluacionId) {
        try {
          console.log(`📋 Obteniendo evaluación ${evaluacionId}`);
          const evaluacion = await evaluationService.getById(evaluacionId);
          // Intentar obtener el nombre del formato desde diferentes propiedades
          evaluacionNombre = evaluacion?.formato?.nombre || 
                           evaluacion?.formato?.title || 
                           evaluacion?.nombre || 
                           evaluacion?.titulo || 
                           evaluacion?.evaluacionNombre ||
                           `Evaluación ${evaluacionId}`;
          console.log(`✅ Nombre de evaluación obtenido: ${evaluacionNombre}`);
        } catch (err) {
          console.warn(`❌ No se pudo obtener evaluación ${evaluacionId}:`, err);
          evaluacionNombre = `Evaluación ${evaluacionId}`;
        }
      }

      const enriched = {
        ...notification,
        proyectoNombre,
        evaluacionNombre,
        proyectoId,
        evaluacionId
      };
      
      console.log('✅ Notificación enriquecida:', enriched);
      return enriched;
    } catch (err) {
      console.error('❌ Error enriqueciendo notificación:', err);
      return notification;
    }
  }, []);

  const describeSubject = (notification) => {
    const { proyectoNombre, evaluacionNombre } = notification;
    if (evaluacionNombre && proyectoNombre) {
      return `la evaluación "${evaluacionNombre}" del proyecto "${proyectoNombre}"`;
    }
    if (evaluacionNombre) {
      return `la evaluación "${evaluacionNombre}"`;
    }
    if (proyectoNombre) {
      return `el proyecto "${proyectoNombre}"`;
    }
    return null;
  };

  const cleanDetailText = (text) => {
    if (!text) return '';
    return ` ${text.replace(/\(id:\s*\d+\)/gi, '').replace(/\s{2,}/g, ' ').trim()}`;
  };

  // Reescribir completamente el mensaje de la notificación
  const rewriteNotificationMessage = (notification) => {
    const { type } = notification;
    const tipo = (type || '').toUpperCase();
    const subject = describeSubject(notification);
    const detail = cleanDetailText(notification.content);
    const fallback = notification.content || 'Tienes una nueva notificación.';

    console.log('✏️ Reescribiendo mensaje para tipo:', tipo);

    switch (tipo) {
      case 'EVALUACION_ASIGNADA':
        return subject ? `Se te asignó ${subject}.${detail}` : fallback;

      case 'EVALUACION_REASIGNADA':
        return subject ? `Se te reasignó ${subject}.${detail}` : fallback;

      case 'EVALUACION_FINALIZADA':
        return subject ? `Se finalizó ${subject}.${detail}` : fallback;

      case 'EVALUACION_VALIDADA':
        return subject ? `Se validó ${subject}.${detail}` : fallback;

      case 'EVALUACION_RECHAZADA':
        return subject ? `Se rechazó ${subject}.${detail}` : fallback;

      case 'EVALUACION_INVALIDADA':
        return subject ? `${subject} fue invalidada.${detail}` : fallback;

      case 'EVALUACION_ESTADO':
        return subject ? `El estado de ${subject} cambió: ${notification.title || 'Actualización'}.${detail}` : fallback;

      default:
        if (subject) {
          return `Actualización sobre ${subject}.${detail}`;
        }
        return fallback;
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No hay usuario, no se pueden cargar notificaciones');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`🟡 Cargando notificaciones para usuario: ${user.id}`);
      const data = await notificationService.getByUser(user.id);
      
      console.log(`📨 Notificaciones crudas recibidas:`, data);

      // Mapear y enriquecer notificaciones
      const mapped = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (n) => {
          console.log('📝 Procesando notificación cruda:', n);
          
          const base = {
            id: n.identificacion || n.id,
            type: n.tipo || n.type || '',
            title: n.Título || n.titulo || n.title || 'Notificación',
            content: n.mensaje || n.message || n.content || '',
            time: n.fecha || n.createdAt || n.date || n.timestamp,
            read: n.Leida === '0x01' || n.leida === true || n.read === true,
            raw: n
          };

          console.log('📦 Notificación base mapeada:', base);

          // Enriquecer con nombres de proyecto y evaluación
          return await enrichNotification(base);
        })
      );

      console.log('✅ Notificaciones finales mapeadas:', mapped);
      setNotifications(mapped);
    } catch (err) {
      console.error('❌ Error cargando notificaciones', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user, enrichNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      console.log('🔄 Abriendo menú de notificaciones');
      await fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('No se pudo marcar como leída', err);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('No se pudieron marcar todas como leídas', err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error eliminando notificación', err);
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navegar según el tipo de notificación
    if (notification.evaluacionId) {
      navigate(`/evaluaciones/${notification.evaluacionId}`);
    } else if (notification.proyectoId) {
      navigate(`/proyectos/${notification.proyectoId}`);
    } else if (notification.raw?.link || notification.raw?.url) {
      navigate(notification.raw.link || notification.raw.url);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="notifications-menu-container" ref={menuRef}>
      <button 
        className={`notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={toggleMenu}
        aria-label="Notificaciones"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notificaciones</h3>
            {loading ? (
              <small>Cargando...</small>
            ) : (
              unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                >
                  Marcar todo como leído
                </button>
              )
            )}
          </div>

          <div className="notifications-list">
            {error && (
              <div className="no-notifications">
                <p>{error}</p>
              </div>
            )}

            {!loading && notifications.length === 0 && !error && (
              <div className="no-notifications">
                <FaBell className="no-notifications-icon" />
                <p>No hay notificaciones</p>
              </div>
            )}

            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {iconForType(notification.type)}
                </div>
                <div className="notification-content">
                  {/* Mostrar el título con tamaño reducido para no competir con el mensaje */}
                  <div className="notification-title" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>{notification.title}</div>
                  <p className="notification-text">
                    {rewriteNotificationMessage(notification)}
                  </p>
                  {(notification.evaluacionNombre || notification.proyectoNombre) && (
                    <div className="notification-meta" style={{ marginTop: 6 }}>
                      {notification.evaluacionNombre && (
                        <small className="notification-meta-pill" style={{ display: 'inline-block', marginRight: 8, color: '#374151' }}>Evaluación: {notification.evaluacionNombre}</small>
                      )}
                      {notification.proyectoNombre && (
                        <small className="notification-meta-pill" style={{ display: 'inline-block', color: '#374151' }}>Proyecto: {notification.proyectoNombre}</small>
                      )}
                    </div>
                  )}
                  <span className="notification-time">{formatTime(notification.time)}</span>
                </div>
                <button
                  className="delete-notification-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  aria-label="Eliminar notificación"
                >
                  <FaTimes />
                </button>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;