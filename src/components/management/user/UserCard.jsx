import { FaEdit } from "react-icons/fa"
import "../../../styles/management/user/UserCard.css"

const UserCard = ({ user, onEdit, onToggleStatus }) => {
  const role = user.role || "evaluador"
  
  // Determinar el estado basado en el campo 'estado' del backend
  const userStatus = user.estado === 'ACTIVO' ? 'active' : 
                    user.estado === 'INACTIVO' ? 'inactive' : 
                    user.status || 'active'
  
  // Obtener nombre completo según la estructura de datos
  const getUserName = () => {
    if (user.nombre && user.apellido) {
      return `${user.nombre} ${user.apellido}`
    }
    return user.name || user.nombre || user.email || "Usuario"
  }

  const getUserEmail = () => {
    return user.email || "-"
  }

  const getUserInstitution = () => {
    return user.afiliacionInstitucional || user.institution || "-"
  }

  const getUserEducationLevel = () => {
    return user.nivelEducativo || user.educationLevel || "-"
  }

  const getUserResearchLines = () => {
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

  const getUserPhone = () => {
    return user.telefono || user.phone || "-"
  }

  const initials = getUserName()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleStatusToggle = () => {
    if (onToggleStatus) {
      onToggleStatus(user.id, user.role);
    }
  }

  return (
    <div className="user-card">
      <div className="card-header">
        <div className="user-avatar">
          <span>{initials}</span>
        </div>
        <div className="user-meta">
          <h3>{getUserName()}</h3>
          <p className="user-email">{getUserEmail()}</p>
          {role === "evaluando" && (
            <p className="user-phone">Tel: {getUserPhone()}</p>
          )}
          <p className={`user-role ${role}`}>{role === "evaluando" ? "Evaluando" : "Evaluador"}</p>
        </div>
        <div className="status-indicator">
          <span className={`status-badge ${userStatus}`}>
            {userStatus === "active" ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="info-group">
          <label>Institución:</label>
          <p>{getUserInstitution()}</p>
        </div>
        <div className="info-group">
          <label>Nivel de Estudios:</label>
          <p>{getUserEducationLevel()}</p>
        </div>
        <div className="info-group">
          <label>Líneas de Investigación:</label>
          <p className="research-lines">{getUserResearchLines()}</p>
        </div>

        {role === "evaluador" && (
          <div className="user-links">
            {user.cvlac && (
              <a href={user.cvlac} target="_blank" rel="noopener noreferrer" className="link-item">
                <span>CVLAC</span>
              </a>
            )}
            {user.googleScholar && (
              <a href={user.googleScholar} target="_blank" rel="noopener noreferrer" className="link-item">
                <span>Google Scholar</span>
              </a>
            )}
            {user.orcid && <span className="link-item">ORCID: {user.orcid}</span>}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="action-buttons">
          <button className="btn-icon btn-edit" onClick={() => onEdit(user)} title="Editar">
            <FaEdit />
          </button>
          <button
            className={`btn-toggle ${userStatus === "active" ? "active" : ""}`}
            onClick={handleStatusToggle}
            title={userStatus === "active" ? "Desactivar" : "Activar"}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
        <div className="registration-date">
          Registrado: {new Date(user.registrationDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default UserCard