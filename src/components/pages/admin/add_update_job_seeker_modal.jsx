/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobSeekerFormModal = ({ isOpen, onClose, jobSeeker = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "male",
    experience: 0,
    education_level: "secondary",
    education_sector: "",
    skills: "",
    status: true,
    resume: null,
    salary_range: "",
    registration_fee: "",
    renewal_fee: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  const isEditMode = !!jobSeeker;

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
  };

  // Calculate fees based on salary range
  const calculateFees = (salaryRangeStr) => {
    const salaryMatch = salaryRangeStr.match(/\d+/);
    if (!salaryMatch) return { registration: "", renewal: "" };
    
    const salary = parseInt(salaryMatch[0], 10);
    
    if (salary < 100000) {
      return { registration: "2000", renewal: "1000" };
    } else if (salary >= 100000 && salary < 200000) {
      return { registration: "5000", renewal: "2500" };
    } else if (salary >= 200000 && salary < 500000) {
      return { registration: "10000", renewal: "5000" };
    } else if (salary >= 500000) {
      return { registration: "20000", renewal: "10000" };
    }
    
    return { registration: "", renewal: "" };
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      
      if (jobSeeker) {
        const initialData = {
          user_id: jobSeeker.custom_user?.id || "",
          first_name: jobSeeker.first_name || "",
          middle_name: jobSeeker.middle_name || "",
          last_name: jobSeeker.last_name || "",
          gender: jobSeeker.gender || "male",
          experience: jobSeeker.experience || 0,
          education_level: jobSeeker.education_level || "secondary",
          education_sector: jobSeeker.education_sector || "",
          skills: jobSeeker.skills || "",
          salary_range: jobSeeker.salary_range || "",
          status: jobSeeker.status !== undefined ? jobSeeker.status : true,
          registration_fee: jobSeeker.registration_fee || "",
          renewal_fee: jobSeeker.renewal_fee || "",
        };

        if ((!initialData.registration_fee || !initialData.renewal_fee) && initialData.salary_range) {
          const calculatedFees = calculateFees(initialData.salary_range);
          if (!initialData.registration_fee) {
            initialData.registration_fee = calculatedFees.registration;
          }
          if (!initialData.renewal_fee) {
            initialData.renewal_fee = calculatedFees.renewal;
          }
        }

        setFormData(initialData);
      } else {
        setFormData({
          user_id: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          gender: "male",
          experience: 0,
          education_level: "secondary",
          education_sector: "",
          skills: "",
          status: true,
          resume: null,
          salary_range: "",
          registration_fee: "",
          renewal_fee: "",
        });
        setResumeFile(null);
      }
    }
  }, [isOpen, jobSeeker]);

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const url = isEditMode && jobSeeker?.user?.id 
        ? `https://anaweza-backend.up.railway.app/user/${jobSeeker.user.id}/` 
        : 'https://anaweza-backend.up.railway.app/users/';
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userData = response.data.users ? response.data.users : 
                      Array.isArray(response.data) ? response.data : 
                      [response.data].filter(Boolean);
      
      setUsers(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        // Optional: redirect to login
        // navigate('/login');
      } else {
        setError("Failed to load users");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "salary_range") {
      const fees = calculateFees(value);
      
      setFormData({
        ...formData,
        [name]: value,
        registration_fee: fees.registration,
        renewal_fee: fees.renewal
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== "resume" && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }

      let response;
      const apiUrl = isEditMode 
        ? `https://anaweza-backend.up.railway.app/job_seeker/update/${jobSeeker.id}/`
        : "https://anaweza-backend.up.railway.app/job_seeker/create/";
      
      if (isEditMode) {
        response = await axios.put(
          apiUrl,
          formDataToSend,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
          }
        );
      } else {
        response = await axios.post(
          apiUrl,
          formDataToSend,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data" 
            },
          }
        );
      }

      setLoading(false);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        // Optional: redirect to login
        // navigate('/login');
      } else {
        setError(err.response?.data?.error || "An error occurred. Please try again.");
      }
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Job Seeker" : "Add New Job Seeker"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? "Update job seeker information" : "Create a new job seeker profile"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    className="w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isEditMode}
                  >
                    <option value="">Select a user</option>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email || "No email"} ({user.phone_number || 'No phone'})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading users or no users available</option>
                    )}
                  </select>
                  {users.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      No users found. Make sure users exist in the database.
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="none">No Formal Education</option>
                    <option value="primary">Primary Education</option>
                    <option value="ordinary_level">Ordinary Level</option>
                    <option value="secondary">Secondary Education</option>
                    <option value="vocational">Vocational Training</option>
                    <option value="advanced_diploma">Advanced Diploma</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                {/* Education Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Sector
                  </label>
                  <input
                    type="text"
                    name="education_sector"
                    value={formData.education_sector}
                    onChange={handleInputChange}
                    placeholder="e.g. Engineering, Medicine, Arts"
                    className="w-ful text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    placeholder="e.g. 100000 or 100000 - 200000"
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Registration and renewal fees are auto-calculated based on the first number
                  </p>
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="List your skills separated by commas (e.g. JavaScript, React, UI Design, Project Management)"
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fee Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Fee
                  </label>
                  <input
                    type="text"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    placeholder="Auto-calculated from salary"
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>

                {/* Renewal Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Fee
                  </label>
                  <input
                    type="text"
                    name="renewal_fee"
                    value={formData.renewal_fee}
                    onChange={handleInputChange}
                    placeholder="Auto-calculated from salary"
                    className="w-full px-4  text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Fee Schedule Info */}
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Fee Schedule</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Salary &lt; 100,000: Registration 2,000 | Renewal 1,000</p>
                  <p>• Salary 100,000 - 199,999: Registration 5,000 | Renewal 2,500</p>
                  <p>• Salary 200,000 - 499,999: Registration 10,000 | Renewal 5,000</p>
                  <p>• Salary 500,000+: Registration 20,000 | Renewal 10,000</p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX (Max size: 10MB)
                </p>
                {isEditMode && jobSeeker.resume && !resumeFile && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Current resume: {jobSeeker.resume.split('/').pop()}
                      <a 
                        href={`https://anaweza-backend.up.railway.app${jobSeeker.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        View Current Resume
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Active Status
                </label>
                <span className="text-xs text-gray-500">
                  (Unchecked profiles will be inactive)
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              isEditMode ? "Update Job Seeker" : "Create Job Seeker"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerFormModal;