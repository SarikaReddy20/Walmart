import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Uncomment in a real MERN app
import { useNavigate } from 'react-router-dom'; // Uncomment in a real React Router setup



const API_BASE = 'http://localhost:5000/api'; // Update if needed

// Custom Alert/Confirm Modal Component
const CustomModal = ({ message, type, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-95 animate-scale-in">
        <h3 className={`text-2xl font-bold mb-4 ${type === 'error' ? 'text-red-700' : 'text-gray-800'}`}>
          {type === 'confirm' ? 'Confirm Action' : (type === 'error' ? 'Error' : 'Success')}
        </h3>
        <p className="text-gray-700 mb-6 text-lg">{message}</p>
        <div className="flex justify-center space-x-4">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200
              ${type === 'confirm' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {type === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};


// Store Form Component (reusable for Create and Edit)
const StoreForm = ({ form, handleInputChange, handleSubmit, handleCancel, isEditMode, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 transform translate-y-0 opacity-100 transition-all duration-500 ease-in-out">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {isEditMode ? 'Edit Store & Manager Details' : 'Register New Store & Manager'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input type="text" name="storeName" id="storeName" value={form.storeName} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. Main Street Store" required />
        </div>
        <div>
          <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
          <input type="text" name="storeAddress" id="storeAddress" value={form.storeAddress} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. 123 Main St, City" required />
        </div>
        <div>
          <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">Coordinates (lat,lng)</label>
          <input type="text" name="coordinates" id="coordinates" value={form.coordinates} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. 12.9716,77.5946" required />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input type="email" name="contactEmail" id="contactEmail" value={form.contactEmail} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. store@example.com" />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="text" name="phoneNumber" id="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. +91-9876543210" />
        </div>
        <div>
          <label htmlFor="managerName" className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
          <input type="text" name="managerName" id="managerName" value={form.managerName} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. John Doe" required />
        </div>
        <div>
          <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-1">Manager Email</label>
          <input type="email" name="managerEmail" id="managerEmail" value={form.managerEmail} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="e.g. manager@example.com" required />
        </div>
        {!isEditMode && ( // Password only for creation
          <div>
            <label htmlFor="managerPassword" className="block text-sm font-medium text-gray-700 mb-1">Manager Password</label>
            <input type="password" name="managerPassword" id="managerPassword" value={form.managerPassword} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200" placeholder="Manager Password" required />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2.5 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow-md hover:bg-gray-400 transition-colors duration-200 transform hover:scale-105"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Store')}
        </button>
      </div>
    </form>
  );
};


const AdminDashboard = () => {
  const navigate = useNavigate(); // Mock navigate
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [savingStore, setSavingStore] = useState(false); // For create/update operations
  const [editingStoreId, setEditingStoreId] = useState(null); // Holds the _id of the store being edited
  const [newStoreFormVisible, setNewStoreFormVisible] = useState(false);

  // State for modal messages
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success', 'error', 'confirm'
  const [modalAction, setModalAction] = useState(null); // Callback for confirm action

  const [form, setForm] = useState({
    storeName: '',
    storeAddress: '',
    coordinates: '', // Stored as "lat,lng" string for input
    contactEmail: '',
    phoneNumber: '',
    managerName: '',
    managerEmail: '',
    managerPassword: '' // Only for creation
  });

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/stores`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Use mock token
        }
      });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setModalMessage(err.response?.data?.message || 'Failed to load stores.');
      setModalType('error');
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
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
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      const coords = form.coordinates.split(',').map(Number);
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        throw new Error('Invalid coordinates format. Please use "lat,lng".');
      }

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
            Authorization: `Bearer ${localStorage.getItem('token') }`
          }
        }
      );
      setModalMessage('Store and Manager created successfully!');
      setModalType('success');
      resetForm();
      setNewStoreFormVisible(false);
      fetchStores();
    } catch (err) {
      console.error('Failed to create store:', err);
      setModalMessage(err.response?.data?.message || err.message || 'Failed to create store.');
      setModalType('error');
    } finally {
      setSavingStore(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      const coords = form.coordinates.split(',').map(Number);
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        throw new Error('Invalid coordinates format. Please use "lat,lng".');
      }

      await axios.put(
        `${API_BASE}/admin/stores/${editingStoreId}`,
        {
          storeName: form.storeName,
          storeAddress: form.storeAddress,
          coordinates: coords,
          contactEmail: form.contactEmail,
          phoneNumber: form.phoneNumber,
          managerName: form.managerName,
          managerEmail: form.managerEmail
          // managerPassword is not sent on update
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setModalMessage('Store and Manager updated successfully!');
      setModalType('success');
      setEditingStoreId(null);
      resetForm();
      fetchStores();
    } catch (err) {
      console.error('Failed to update store:', err);
      setModalMessage(err.response?.data?.message || err.message || 'Failed to update store.');
      setModalType('error');
    } finally {
      setSavingStore(false);
    }
  };

  const handleDelete = async (storeId) => {
    setModalMessage('Are you sure you want to delete this store and its manager? This action cannot be undone.');
    setModalType('confirm');
    setModalAction(() => async () => {
      try {
        await axios.delete(`${API_BASE}/admin/stores/${storeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setModalMessage('Store and Manager deleted successfully!');
        setModalType('success');
        fetchStores();
      } catch (err) {
        console.error('Failed to delete store:', err);
        setModalMessage(err.response?.data?.message || 'Failed to delete store.');
        setModalType('error');
      } finally {
        setModalAction(null); // Clear action
      }
    });
  };

  const startEdit = (store) => {
    setNewStoreFormVisible(false); // Hide create form if editing
    setEditingStoreId(store._id);
    setForm({
      storeName: store.name,
      storeAddress: store.address,
      coordinates: store.location.coordinates.join(','),
      contactEmail: store.contactEmail || '',
      phoneNumber: store.phoneNumber || '',
      managerName: store.managerId.fullName,
      managerEmail: store.managerId.email,
      managerPassword: '' // Password is not loaded for edit
    });
  };

  const handleCancelForm = () => {
    setNewStoreFormVisible(false);
    setEditingStoreId(null);
    resetForm();
  };

  const closeModal = () => {
    setModalMessage('');
    setModalType('');
    setModalAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-8 sm:p-10 lg:p-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-10 text-center drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Admin Dashboard</span>
        </h1>

        {/* Action Button: Add New Store */}
        <div className="mb-10 flex justify-center">
          <button
            onClick={() => {
              setNewStoreFormVisible(!newStoreFormVisible);
              setEditingStoreId(null); // Ensure edit form is hidden
              resetForm(); // Clear form for new store
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{newStoreFormVisible ? 'Cancel Add New Store' : 'Add New Store & Manager'}</span>
          </button>
        </div>

        {/* Create/Edit Store Form */}
        {(newStoreFormVisible || editingStoreId) && (
          <div className="mb-10 p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner border border-gray-300 animate-fade-in-up">
            <StoreForm
              form={form}
              handleInputChange={handleInputChange}
              handleSubmit={editingStoreId ? handleUpdate : handleCreate}
              handleCancel={handleCancelForm}
              isEditMode={!!editingStoreId}
              isLoading={savingStore}
            />
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Stores</h2>
        {loadingStores ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl shadow-md border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading stores data...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center p-10 bg-yellow-50 rounded-xl border border-yellow-200 shadow-md">
            <p className="text-xl font-semibold text-yellow-700 mb-2">No Stores Found</p>
            <p className="text-md text-gray-600">It looks like there are no stores registered yet. Add a new store above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-xl">Store Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Coordinates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stores.map(store => (
                  <tr key={store._id} className="hover:bg-blue-50 transition-all duration-200 ease-in-out group">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                      {store.name}
                      <p className="text-xs text-gray-500">{store.contactEmail}</p>
                      <p className="text-xs text-gray-500">{store.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{store.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.location.coordinates.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {store.managerId ? (
                        <>
                          <span className="font-medium">{store.managerId.fullName}</span>
                          <p className="text-xs text-gray-500">{store.managerId.email}</p>
                        </>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-md transform hover:scale-105"
                        onClick={() => startEdit(store)}
                      >
                        <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z"></path></svg>
                        Edit
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-md transform hover:scale-105"
                        onClick={() => handleDelete(store._id)}
                      >
                        <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd"></path></svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Modal for Alerts/Confirms */}
      {modalMessage && (
        <CustomModal
          message={modalMessage}
          type={modalType}
          onConfirm={() => {
            if (modalAction) modalAction(); // Execute the stored action if it's a confirm
            closeModal();
          }}
          onCancel={closeModal}
        />
      )}
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom animations */
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
