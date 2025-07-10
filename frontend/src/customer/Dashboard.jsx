import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [impact, setImpact] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editEmail, setEditEmail] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customer/impact", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setImpact(res.data);
        console.log(res,"res")
      } catch (err) {
        console.error("Error fetching impact", err);
      }
      
    };
    const fetchCustomer = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customer/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCustomer(res.data);
        console.log(res,"res")
      } catch (err) {
        console.error("Error fetching impact", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
    fetchCustomer();
  }, []);

  if (loading) return <p>Loading impact...</p>;
  if (!impact) return <p>No impact data found.</p>;

    // Handler for saving profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading while saving
    try {
      // In a real app, this would be your API call to update the user's profile
      // Example: router.put('/profile', protectCustomer, updateMyProfile);
      const updatedData = {
        fullName: editFullName,
        email: editEmail,
        profilePic: editProfilePic,
      };
      const res = await axios.put('http://localhost:5000/api/customer/profile', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserProfile(res.data?.user || null); // Update with response from server
      alert('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode
      setUserProfile(res.data?.user || null);
      setCustomer(res.data?.user || null);
    } catch (err) {
      console.error('Failed to update profile:', err.response?.data?.message || err.message);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
    

  };

  // Handler for canceling profile edits
  const handleCancelEdit = () => {
    // Reset edit states to current userProfile values
    if (userProfile) {
      setEditFullName(userProfile.fullName);
      setEditEmail(userProfile.email);
      setEditProfilePic(userProfile.profilePic);
    }
    setIsEditing(false); // Exit edit mode
  };
  const {
    wasteReducedKg = 0,
    plasticSavedUnits = 0,
    badges = [],
    score = 0,
    milestones = [],
  } = impact;
  const getProfileImageUrl = (picUrl, name) => {
    if (picUrl && picUrl.trim() !== '') {
      return picUrl;
    }
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://placehold.co/150x150/A78BFA/FFFFFF?text=${initials || 'User'}`;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto mt-10">
      <div className=" text-white p-6   text-center">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 rounded-t-2xl shadow-lg text-center">
          <h2 className="text-3xl font-extrabold flex items-center justify-center">
            <span className="mr-4 text-4xl">👤</span> Your EcoRetail Profile
          </h2>
          <p className="text-indigo-200 text-sm mt-1">Manage your account and track your environmental impact.</p>
        </div>

        {/* Profile Details / Edit Form Section */}
        <div className="p-6 mb-10 sm:p-8 border-b flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={getProfileImageUrl(isEditing ? editProfilePic : customer.profilePic, isEditing ? editFullName : customer.fullName)}
            alt={`${customer.fullName}'s profile`}
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300 shadow-lg flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              const name = isEditing ? editFullName : customer.fullName;
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
              e.target.src = `https://placehold.co/150x150/A78BFA/FFFFFF?text=${initials || 'User'}`;

            }}
          />
          <div className="text-center md:text-left flex-grow text-black">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="edit-fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="edit-fullName"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-profilePic" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                  <input
                    type="url"
                    id="edit-profilePic"
                    value={editProfilePic}
                    onChange={(e) => setEditProfilePic(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-center md:justify-start gap-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-full text-md font-semibold shadow-md hover:bg-green-700 transition-colors duration-200"
                    disabled={loading} // Disable while saving
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full text-md font-semibold shadow-md hover:bg-gray-400 transition-colors duration-200"
                    disabled={loading} // Disable while saving
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{customer.fullName}</h3>
                <p className="text-lg text-gray-600 mb-4">{customer.email}</p>
                <button
                  onClick={() =>{ 
                    setIsEditing(true);
                    setEditFullName(customer.fullName);
                    setEditEmail(customer.email);
                    setEditProfilePic(customer.profilePic || '');
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full text-md font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div> 
        </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Eco Impact Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <p className="text-green-700 text-5xl font-extrabold">{wasteReducedKg}kg</p>
          <p className="text-green-600 text-lg font-semibold mt-2">Waste Reduced</p>
          <p className="text-sm text-gray-500">by buying near-expiry items</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
          <p className="text-blue-700 text-5xl font-extrabold">{plasticSavedUnits}</p>
          <p className="text-blue-600 text-lg font-semibold mt-2">Packaging Units Saved</p>
          <p className="text-sm text-gray-500">by returning reusable packaging</p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
        <p className="text-purple-700 text-4xl font-extrabold mb-2">{score}</p>
        <p className="text-purple-600 text-lg font-semibold">Eco Score</p>
        <p className="text-sm text-gray-500 mt-2">Keep up the great work!</p>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Badges</h3>
      {badges.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {badges.map((badge, index) => (
            <span key={index} className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              ✨ {badge}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">No badges earned yet. Keep contributing!</p>
      )}

      <h3 className="text-xl font-semibold text-gray-800 mb-4">Milestones</h3>
      {milestones.length > 0 ? (
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div key={index} className={`flex items-center p-3 rounded-lg ${milestone.achieved ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <svg className={`w-6 h-6 mr-3 ${milestone.achieved ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                {milestone.achieved ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4zM10 4a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" />
                )}
              </svg>
              <p className={`font-medium ${milestone.achieved ? 'text-green-700' : 'text-gray-700'}`}>{milestone.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No milestones tracked yet.</p>
      )}
    </div>
  );
};

export default Dashboard;