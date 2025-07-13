import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RedistributionPage = () => {
  const [products, setProducts] = useState([]);
  const [neededForecasts, setNeededForecasts] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  // ✅ Fetch your store's products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/manager/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // ✅ Fetch needed forecasts (other stores' needs)
  const fetchNeededForecasts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/manager/forecasts/need', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNeededForecasts(res.data.forecasts || []);
    } catch (err) {
      console.error('Error fetching needed forecasts:', err);
    }
  };

  // ✅ Fetch incoming redistribution requests for *your* store
  const fetchIncoming = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/manager/redistributions/incoming', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIncoming(res.data.redistributions || []);
    } catch (err) {
      console.error('Error fetching incoming redistributions:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchNeededForecasts();
    fetchIncoming();
  }, []);

  // ✅ Request redistribution (auto picks toStore on backend)
  const handleRequest = async (toStoreId) => {
    if (!productId || !quantity) {
      alert('Please select product and quantity');
      return;
    }
    try {
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
      setQuantity('');
    } catch (err) {
      console.error(err);
      alert('Request failed');
    }
  };

  // ✅ Approve redistribution
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/manager/redistributions/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Approved!');
      fetchIncoming();
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };

  // ✅ Reject redistribution
  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/manager/redistributions/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Rejected!');
      fetchIncoming();
    } catch (err) {
      console.error(err);
      alert('Rejection failed');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">♻️ Redistribution Management</h1>

      {/* Request Redistribution */}
      <section className="mb-12 border p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Request Redistribution</h2>

        <label className="block mb-2">Select Product:</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="block mb-4 border px-3 py-2 rounded w-full"
        >
          <option value="">-- Select product --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} | Stock: {p.stockQuantity}
            </option>
          ))}
        </select>

        <label className="block mb-2">Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Units to transfer"
          className="block mb-4 border px-3 py-2 rounded w-full"
        />

        <p className="text-gray-700 mb-2">Choose a store that needs this:</p>
        {neededForecasts.length === 0 && <p>No stores currently need items.</p>}
        {neededForecasts.map((f) => (
          <div key={f._id} className="border p-3 rounded mb-2 flex justify-between items-center">
            <div>
              📦 <strong>{f.productId?.name || 'Unknown'}</strong> |
              Needed by: {f.storeId?.name || f.storeId?._id} |
              Daily Demand: {f.dailyDemand[0]?.predictedUnits || '?'}
            </div>
            <button
              onClick={() => handleRequest(f.storeId?._id)}
              className="px-4 py-1 bg-blue-600 text-white rounded"
            >
              Request to This Store
            </button>
          </div>
        ))}
      </section>

      {/* Incoming Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Incoming Requests</h2>
        {incoming.length === 0 && <p>No incoming redistribution requests.</p>}
        {incoming.map((r) => (
          <div key={r._id} className="border p-4 rounded mb-4 shadow">
            <p><strong>Product:</strong> {r.productId?.name || r.productId?._id || 'Unknown'}</p>
            <p><strong>From Store:</strong> {r.fromStore?.name || r.fromStore?._id || 'Unknown'}</p>
            <p><strong>Quantity:</strong> {r.quantity}</p>
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
      </section>
    </div>
  );
};

export default RedistributionPage;
