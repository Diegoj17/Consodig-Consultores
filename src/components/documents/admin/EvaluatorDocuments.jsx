import React, { useEffect, useState } from 'react';
import userService from '../../../services/userService';
import api from '../../../api/Axios';
import '../../../styles/documents/admin/EvaluatorDocuments.css';

const DocumentRow = ({ label, url, status, href }) => (
  <div className="doc-row">
    <div className="doc-info">
      <div className="doc-label">{label}</div>
      {url ? (
        <a className="doc-link" href={href || url} target="_blank" rel="noopener noreferrer">Ver documento</a>
      ) : (
        <span className="doc-none">No cargado</span>
      )}
    </div>
    <div className="doc-actions">
      <span className={`doc-status ${status || ''}`}>{status || 'Pendiente'}</span>
    </div>
  </div>
);

const EvaluatorDocuments = ({ evaluator }) => {
  const [archivos, setArchivos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await userService.getEvaluadorArchivos(evaluator.id);
        if (mounted) setArchivos(resp || null);
      } catch (err) {
        console.error('Error obteniendo archivos del evaluador:', err);
        if (mounted) setError(err?.message || 'Error cargando archivos');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [evaluator]);

  const handleAction = async (type, action) => {
    try {
      if (action === 'accept') {
        await userService.acceptArchivo(evaluator.id, type);
      } else {
        await userService.rejectArchivo(evaluator.id, type);
      }
      // refrescar
      const resp = await userService.getEvaluadorArchivos(evaluator.id);
      setArchivos(resp || null);
    } catch (err) {
      console.error('Error al actualizar estado del archivo:', err);
      setError(err?.message || 'Error realizando la acción');
    }
  };

  if (loading) return <div className="docs-loading">Cargando archivos...</div>;
  if (error) return <div className="docs-error">Error: {error}</div>;

  const doc = archivos || {};

  return (
    <div className="evaluator-documents">
      <div className="evaluator-header">
        <h3>{evaluator.nombre} {evaluator.apellido}</h3>
        <div className="evaluator-meta">{evaluator.email}</div>
      </div>

      <div className="docs-list">
        <DocumentRow
          label="Fotocopia documento identidad"
          url={doc.fotocopiaUrl}
          href={`${api.defaults.baseURL}/evaluadores/${evaluator.id}/archivos/fotocopia`}
          status={doc.fotocopiaUrl ? 'Subido' : (doc.fotocopiaStatus || 'Pendiente')}
          onAccept={() => handleAction('fotocopia', 'accept')}
          onReject={() => handleAction('fotocopia', 'reject')}
        />

        <DocumentRow
          label="Certificados de estudios"
          url={doc.certificadosUrl}
          href={`${api.defaults.baseURL}/evaluadores/${evaluator.id}/archivos/certificados`}
          status={doc.certificadosUrl ? 'Subido' : (doc.certificadosStatus || 'Pendiente')}
          onAccept={() => handleAction('certificados', 'accept')}
          onReject={() => handleAction('certificados', 'reject')}
        />

        <DocumentRow
          label="Certificado cuenta bancaria"
          url={doc.cuentaBancariaUrl}
          href={`${api.defaults.baseURL}/evaluadores/${evaluator.id}/archivos/cuenta-bancaria`}
          status={doc.cuentaBancariaUrl ? 'Subido' : (doc.cuentaBancariaStatus || 'Pendiente')}
          onAccept={() => handleAction('cuenta-bancaria', 'accept')}
          onReject={() => handleAction('cuenta-bancaria', 'reject')}
        />
      </div>
    </div>
  );
};

export default EvaluatorDocuments;
