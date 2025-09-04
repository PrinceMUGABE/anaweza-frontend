/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import districtsData from '../../job seeker/rwanda_districts.json';
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, DollarSign, Calendar, Camera, Upload, Edit3, Save, X, Eye, EyeOff, Star, Award, Clock, Building, CheckCircle, AlertCircle } from 'lucide-react';

function Job_seeker_Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [jobSeekerData, setJobSeekerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUserInfoEditing, setIsUserInfoEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalFees, setAdditionalFees] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const {t} = useTranslation();

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
  const [imageOption, setImageOption] = useState('upload');
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

      setUserData(data.custom_user);
      setJobSeekerData(data.job_seeker);

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
          data.job_seeker.status === 'Active' || data.job_seeker.status === 'true',
        district: data.job_seeker.district || '',
        sector: data.job_seeker.sector || '',
      });

      setOriginalSalaryRange(data.job_seeker.salary_range || '');

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

  const calculateAdditionalFees = (newSalaryRange) => {
    if (!jobSeekerData || !originalSalaryRange) return null;

    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    if (newFees.registrationFee > originalFees.registrationFee) {
      return {
        additionalRegistrationFee: newFees.registrationFee - originalFees.registrationFee,
        additionalRenewalFee: newFees.renewalFee - originalFees.renewalFee,
        totalAdditional: (newFees.registrationFee - originalFees.registrationFee) +
          (newFees.renewalFee - originalFees.renewalFee)
      };
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'experience') {
      if (value < 0) {
        setErrors(prev => ({ ...prev, experience: t('Experience cannot be negative') }));
      } else {
        setErrors(prev => ({ ...prev, experience: '' }));
      }
    }

    if (name === 'salary_range') {
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
        sector: ""
      }));
    } else {
      setJobSeekerFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
  }, [jobSeekerFormData.district]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);

    if (!isEditing) {
      stopCapture();
      setImageOption('upload');

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
            jobSeekerData.status === 'Active' || jobSeekerData.status === 'true',
          district: jobSeekerData.district || '',
          sector: jobSeekerData.sector || '',
        });
      }

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

    if (name === 'salary_range') {
      const fees = calculateAdditionalFees(value);
      setAdditionalFees(fees);
    }
  };

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

    setImageOption('upload');
    stopCapture();
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUserFormData({
      ...userFormData,
      profile_picture: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

    if (!accessToken) {
      console.error('Access token is missing!');
      setSaveLoading(false);
      return;
    }

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

    const newSalaryRange = jobSeekerFormData.salary_range;
    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    if (newFees.registrationFee > originalFees.registrationFee) {
      updatedData.job_seeker.registration_fee = newFees.registrationFee;
      updatedData.job_seeker.renewal_fee = newFees.renewalFee;
    } else {
      updatedData.job_seeker.registration_fee = jobSeekerData.registration_fee;
      updatedData.job_seeker.renewal_fee = jobSeekerData.renewal_fee;
    }

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
        setUserData(data.custom_user);
        setJobSeekerData(data.job_seeker);
        setOriginalSalaryRange(data.job_seeker.salary_range);
        setIsEditing(false);
        setAdditionalFees(null);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update user data:', response.status, errorData);
        setMessage(`Update failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setMessage('Network or server error occurred');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600 font-medium">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Error Loading Profile</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserDetails}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !jobSeekerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg text-gray-600">{t("No user data found.")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Success/Error Messages */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.includes('successfully') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } animate-slide-in-right`}>
          <div className="flex items-center space-x-2">
            {message.includes('successfully') ? 
              <CheckCircle className="w-5 h-5" /> : 
              <AlertCircle className="w-5 h-5" />
            }
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {previewImage || userData.profile_picture ? (
                    <img
                      src={previewImage || userData.profile_picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white bg-opacity-90 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <button
                      onClick={() => document.getElementById('profile-upload').click()}
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="text-white pb-4">
                  <h1 className="text-3xl font-bold mb-2">
                    {jobSeekerData.first_name} {jobSeekerData.middle_name} {jobSeekerData.last_name}
                  </h1>
                  <p className="text-blue-100 text-lg mb-1">{t(userData.role)}</p>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{jobSeekerData.district}, {jobSeekerData.sector}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{jobSeekerData.experience} years exp.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditClick}
              className={`absolute top-6 right-6 px-6 py-3 rounded-xl font-semibold transition duration-200 shadow-lg ${
                isEditing 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>{t("Cancel")}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>{t("Edit Profile")}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                {t("Quick Stats")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("Experience")}</span>
                  <span className="font-semibold text-gray-800">{jobSeekerData.experience} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("Education")}</span>
                  <span className="font-semibold text-gray-800 capitalize">{jobSeekerData.education_level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("Status")}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    (typeof jobSeekerData.status === 'string' ? jobSeekerData.status : (jobSeekerData.status ? 'Active' : 'Non-Active')) === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {typeof jobSeekerData.status === 'string' ? t(jobSeekerData.status) : t(jobSeekerData.status ? 'Active' : 'Non-Active')}
                  </span>
                </div>
              </div>
            </div>

            {/* Fees Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                {/* <DollarSign className="w-5 h-5 mr-2 text-green-600" /> */}
                {t("Fee Information")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("Registration Fee")}</span>
                  <span className="font-semibold text-gray-800">{jobSeekerData.registration_fee} FRW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("Renewal Fee")}</span>
                  <span className="font-semibold text-gray-800">{jobSeekerData.renewal_fee} FRW</span>
                </div>
              </div>

              {/* Additional Fees Warning */}
              {additionalFees && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">{t("Additional Fees Required")}</h4>
                      <div className="space-y-1 text-sm text-yellow-700">
                        <div>Additional Registration: {additionalFees.additionalRegistrationFee} FRW</div>
                        <div>Additional Renewal: {additionalFees.additionalRenewalFee} FRW</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Preview (Non-editing mode) */}
            {!isEditing && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  {t("Skills")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobSeekerData.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {!isEditing ? (
              /* Display Mode */
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        onClick={() => setIsUserInfoEditing(true)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                          isUserInfoEditing
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{t("Account Information")}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setIsUserInfoEditing(false)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                          !isUserInfoEditing
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{t("Professional Information")}</span>
                        </div>
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {isUserInfoEditing ? (
                      /* Account Information */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="w-4 h-4 mr-2 text-blue-600" />
                            {t("Phone Number")}
                          </label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-800 font-medium">{userData.phone_number}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Mail className="w-4 h-4 mr-2 text-blue-600" />
                            {t("Email Address")}
                          </label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-800 font-medium">{userData.email}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Building className="w-4 h-4 mr-2 text-blue-600" />
                            {t("Role")}
                          </label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-800 font-medium">{t(userData.role)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            {t("Member Since")}
                          </label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-800 font-medium">
                              {new Date(userData.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Professional Information */
                      <div className="space-y-8">
                        {/* Personal Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Personal Details")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Full Name")}</label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">
                                  {jobSeekerData.first_name} {jobSeekerData.middle_name} {jobSeekerData.last_name}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Gender")}</label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium capitalize">{t(jobSeekerData.gender)}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Location")}
                              </label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">
                                  {jobSeekerData.district}, {jobSeekerData.sector}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Experience")}
                              </label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">{jobSeekerData.experience} {t("years")}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Education")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Education Level")}</label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium capitalize">{t(jobSeekerData.education_level)}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Field of Study")}</label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">{jobSeekerData.education_sector || t("Not specified")}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Career Information */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Career Information")}
                          </h4>
                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Salary Expectation")}
                              </label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">{jobSeekerData.salary_range} FRW</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Star className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Skills & Expertise")}
                              </label>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                  {jobSeekerData.skills.split(',').map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hidden file input for profile picture */}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Navigation Tabs for Edit Mode */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        type="button"
                        onClick={() => setIsUserInfoEditing(true)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                          isUserInfoEditing
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{t("Account Information")}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUserInfoEditing(false)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                          !isUserInfoEditing
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{t("Professional Information")}</span>
                        </div>
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {isUserInfoEditing ? (
                      /* Edit Account Information */
                      <div className="space-y-8">
                        {/* Profile Picture Section */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Camera className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Profile Picture")}
                          </h4>
                          
                          <div className="flex flex-col items-center space-y-4">
                            {/* Current Profile Picture */}
                            <div className="relative">
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt="Profile Preview"
                                  className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 shadow-lg"
                                />
                              ) : (
                                <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                                  <User className="w-16 h-16 text-gray-400" />
                                </div>
                              )}
                              
                              {previewImage && (
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* Image Source Options */}
                            <div className="w-full max-w-sm">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Choose Image Source")}
                              </label>
                              <select
                                value={imageOption}
                                onChange={handleImageOptionChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              >
                                <option value="upload">{t("Upload from Device")}</option>
                                <option value="webcam">{t("Capture with Webcam")}</option>
                              </select>
                            </div>

                            {/* Webcam Capture */}
                            {imageOption === 'webcam' && isCapturing && (
                              <div className="w-full max-w-sm">
                                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    className="w-full rounded-lg"
                                  />
                                  <div className="flex justify-center mt-4 space-x-3">
                                    <button
                                      type="button"
                                      onClick={captureImage}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                                    >
                                      {t("Capture")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setImageOption('upload')}
                                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                                    >
                                      {t("Cancel")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Upload Button */}
                            {imageOption === 'upload' && (
                              <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>{t("Upload Image")}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Account Fields */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Account Details")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Phone Number")}
                              </label>
                              <input
                                type="text"
                                name="phone_number"
                                value={userFormData.phone_number}
                                onChange={handleUserChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Email Address")}
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={userFormData.email}
                                onChange={handleUserChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Building className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Role")}
                              </label>
                              <input
                                type="text"
                                name="role"
                                value={t(userFormData.role)}
                                onChange={handleUserChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                readOnly
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Account Status")}
                              </label>
                              <select
                                name="status"
                                value={userFormData.status.toString()}
                                onChange={(e) => setUserFormData({
                                  ...userFormData,
                                  status: e.target.value === 'true'
                                })}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              >
                                <option value="true">{t("Active")}</option>
                                <option value="false">{t("Non-Active")}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Edit Professional Information */
                      <div className="space-y-8">
                        {/* Personal Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Personal Details")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("First Name")}</label>
                              <input
                                type="text"
                                name="first_name"
                                value={jobSeekerFormData.first_name}
                                onChange={handleJobSeekerChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Middle Name")}</label>
                              <input
                                type="text"
                                name="middle_name"
                                value={jobSeekerFormData.middle_name}
                                onChange={handleJobSeekerChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Last Name")}</label>
                              <input
                                type="text"
                                name="last_name"
                                value={jobSeekerFormData.last_name}
                                onChange={handleJobSeekerChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Gender")}</label>
                              <select
                                name="gender"
                                value={jobSeekerFormData.gender}
                                onChange={handleJobSeekerChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              >
                                <option value="">{t("Select Gender")}</option>
                                <option value="male">{t("Male")}</option>
                                <option value="female">{t("Female")}</option>
                                <option value="other">{t("Other")}</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                {t("District")}
                              </label>
                              <select
                                name="district"
                                value={jobSeekerFormData.district}
                                onChange={handleChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              >
                                <option value="">{t("Select District")}</option>
                                {Object.keys(districtsData.districts).map((district) => (
                                  <option key={district} value={district}>{district}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Sector")}</label>
                              <select
                                name="sector"
                                value={jobSeekerFormData.sector}
                                onChange={handleChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                required
                              >
                                <option value="">{t("Select Sector")}</option>
                                {sectors.map(([name]) => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Education")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Education Level")}</label>
                              <select
                                name="education_level"
                                value={jobSeekerFormData.education_level}
                                onChange={handleJobSeekerChange}
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              >
                                <option value="none">{t("No Formal Education")}</option>
                                <option value="primary">{t("Primary Education")}</option>
                                <option value="ordinary_level">{t("Ordinary Level")}</option>
                                <option value="secondary">{t("Secondary Education")}</option>
                                <option value="vocational">{t("Vocational Training")}</option>
                                <option value="advance_diploma">{t("Advanced Diploma")}</option>
                                <option value="bachelor">{t("Bachelor's Degree")}</option>
                                <option value="master">{t("Master's Degree")}</option>
                                <option value="phd">{t("PhD")}</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">{t("Field of Study")}</label>
                              <input
                                type="text"
                                name="education_sector"
                                value={jobSeekerFormData.education_sector}
                                onChange={handleJobSeekerChange}
                                placeholder="e.g. Computer Science, Engineering, Business"
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Career Information */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                            {t("Career Information")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Years of Experience")}
                              </label>
                              <input
                                type="number"
                                name="experience"
                                value={jobSeekerFormData.experience}
                                onChange={handleJobSeekerChange}
                                min="0"
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              />
                              {errors.experience && (
                                <p className="text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {errors.experience}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-700">
                                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                                {t("Salary Expectation (FRW)")}
                              </label>
                              <input
                                type="text"
                                name="salary_range"
                                value={jobSeekerFormData.salary_range}
                                onChange={handleJobSeekerChange}
                                placeholder="e.g. 500000 or 400000 - 600000"
                                className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                              />
                              {errors.salary_range && (
                                <p className="text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {errors.salary_range}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <Star className="w-4 h-4 mr-2 text-blue-600" />
                              {t("Skills & Expertise")}
                            </label>
                            <textarea
                              name="skills"
                              value={jobSeekerFormData.skills}
                              onChange={handleJobSeekerChange}
                              placeholder="e.g. JavaScript, React, Node.js, Python, SQL (comma separated)"
                              rows="3"
                              className="w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500">{t("Separate skills with commas")}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>{t("Cancel")}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saveLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t("Saving...")}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{t("Save Changes")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Job_seeker_Profile;