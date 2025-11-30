import React, { useState, useEffect } from 'react';
import MessageComposer from '../../messages/MessageComposer';
import '../../styles/pages/admin/MessagesPage.css';
import userService from '../../services/userService';

const MessagesPage = () => {
  const [evaluators, setEvaluators] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    let mounted = true;
    const loadEvaluators = async () => {
      setLoading(true);
      setError(null);
      try {
        const evs = await userService.getEvaluadores();
        // Map backend shape to MessageComposer expected shape
        const mapped = evs.map(e => ({
          id: e.id,
          name: `${e.nombre || e.nombre} ${e.apellido || ''}`.trim(),
          email: e.email || e.correo || '',
          institution: e.afiliacionInstitucional || e.institucion || '',
          // Normalizar líneas de investigación a array de strings (nombres)
          researchLines: Array.isArray(e.lineasInvestigacion)
            ? e.lineasInvestigacion.map(li => (li?.nombre || li?.name || li))
            : Array.isArray(e.lineasInvestigacionEvaluador)
              ? e.lineasInvestigacionEvaluador.map(li => (li?.nombre || li?.name || li))
              : [],
          studyLevel: e.nivelEducativo || e.nivelEstudios || ''
        }));

        if (mounted) setEvaluators(mapped);

        // keep a small initial history for testing — can be removed later
        if (mounted) setMessageHistory([{ id: 1, subject: 'Prueba envío', message: 'Mensaje de prueba', recipients: mapped.length ? [mapped[0].name] : [], date: '2024-01-01', status: 'Enviado' }]);
      } catch (err) {
        console.error('Error cargando evaluadores:', err);
        if (mounted) setError('No se pudieron cargar los evaluadores');
        // fallback to empty list
        if (mounted) setEvaluators([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEvaluators();
    return () => { mounted = false; };
  }, []);

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: messageHistory.length + 1,
      subject: messageData.subject,
      message: messageData.message,
      recipients: messageData.recipients.map(id => {
        const ev = evaluators.find(e => e.id === id);
        return ev ? ev.name : '';
      }),
      date: new Date().toLocaleString(),
      status: 'Enviado'
    };
    setMessageHistory(prev => [newMessage, ...prev]);
    alert('Mensaje enviado (simulado)');
  };

  return (
    <div className="messages-page">
      <div className="messages-main">
        {loading ? (
          <div>Cargando evaluadores...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger, #c00)' }}>{error}</div>
        ) : (
          <MessageComposer evaluators={evaluators} onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
