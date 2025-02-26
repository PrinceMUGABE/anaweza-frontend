/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Job_seeker_Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    role: '',
    profile_picture: null,
    status: true // Added default status
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageOption, setImageOption] = useState('upload'); // 'upload' or 'webcam'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    console.log("Retrieved user from localStorage:", storedUser);

    if (storedUser && storedUser.id.toString() === id) {
      setUserData(storedUser);
      
      // Fix: Properly set phone_number from whichever property exists
      const phoneValue = storedUser.phone_number || storedUser.phone || '';
      
      // Parse status to boolean if it's a string
      let userStatus = storedUser.status;
      if (typeof userStatus === 'string') {
        userStatus = userStatus.toLowerCase() === 'active' || userStatus.toLowerCase() === 'true';
      } else if (userStatus === undefined) {
        userStatus = true; // Default to true if undefined
      }
      
      setFormData({
        phone_number: phoneValue,
        email: storedUser.email || '',
        role: storedUser.role || '',
        profile_picture: null,
        status: userStatus // Set status properly
      });
      
      // Set preview image if user already has a profile picture
      if (storedUser.profile_picture) {
        setPreviewImage(storedUser.profile_picture);
      }
      
      console.log("Matching user data:", storedUser);
    }
  }, [id]);

  useEffect(() => {
    if (userData) {
      console.log("User data set in state:", userData);
    }
  }, [userData]);

  // Clean up webcam stream when component unmounts or capture mode changes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Effect to handle image option change
  useEffect(() => {
    if (imageOption === 'webcam') {
      startCapture();
    } else {
      stopCapture();
    }
  }, [imageOption]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    
    if (!isEditing) {
      // Reset capture state when toggling edit mode
      stopCapture();
      setImageOption('upload');
      
      // Important: Reset form data when entering edit mode to ensure current values
      if (userData) {
        const phoneValue = userData.phone_number || userData.phone || '';
        
        // Parse status to boolean
        let userStatus = userData.status;
        if (typeof userStatus === 'string') {
          userStatus = userStatus.toLowerCase() === 'active' || userStatus.toLowerCase() === 'true';
        } else if (userStatus === undefined) {
          userStatus = true; // Default to true if undefined
        }
        
        setFormData({
          phone_number: phoneValue,
          email: userData.email || '',
          role: userData.role || '',
          profile_picture: null,
          status: userStatus // Make sure to include status
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle the image option change
  const handleImageOptionChange = (e) => {
    setImageOption(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setFormData({
        ...formData,
        profile_picture: reader.result
      });
    };
    reader.readAsDataURL(file);
    
    // Exit capture mode if it was active
    stopCapture();
    setImageOption('upload');
  };

  const startCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setIsCapturing(false);
      // Fallback to upload if webcam fails
      setImageOption('upload');
    }
  };

  const stopCapture = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setPreviewImage(imageData);
    setFormData({
      ...formData,
      profile_picture: imageData
    });
    
    // Reset to upload mode after capturing
    setImageOption('upload');
    stopCapture();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

    if (!accessToken) {
      console.error('Access token is missing!');
      return;
    }

    const updatedUser = {
      ...userData,
      phone_number: formData.phone_number,
      email: formData.email,
      role: formData.role,
      profile_picture: formData.profile_picture,
      status: formData.status // Include status in update
    };

    try {
      const response = await fetch(`https://anaweza-backend.up.railway.app/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedUser),
      });
    
      if (response.ok) {
        const data = await response.json();
        // Update local storage with new data
        const updatedUserData = {
          ...userData,
          phone_number: data.phone_number,
          email: data.email,
          role: data.role,
          profile_picture: data.profile_picture,
          status: data.status === "Active"
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        // Better error handling
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update user data:', response.status, errorData);
        alert(`Update failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Network or server error occurred');
    }
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData({
      ...formData,
      profile_picture: null
    });
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-lg transition-all">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Profile Info
        </h1>

        {!isEditing ? (
          <div className="space-y-6">
            {/* Display Profile Picture */}
            <div className="flex justify-center mb-6">
              {previewImage || userData.profile_picture ? (
                <div className="relative">
                  <img 
                    src={previewImage || userData.profile_picture} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-5xl">
                    {userData.email ? userData.email.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Phone</strong>
                <span className="text-gray-800 text-lg">{userData.phone_number || userData.phone}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Email</strong>
                <span className="text-gray-800 text-lg">{userData.email}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Role</strong>
                <span className="text-gray-800 text-lg">{userData.role}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Status</strong>
                <span className="text-gray-800 text-lg">
                  {typeof userData.status === 'string' ? userData.status : (userData.status ? 'Active' : 'Non-Active')}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Created At</strong>
                <span className="text-gray-800 text-lg">
                  {new Date(userData.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleEditClick}
                className="px-8 py-3 text-white bg-sky-900 hover:bg-gray-700 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Profile Picture
                </label>

                {/* Preview Image */}
                <div className="mb-4">
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-5xl">
                        {userData.email ? userData.email.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Image Source Dropdown */}
                <div className="w-full max-w-sm mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Choose Image Source
                  </label>
                  <select
                    value={imageOption}
                    onChange={handleImageOptionChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="upload">Upload from Device</option>
                    <option value="webcam">Capture with Webcam</option>
                  </select>
                </div>

                {/* Webcam Capture Area */}
                {imageOption === 'webcam' && isCapturing && (
                  <div className="mb-4 border rounded-lg p-2 bg-gray-50 w-full max-w-sm">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded"
                    />
                    <div className="flex justify-center mt-2">
                      <button
                        type="button"
                        onClick={captureImage}
                        className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageOption('upload')}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Upload Button - Only show for upload option */}
                {imageOption === 'upload' && (
                  <div className="flex justify-center">
                    <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">Profile picture is optional</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="phone_number"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="role"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 cursor-not-allowed"
                  required
                />
              </div>
              
              {/* Add status field display/toggle */}
              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status === true || formData.status === "true" || formData.status === "Active" ? "true" : "false"}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.value === "true"
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="true">Active</option>
                  <option value="false">Non-Active</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleEditClick}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-white bg-sky-900 hover:bg-gray-700 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Job_seeker_Profile;