import React, { useState } from 'react';
import UserStats from '../../components/management/user/UserStats';
import UserToolbar from '../../components/management/user/UserToolbar';
import UserGrid from '../../components/management/user/UserGrid';
import UserTable from '../../components/management/user/UserTable';
import EmptyState from '../../components/management/user/EmptyState';
import UserModal from '../../components/management/user/UserModal';
import Modal from '../../components/common/Modal';
import '../../styles/pages/admin/UserManagementPage.css';

const UserManagement = () => {
  const [users, setUsers] = useState([
    // ... datos iniciales
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Filtrado
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateUser = (userData) => {
    const newUser = {
      ...userData,
      id: Math.max(...users.map(u => u.id)) + 1,
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setShowModal(false);
    showAlert('success', '¡Éxito!', 'El evaluador ha sido registrado correctamente.');
  };

  const handleEditUser = (userData) => {
    setUsers(users.map(user => 
      user.id === editingUser.id ? { ...user, ...userData } : user
    ));
    setShowModal(false);
    setEditingUser(null);
    showAlert('success', '¡Actualizado!', 'La información del evaluador ha sido actualizada correctamente.');
  };

  const handleDeleteUser = (userId) => {
    setDeleteConfirm({ isOpen: true, userId });
  };

  const confirmDelete = () => {
    setUsers(users.filter(user => user.id !== deleteConfirm.userId));
    setDeleteConfirm({ isOpen: false, userId: null });
    showAlert('success', 'Eliminado', 'El evaluador ha sido eliminado correctamente.');
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const handleExport = () => {
    // Lógica de exportación
    showAlert('info', 'Exportar', 'Función de exportación en desarrollo.');
  };

  return (
    <div className="user-management">
      <UserStats users={users} onCreateUser={openCreateModal} />
      
      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
      />

      <div className="content-area">
        {filteredUsers.length === 0 ? (
          <EmptyState onCreateUser={openCreateModal} />
        ) : viewMode === 'grid' ? (
          <UserGrid
            users={filteredUsers}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            onToggleStatus={toggleUserStatus}
          />
        ) : (
          <UserTable
            users={filteredUsers}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            onToggleStatus={toggleUserStatus}
          />
        )}
      </div>

      {/* Modals */}
      <UserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={editingUser ? handleEditUser : handleCreateUser}
        userData={editingUser}
        isEditing={!!editingUser}
      />

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null })}
        type="warning"
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este evaluador? Esta acción no se puede deshacer."
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