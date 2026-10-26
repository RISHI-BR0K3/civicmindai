import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, 5);
  }, [map, center]);
  return null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total_complaints: 0, resolved_complaints: 0, total_users: 0, total_managers: 0, hotspots: [] });
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const currentRole = localStorage.getItem('role');

  const fetchData = async () => {
    setIsLoading(true);
    setAuthError(null);

    // Verify role first
    if (currentRole !== 'ADMIN' && currentRole !== 'HEAD') {
      setAuthError("You are not logged in as an Administrator. Please log in with admin@city.com to access this dashboard.");
      setIsLoading(false);
      return;
    }

    try {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data || { total_complaints: 0, resolved_complaints: 0, total_users: 0, total_managers: 0, hotspots: [] });
      } catch (err) {
        console.warn("Could not fetch stats:", err);
      }

      try {
        const usersRes = await api.get('/dashboard/users');
        setUsers(usersRes.data || []);
      } catch (err) {
        console.warn("Could not fetch users:", err);
      }

      try {
        const compRes = await api.get('/complaints/');
        setComplaints(compRes.data || []);
      } catch (err) {
        console.warn("Could not fetch complaints:", err);
      }
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/dashboard/users/${id}`);
      fetchData();
    } catch (e) { alert("Error deleting user"); }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      await api.put(`/dashboard/users/${id}/role`, { role: newRole });
      fetchData();
    } catch (e) { alert("Error updating role"); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      fetchData();
    } catch (e) { alert("Error deleting complaint"); }
  };

  const updateComplaintStatus = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchData();
    } catch (e) { alert("Error updating status"); }
  };

  if (authError) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white border border-red-200 rounded-xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Administrator Access Required</h2>
        <p className="text-gray-600 text-sm mb-6">{authError}</p>
        <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-700 font-mono mb-6 text-left">
          <strong>Default Admin Credentials:</strong><br/>
          Email: admin@city.com<br/>
          Password: AdminCivic2026!
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border border-gray-200 rounded shadow-sm p-4 h-fit sticky top-6">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-extrabold text-blue-900">Admin Control</h2>
          <button onClick={fetchData} title="Refresh Data" className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded">🔄</button>
        </div>
        <nav className="flex flex-col space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 rounded font-bold transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            📊 System Overview
          </button>
          <button onClick={() => setActiveTab('users')} className={`text-left px-4 py-3 rounded font-bold transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            👥 Manage Users
          </button>
          <button onClick={() => setActiveTab('complaints')} className={`text-left px-4 py-3 rounded font-bold transition ${activeTab === 'complaints' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            🚨 Master Database
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 border rounded shadow-sm text-center">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Total Users</h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.total_users || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded shadow-sm text-center">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Managers</h3>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.total_managers || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded shadow-sm text-center">
                <h3 className="text-gray-500 text-xs font-bold uppercase">All Complaints</h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.total_complaints || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded shadow-sm text-center border-b-4 border-b-red-500">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Active Hotspots</h3>
                <p className="text-3xl font-extrabold text-red-600 mt-1">{stats.hotspots?.length || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 border rounded shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2 border-b pb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">AI Hotspot Heatmap (India)</h2>
                  <p className="text-xs text-gray-500">Live geographical view of recurring complaint clusters detected by DBSCAN.</p>
                </div>
                <div>
                  {(stats.hotspots || []).length === 0 ? (
                    <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-semibold">
                      ✅ All hotspots resolved / No active clusters
                    </span>
                  ) : (
                    <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-semibold">
                      🚨 {stats.hotspots.length} Active Hotspot{stats.hotspots.length > 1 ? 's' : ''} Detected
                    </span>
                  )}
                </div>
              </div>
              <div className="h-96 w-full rounded border overflow-hidden relative z-0">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} minZoom={4} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <MapController center={[20.5937, 78.9629]} />
                  {(stats.hotspots || []).map((h, idx) => (
                    <CircleMarker 
                      key={idx} 
                      center={[h.center_latitude, h.center_longitude]} 
                      radius={h.severity === 'High' ? 25 : h.severity === 'Medium' ? 15 : 10}
                      fillOpacity={0.5}
                      pathOptions={{ color: h.severity === 'High' ? 'red' : h.severity === 'Medium' ? 'orange' : 'yellow' }}
                    >
                      <Popup>
                        <strong>{h.severity} Severity Hotspot</strong><br/>
                        Complaints in cluster: {h.complaint_count}
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Managers Section */}
            <div className="bg-white p-6 border rounded shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between">
                <span>City Managers & Admins</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {users.filter(u => u.role === 'OFFICER' || u.role === 'ADMIN').length} Total
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="uppercase border-b-2 bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'OFFICER' || u.role === 'ADMIN').map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">#{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800 font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.occupation || 'Staff'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-600">{u.email}</div>
                          <div className="text-xs text-gray-400">{u.contact_number || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            className={`border rounded p-1 text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                            value={u.role}
                            onChange={(e) => changeUserRole(u.id, e.target.value)}
                            disabled={u.role === 'ADMIN'}
                          >
                            <option value="CITIZEN">Citizen</option>
                            <option value="OFFICER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Citizens Section */}
            <div className="bg-white p-6 border rounded shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between">
                <span>Citizens</span>
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {users.filter(u => u.role === 'CITIZEN').length} Total
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="uppercase border-b-2 bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'CITIZEN').map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">#{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800 font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.occupation || 'Citizen'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-600">{u.email}</div>
                          <div className="text-xs text-gray-400">{u.contact_number || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            className="border rounded p-1 text-xs font-bold bg-gray-100 text-gray-800"
                            value={u.role}
                            onChange={(e) => changeUserRole(u.id, e.target.value)}
                          >
                            <option value="CITIZEN">Citizen</option>
                            <option value="OFFICER">Manager</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="bg-white p-6 border rounded shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
              <span>Master Database (All Complaints)</span>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded">Total: {complaints.length}</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="uppercase border-b-2 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Snippet</th>
                    <th className="px-4 py-3">Reporter ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Danger Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 10).map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">#{c.id}</td>
                      <td className="px-4 py-3 text-gray-800 truncate max-w-[180px]">{c.description}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{c.citizen?.name || `User #${c.citizen_id}`}</div>
                        {c.citizen?.contact_number && (
                          <div className="text-xs text-green-700 font-mono">📞 {c.citizen.contact_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          className="border border-gray-300 rounded p-1 text-xs bg-white font-semibold"
                          value={c.status}
                          onChange={(e) => updateComplaintStatus(c.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteComplaint(c.id)} className="text-white bg-red-600 hover:bg-red-700 font-bold text-xs px-3 py-1 rounded shadow-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {complaints.length > 10 && (
              <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded border">
                <span className="text-sm text-gray-600 font-semibold">Showing top 10 recent records (Pagination enabled)</span>
                <div className="space-x-2">
                  <button disabled className="px-3 py-1 border rounded bg-gray-200 text-gray-400 cursor-not-allowed text-sm font-bold">Prev</button>
                  <button disabled className="px-3 py-1 border rounded bg-gray-200 text-gray-400 cursor-not-allowed text-sm font-bold">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
