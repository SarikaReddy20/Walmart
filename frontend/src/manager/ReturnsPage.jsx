import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);

  const fetchReturns = async () => {
    const res = await axios.get('http://localhost:5000/api/manager/returns/pending', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setReturns(res.data.returns);
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleApprove = async (id) => {
    await axios.put(
      `http://localhost:5000/api/manager/returns/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Return approved!');
    fetchReturns();
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection?');
    await axios.put(
      `http://localhost:5000/api/manager/returns/${id}/reject`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    alert('Return rejected!');
    fetchReturns();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pending Customer Returns</h1>
      {returns.length === 0 && <p>No pending returns 🎉</p>}
      {returns.map((r) => (
        <div key={r._id} className="border p-4 rounded mb-4 shadow">
          <p><strong>Customer:</strong> {r.customerId?.fullName}</p>
          <p><strong>Packaging:</strong> {r.packagingType}</p>
          <p><strong>Status:</strong> {r.status}</p>
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

export default ReturnsPage;
