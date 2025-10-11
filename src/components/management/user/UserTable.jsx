import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../../../styles/management/user/UserTable.css';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="users-table">
      <table>
        <thead>
          <tr>
            <th>Evaluador</th>
            <th>Contacto</th>
            <th>Institución</th>
            <th>Nivel</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <div className="user-avatar small">
                    <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span className="research-lines">{user.researchLines}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="contact-info">
                  <div>{user.email}</div>
                  <div className="user-links">
                    {user.cvLink && <a href={user.cvLink} target="_blank" rel="noopener noreferrer">CVLAC</a>}
                    {user.scholarLink && <a href={user.scholarLink} target="_blank" rel="noopener noreferrer">Scholar</a>}
                  </div>
                </div>
              </td>
              <td>{user.institution}</td>
              <td>{user.educationLevel}</td>
              <td>
                <span className={`status-badge ${user.status}`}>
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button 
                    className="btn-icon btn-edit"
                    onClick={() => onEdit(user)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(user.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                  <button 
                    className={`btn-toggle ${user.status === 'active' ? 'active' : ''}`}
                    onClick={() => onToggleStatus(user.id)}
                    title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;