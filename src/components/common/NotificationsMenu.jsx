// components/common/NotificationsMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import '../../styles/common/NotificationsMenu.css';

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);

  // Datos de ejemplo para notificaciones
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'message',
        title: 'Nuevo mensaje',
        content: 'Tienes un nuevo mensaje del administrador',
        time: 'Hace 5 min',
        read: false,
        icon: <FaEnvelope />
      },
      {
        id: 2,
        type: 'alert',
        title: 'Evaluación pendiente',
        content: 'Tienes 3 evaluaciones pendientes por completar',
        time: 'Hace 1 hora',
        read: false,
        icon: <FaExclamationTriangle />
      },
      {
        id: 3,
        type: 'success',
        title: 'Evaluación completada',
        content: 'La evaluación del proyecto "Sistema Académico" ha sido completada',
        time: 'Hace 2 horas',
        read: true,
        icon: <FaCheckCircle />
      },
      {
        id: 4,
        type: 'message',
        title: 'Recordatorio',
        content: 'No olvides completar las evaluaciones asignadas esta semana',
        time: 'Hace 1 día',
        read: true,
        icon: <FaEnvelope />
      }
    ];
    setNotifications(mockNotifications);
  }, []);

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigate = useNavigate();

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="notifications-menu-container" ref={menuRef}>
      <button 
        className={`notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={toggleMenu}
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
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Marcar todo como leído
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <FaBell className="no-notifications-icon" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-text">{notification.content}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <FaTimes />
                  </button>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;