import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/crud.css'; // We'll create this CSS file

function CRUD() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', nameSurname: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const createUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/users', newUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNewUser({ username: '', nameSurname: '', password: '' });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const updateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/users/${editingUser.id}`, editingUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="crud-container">
            <h1>User Management</h1>
            
            {/* Create User Form */}
            <div className="create-user-form">
                <h2>Create New User</h2>
                <form onSubmit={createUser}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Name Surname"
                        value={newUser.nameSurname}
                        onChange={(e) => setNewUser({...newUser, nameSurname: e.target.value})}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                    />
                    <button type="submit">Create User</button>
                </form>
            </div>

            {/* User List */}
            <div className="user-list">
                <h2>User List</h2>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            {editingUser && editingUser.id === user.id ? (
                                <form onSubmit={updateUser} className="edit-form">
                                    <input
                                        type="text"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        value={editingUser.nameSurname}
                                        onChange={(e) => setEditingUser({...editingUser, nameSurname: e.target.value})}
                                    />
                                    <button type="submit">Save</button>
                                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                                </form>
                            ) : (
                                <div className="user-item">
                                    <span>{user.username} - {user.nameSurname}</span>
                                    <div className="user-actions">
                                        <button onClick={() => setEditingUser(user)}>Edit</button>
                                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CRUD;
