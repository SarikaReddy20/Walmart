import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RedistributionPage = () => {
  const [products, setProducts] = useState([]);
  const [toStoreId, setToStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [incoming, setIncoming] = useState([]);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/manager/products', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setProducts(res.data.products);
  };

  const fetchIncoming = async () => {
    // You’ll probably have a separate endpoint to fetch incoming redistribution requests.
    // For demo, reuse products as mock.
    // Adjust as per your backend!
    // Example:
    // const res = await axios.get(`http://localhost:5000/api/manager/redistributions/incoming`, { ... });
    // setIncoming(res.data);
    setIncoming([]); // Mock
  };

  useEffect(() => {
    fetchProducts();
    fetchIncoming();
  }, []);

  const handleRequest = async () => {
    await axios.post(
      `http://localhost:5000/api/manager/redistributions`,
      {
        productId,
        toStoreId,
        quantity: Number(quantity)
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Redistribution requested!');
    setProductId('');
    setToStoreId('');
    setQuantity('');
  };

  const handleApprove = async (id) => {
    await axios.put(
      `http://localhost:5000/api/manager/redistributions/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Redistribution approved!');
    fetchIncoming();
  };

  const handleReject = async (id) => {
    await axios.put(
      `http://localhost:5000/api/manager/redistributions/${id}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Redistribution rejected!');
    fetchIncoming();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Redistribution Management</h1>

      <h2 className="text-xl font-semibold mb-2">Request Redistribution</h2>
      <div className="mb-6 border p-4 rounded shadow">
        <label>Product:</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="block mb-2 border px-3 py-2 rounded w-full"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - Stock: {p.stockQuantity}
            </option>
          ))}
        </select>

        <label>To Store ID:</label>
        <input
          value={toStoreId}
          onChange={(e) => setToStoreId(e.target.value)}
          placeholder="Target Store ID"
          className="block mb-2 border px-3 py-2 rounded w-full"
        />

        <label>Quantity:</label>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Units to transfer"
          className="block mb-2 border px-3 py-2 rounded w-full"
        />

        <button
          onClick={handleRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit Request
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Incoming Requests (for your store)</h2>
      {incoming.length === 0 && <p>No incoming redistribution requests yet.</p>}
      {incoming.map((r) => (
        <div key={r._id} className="border p-4 rounded mb-4 shadow">
          <p>Product: {r.productId.name}</p>
          <p>From Store: {r.fromStore}</p>
          <p>Quantity: {r.quantity}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleApprove(r._id)}
              className="px-4 py-1 bg-green-600 text-white rounded"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleReject(r._id)}
              className="px-4 py-1 bg-red-600 text-white rounded"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RedistributionPage;
