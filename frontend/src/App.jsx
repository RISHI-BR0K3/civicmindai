import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import api from './api';
import { ToastProvider, useToast } from './ToastContext';

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [occupation, setOccupation] = useState('Resident');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      
      toast("Login successful! Redirecting...");
      setTimeout(() => {
        if (response.data.role === 'CITIZEN') window.location.href = '/citizen';
        else if (response.data.role === 'OFFICER') window.location.href = '/officer';
        else window.location.href = '/admin';
      }, 500);
    } catch (err) {
      toast("Login failed! Please check credentials.", "error");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast("Password must be at least 6 characters.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        contact_number: contactNumber,
        occupation: occupation,
        email: email,
        password: password
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('role', response.data.role);
        toast(`Welcome to CivicMind AI, ${firstName || 'Citizen'}!`);
        setTimeout(() => {
          window.location.href = '/citizen';
        }, 600);
      } else {
        toast("Account created! Please sign in.");
        setIsSignUp(false);
        setIsLoading(false);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      toast(msg, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight">CIVICMIND AI</h1>
        <p className="text-lg text-gray-600 italic font-medium">"Predict • Prioritize • Prevent"</p>
      </div>

      <div className={`w-full ${isSignUp ? 'max-w-lg' : 'max-w-sm'} bg-white p-8 border border-gray-200 rounded-2xl shadow-sm transition-all`}>
        {/* Switch Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-center font-bold text-sm border-b-2 transition ${!isSignUp ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-center font-bold text-sm border-b-2 transition ${isSignUp ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Create Account
          </button>
        </div>

        {!isSignUp ? (
          /* Sign In Form */
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                autoComplete="off" 
                placeholder="you@example.com"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  autoComplete="new-password" 
                  placeholder="••••••••"
                  className="w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:bg-blue-400 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">New to CivicMind?</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSignUp(true)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition shadow-sm"
              >
                Create an Account
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1">First Name *</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  placeholder="e.g. John"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1">Last Name *</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  placeholder="e.g. Doe"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1">Contact Number *</label>
                <input 
                  type="tel" 
                  value={contactNumber} 
                  onChange={e => setContactNumber(e.target.value)} 
                  required 
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1">Occupation *</label>
                <select 
                  value={occupation} 
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Resident">Local Resident</option>
                  <option value="Student">Student</option>
                  <option value="IT / Software Professional">IT / Software Professional</option>
                  <option value="Business Owner / Merchant">Business Owner / Merchant</option>
                  <option value="Healthcare Worker">Healthcare Worker</option>
                  <option value="Educator / Teacher">Educator / Teacher</option>
                  <option value="Civil Engineer">Civil Engineer</option>
                  <option value="Government Employee">Government Employee</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1">Email Address *</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="john.doe@example.com"
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
              />
            </div>

            <div className="mb-6 relative">
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  autoComplete="new-password" 
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-300 p-2 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">Make sure it has at least 6 characters.</p>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:bg-blue-400 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </button>
              <div className="text-center text-xs text-gray-500 pt-2">
                Already registered?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Sign In instead
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="bg-blue-800 text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
              <Link to="/" className="hover:text-blue-200 transition">
                <h1 className="text-xl font-bold">CivicMind AI</h1>
              </Link>
              <nav className="space-x-6 flex items-center">
                {isAuthenticated && <button onClick={logout} className="hover:text-blue-200 transition">Logout</button>}
              </nav>
            </div>
          </header>
          <main className="flex-grow w-full max-w-6xl mx-auto p-4 mt-6">
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
