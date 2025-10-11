import React from 'react';
import UserCard from './UserCard';
import '../../../styles/management/user/UserGrid.css';

const UserGrid = ({ users, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="users-grid">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default UserGrid;