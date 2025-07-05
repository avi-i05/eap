import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./UserListPage.css";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
        setLoading(false);
      } catch (error) {
        alert("Failed to fetch users.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <motion.div 
        className="users-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2>User Management</h2>
          <p className="subtitle">{filteredUsers.length} users found</p>
        </div>
        <div className="controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="role-filter">
            <select value={selectedRole} onChange={handleRoleChange}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <UserRow 
                  key={user._id}
                  user={user}
                  index={index}
                  variants={rowVariants}
                />
              ))
            ) : (
              <motion.tr 
                className="empty-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td colSpan="5">
                  <div className="empty-state">
                    <i className="fas fa-user-slash"></i>
                    <p>No users found</p>
                  </div>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserRow = ({ user, index, variants }) => {
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
        <span className="status-badge active">Active</span>
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
          <button className="action-btn edit-btn" title="Edit">
            <i className="fas fa-edit"></i>
          </button>
          <button className="action-btn delete-btn" title="Delete">
            <i className="fas fa-trash"></i>
          </button>
          <button className="action-btn more-btn" title="More options">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </motion.div>
      </td>
    </motion.tr>
  );
};

export default UserListPage;