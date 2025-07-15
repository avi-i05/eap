import React, { useState } from "react";
import { motion } from "framer-motion";

const UserRow = ({ user, index, variants, onBlockToggle, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.tr
      variants={variants}
      initial="hidden"
      animate="visible"
      custom={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="user-row"
    >
      <td>
        <div className="user-info">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="username">{user.username}</div>
            <div className="join-date">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td>
        <span className={`role-badge ${user.role}`}>
          {user.role}
        </span>
      </td>
      <td>
        <motion.div 
          className="actions"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          <button
            className="action-btn edit-btn"
            title={user.isBlocked ? "Unblock User" : "Block User"}
            onClick={() => onBlockToggle(user._id)}
          >
            <i className={`fas fa-user-${user.isBlocked ? "check" : "slash"}`}></i>
          </button>
          <button
            className="action-btn delete-btn"
            title="Delete User"
            onClick={() => onDelete(user._id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </motion.div>
      </td>
    </motion.tr>
  );
};

export default UserRow;
