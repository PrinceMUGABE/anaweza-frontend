/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobSeekerFormModal = ({ isOpen, onClose, jobSeeker = null, onSuccess, token }) => {
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
    salary_range: ""
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  const isEditMode = !!jobSeeker;

  useEffect(() => {
    if (isOpen) {
      // Fetch available users for dropdown
      fetchUsers();
      
      // If editing, populate form with existing data
      if (jobSeeker) {
        setFormData({
          user_id: jobSeeker.user?.id || "",
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
        });
      } else {
        // Reset form for create mode
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
          salary_range: ""
        });
        setResumeFile(null);
      }
    }
  }, [isOpen, jobSeeker]);

  const fetchUsers = async () => {
    try {
      // For edit mode, fetch specific user; for create mode, fetch all users
      const url = isEditMode && jobSeeker?.user?.id 
        ? `https://anaweza-backend.up.railway.app/user/${jobSeeker.user.id}/` 
        : 'https://anaweza-backend.up.railway.app/users/';  // Endpoint to get all users
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUsers(Array.isArray(response.data) ? response.data : [response.data].filter(Boolean));
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== "resume" && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append resume file if selected
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }

      let response;
      if (isEditMode) {
        // Update existing job seeker
        response = await axios.put(
          `https://anaweza-backend.up.railway.app/job_seeker/update/${jobSeeker.id}/`,
          formDataToSend,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
          }
        );
      } else {
        // Create new job seeker
        response = await axios.post(
          "https://anaweza-backend.up.railway.app/job_seeker/create/",
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
      setError(err.response?.data?.error || "An error occurred. Please try again.");
      console.error("Error submitting form:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">
            {isEditMode ? "Edit Job Seeker" : "Add New Job Seeker"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                User Account *
              </label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                className="w-full px-3 text-gray-500 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isEditMode}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.phone_number})
                  </option>
                ))}
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 text-gray-500 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Experience (years) *
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Education Level *
              </label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="none">No Formal Education</option>
                <option value="primary">Primary Education</option>
                <option value="secondary">Secondary Education</option>
                <option value="vocational">Vocational Training</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>

            {/* Education Sector */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Education Sector
              </label>
              <input
                type="text"
                name="education_sector"
                value={formData.education_sector}
                onChange={handleInputChange}
                placeholder="e.g. Engineering, Medicine, Arts"
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Skills (comma separated)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows="3"
                placeholder="e.g. JavaScript, React, UI Design"
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Salary Range (eg: 1000 - 2000)
              </label>
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Resume Upload */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Resume
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEditMode && jobSeeker.resume && !resumeFile && (
                <p className="mt-1 text-sm text-gray-500">
                  Current resume: {jobSeeker.resume.split('/').pop()}
                  <a 
                    href={`https://anaweza-backend.up.railway.app${jobSeeker.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    View
                  </a>
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Processing..." : isEditMode ? "Update Job Seeker" : "Create Job Seeker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSeekerFormModal;