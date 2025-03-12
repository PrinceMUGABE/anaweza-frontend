/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */


import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import districtsData from '../../job seeker/rwanda_districts.json';
import { useTranslation } from "react-i18next";

function Job_seeker_Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [jobSeekerData, setJobSeekerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUserInfoEditing, setIsUserInfoEditing] = useState(true); // Which form is active
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalFees, setAdditionalFees] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');


  // Form data for CustomUser
  const [userFormData, setUserFormData] = useState({
    phone_number: '',
    email: '',
    role: '',
    profile_picture: null,
    status: true
  });

  // Form data for JobSeeker
  const [jobSeekerFormData, setJobSeekerFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    skills: '',
    experience: 0,
    education_level: '',
    education_sector: '',
    salary_range: '',
    status: true,
    district: '',
    sector: '',
  });

  // For image preview
  const [previewImage, setPreviewImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageOption, setImageOption] = useState('upload'); // 'upload' or 'webcam'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Original salary range to compare for fee calculation
  const [originalSalaryRange, setOriginalSalaryRange] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

      if (!accessToken) {
        throw new Error('Access token is missing!');
      }

      const response = await fetch('https://anaweza-backend.up.railway.app/job_seeker/user/details/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching user details: ${response.status}`);
      }

      const data = await response.json();
      console.log("Retrieved user data:", data);

      // Set user data and job seeker data separately
      setUserData(data.custom_user);
      setJobSeekerData(data.job_seeker);

      // Set form data for both entities
      setUserFormData({
        phone_number: data.custom_user.phone_number || '',
        email: data.custom_user.email || '',
        role: data.custom_user.role || '',
        profile_picture: null,
        status: typeof data.custom_user.status === 'boolean' ? data.custom_user.status :
          data.custom_user.status === 'Active' || data.custom_user.status === 'true'
      });

      setJobSeekerFormData({
        first_name: data.job_seeker.first_name || '',
        middle_name: data.job_seeker.middle_name || '',
        last_name: data.job_seeker.last_name || '',
        gender: data.job_seeker.gender || '',
        skills: data.job_seeker.skills || '',
        experience: data.job_seeker.experience || 0,
        education_level: data.job_seeker.education_level || '',
        education_sector: data.job_seeker.education_sector || '',
        salary_range: data.job_seeker.salary_range || '',
        status: typeof data.job_seeker.status === 'boolean' ? data.job_seeker.status :
          data.job_seeker.status === 'Active' || data.job_seeker.status === 'true'
      });

      // Store original salary range for comparison
      setOriginalSalaryRange(data.job_seeker.salary_range || '');

      // Set profile picture preview if available
      if (data.custom_user.profile_picture) {
        setPreviewImage(data.custom_user.profile_picture);
      }

    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate registration and renewal fees based on salary range
  const calculateFees = (salaryRange) => {
    const salary = parseInt(salaryRange.replace(/,/g, '')) || 0;

    if (salary < 100000) {
      return { registrationFee: 2000, renewalFee: 1000 };
    } else if (salary >= 100000 && salary < 200000) {
      return { registrationFee: 5000, renewalFee: 2500 };
    } else if (salary >= 200000 && salary < 500000) {
      return { registrationFee: 10000, renewalFee: 5000 };
    } else {
      return { registrationFee: 20000, renewalFee: 10000 };
    }
  };

  // Calculate additional fees when salary range changes
  const calculateAdditionalFees = (newSalaryRange) => {
    if (!jobSeekerData || !originalSalaryRange) return null;

    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    // If new fees are higher than current fees, calculate the difference
    if (newFees.registrationFee > originalFees.registrationFee) {
      return {
        additionalRegistrationFee: newFees.registrationFee - originalFees.registrationFee,
        additionalRenewalFee: newFees.renewalFee - originalFees.renewalFee,
        totalAdditional: (newFees.registrationFee - originalFees.registrationFee) +
          (newFees.renewalFee - originalFees.renewalFee)
      };
    }

    return null; // No additional fees if new salary range is lower
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for experience - must be a positive number
    if (name === 'experience') {
      if (value < 0) {
        setErrors(prev => ({ ...prev, experience: 'Experience cannot be negative' }));
      } else {
        setErrors(prev => ({ ...prev, experience: '' }));
      }
    }

    // Specific validation for salary range
    if (name === 'salary_range') {
      // Validate format: either a single number or two numbers separated by a hyphen
      const salaryRangeRegex = /^\d+(\s*-\s*\d+)?$/;

      if (value && !salaryRangeRegex.test(value)) {
        setErrors(prev => ({
          ...prev,
          salary_range: 'Salary range must be in format "1000" or "1000 - 2000"'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.salary_range;
          return newErrors;
        });
      }
    }

    if (name === "district") {
      setJobSeekerFormData(prevState => ({
        ...prevState,
        district: value,
        sector: "" // Reset sector when district changes
      }));
    } else {
      setJobSeekerFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    setJobSeekerFormData({ ...jobSeekerFormData, [name]: value });

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

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

  useEffect(() => {
    if (jobSeekerFormData.district) {
      setSectors(districtsData.districts[jobSeekerFormData.district]?.sectors || []);
    } else {
      setSectors([]);
    }
  }, [jobSeekerFormData.district]);  // ✅ Trigger when district changes




  const handleEditClick = () => {
    setIsEditing(!isEditing);

    if (!isEditing) {
      // Reset capture state when toggling edit mode
      stopCapture();
      setImageOption('upload');

      // Reset form data when entering edit mode to ensure current values
      if (userData && jobSeekerData) {
        setUserFormData({
          phone_number: userData.phone_number || '',
          email: userData.email || '',
          role: userData.role || '',
          profile_picture: null,
          status: typeof userData.status === 'boolean' ? userData.status :
            userData.status === 'Active' || userData.status === 'true'
        });

        setJobSeekerFormData({
          first_name: jobSeekerData.first_name || '',
          middle_name: jobSeekerData.middle_name || '',
          last_name: jobSeekerData.last_name || '',
          gender: jobSeekerData.gender || '',
          skills: jobSeekerData.skills || '',
          experience: jobSeekerData.experience || 0,
          education_level: jobSeekerData.education_level || '',
          education_sector: jobSeekerData.education_sector || '',
          salary_range: jobSeekerData.salary_range || '',
          status: typeof jobSeekerData.status === 'boolean' ? jobSeekerData.status :
            jobSeekerData.status === 'Active' || jobSeekerData.status === 'true'
        });
      }

      // Reset additional fees
      setAdditionalFees(null);
    }
  };

  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleJobSeekerChange = (e) => {
    const { name, value } = e.target;

    setJobSeekerFormData({
      ...jobSeekerFormData,
      [name]: value
    });

    // Calculate additional fees if salary range changes
    if (name === 'salary_range') {
      const fees = calculateAdditionalFees(value);
      setAdditionalFees(fees);
    }
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
      setUserFormData({
        ...userFormData,
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
    setUserFormData({
      ...userFormData,
      profile_picture: imageData
    });

    // Reset to upload mode after capturing
    setImageOption('upload');
    stopCapture();
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUserFormData({
      ...userFormData,
      profile_picture: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

    if (!accessToken) {
      console.error('Access token is missing!');
      return;
    }

    // Prepare updated data
    const updatedData = {
      custom_user: {
        phone_number: userFormData.phone_number,
        email: userFormData.email,
        role: userFormData.role,
        profile_picture: userFormData.profile_picture,
        status: userFormData.status
      },
      job_seeker: {
        first_name: jobSeekerFormData.first_name,
        middle_name: jobSeekerFormData.middle_name,
        last_name: jobSeekerFormData.last_name,
        gender: jobSeekerFormData.gender,
        skills: jobSeekerFormData.skills,
        experience: jobSeekerFormData.experience,
        education_level: jobSeekerFormData.education_level,
        education_sector: jobSeekerFormData.education_sector,
        salary_range: jobSeekerFormData.salary_range,
        status: jobSeekerFormData.status,
        district: jobSeekerFormData.district,
        sector: jobSeekerFormData.sector
      }
    };

    // Add registration and renewal fees based on salary range logic
    const newSalaryRange = jobSeekerFormData.salary_range;
    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    // Only update fees if new salary range results in higher fees
    if (newFees.registrationFee > originalFees.registrationFee) {
      updatedData.job_seeker.registration_fee = newFees.registrationFee;
      updatedData.job_seeker.renewal_fee = newFees.renewalFee;
    } else {
      // Keep the original fees if new salary range is lower
      updatedData.job_seeker.registration_fee = jobSeekerData.registration_fee;
      updatedData.job_seeker.renewal_fee = jobSeekerData.renewal_fee;
    }

    console.log("Submitting updated data:", updatedData);

    try {
      const response = await fetch('https://anaweza-backend.up.railway.app/job_seeker/user/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Update response:", data);

        // Update state with new data
        setUserData(data.custom_user);
        setJobSeekerData(data.job_seeker);

        // Update original salary range for future comparisons
        setOriginalSalaryRange(data.job_seeker.salary_range);

        setIsEditing(false);
        setAdditionalFees(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!userData || !jobSeekerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">No user data found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg transition-all">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Job Seeker Profile
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

            {/* User and Job Seeker Info tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setIsUserInfoEditing(true)}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${isUserInfoEditing
                      ? 'border-sky-900 text-sky-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Account Information
                </button>
                <button
                  onClick={() => setIsUserInfoEditing(false)}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${!isUserInfoEditing
                      ? 'border-sky-900 text-sky-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Job Seeker Information
                </button>
              </nav>
            </div>

            {isUserInfoEditing ? (
              // User Account Information
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Phone</strong>
                  <span className="text-gray-800 text-lg">{userData.phone_number}</span>
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
            ) : (
              // Job Seeker Information
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Full Name</strong>
                  <span className="text-gray-800 text-lg">
                    {jobSeekerData.first_name} {jobSeekerData.middle_name} {jobSeekerData.last_name}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Location</strong>
                  <span className="text-gray-800 text-lg">
                    {jobSeekerData.district} {jobSeekerData.sector}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Gender</strong>
                  <span className="text-gray-800 text-lg capitalize">{jobSeekerData.gender}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Skills</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.skills}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Experience</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.experience} years</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Education Level</strong>
                  <span className="text-gray-800 text-lg capitalize">{jobSeekerData.education_level}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Education Sector</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.education_sector}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Salary Range</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.salary_range}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Registration Fee</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.registration_fee} Frw</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Renewal Fee</strong>
                  <span className="text-gray-800 text-lg">{jobSeekerData.renewal_fee} Frw</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700 block mb-1">Status</strong>
                  <span className="text-gray-800 text-lg">
                    {typeof jobSeekerData.status === 'string' ? jobSeekerData.status : (jobSeekerData.status ? 'Active' : 'Non-Active')}
                  </span>
                </div>
              </div>
            )}

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
            {/* Edit mode tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  type="button"
                  onClick={() => setIsUserInfoEditing(true)}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${isUserInfoEditing
                      ? 'border-sky-900 text-sky-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Account Information
                </button>
                <button
                  type="button"
                  onClick={() => setIsUserInfoEditing(false)}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${!isUserInfoEditing
                      ? 'border-sky-900 text-sky-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Job Seeker Information
                </button>
              </nav>
            </div>

            {isUserInfoEditing ? (
              // Edit User Account Information
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={userFormData.phone_number}
                      onChange={handleUserChange}
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
                      value={userFormData.email}
                      onChange={handleUserChange}
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
                      // Completing the Role input field that was cut off
                      value={userFormData.role}
                      onChange={handleUserChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      readOnly // Role should typically be read-only
                    />
                  </div>

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
                      value={userFormData.status.toString()}
                      onChange={(e) => setUserFormData({
                        ...userFormData,
                        status: e.target.value === 'true'
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      <option value="true">Active</option>
                      <option value="false">Non-Active</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Job Seeker Information
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="first_name"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={jobSeekerFormData.first_name}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="middle_name"
                    >
                      Middle Name
                    </label>
                    <input
                      type="text"
                      id="middle_name"
                      name="middle_name"
                      value={jobSeekerFormData.middle_name}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="last_name"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={jobSeekerFormData.last_name}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>


                  <div>
                    <label>District *</label>
                    <select className='text-gray-500 w-72' name="district" value={jobSeekerFormData.district} onChange={handleChange} required>
                      <option value="">Select District</option>
                      {Object.keys(districtsData.districts).map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Sector *</label>
                    <select className="text-gray-500 w-72" name="sector" value={jobSeekerFormData.sector} onChange={handleChange} required>
                      <option value="">Select Sector</option>
                      {sectors.map(([name]) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>

                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="gender"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={jobSeekerFormData.gender}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="skills"
                    >
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={jobSeekerFormData.skills}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="e.g. Python, Data Analysis, Marketing"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="experience"
                    >
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={jobSeekerFormData.experience}
                      onChange={handleJobSeekerChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="education_level"
                    >
                      Education Level
                    </label>
                    <select
                      id="education_level"
                      name="education_level"
                      value={jobSeekerFormData.education_level}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      <option value="none">No Formal Education</option>
                      <option value="primary">Primary Education</option>
                      <option value="ordinary_level">Ordinary Level</option>
                      <option value="secondary">Secondary Education</option>
                      <option value="advance_dimploma">Advanced Diploma</option>
                      <option value="vocational">Vocational Training</option>
                      <option value="advance_dimploma">Advanced Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="education_sector"
                    >
                      Education Sector
                    </label>
                    <input
                      type="text"
                      id="education_sector"
                      name="education_sector"
                      value={jobSeekerFormData.education_sector}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="e.g. Computer Science, Engineering, Business"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="salary_range"
                    >
                      Salary Range (Frw)
                    </label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={jobSeekerFormData.salary_range}
                      onChange={handleJobSeekerChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="e.g. 500000"
                    />
                  </div>

                  {/* <div>
                    <label 
                      className="block text-gray-700 text-sm font-medium mb-2" 
                      htmlFor="jobseeker_status"
                    >
                      Status
                    </label>
                    <input
                      id="jobseeker_status"
                      name="status"
                      value={jobSeekerFormData.status.toString()}
                      onChange={(e) => setJobSeekerFormData({
                        ...jobSeekerFormData,
                        status: e.target.value === 'true'
                      })}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />

                  </div> */}
                </div>

                {/* Display information about current fees */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Current Fee Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-700">Registration Fee:</span>
                      <span className="ml-2 text-gray-500 font-medium">{jobSeekerData.registration_fee} FRW</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Renewal Fee:</span>
                      <span className="ml-2 text-gray-500 font-medium">{jobSeekerData.renewal_fee} FRW</span>
                    </div>
                  </div>
                </div>

                {/* Display Additional Fees if salary range changes */}
                {additionalFees && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-bold text-yellow-800 mb-2">Additional Fees Required</h3>
                    <p className="text-gray-800 mb-2">
                      Your new salary range requires additional fees:
                    </p>
                    <ul className="list-disc pl-5 mb-3 text-gray-800">
                      <li>Additional Registration Fee: <strong>{additionalFees.additionalRegistrationFee} Frw</strong></li>
                      <li>Additional Renewal Fee: <strong>{additionalFees.additionalRenewalFee} Frw</strong></li>

                    </ul>
                    <div className="p-3 bg-white rounded border border-yellow-300">
                      <p className="font-medium text-gray-800">Payment Information:</p>
                      <p className="text-gray-700">Please deposit the amount to:</p>
                      <p className="font-bold text-gray-500">
                        <ul>
                          <li>MTN MOMO PAY: <span className='text-red-600'>1592374</span></li>
                          <li>Anaweza App LTD</li>
                        </ul>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center space-x-4 mt-8">
              <button
                type="submit"
                className="px-8 py-3 text-white bg-sky-900 hover:bg-sky-700 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleEditClick}
                className="px-8 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Job_seeker_Profile;