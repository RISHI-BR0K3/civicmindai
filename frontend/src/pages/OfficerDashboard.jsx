import React, { useState, useEffect } from 'react';
import api from '../api';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints(); // Refresh table
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 border border-gray-200 rounded shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manager Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Click "View Details" to see full reports and photos.</p>
        </div>
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
          {complaints.filter(c => c.status === 'Pending').length} Pending Issues
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Issue Snippet</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <React.Fragment key={c.id}>
                {/* Main Row */}
                <tr className={`border-b hover:bg-gray-50 transition-colors ${expandedId === c.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 font-bold text-gray-800">#{c.id}</td>
                  <td className="px-6 py-4 text-gray-800 truncate max-w-xs">{c.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleExpand(c.id)} 
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                    >
                      {expandedId === c.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedId === c.id && (
                  <tr className="border-b bg-gray-50">
                    <td colSpan="4" className="px-8 py-6">
                      <div className="bg-white border rounded shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Text Details Section */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Date & Time</h4>
                            <p className="text-gray-800 font-medium">
                              {new Date(c.created_at + 'Z').toLocaleString('en-IN', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                                hour12: false
                              })}
                            </p>
                          </div>

                          {/* Citizen Contact Card */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 shadow-sm">
                            <h4 className="text-xs uppercase font-bold text-blue-800 tracking-wider mb-2">Citizen Contact Details</h4>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <p className="text-gray-900 font-bold text-sm">
                                  {c.citizen?.name || `Citizen #${c.citizen_id}`}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  Occupation: <span className="font-semibold text-gray-800">{c.citizen?.occupation || 'Resident'}</span>
                                </p>
                              </div>
                              <div className="flex flex-col sm:items-end gap-1">
                                {c.citizen?.contact_number ? (
                                  <a 
                                    href={`tel:${c.citizen.contact_number}`} 
                                    className="inline-flex items-center text-xs font-bold text-green-800 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded transition w-fit"
                                  >
                                    📞 Call: {c.citizen.contact_number}
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No phone registered</span>
                                )}
                                {c.citizen?.email && (
                                  <a 
                                    href={`mailto:${c.citizen.email}`} 
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center font-medium"
                                  >
                                    ✉️ {c.citizen.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Full Complaint Description</h4>
                            <p className="text-gray-800 bg-gray-50 p-3 border rounded mt-1">{c.description}</p>
                          </div>

                          <div>
                            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Location Address</h4>
                            <p className="text-gray-800 font-medium mt-1">{c.address || 'Address not available'}</p>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 transition"
                            >
                              🗺️ Open in Google Maps
                            </a>
                          </div>

                          <div className="pt-4 border-t">
                            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Update Status</h4>
                            <select 
                              className="border border-gray-300 rounded p-2 text-sm bg-white font-semibold focus:outline-none focus:border-blue-500"
                              value={c.status}
                              onChange={(e) => updateStatus(c.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </div>

                        {/* Photo Proof Section */}
                        <div>
                          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Attached Proof</h4>
                          {c.image_url ? (
                            <div className="border-4 border-white shadow-md rounded overflow-hidden">
                              <img src={c.image_url} alt="Proof of complaint" className="w-full h-auto object-contain bg-gray-100" />
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 font-medium italic">
                              No photo was attached
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
