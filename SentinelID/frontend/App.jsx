import React, { useState, useEffect } from 'react';

function ShieldLogo({className = 'w-10 h-10'}) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48">
      <path d="M24 7l15 5v8.2c0 10.53-6.44 16.67-14.19 20.17a2 2 0 0 1-1.62 0C15.44 36.87 9 30.73 9 20.2V12L24 7z"
        stroke="#00B6FF" strokeWidth="2.5" />
      <ellipse cx="24" cy="23.5" rx="7" ry="5.5" stroke="#00B6FF" strokeWidth="2" />
      <circle cx="24" cy="23.5" r="2.75" fill="#00B6FF"/>
    </svg>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
        return;
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      onLogin();
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1621] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex gap-10 xl:gap-24 w-full max-w-6xl mx-auto">
        {/* Left side */}
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#0B1621] to-[#111926] p-10 relative flex flex-col justify-between shadow-lg border border-[#131f2e]/60 min-h-[620px] overflow-hidden">
          {/* Navbar */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <ShieldLogo className="w-10 h-10" />
              <span className="text-xl font-bold tracking-wide">SENTINELID</span>
            </div>
            <div className="flex space-x-8 text-base font-medium">
              <a href="#" className="hover:text-[#00b6ff]">Solução</a>
              <a href="#" className="hover:text-[#00b6ff]">Como Funciona</a>
              <a href="#" className="hover:text-[#00b6ff]">Preços</a>
              <a href="#" className="hover:text-[#00b6ff]">Sobre</a>
            </div>
          </div>
          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center z-10 relative">
            <h1 className="text-[48px] leading-[1.05] font-bold mb-6 text-white w-full max-w-[520px]">
              Proteja seu<br/>negócio com<br/>Inteligência<br/>Facial.
            </h1>
            <p className="text-lg text-[#c2d0e8] max-w-lg mb-8 font-normal">
              A nova geração de segurança baseada em reconhecimento facial de alta precisão.
            </p>
            <div className="flex gap-4 mt-2">
              <button className="px-7 py-3 rounded-lg bg-[#11b9ff] text-white text-lg font-medium shadow-lg hover:bg-[#09a2db] transition">
                Têste Grátis 30 Dias
              </button>
              <button className="px-7 py-3 rounded-lg border border-[#586372] bg-[#171e25] text-white text-lg font-medium hover:bg-[#262f39] transition">
                Agendar Demonstração
              </button>
            </div>
          </div>
          {/* Background image */}
          <img 
            src="https://images.pexels.com/photos/1138903/pexels-photo-1138903.jpeg?auto=compress&w=900&q=60"
            alt="Businessman in dark suit standing in confident pose, corporate office mood, out of focus background, business setting"
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none rounded-2xl"
            style={{zIndex: 0, objectPosition: 'center'}}
          />
        </div>
        {/* Right side */}
        <div className="flex flex-col justify-center w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0A121B] to-[#101D2C] p-12 shadow-lg border border-[#131f2e]/60">
          <div className="flex flex-col items-center mb-10">
            <ShieldLogo className="w-16 h-16 mb-2" />
            <span className="font-bold text-2xl tracking-[.15em] mb-2 mt-1">SENTINELID</span>
            <p className="text-base text-[#d1dbe6] text-center font-normal">
              Acesse sua plataforma de<br/>segurança facial
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="usuario" className="text-base text-[#c2d0e8]">Usuário</label>
              <input
                id="usuario"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border border-[#293242] rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#10bcff] transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="senha" className="text-base text-[#c2d0e8]">Senha</label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border border-[#293242] rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#10bcff] transition"
              />
              <a href="#" className="text-right text-[#899cb1] hover:text-[#10bcff] text-[15px] mt-1">Esqueceu sua senha!</a>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit" className="mt-3 px-6 py-3 rounded-lg bg-[#11b9ff] text-white text-lg font-bold hover:bg-[#09a2db] transition">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    // Fetch initial alerts
    fetch('http://localhost:8000/alerts?token=' + token)
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setAlerts(data))
      .catch(() => {
        localStorage.removeItem('access_token');
        window.location.href = '/';
      });

    // Setup WebSocket for real-time alerts
    const socket = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
    socket.onmessage = (event) => {
      setAlerts(prev => [JSON.parse(event.data), ...prev]);
    };
    socket.onclose = () => {
      console.log('WebSocket closed');
    };
    setWs(socket);

    return () => {
      if (socket) socket.close();
    };
  }, []);

  function logout() {
    localStorage.removeItem('access_token');
    if (ws) ws.close();
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">SentinelID Dashboard</h1>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
      </header>
      <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="col-span-2 bg-white rounded shadow p-4 overflow-auto max-h-[600px]">
          <h2 className="text-lg font-semibold mb-4">Real-Time Alerts</h2>
          {alerts.length === 0 ? (
            <p>No alerts yet.</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map(alert => (
                <li key={alert.id} className="border border-gray-300 rounded p-2">
                  <p><strong>Face ID:</strong> {alert.face_id}</p>
                  <p><strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                  <p><strong>Camera:</strong> {alert.camera_id}</p>
                  <p><strong>Type:</strong> {alert.alert_type}</p>
                  <p><strong>Description:</strong> {alert.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Camera Feeds</h2>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-200 rounded h-40 flex items-center justify-center text-gray-500">
                Camera Feed {i}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setLoggedIn(!!token);
  }, []);

  return loggedIn ? <Dashboard /> : <Login onLogin={() => setLoggedIn(true)} />;
}

export default App;
