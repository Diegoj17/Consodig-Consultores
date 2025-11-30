import React from 'react';
import { FaPaperPlane, FaUsers } from 'react-icons/fa';
import '../styles/messages/MessageHistory.css';

const MessageHistory = ({ messages = [] }) => {
  // Datos de ejemplo si no llega `messages` desde el padre
  const demoMessages = [
    {
      id: 1,
      subject: 'Recordatorio de Evaluación',
      message: 'Por favor, recuerde completar las evaluaciones asignadas esta semana.',
      recipients: ['Diego Jaimes', 'María López'],
      date: '2025-11-25 09:12',
      status: 'Enviado'
    },
    {
      id: 2,
      subject: 'Nuevos proyectos asignados',
      message: 'Se han asignado nuevos proyectos a su cuenta. Revise su panel de tareas.',
      recipients: ['Carlos Rodríguez'],
      date: '2025-11-20 14:30',
      status: 'Enviado'
    },
    {
      id: 3,
      subject: 'Mantenimiento del sistema',
      message: 'El sistema estará en mantenimiento programado el próximo sábado.',
      recipients: ['Todos los evaluadores'],
      date: '2025-11-18 08:00',
      status: 'Enviado'
    }
  ];

  const list = messages && messages.length > 0 ? messages : demoMessages;

  return (
    <div className="message-history">

      <div className="message-history-list">
        {list.map(msg => (
          <div key={msg.id} className="message-history-item">
            <div className="message-history-icon">
              <FaPaperPlane />
            </div>
            <div className="message-history-content">
              <div className="message-history-row">
                <div className="message-history-subject">{msg.subject}</div>
                <div className="message-history-date">{msg.date}</div>
              </div>
              <div className="message-history-text">{msg.message}</div>
              <div className="message-history-meta">
                <div className="message-history-recipients">
                  <FaUsers /> {Array.isArray(msg.recipients) ? msg.recipients.join(', ') : msg.recipients}
                </div>
                <div className="message-history-status">{msg.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageHistory;