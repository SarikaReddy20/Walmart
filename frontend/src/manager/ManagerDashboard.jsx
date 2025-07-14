import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Uncomment in a real MERN app
import { useNavigate } from 'react-router-dom'; // Uncomment in a real MERN app
import { getCurrentUser } from '../utils/auth'; // Uncomment in a real MERN app

const API_BASE = 'http://localhost:5000/api'; // Base URL for your API

// Helper to format date for input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Helper to get status badge styling
const getStatusBadge = (status) => {
  switch (status) {
    case 'fresh': return 'bg-green-100 text-green-800';
    case 'near-expiry': return 'bg-yellow-100 text-yellow-800';
    case 'expiring-soon': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-gray-200 text-gray-700';
    case 'sold-out': return 'bg-gray-400 text-gray-900';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// Product Form Component (used for both Create and Edit)
const ProductForm = ({ form, handleInputChange, handleSubmit, handleCancel, isEditMode, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" name="name" id="name" value={form.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={form.description} onChange={handleInputChange} rows="2" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input type="number" name="price" id="price" value={form.price} onChange={handleInputChange} step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" name="stockQuantity" id="stockQuantity" value={form.stockQuantity} onChange={handleInputChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input type="date" name="expiryDate" id="expiryDate" value={formatDateForInput(form.expiryDate)} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="currentDiscount" className="block text-sm font-medium text-gray-700">Discount (%)</label>
          <input type="number" name="currentDiscount" id="currentDiscount" value={form.currentDiscount * 100} onChange={handleInputChange} min="0" max="100" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="url" name="imageUrl" id="imageUrl" value={form.imageUrl} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" id="status" value={form.status} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            <option value="">Select Status</option>
            <option value="fresh">Fresh</option>
            <option value="near-expiry">Near Expiry</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="sold-out">Sold Out</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Product')}
        </button>
      </div>
    </form>
  );
};


const ManagerDashboard = () => {
  const navigate = useNavigate(); // This will be the mock navigate
  const user = getCurrentUser();
  const role = user?.role;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false); // For create/update operations
  const [editingProduct, setEditingProduct] = useState(null); // Holds the _id of the product being edited
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [storeProfile, setStoreProfile] = useState(null); // New state for store profile
  const [Profile, setProfile] = useState(null); // New state for store profile
  const [loadingStore, setLoadingStore] = useState(true); // New loading state for store

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    expiryDate: '',
    currentDiscount: '', // Stored as decimal (e.g., 0.20)
    status: '',
    imageUrl: '',
    stockQuantity: ''
  });

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE}/manager/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch manager products:', err);
      alert('Failed to load products. Check console for details.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchManagerProfile = async () => {
    setLoadingStore(true);
    try {
      // In a real app, this would fetch the store linked to the manager's ID
      const res = await axios.get(`${API_BASE}/manager/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch store profile:', err);
      // Don't alert for this, as products might still load
    } finally {
      setLoadingStore(false);
    }
  };
  const fetchStoreProfile = async () => {
    setLoadingStore(true);
    try {
      // In a real app, this would fetch the store linked to the manager's ID
      const res = await axios.get(`${API_BASE}/manager/store-profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStoreProfile(res.data.store);
      setStoreProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch store profile:', err);
      // Don't alert for this, as products might still load
    } finally {
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is manager/admin
    if (role === 'manager' || role === 'admin') {
      fetchProducts();
      fetchStoreProfile(); // Fetch store profile
      fetchManagerProfile()
    } else {
      setLoadingProducts(false);
      setLoadingStore(false);
    }
  }, [role]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Special handling for discount input (convert percentage to decimal)
    if (name === 'currentDiscount') {
      setForm({ ...form, [name]: parseFloat(value) / 100 });
    } else if (type === 'number') {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      expiryDate: '',
      currentDiscount: '',
      status: '',
      imageUrl: '',
      stockQuantity: ''
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setSavingProduct(true);
    try {
      await axios.post(
        `${API_BASE}/manager/products`,
        {
          ...form,
          // Ensure numbers are numbers, and date is ISO string
          price: Number(form.price),
          currentDiscount: Number(form.currentDiscount),
          stockQuantity: Number(form.stockQuantity),
          expiryDate: new Date(form.expiryDate).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'mock-manager-token'}`
          }
        }
      );
      alert('Product created successfully!');
      resetForm();
      setShowNewProductForm(false);
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('Failed to create product. Check console for details.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setSavingProduct(true);
    try {
      await axios.put(
        `${API_BASE}/manager/products/${editingProduct}`, // Use editingProduct as the ID
        {
          ...form,
          price: Number(form.price),
          currentDiscount: Number(form.currentDiscount),
          stockQuantity: Number(form.stockQuantity),
          expiryDate: new Date(form.expiryDate).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'mock-manager-token'}`
          }
        }
      );
      alert('Product updated successfully!');
      setEditingProduct(null); // Exit edit mode
      resetForm();
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product. Check console for details.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_BASE}/manager/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'mock-manager-token'}`
        }
      });
      alert('Product deleted successfully!');
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Check console for details.');
    }
  };

  const handleSoldOut = async (productId) => {
    if (!confirm('Are you sure you want to mark this product as sold out?')) return;

    try {
      await axios.put(
        `${API_BASE}/manager/products/${productId}/sold-out`, // Corrected endpoint to match backend
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'mock-manager-token'}`
          }
        }
      );
      alert('Product marked as sold out!');
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      console.error('Failed to mark product as sold out:', err);
      alert('Failed to mark product as sold out. Check console for details.');
    }
  };

  const startEdit = (product) => {
    setShowNewProductForm(false); // Hide create form if editing
    setEditingProduct(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      expiryDate: product.expiryDate.split('T')[0], // Format for date input
      currentDiscount: product.currentDiscount, // Keep as decimal for internal state
      status: product.status,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity
    });
  };

  const handleCancelForm = () => {
    setShowNewProductForm(false);
    setEditingProduct(null);
    resetForm();
  };
  

  // Render only if the user is a manager or admin
  if (role !== 'manager' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter text-gray-800 flex items-center justify-center p-4">
        <div className="text-center p-10 bg-red-50 rounded-lg border border-red-200 shadow-md">
          <p className="text-xl font-semibold text-red-700 mb-2">Access Denied</p>
          <p className="text-md text-gray-600">You must be a Manager or Admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Manager Dashboard ({Profile?.fullName || role})
        </h1>

        {/* Manager and Store Profile Section */}
        {loadingStore ? (
          <div className="flex flex-col items-center justify-center h-24 mb-8 bg-gray-50 rounded-lg shadow-inner">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-600 text-sm">Loading store info...</p>
          </div>
        ) : storeProfile ? (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-md border border-indigo-200 mb-8 text-center">
            <h3 className="text-2xl font-semibold text-indigo-800 mb-2">
              Managing: {storeProfile.name}
            </h3>
            <p className="text-gray-700 text-md mb-2">{storeProfile.address}</p>
            <p className="text-gray-600 text-sm">Logged in as: <span className="font-medium">{Profile?.fullName ||  role}</span></p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-6 rounded-xl shadow-md border border-yellow-200 mb-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">Store Information Not Found</h3>
            <p className="text-gray-700 text-sm">Could not retrieve store details for this manager.</p>
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setShowNewProductForm(!showNewProductForm);
              setEditingProduct(null); // Ensure edit form is hidden
              resetForm(); // Clear form for new product
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
            Add New Product
          </button>
          <button
            onClick={() => navigate('/manager/returns')}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold shadow-md hover:bg-yellow-700 transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"></path></svg>
            Handle Customer Returns
          </button>
          <button
            onClick={() => navigate('/manager/redistributions')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            Redistribute Products
          </button>
        </div>

        {/* Create/Edit Product Form */}
        {(showNewProductForm || editingProduct) && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
            <ProductForm
              form={form}
              handleInputChange={handleInputChange}
              handleSubmit={editingProduct ? handleUpdate : handleCreate}
              handleCancel={handleCancelForm}
              isEditMode={!!editingProduct}
              isLoading={savingProduct}
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Products</h2>
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 bg-yellow-50 rounded-lg border border-yellow-200 shadow-md">
            <p className="text-xl font-semibold text-yellow-700 mb-2">No Products Found</p>
            <p className="text-md text-gray-600">No products available for your store. Add a new product above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.stockQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(product.currentDiscount * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                        {product.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md transition-colors"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors"
                        onClick={() => handleSoldOut(product._id)}
                        disabled={product.stockQuantity === 0 || product.status === 'sold-out'}
                      >
                        Sold Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
