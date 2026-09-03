import { useEffect, useState } from 'react';
import api from '../utils/api';

const ROLES = ['Admin', 'HR', 'Sales', 'Support', 'Finance'];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', roleName: 'Support' });

  function loadUsers() {
    api.get('/admin/users').then(({ data }) => setUsers(data.users));
  }
  function loadLogs() {
    api.get('/admin/audit-logs').then(({ data }) => setLogs(data.logs));
  }

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post('/admin/users', form);
    setForm({ name: '', email: '', password: '', roleName: 'Support' });
    loadUsers();
    loadLogs();
  }

  async function handleRoleChange(userId, roleName) {
    await api.put(`/admin/users/${userId}/role`, { roleName });
    loadUsers();
    loadLogs();
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Admin Panel</h2>

      <h3>Create User</h3>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit">Add User</button>
      </form>

      <h3>Users</h3>
      <table width="100%" border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.Roles?.[0]?.name || ''}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Audit Logs</h3>
      <ul>
        {logs.map((l) => (
          <li key={l.id}>[{new Date(l.createdAt).toLocaleString()}] {l.action} — {l.detail}</li>
        ))}
      </ul>
    </div>
  );
}
