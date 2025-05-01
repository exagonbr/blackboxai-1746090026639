import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FaShieldAlt, FaVideo, FaSignOutAlt } from 'react-icons/fa';

// Components
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/login', { username, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-8">
          <FaShieldAlt className="text-blue-500 text-4xl mr-3" />
          <h1 className="text-2xl font-bold">SentinelID</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch alerts
    axios.get('http://localhost:8000/alerts', {
      headers: { Authorization: token }
    }).then(res => setAlerts(res.data));

    // WebSocket connection
    const socket = new WebSocket(`ws://localhost:8000`);
    socket.onmessage = (e) => {
      setAlerts(prev => [JSON.parse(e.data), ...prev]);
    };
    setWs(socket);

    return () => socket.close();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (ws) ws.close();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>
      <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="md:col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Alerts</h2>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="border rounded p-3">
                  <p><span className="font-medium">Face ID:</span> {alert.faceId}</p>
                  <p><span className="font-medium">Camera:</span> {alert.cameraId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No alerts detected</p>
          )}
        </section>
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Camera Feeds</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded h-40 flex items-center justify-center">
                <FaVideo className="text-gray-500 text-2xl" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
