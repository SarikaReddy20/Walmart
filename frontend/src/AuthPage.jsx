import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Uncomment in a real React Router setup
import axios from 'axios'; // Uncomment in a real MERN app


const API_BASE = 'http://localhost:5000/api'; // Replace if needed

const AuthPage = () => {
  const [role, setRole] = useState('admin'); // admin | manager | customer
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false); // New loading state
  const [message, setMessage] = useState(''); // New message state for success/error
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(''); // Clear previous messages
    setMessageType('');

    const { fullName, email, password } = form;
    try {
      let url = '';
      let payload = { email, password };

      if (role === 'admin') {
        url = `${API_BASE}/admin/login`;
      } else if (role === 'manager') {
        url = `${API_BASE}/manager/login`;
      } else if (role === 'customer' && isRegister) {
        url = `${API_BASE}/customer/register`;
        const pos = await getLocation(); // This will use the mock getLocation
        payload = { ...payload, fullName, lat: pos.lat, lng: pos.lng }; // Add fullName, lat, lng for customer register
      } else if (role === 'customer') {
        url = `${API_BASE}/customer/login`;
      }

      const res = await axios.post(url, payload);
      localStorage.setItem('token', res.data.token);
      setMessage(`${role} ${isRegister ? 'registered' : 'logged in'} successfully!`);
      setMessageType('success');

      // Redirect based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'manager') navigate('/manager/dashboard');
      else navigate('/customer/dashboard');
      window.location.reload();
    } catch (err) {
      console.error("Auth error:", err);
      setMessage(err.response?.data?.message || 'An unexpected error occurred.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 lg:p-12 border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-8">
          {isRegister ? 'Register' : 'Login'} as <span className="capitalize">{role}</span>
        </h2>

        {/* Role Selection Buttons */}
        <div className="flex justify-between gap-2 mb-6">
          {['admin', 'manager', 'customer'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setIsRegister(false); // Reset to login view when changing role
                setForm({ fullName: '', email: '', password: '' }); // Clear form
                setMessage(''); // Clear messages
                setMessageType('');
              }}
              className={`flex-1 py-3 rounded-lg font-semibold capitalize transition-all duration-300
                ${role === r
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center text-sm font-medium
            ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          {role === 'customer' && isRegister && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isRegister ? 'Registering...' : 'Logging In...'}
            </>
          ) : (
            isRegister ? 'Register' : 'Login'
          )}
        </button>

        {/* Toggle Register/Login for Customer Role */}
        {role === 'customer' && (
          <p className="text-center text-sm mt-4 text-gray-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setForm({ fullName: '', email: '', password: '' }); // Clear form on toggle
                setMessage(''); // Clear messages
                setMessageType('');
              }}
              className="text-indigo-600 font-medium hover:underline focus:outline-none"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
