import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, clearSession } from '../utils/auth';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/apps')
      .then(({ data }) => setApps(data.apps))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user?.name} ({user?.role})</h2>
        <button onClick={handleLogout}>Log out</button>
      </div>

      {user?.role === 'Admin' && (
        <button onClick={() => navigate('/admin')} style={{ marginBottom: 16 }}>
          Admin Panel
        </button>
      )}

      <h3>Your Applications</h3>
      {loading && <p>Loading...</p>}
      {!loading && apps.length === 0 && <p>No applications assigned to your role.</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {apps.map((app) => (
          <button
            key={app.key}
            style={{ padding: 16, fontSize: 16 }}
            onClick={() => alert(`Would proxy into /api/zoho/${app.key}/...`)}
          >
            {app.label}
          </button>
        ))}
      </div>
    </div>
  );
}
