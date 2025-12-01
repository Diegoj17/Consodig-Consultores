import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/pages/admin/DocumentsPage.css';
import userService from '../../services/userService';
import EvaluatorList from '../../components/documents/admin/EvaluatorList';
import EvaluatorDocuments from '../../components/documents/admin/EvaluatorDocuments';

const DocumentsPage = () => {
  const [evaluadores, setEvaluadores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getEvaluadores();
      setEvaluadores(data || []);
    } catch (err) {
      console.error('Error cargando evaluadores para documentos:', err);
      setError(err?.message || 'Error cargando evaluadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="admin-documents-page">
      <div className="admin-documents-header">
        <p className="muted">Seleccione un evaluador para revisar sus archivos y aceptarlos o rechazarlos.</p>
      </div>

      <div className="admin-documents-grid">
        <div className="left-col">
          <EvaluatorList
            evaluadores={evaluadores}
            loading={loading}
            error={error}
            selectedId={selected?.id}
            onSelect={(ev) => setSelected(ev)}
          />
        </div>

        <div className="right-col">
          {selected ? (
            <EvaluatorDocuments evaluator={selected} />
          ) : (
            <div className="empty">Seleccione un evaluador para ver sus documentos.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
