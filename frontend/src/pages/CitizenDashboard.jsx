import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import { useToast } from '../ToastContext';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationPicker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true });
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [address, setAddress] = useState('');

  // Fetch address whenever position changes
  useEffect(() => {
    if (position) {
      const getAddress = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
          const data = await res.json();
          setAddress(data.display_name || "Unknown Location");
        } catch (error) {
          setAddress("Could not fetch address");
        }
      };
      getAddress();
    }
  }, [position]);

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const defaultCenter = [28.6139, 77.2090]; 

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/');
      setComplaints(res.data);
    } catch (e) {
      toast("Failed to load history", "error");
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  // --- Camera Logic ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    setPhotoUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      toast("Camera access denied or no camera found.", "error");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoUrl(canvas.toDataURL('image/png'));
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhotoUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };
  // -------------------

  const handleDetectLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      toast("Requesting location access...");
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          toast("Location detected!");
        },
        () => toast("Could not detect location. Please ensure permissions are enabled.", "error")
      );
    } else {
      toast("Geolocation is not supported by your browser.", "error");
    }
  };

  const isFormValid = description.trim().length >= 10 && position !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/complaints/', {
        description,
        address: address,
        latitude: parseFloat(position.lat),
        longitude: parseFloat(position.lng),
        image_url: photoUrl
      });
      toast('Complaint successfully submitted!');
      setDescription('');
      setPosition(null);
      setPhotoUrl(null);
      setAddress('');
      fetchComplaints();
    } catch (e) {
      toast("Error submitting complaint.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 border border-gray-200 rounded shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Report an Issue</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" rows="3" placeholder="E.g. Broken water pipe leaking on Main Street..." required></textarea>
            {description.length > 0 && description.trim().length < 10 && (
              <p className="text-red-500 text-xs mt-1 font-semibold">Please describe the issue in more detail (at least 10 characters).</p>
            )}
          </div>
          
          <div className="mb-6 border p-4 rounded bg-gray-50">
            <label className="block text-gray-700 text-sm font-bold mb-2">Attach Photo Proof (Optional)</label>
            {!isCameraOpen && !photoUrl && (
              <div className="flex space-x-4">
                <button type="button" onClick={startCamera} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition font-semibold">📷 Take Photo</button>
                <label className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition cursor-pointer font-semibold">
                  📁 Upload File
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
            
            {isCameraOpen && (
              <div className="mt-2 flex flex-col items-center">
                <video ref={videoRef} autoPlay className="w-full max-h-48 bg-black rounded" />
                <div className="flex space-x-2 mt-2">
                  <button type="button" onClick={takePhoto} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Snap!</button>
                  <button type="button" onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Cancel</button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />

            {photoUrl && !isCameraOpen && (
              <div className="mt-2 relative inline-block">
                <img src={photoUrl} alt="Complaint" className="max-h-48 rounded border shadow-sm" />
                <button type="button" onClick={() => setPhotoUrl(null)} className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Remove</button>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">Pinpoint Location on Map *</label>
              <button type="button" onClick={handleDetectLocation} className="bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold transition">📍 Detect My Location</button>
            </div>
            <div className={`h-64 w-full rounded border overflow-hidden ${!position ? 'border-red-300' : 'border-green-400 border-2'}`}>
              <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {!position && <p className="text-red-500 text-xs mt-1 font-semibold">You must click the map or detect your location to submit.</p>}
            
            {address && (
              <p className="text-sm text-gray-700 mt-2 bg-gray-100 p-2 rounded border">
                <strong>Address:</strong> {address}
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {isSubmitting ? "Analyzing & Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">My History</h2>
        <p className="text-gray-500 text-sm mb-4">Click "View Details" to see the full report of your submitted issues.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="uppercase border-b-2 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Issue Snippet</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className={`border-b hover:bg-gray-50 transition-colors ${expandedId === c.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4 font-bold text-gray-800">#{c.id}</td>
                    <td className="px-4 py-4 text-gray-800 truncate max-w-xs">{c.description}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        c.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => toggleExpand(c.id)} 
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                      >
                        {expandedId === c.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {expandedId === c.id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan="4" className="px-6 py-6">
                        <div className="bg-white border rounded shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Text Details Section */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Date Submitted</h4>
                              <p className="text-gray-800 font-medium">
                                {new Date(c.created_at + 'Z').toLocaleString('en-IN', {
                                  day: '2-digit', month: '2-digit', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                  hour12: false
                                })}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Full Description</h4>
                              <p className="text-gray-800 bg-gray-50 p-3 border rounded mt-1">{c.description}</p>
                            </div>

                            <div>
                              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Location Address</h4>
                              <p className="text-gray-800 font-medium mt-1">{c.address || 'Address not available'}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Current Status</h4>
                              <p className="text-gray-800 font-bold mt-1">{c.status}</p>
                            </div>
                          </div>

                          {/* Photo Section */}
                          <div>
                            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Uploaded Photo</h4>
                            {c.image_url ? (
                              <div className="border border-gray-200 shadow-sm rounded overflow-hidden">
                                <img src={c.image_url} alt="Proof" className="w-full h-auto object-contain bg-gray-100 max-h-64" />
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
    </div>
  );
}
