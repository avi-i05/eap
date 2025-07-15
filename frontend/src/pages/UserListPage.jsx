import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "../styles/pages/UserListPage.css";
import UserRow from "../components/UserRow";
import { toast } from "react-toastify";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch users");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleBlockToggle = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${BASE_URL}/api/admin/users/${userId}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(user => (
        user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
      )));
      toast.success("User status updated");
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    toast.info("Deleting user...");
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(user => user._id !== userId));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

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
                  onBlockToggle={handleBlockToggle}
                  onDelete={handleDeleteUser}
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

export default UserListPage;
