import React, { useState } from 'react';
import { FaPaperPlane, FaUsers } from 'react-icons/fa';
import '../styles/messages/MessageComposer.css';

const MessageComposer = ({ evaluators, onSendMessage }) => {
  const [messageData, setMessageData] = useState({
    recipients: [],
    subject: '',
    message: '',
    priority: 'normal',
    type: 'notification'
  });

  const handleRecipientChange = (evaluatorId) => {
    setMessageData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(evaluatorId)
        ? prev.recipients.filter(id => id !== evaluatorId)
        : [...prev.recipients, evaluatorId]
    }));
  };

  const selectAllEvaluators = () => {
    setMessageData(prev => ({
      ...prev,
      recipients: evaluators.map(e => e.id)
    }));
  };

  const clearRecipients = () => {
    setMessageData(prev => ({
      ...prev,
      recipients: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageData.recipients.length === 0) {
      alert('Selecciona al menos un destinatario');
      return;
    }
    if (!messageData.subject || !messageData.message) {
      alert('Completa el asunto y el mensaje');
      return;
    }

    onSendMessage(messageData);
    
    // Reset form
    setMessageData({
      recipients: [],
      subject: '',
      message: '',
      priority: 'normal',
      type: 'notification'
    });
  };

  return (
    <div className="message-composer">
      <form onSubmit={handleSubmit}>
        <div className="message-section">
          <h3>
            <FaUsers /> Seleccionar Evaluadores
          </h3>
          <div className="message-recipient-actions">
            <button type="button" onClick={selectAllEvaluators} className="message-action-btn">
              Seleccionar Todos
            </button>
            <button type="button" onClick={clearRecipients} className="message-action-btn message-clear">
              Limpiar Selección
            </button>
          </div>
          <div className="message-recipients-list">
            {evaluators.map(evaluator => (
              <div 
                key={evaluator.id} 
                className={`message-recipient-card ${messageData.recipients.includes(evaluator.id) ? 'message-recipient-selected' : ''}`}
                onClick={() => handleRecipientChange(evaluator.id)}
              >
                <input
                  type="checkbox"
                  checked={messageData.recipients.includes(evaluator.id)}
                  onChange={() => handleRecipientChange(evaluator.id)}
                  className="message-recipient-checkbox"
                />
                <div className="message-recipient-info">
                  <div className="message-recipient-top">
                    <strong className="message-recipient-name">{evaluator.name}</strong>
                    <span className="message-recipient-institution">{evaluator.institution}</span>
                  </div>
                  <div className="message-recipient-meta">
                    <span className="message-recipient-email">{evaluator.email}</span>
                    {evaluator.researchLines && evaluator.researchLines.length > 0 && (
                      <span className="message-recipient-lines">Líneas: {evaluator.researchLines.join(', ')}</span>
                    )}
                    {evaluator.studyLevel && (
                      <span className="message-recipient-level">Nivel: {evaluator.studyLevel}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="message-selected-count">
            {messageData.recipients.length} evaluadores seleccionados
          </div>
        </div>

        <div className="message-section">
          <h3>Configuración del Mensaje</h3>
          <div className="message-config">
            <div className="message-config-group">
              <label>Tipo de Mensaje:</label>
              <select
                value={messageData.type}
                onChange={(e) => setMessageData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="notification">Notificación</option>
                <option value="reminder">Recordatorio</option>
                <option value="alert">Alerta</option>
                <option value="announcement">Anuncio</option>
              </select>
            </div>
            <div className="message-config-group">
              <label>Prioridad:</label>
              <select
                value={messageData.priority}
                onChange={(e) => setMessageData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="message-section">
          <h3>Contenido del Mensaje</h3>
          <div className="message-input-group">
            <label>Asunto:</label>
            <input
              type="text"
              placeholder="Ingresa el asunto del mensaje..."
              value={messageData.subject}
              onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          <div className="message-input-group">
            <label>Mensaje:</label>
            <textarea
              placeholder="Escribe tu mensaje aquí..."
              value={messageData.message}
              onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
              rows="8"
              required
            />
          </div>
        </div>

        <div className="message-actions">
          <button type="submit" className="message-send-btn">
            <FaPaperPlane /> Enviar Mensaje
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;