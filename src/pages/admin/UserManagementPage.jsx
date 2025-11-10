import React, { useState, useEffect, useCallback } from 'react';
import UserStats from '../../components/management/user/UserStats';
import UserToolbar from '../../components/management/user/UserToolbar';
import UserGrid from '../../components/management/user/UserGrid';
import UserTable from '../../components/management/user/UserTable';
import EmptyState from '../../components/management/user/EmptyState';
import UserModal from '../../components/management/user/UserModal';
import EvaluandoModal from '../../components/management/user/EvaluandoModal';
import Modal from '../../components/common/Modal';
import { useEvaluadores } from '../../hooks/useEvaluadores';
import { useEvaluandos } from '../../hooks/useEvaluandos';
import '../../styles/pages/admin/UserManagementPage.css';

// Componente para el PDF (moverlo fuera del componente principal si prefieres)
const UserExportPDF = ({ users, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (estado) => {
    return estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="pdf-export-container">
      <div className="pdf-header">
        <button className="pdf-download-btn" onClick={handleDownload}>
          📥 Descargar PDF
        </button>
        <button className="pdf-close-btn" onClick={onClose}>
          ✕ Cerrar
        </button>
      </div>
      
      <div className="pdf-content">
        {/* Encabezado del reporte */}
        <div className="pdf-header-section">
          <div className="pdf-logo">
            <h1>📊</h1>
          </div>
          <div className="pdf-title">
            <h1>Reporte de Usuarios</h1>
            <p className="pdf-subtitle">Sistema de Gestión de Evaluadores</p>
            <p className="pdf-date">
              Generado el: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Estadísticas resumen */}
        <div className="pdf-stats">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {users.filter(u => u.role === 'evaluador').length}
            </span>
            <span className="stat-label">Evaluadores</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {users.filter(u => u.role === 'evaluando').length}
            </span>
            <span className="stat-label">Evaluandos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {users.filter(u => u.estado === 'ACTIVO').length}
            </span>
            <span className="stat-label">Activos</span>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="pdf-table-section">
          <h2>Detalle de Usuarios</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Líneas de Investigación</th>
                <th>Fecha de Creación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td className="user-name">
                    <strong>{user.nombre} {user.apellido}</strong>
                  </td>
                  <td className="user-email">{user.email || 'N/A'}</td>
                  <td className="user-phone">{user.telefono || 'N/A'}</td>
                  <td className="user-role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'evaluador' ? 'Evaluador' : 'Evaluando'}
                    </span>
                  </td>
                  <td className="user-lines">
                    {user.lineasInvestigacion && user.lineasInvestigacion.length > 0 
                      ? user.lineasInvestigacion.join(', ')
                      : 'N/A'
                    }
                  </td>
                  <td className="user-date">
                    {formatDate(user.fechaCreacion)}
                  </td>
                  <td className="user-status">
                    <span className={`status-badge ${user.estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                      {getStatusText(user.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie de página */}
        <div className="pdf-footer">
          <div className="footer-info">
            <p><strong>Sistema de Gestión Académica</strong></p>
            <p>Reporte generado automáticamente</p>
          </div>
          <div className="page-number">
            Página 1 de 1
          </div>
        </div>
      </div>

      <style jsx>{`
        .pdf-export-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 10000;
          overflow-y: auto;
        }

        .pdf-header {
          position: sticky;
          top: 0;
          background: #f8f9fa;
          padding: 1rem 2rem;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
        }

        .pdf-download-btn, .pdf-close-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pdf-download-btn {
          background: #28a745;
          color: white;
        }

        .pdf-download-btn:hover {
          background: #218838;
        }

        .pdf-close-btn {
          background: #6c757d;
          color: white;
        }

        .pdf-close-btn:hover {
          background: #5a6268;
        }

        .pdf-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pdf-header-section {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 3px solid #2c5aa0;
        }

        .pdf-logo {
          margin-right: 1.5rem;
        }

        .pdf-logo h1 {
          font-size: 3rem;
          margin: 0;
        }

        .pdf-title h1 {
          margin: 0;
          color: #2c5aa0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .pdf-subtitle {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 1.2rem;
        }

        .pdf-date {
          margin: 0;
          color: #495057;
          font-size: 0.9rem;
        }

        .pdf-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .pdf-table-section {
          margin-top: 2rem;
        }

        .pdf-table-section h2 {
          color: #2c5aa0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .pdf-table th {
          background: #2c5aa0;
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .pdf-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .pdf-table tr.even {
          background: #f8f9fa;
        }

        .pdf-table tr:hover {
          background: #e3f2fd;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .role-badge.evaluador {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.evaluando {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-badge.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .user-name {
          font-weight: 600;
          color: #2c3e50;
        }

        .user-email {
          color: #2c5aa0;
        }

        .pdf-footer {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6c757d;
        }

        @media print {
          .pdf-header {
            display: none;
          }
          
          .pdf-export-container {
            position: static;
            overflow: visible;
          }
          
          .pdf-content {
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

const UserManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all'
  });

  // Usar hooks separados para evaluadores y evaluandos
  const {
    evaluadores,
    loading: loadingEvaluadores,
    error: errorEvaluadores,
    createEvaluador,
    updateEvaluador,
    deleteEvaluador,
    toggleStatus: toggleEvaluadorStatus,
    setFilters: setEvaluadoresFilters
  } = useEvaluadores();

  const {
    evaluandos,
    loading: loadingEvaluandos,
    error: errorEvaluandos,
    createEvaluando,
    updateEvaluando,
    deleteEvaluando,
    toggleStatus: toggleEvaluandoStatus,
    setFilters: setEvaluandosFilters
  } = useEvaluandos();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEvaluandoModal, setShowEvaluandoModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null, userRole: null });
  const [viewMode, setViewMode] = useState('grid');
  const [showExportPDF, setShowExportPDF] = useState(false); // Nuevo estado para el PDF

  // No enviamos filtros a los hooks para evitar que las estadísticas (UserStats)
  // se actualicen cuando el usuario busca o cambia estado/rol en la vista.
  // Los hooks traen todos los evaluadores/evaluandos y el filtrado (search/status/role)
  // se aplica únicamente en cliente sobre `allUsers` -> `displayedUsers`.

  // Combinar usuarios para estadísticas y visualización
  const allUsers = [...evaluadores, ...evaluandos];
  // Aplicar filtrado adicional del lado del cliente (rol, estado y búsqueda) sobre la lista combinada
  const displayedUsers = allUsers.filter(user => {
    // Filtrar por rol (si se seleccionó)
    if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
      return false;
    }

    // Filtrar por estado (mapear valores del select a los valores del backend)
    if (filters.status && filters.status !== 'all') {
      const statusMap = { active: 'ACTIVO', inactive: 'INACTIVO' };
      if (user.estado !== statusMap[filters.status]) {
        return false;
      }
    }

    // Filtrar por búsqueda (coincidencia en varios campos)
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      const matches = (
        (user.nombre && user.nombre.toLowerCase().includes(q)) ||
        (user.apellido && user.apellido.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.afiliacionInstitucional && user.afiliacionInstitucional.toLowerCase().includes(q))
      );
      if (!matches) return false;
    }

    return true;
  });
  const loading = loadingEvaluadores || loadingEvaluandos;
  const error = errorEvaluadores || errorEvaluandos;

  // Manejar cambios en los filtros
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Handlers para evaluadores
  const handleCreateEvaluador = async (userData) => {
    try {
      await createEvaluador(userData);
      setShowModal(false);
      showAlert('success', '¡Éxito!', 'El evaluador ha sido registrado correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al crear evaluador');
    }
  };

  const handleEditEvaluador = async (userData) => {
    try {
      await updateEvaluador(editingUser.id, userData);
      setShowModal(false);
      setEditingUser(null);
      showAlert('success', '¡Actualizado!', 'La información del evaluador ha sido actualizada correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al actualizar evaluador');
    }
  };

  // Handlers para evaluandos
  const handleCreateEvaluando = async (userData) => {
    try {
      await createEvaluando(userData);
      setShowEvaluandoModal(false);
      showAlert('success', '¡Éxito!', 'El evaluando ha sido registrado correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al crear evaluando');
    }
  };

  const handleEditEvaluando = async (userData) => {
    try {
      await updateEvaluando(editingUser.id, userData);
      setShowEvaluandoModal(false);
      setEditingUser(null);
      showAlert('success', '¡Actualizado!', 'La información del evaluando ha sido actualizada correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al actualizar evaluando');
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteConfirm({ 
      isOpen: true, 
      userId: user.id, 
      userRole: user.role 
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.userRole === 'evaluador') {
        await deleteEvaluador(deleteConfirm.userId);
      } else {
        await deleteEvaluando(deleteConfirm.userId);
      }
      setDeleteConfirm({ isOpen: false, userId: null, userRole: null });
      showAlert('success', 'Eliminado', 'El usuario ha sido eliminado correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (userId, userRole) => {
    try {
      if (userRole === 'evaluador') {
        await toggleEvaluadorStatus(userId);
      } else {
        await toggleEvaluandoStatus(userId);
      }
      showAlert('success', 'Estado actualizado', 'El estado del usuario ha sido cambiado correctamente.');
    } catch (error) {
      showAlert('error', 'Error', error.message || 'Error al cambiar estado');
    }
  };

  const openEditModal = (user) => {
  console.log("🟢 OPEN EDIT MODAL - User data:", user);
  console.log("🟢 User email:", user?.email);
  console.log("🟢 User role:", user?.role);
  
  setEditingUser(user);
  if (user.role === 'evaluando') {
    console.log("🟢 Opening Evaluando modal");
    setShowEvaluandoModal(true);
  } else {
    console.log("🟢 Opening Evaluador modal");
    setShowModal(true);
  }
};

  const openCreateModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openCreateEvaluando = () => {
    setEditingUser(null);
    setShowEvaluandoModal(true);
  };

  // Función para exportar - CORREGIDA
  const handleExport = () => {
    console.log("🟢 Export button clicked");
    setShowExportPDF(true);
  };

  // Función para preparar datos para exportación
  const getExportData = () => {
    return displayedUsers.map(user => ({
      ...user,
      // Aseguramos que los campos existan
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || 'N/A',
      telefono: user.telefono || 'N/A',
      lineasInvestigacion: user.lineasInvestigacion || [],
      fechaCreacion: user.fechaCreacion || user.createdAt || new Date().toISOString(),
      estado: user.estado || 'ACTIVO',
      role: user.role || 'evaluando'
    }));
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  // Mostrar errores
  useEffect(() => {
    if (error) {
      showAlert('error', 'Error', error);
    }
  }, [error]);

  return (
    <div className="user-management">
      {/* Modal de exportación PDF */}
      {showExportPDF && (
        <UserExportPDF 
          users={getExportData()} 
          onClose={() => setShowExportPDF(false)} 
        />
      )}

      <UserStats 
        users={allUsers} 
        onCreateUser={openCreateModal} 
        onCreateEvaluando={openCreateEvaluando} 
      />
      
      <UserToolbar
        searchTerm={filters.search}
        onSearchChange={(search) => handleFilterChange({ ...filters, search })}
        statusFilter={filters.status}
        onStatusFilterChange={(status) => handleFilterChange({ ...filters, status })}
        roleFilter={filters.role}
        onRoleFilterChange={(role) => handleFilterChange({ ...filters, role })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport} // ✅ Ahora está correctamente conectado
      />

      <div className="content-area">
        {loading ? (
          <div className="loading-state">Cargando usuarios...</div>
        ) : displayedUsers.length === 0 ? (
          <EmptyState onCreateUser={openCreateModal} />
        ) : viewMode === 'grid' ? (
          <UserGrid
            users={displayedUsers}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <UserTable
            users={displayedUsers}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      {/* Modals */}
      <UserModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleEditEvaluador : handleCreateEvaluador}
        userData={editingUser}
        isEditing={!!editingUser}
      />

      <EvaluandoModal
        show={showEvaluandoModal}
        onClose={() => {
          setShowEvaluandoModal(false);
          setEditingUser(null);
        }}
        userData={editingUser}
        isEditing={!!editingUser && editingUser.role === 'evaluando'}
        onSubmit={editingUser ? handleEditEvaluando : handleCreateEvaluando}
      />

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userRole: null })}
        type="warning"
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
      />

      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, type: '', title: '', message: '' })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        showCancel={false}
        confirmText="Aceptar"
      />
    </div>
  );
};

export default UserManagement;