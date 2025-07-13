import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const RedistributionPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [redistributions, setRedistributions] = useState([]);
  const [productId, setProductId] = useState('');
  const [fromStoreId, setFromStoreId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentStoreId, setCurrentStoreId] = useState('');

  const token = localStorage.getItem('token');
  const managerId = token ? jwtDecode(token)?.id : null;

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/manager/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Error fetching stores', err);
    }
  };

  const fetchRedistributions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/manager/redistributions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRedistributions(res.data.redistributions);
      setCurrentStoreId(res.data.currentStoreId);
    } catch (err) {
      console.error('Error fetching redistributions', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRedistributions();
    fetchStores();
  }, []);

  const handleRequest = async () => {
    if (!productId || !fromStoreId || !quantity) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/manager/redistributions`,
        { productId, fromStoreId, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Redistribution requested!');
      setProductId('');
      setFromStoreId('');
      setQuantity('');
      fetchRedistributions();
    } catch (err) {
      console.error('Request failed', err);
      alert('Request failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/manager/redistributions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Redistribution approved!');
      fetchRedistributions();
    } catch (err) {
      console.error('Approval failed', err);
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/manager/redistributions/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Redistribution rejected!');
      fetchRedistributions();
    } catch (err) {
      console.error('Rejection failed', err);
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔁 Redistribution Management</h1>

      <div className="mb-10 border border-gray-200 p-6 rounded shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Request Redistribution</h2>

        <label className="block mb-1 font-medium">Product:</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="block mb-3 border px-3 py-2 rounded w-full"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - Stock: {p.stockQuantity}
            </option>
          ))}
        </select>

        <label className="block mb-1 font-medium">From Store ID:</label>
        <input
          value={fromStoreId}
          onChange={(e) => setFromStoreId(e.target.value)}
          placeholder="Enter store ID to request from"
          className="block mb-3 border px-3 py-2 rounded w-full"
        />

        <label className="block mb-1 font-medium">Quantity:</label>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Units to transfer"
          type="number"
          className="block mb-3 border px-3 py-2 rounded w-full"
        />

        <button
          onClick={handleRequest}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Submit Request
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">All Redistributions</h2>
      {redistributions.length === 0 && (
        <p className="text-gray-600">No redistributions yet.</p>
      )}

      {redistributions.map((r) => {
        const fromStoreIdVal = r.fromStore?._id || r.fromStore;
        const toStoreIdVal = r.toStore?._id || r.toStore;

        return (
          <div key={r._id} className="border p-4 rounded mb-4 shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">🛒 {r.productId?.name}</p>
                <p>From: <span className="font-medium">{r.fromStore?.name || fromStoreIdVal}</span></p>
                <p>To: <span className="font-medium">{r.toStore?.name || toStoreIdVal}</span></p>
                <p>Qty: {r.quantity}</p>
                {r.notes === 'Auto redistribution due to imbalance' && (
                  <p className="text-blue-500 font-medium mt-1">🔄 Auto Redistribution</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                {r.approvedBy ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✅ Approved
                  </span>
                ) : (
                  toStoreIdVal === currentStoreId && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(r._id)}
                        className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RedistributionPage;
