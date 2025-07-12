import React, { useEffect, useState } from 'react';
import axios from 'axios'; // In a real MERN app, uncomment this and install axios

// --- Mocking axios for standalone UI demonstration ---
// This mock simulates the backend responses from your mern-backend-returns Express app.

// The ManagerReturnDashboard React Component
const ManagerReturnDashboard = () => { // Provide a default mock token for demo
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  // Function to fetch pending return requests from the backend
  const token=localStorage.getItem('token');
  const fetchReturns = async () => {

    setLoading(true); // Set loading state to true before fetching
    try {
      // Make GET request to your Express.js backend endpoint
      const res = await axios.get('http://localhost:5000/api/manager/returns/pending', {
        headers: { Authorization: `Bearer ${token}` }, // Send JWT for authentication/authorization
      });
      console.log(res,"resma")
      // Update state with fetched returns. Backend is expected to send 'returns' array.
      setReturns(res.data?.returns || []);
    } catch (error) {
      console.error('Failed to load returns:', error.response?.data?.message || error.message);
      setReturns([]); // Clear returns on error
      // In a real app, display a user-friendly error message
      alert('Error fetching returns. Please try again.');
    } finally {
      setLoading(false); // Set loading state to false after fetch completes (success or failure)
    }
  };

  // Handler for approving a return request
  const handleApprove = async (id) => {
    try {
      // Make PUT request to your Express.js backend endpoint to approve
      await axios.put(`http://localhost:5000/api/manager/returns/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Return approved successfully!'); // Success feedback
      fetchReturns(); // Re-fetch returns to update the list (remove approved item)
    } catch (error) {
      console.error('Approve failed:', error.response?.data?.message || error.message);
      alert('Failed to approve return: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  // Handler for rejecting a return request
  const handleReject = async (id) => {
    // Prompt for rejection reason (consider a modal for better UX in a real app)
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return; // If user cancels or enters empty reason

    try {
      // Make PUT request to your Express.js backend endpoint to reject
      await axios.put(`http://localhost:5000/api/manager/returns/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Return rejected successfully.'); // Success feedback
      fetchReturns(); // Re-fetch returns to update the list (remove rejected item)
    } catch (error) {
      console.error('Reject failed:', error.response?.data?.message || error.message);
      alert('Failed to reject return: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  // useEffect hook to fetch returns when the component mounts or token changes
  useEffect(() => {
    fetchReturns();
  }, [token]); // Dependency array: re-run if 'token' changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 rounded-t-2xl shadow-lg">
          <h2 className="text-3xl font-extrabold flex items-center">
            <span className="mr-4 text-4xl">🧾</span> Packaging Returns to Review
          </h2>
          <p className="text-indigo-200 text-sm mt-1">Manage and approve reusable packaging returns from customers.</p>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8">
          {loading ? (
            // Loading State UI
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg shadow-inner">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Fetching pending returns...</p>
            </div>
          ) : returns.length === 0 ? (
            // Empty State UI (No pending returns)
            <div className="text-center p-10 bg-green-50 rounded-lg border border-green-200 shadow-md">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-xl font-semibold text-green-700 mb-2">All Clear!</p>
              <p className="text-md text-gray-600">No pending returns for your store at the moment. Great job!</p>
            </div>
          ) : (
            // List of Returns (Cards Layout)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {returns.map((r) => (
                <div key={r._id} className="bg-white border border-gray-200 rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:border-indigo-300">
                  <div className="flex items-center mb-4">
                    <img
                      src={r.customerId?.profilePic || 'https://placehold.co/40x40/cccccc/000000?text=User'}
                      alt={r.customerId?.fullName || 'Unknown User'}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-indigo-400"
                    />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{r.customerId?.fullName || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-500">Requested on: {new Date(r.returnedDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 text-base mb-2">
                      <span className="font-medium">Packaging:</span> {r.packagingType}
                    </p>
                    <p className="text-gray-700 text-base">
                      <span className="font-medium">Potential Points:</span> <span className="text-indigo-600 font-bold">{r.pointsEarned || 0} pts</span>
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    {/* Reject Button */}
                    <button
                      onClick={() => handleReject(r._id)}
                      className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd"></path></svg>
                      Reject
                    </button>
                    {/* Approve Button */}
                    <button
                      onClick={() => handleApprove(r._id)}
                      className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerReturnDashboard;
