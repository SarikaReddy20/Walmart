import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // Update if needed

const AdminDashboard = () => {
  const [stores, setStores] = useState([]);
  const [editingStore, setEditingStore] = useState(null);
  const [newStoreFormVisible, setNewStoreFormVisible] = useState(false);

  const [form, setForm] = useState({
    storeName: '',
    storeAddress: '',
    coordinates: '',
    contactEmail: '',
    phoneNumber: '',
    managerName: '',
    managerEmail: '',
    managerPassword: ''
  });

  const fetchStores = async () => {
    const res = await axios.get(`${API_BASE}/admin/stores`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setStores(res.data);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    const coords = form.coordinates.split(',').map(Number);

    await axios.post(
      `${API_BASE}/admin/stores`,
      {
        storeName: form.storeName,
        storeAddress: form.storeAddress,
        coordinates: coords,
        contactEmail: form.contactEmail,
        phoneNumber: form.phoneNumber,
        managerName: form.managerName,
        managerEmail: form.managerEmail,
        managerPassword: form.managerPassword
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    alert('Store + Manager created!');
    setForm({
      storeName: '',
      storeAddress: '',
      coordinates: '',
      contactEmail: '',
      phoneNumber: '',
      managerName: '',
      managerEmail: '',
      managerPassword: ''
    });
    setNewStoreFormVisible(false);
    fetchStores();
  };

  const handleUpdate = async (storeId) => {
    const coords = form.coordinates.split(',').map(Number);

    await axios.put(
      `${API_BASE}/admin/stores/${storeId}`,
      {
        storeName: form.storeName,
        storeAddress: form.storeAddress,
        coordinates: coords,
        contactEmail: form.contactEmail,
        phoneNumber: form.phoneNumber,
        managerName: form.managerName,
        managerEmail: form.managerEmail
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    alert('Store + Manager updated!');
    setEditingStore(null);
    fetchStores();
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store + manager?')) return;

    await axios.delete(`${API_BASE}/admin/stores/${storeId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    alert('Deleted!');
    fetchStores();
  };

  const startEdit = (store) => {
    setEditingStore(store._id);
    setForm({
      storeName: store.name,
      storeAddress: store.address,
      coordinates: store.location.coordinates.join(','),
      contactEmail: store.contactEmail || '',
      phoneNumber: store.phoneNumber || '',
      managerName: store.managerId.fullName,
      managerEmail: store.managerId.email,
      managerPassword: '' // not used for update
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <button
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => setNewStoreFormVisible(!newStoreFormVisible)}
      >
        {newStoreFormVisible ? 'Cancel New Store' : '➕ Add New Store + Manager'}
      </button>

      {newStoreFormVisible && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Store + Manager</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Store Name</label>
              <input
                name="storeName"
                placeholder="e.g. Main Street Store"
                value={form.storeName}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Store Address</label>
              <input
                name="storeAddress"
                placeholder="e.g. 123 Main St, City"
                value={form.storeAddress}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Coordinates (lat,lng)</label>
              <input
                name="coordinates"
                placeholder="e.g. 12.9716,77.5946"
                value={form.coordinates}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Contact Email</label>
              <input
                name="contactEmail"
                placeholder="e.g. store@example.com"
                value={form.contactEmail}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phoneNumber"
                placeholder="e.g. +91-9876543210"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Manager Name</label>
              <input
                name="managerName"
                placeholder="e.g. John Doe"
                value={form.managerName}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Manager Email</label>
              <input
                name="managerEmail"
                placeholder="e.g. manager@example.com"
                value={form.managerEmail}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Manager Password</label>
              <input
                name="managerPassword"
                type="password"
                placeholder="Manager Password"
                value={form.managerPassword}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create Store + Manager
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">All Stores</h2>
      {stores.map((store) => (
        <div
          key={store._id}
          className="border rounded p-4 mb-4 shadow flex flex-col md:flex-row justify-between"
        >
          <div>
            <p><strong>Store:</strong> {store.name}</p>
            <p><strong>Address:</strong> {store.address}</p>
            <p><strong>Coordinates:</strong> {store.location.coordinates.join(',')}</p>
            <p><strong>Contact:</strong> {store.contactEmail || '-'} | {store.phoneNumber || '-'}</p>
            <p><strong>Manager:</strong> {store.managerId.fullName} ({store.managerId.email})</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              onClick={() => startEdit(store)}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(store._id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}

      {editingStore && (
        <div className="mt-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Store + Manager</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Same inputs reused */}
            <div>
              <label className="block mb-1">Store Name</label>
              <input
                name="storeName"
                placeholder="Store Name"
                value={form.storeName}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Store Address</label>
              <input
                name="storeAddress"
                placeholder="Store Address"
                value={form.storeAddress}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Coordinates</label>
              <input
                name="coordinates"
                placeholder="lat,lng"
                value={form.coordinates}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Contact Email</label>
              <input
                name="contactEmail"
                placeholder="Contact Email"
                value={form.contactEmail}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Manager Name</label>
              <input
                name="managerName"
                placeholder="Manager Name"
                value={form.managerName}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Manager Email</label>
              <input
                name="managerEmail"
                placeholder="Manager Email"
                value={form.managerEmail}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <button
            onClick={() => handleUpdate(editingStore)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
