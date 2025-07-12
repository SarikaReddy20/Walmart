
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import axios from 'axios'; // Uncomment in a real MERN app

// Helper to format date for input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Check for invalid date
  return date.toISOString().split('T')[0];
};

// Helper to get status badge styling (kept from previous version)
const getStatusBadge = (status) => {
  switch (status) {
    case 'fresh':
      return 'bg-green-100 text-green-800';
    case 'near-expiry':
      return 'bg-yellow-100 text-yellow-800';
    case 'expiring-soon':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Edit Product Modal Component
const EditProductModal = ({ product, onClose, onSave, isLoading }) => {
  const [editedProduct, setEditedProduct] = useState(product);

  useEffect(() => {
    // Ensure the modal state is updated if the product prop changes
    setEditedProduct(product);
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedProduct);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Product</h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          disabled={isLoading}
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" id="name" value={editedProduct.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={editedProduct.description || ''} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input type="number" name="price" id="price" value={editedProduct.price} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input type="number" name="stockQuantity" id="stockQuantity" value={editedProduct.stockQuantity} onChange={handleChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input type="date" name="expiryDate" id="expiryDate" value={formatDateForInput(editedProduct.expiryDate)} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="currentDiscount" className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input type="number" name="currentDiscount" id="currentDiscount" value={(editedProduct.currentDiscount * 100).toFixed(0)} onChange={(e) => setEditedProduct(prev => ({ ...prev, currentDiscount: parseFloat(e.target.value) / 100 || 0 }))} min="0" max="100" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" name="imageUrl" id="imageUrl" value={editedProduct.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" id="status" value={editedProduct.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="fresh">Fresh</option>
              <option value="near-expiry">Near Expiry</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// The ManagerProducts Component (Main App Component)
const App = () => { // Renamed to App for standalone execution
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Product being edited
  const [showEditModal, setShowEditModal] = useState(false); // Control modal visibility

  const user = getCurrentUser();
  const role = user?.role || 'customer'; // Default to customer if user or role is undefined

  // Fetch products for the manager's store
  useEffect(() => {
    const fetchProducts = async () => {
      if (role === 'manager' || role === 'admin') { // Only managers/admins can fetch
        setLoadingProducts(true);
        try {
          const res = await axios.get('http://localhost:5000/api/manager/products', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setProducts(res.data);
        } catch (err) {
          console.error('Failed to fetch manager products:', err);
          alert('Failed to load products. Check console for details.');
        } finally {
          setLoadingProducts(false);
        }
      } else {
        setLoadingProducts(false); // Not a manager, no products to load
        setProducts([]);
      }
    };

    fetchProducts();
  }, [role]); // Re-run if role changes

  // Handler to mark a product as sold out
  const markAsSoldOut = async (productId) => {
    if (!confirm('Are you sure you want to mark this product as sold out?')) return; // Simple confirmation

    try {
      await axios.put(`http://localhost:5000/api/manager/products/${productId}/soldout`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProducts((prev) => prev.map(p => p._id === productId ? { ...p, stockQuantity: 0, status: 'sold-out' } : p));
      alert('Product marked as sold out!');
    } catch (err) {
      console.error('Failed to mark product as sold out:', err);
      alert('Failed to mark product as sold out. Check console for details.');
    }
  };

  // Handler for opening the edit modal
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handler for saving edited product
  const handleSaveEditedProduct = async (updatedProduct) => {
    setSavingProduct(true);
    try {
      // Make the API call to update the product
      const res = await axios.put(`http://localhost:5000/api/manager/products/${updatedProduct._id}`, updatedProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Update the local state with the response from the server
      setProducts(prev => prev.map(p => p._id === res.data._id ? res.data : p));
      alert('Product updated successfully!');
      setShowEditModal(false); // Close modal
      setEditingProduct(null); // Clear editing product
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product. Check console for details.');
    } finally {
      setSavingProduct(false);
    }
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
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Manage Your Store Products
        </h2>

        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 bg-yellow-50 rounded-lg border border-yellow-200 shadow-md">
            <p className="text-xl font-semibold text-yellow-700 mb-2">No Products Found</p>
            <p className="text-md text-gray-600">No products available for your store.</p>
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
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
                        onClick={() => markAsSoldOut(product._id)}
                        disabled={product.stockQuantity === 0}
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

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEditedProduct}
          isLoading={savingProduct}
        />
      )}
    </div>
  );
};

export default App;
