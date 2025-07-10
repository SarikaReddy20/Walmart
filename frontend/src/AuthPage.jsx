import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // update to your backend URL
  const getLocation = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err)
        );
    });}
const AuthPage = () => {
  const [role, setRole] = useState('admin'); // admin | manager | customer
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { fullName, email, password } = form;
    try {
      let url = '';
      let payload = { email, password };

      if (role === 'admin') url = `${API_BASE}/admin/login`;
      else if (role === 'manager') url = `${API_BASE}/manager/login`;
      else if (role === 'customer' && isRegister) {
        url = `${API_BASE}/customer/register`;
         const pos = await getLocation();
        payload.fullName = fullName;
        payload.lat = pos.lat;
        payload.lng = pos.lng;
      } else if (role === 'customer') {
        url = `${API_BASE}/customer/login`;
      }

      const res = await axios.post(url, payload);
      localStorage.setItem('token', res.data.token);
      alert(`${role} ${isRegister ? 'registered' : 'logged in'} successfully!`);
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? 'Register' : 'Login'} as{' '}
          <span className="capitalize">{role}</span>
        </h2>

        <div className="flex justify-between mb-4">
          {['admin', 'manager', 'customer'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setIsRegister(false);
              }}
              className={`w-full mx-1 py-2 rounded ${
                role === r
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {role === 'customer' && isRegister && (
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md mb-3"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>

        {role === 'customer' && (
          <p className="text-center text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-green-600 font-medium hover:underline"
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
