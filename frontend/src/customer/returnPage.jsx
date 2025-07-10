
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // In a real MERN app, uncomment this and install axios


const PACKAGING_TYPES = [
  'bottle', 'bag', 'box', 'container', 'can', 'jar', 'pouch', 'wrapper', 'crate', 'carton'
];

// The CustomerReturnDashboard React Component
const CustomerReturnDashboard = ({ token = localStorage.getItem("token")}) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPackagingType, setNewPackagingType] = useState(PACKAGING_TYPES[0]); // Default to first option
  const [submitting, setSubmitting] = useState(false);

  // Function to fetch customer's return history
  const fetchMyReturns = async () => {
    setLoading(true);
    try {
      // Calls router.get('/returns', protectCustomer, getMyReturns);
      const res = await axios.get('http://localhost:5000/api/customer/returns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res,"return")
      // Adjusted to expect the array directly from res.data
      setReturns(res.data || []);
    } catch (error) {
      console.error('Failed to load customer returns:', error.response?.data?.message || error.message);
      setReturns([]);
      alert('Error fetching your returns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for submitting a new return request
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!newPackagingType.trim()) {
      alert('Please select a packaging type.');
      return;
    }

    setSubmitting(true);
    try {
      // Calls router.post('/returns', protectCustomer, submitReturn);
      const res = await axios.post('http://localhost:5000/api/customer/returns', { packagingType: newPackagingType }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message);
      setNewPackagingType(PACKAGING_TYPES[0]); // Reset to first option after submission
      fetchMyReturns(); // Refresh the list to show the new pending request
    } catch (error) {
      console.error('Failed to submit return request:', error.response?.data?.message || error.message);
      alert('Failed to submit request: ' + (error.response?.data?.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  // useEffect hook to fetch returns when the component mounts or token changes
  useEffect(() => {
    fetchMyReturns();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl shadow-lg">
          <h2 className="text-3xl font-extrabold flex items-center">
            <span className="mr-4 text-4xl">♻️</span> Your Packaging Returns
          </h2>
          <p className="text-blue-200 text-sm mt-1">View your return history and submit new requests for reusable packaging.</p>
        </div>

        {/* Submit New Return Request */}
        <div className="p-6 sm:p-8 border-b border-gray-200 bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Submit a New Return</h3>
          <form onSubmit={handleSubmitReturn} className="flex flex-col sm:flex-row gap-4">
            <select
              value={newPackagingType}
              onChange={(e) => setNewPackagingType(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white appearance-none pr-8" // appearance-none and pr-8 for custom arrow
              disabled={submitting}
            >
              {PACKAGING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalize first letter */}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                  Request Return
                </>
              )}
            </button>
          </form>
        </div>

        {/* Return History Section */}
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Return History</h3>
          {loading ? (
            // Loading State UI for history
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg shadow-inner">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading your return history...</p>
            </div>
          ) : returns.length === 0 ? (
            // Empty State UI for history
            <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200 shadow-md">
              <p className="text-xl font-semibold text-yellow-700 mb-2">No Returns Yet!</p>
              <p className="text-md text-gray-600">Submit your first packaging return request above.</p>
            </div>
          ) : (
            // List of Customer Returns (Cards Layout)
            <div className="grid grid-cols-1 gap-4">
              {returns.map((r) => (
                <div key={r._id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:border-blue-300">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">{r.packagingType.charAt(0).toUpperCase() + r.packagingType.slice(1)}</p>
                    <p className="text-sm text-gray-500">Requested on: {new Date(r.returnedDate).toLocaleDateString()}</p>
                    {r.status === 'rejected' && r.adminNotes && (
                      <p className="text-xs text-red-500 mt-1">Reason for Rejection: {r.adminNotes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    {r.status === 'approved' && (
                      <>
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                          Approved
                        </span>
                        {/* Display pointsEarned only if status is 'approved' */}
                        {r.pointsEarned > 0 && (
                          <span className="text-indigo-600 font-bold text-base">{r.pointsEarned} pts</span>
                        )}
                      </>
                    )}
                    {r.status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                    {r.status === 'rejected' && (
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                        Rejected
                      </span>
                    )}
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

export default CustomerReturnDashboard;