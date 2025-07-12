import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    expiryDate: '',
    currentDiscount: '',
    status: '',
    imageUrl: '',
    stockQuantity: ''
  });

  const fetchProducts = async () => {
    const res = await axios.get(`${API_BASE}/manager/products`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setProducts(res.data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    await axios.post(
      `${API_BASE}/manager/products`,
      {
        ...form,
        price: Number(form.price),
        currentDiscount: Number(form.currentDiscount),
        stockQuantity: Number(form.stockQuantity)
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Product created!');
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
    setShowNewProductForm(false);
    fetchProducts();
  };

  const handleUpdate = async (productId) => {
    await axios.put(
      `${API_BASE}/manager/products/${productId}`,
      {
        ...form,
        price: Number(form.price),
        currentDiscount: Number(form.currentDiscount),
        stockQuantity: Number(form.stockQuantity)
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Product updated!');
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    await axios.delete(`${API_BASE}/manager/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    alert('Deleted!');
    fetchProducts();
  };

  const handleSoldOut = async (productId) => {
    await axios.put(
      `${API_BASE}/manager/products/${productId}/sold-out`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Marked as sold out!');
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      expiryDate: product.expiryDate.split('T')[0],
      currentDiscount: product.currentDiscount,
      status: product.status,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowNewProductForm(!showNewProductForm)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ➕ Add New Product
        </button>
        <button
          onClick={() => navigate('/manager/returns')}
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          📦 Handle Customer Returns
        </button>
        <button
          onClick={() => navigate('/manager/redistributions')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🔄 Redistribute Products
        </button>
      </div>

      {showNewProductForm && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                placeholder="Product Name"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <input
                name="description"
                value={form.description}
                placeholder="Description"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Price</label>
              <input
                name="price"
                type="number"
                value={form.price}
                placeholder="Price"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Expiry Date</label>
              <input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Discount</label>
              <input
                name="currentDiscount"
                type="number"
                step="0.01"
                value={form.currentDiscount}
                placeholder="0 to 0.5"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <input
                name="status"
                value={form.status}
                placeholder="fresh/near-expiry/..."
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Image URL</label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                placeholder="Image URL"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Stock Quantity</label>
              <input
                name="stockQuantity"
                type="number"
                value={form.stockQuantity}
                placeholder="Stock"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Product
          </button>
        </div>
      )}

      {editingProduct && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
          {/* Same form reused */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Same fields */}
            {Object.keys(form).map((key) => (
              <div key={key}>
                <label className="block mb-1">{key}</label>
                <input
                  name={key}
                  value={form[key]}
                  placeholder={key}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => handleUpdate(editingProduct)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">All Products</h2>
      {products.map((p) => (
        <div key={p._id} className="border p-4 rounded mb-4 shadow">
          <p><strong>{p.name}</strong> ({p.status})</p>
          <p>{p.description}</p>
          <p>Price: ₹{p.price}</p>
          <p>Discount: {Math.round(p.currentDiscount * 100)}%</p>
          <p>Stock: {p.stockQuantity}</p>
          <p>Expiry: {new Date(p.expiryDate).toDateString()}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => startEdit(p)}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(p._id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => handleSoldOut(p._id)}
              className="px-3 py-1 bg-purple-600 text-white rounded"
            >
              ❌ Mark Sold Out
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManagerDashboard;
