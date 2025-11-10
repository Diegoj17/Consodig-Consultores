import React from 'react';
import { FaEdit } from 'react-icons/fa';
import '../../../styles/management/user/UserTable.css';

const UserTable = ({ users = [], onEdit, onToggleStatus }) => {
  // Función para obtener nombre completo
  const getDisplayName = (user) => {
    if (user.nombre && user.apellido) {
      return `${user.nombre} ${user.apellido}`
    }
    return user.name || user.nombre || user.email || '—'
  }

  // Función para obtener institución
  const getInstitution = (user) => {
    return user.afiliacionInstitucional || user.institution || '-'
  }

  // Función para obtener nivel educativo
  const getEducationLevel = (user) => {
    return user.nivelEducativo || user.educationLevel || '-'
  }

  // Función para obtener estado
  const getUserStatus = (user) => {
    return user.estado === 'ACTIVO' ? 'active' : 
           user.estado === 'INACTIVO' ? 'inactive' : 
           user.status || 'active'
  }

  // Función para obtener líneas de investigación
  const getResearchLines = (user) => {
    if (!user.lineasInvestigacion) return "-";

    if (Array.isArray(user.lineasInvestigacion)) {
      return user.lineasInvestigacion.map(l => l.nombre).join(", ");
    }

    if (typeof user.lineasInvestigacion === "string") {
      return user.lineasInvestigacion;
    }

    if (typeof user.lineasInvestigacion === "object") {
      return Object.values(user.lineasInvestigacion).join(", ");
    }

    return "-";
  };

  return (
    <div className="users-table">
      <table>
        <thead>
          <tr>
            <th>Contacto</th>
            <th>Líneas de Investigación & Enlaces</th>
            <th>Institución</th>
            <th>Nivel</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => {
            const displayName = getDisplayName(user)
            const initials = displayName
              .split(' ')
              .map(n => (n ? n[0] : ''))
              .join('')
              .toUpperCase()
              .slice(0, 2)
            
            const status = getUserStatus(user)
            const role = user.role || 'evaluador'

            return (
              <tr key={user?.id || user?.email || idx}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar small">
                      <span>{initials}</span>
                    </div>
                    <div className="user-info">
                      <strong>{displayName}</strong>
                      <div className="contact-details">
                        <div className="email">{user?.email}</div>
                        {role === 'evaluando' && user?.telefono && (
                          <div className="phone">Tel: {user.telefono}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="research-links-info">
                    <div className="research-lines">
                      {getResearchLines(user)}
                    </div>
                    <div className="user-links">
                      {user?.cvlac && (
                        <a href={user.cvlac} target="_blank" rel="noopener noreferrer" className="link-item">
                          CVLAC
                        </a>
                      )}
                      {user?.googleScholar && (
                        <a href={user.googleScholar} target="_blank" rel="noopener noreferrer" className="link-item">
                          Scholar
                        </a>
                      )}
                      {user?.orcid && (
                        <span className="orcid-info link-item">ORCID: {user.orcid}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{getInstitution(user)}</td>
                <td>{getEducationLevel(user)}</td>
                <td>
                  <span className={`role-badge ${role}`}>
                    {role === 'evaluando' ? 'Evaluando' : 'Evaluador'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${status}`}>
                    {status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => onEdit && onEdit(user)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-toggle ${status === 'active' ? 'active' : ''}`}
                      onClick={() => onToggleStatus && onToggleStatus(user?.id, user?.role)}
                      title={status === 'active' ? 'Desactivar' : 'Activar'}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;