/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RegisterAsJobSeeker = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    experience: 0,
    education_level: 'none',
    education_sector: '',
    skills: '',
    resume: null,
    salary_range: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    console.log("User Token: ", token);
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken && !token) {
      navigate("/login");
    }
  }, [navigate, token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, resume: "File size cannot exceed 10MB" });
        return;
      }

      // Validate file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(fileExtension)) {
        setErrors({ ...errors, resume: "Only PDF, DOC, or DOCX files are allowed" });
        return;
      }

      setFileName(file.name);
      setFormData({ ...formData, resume: file });
      setErrors({ ...errors, resume: '' });
      
      if (fileExtension === 'pdf') {
        extractPdfData(file);
      }
    }
  };

  const extractPdfData = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const pdf = await pdfjs.getDocument({ data: reader.result }).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ');
        }
        autoFillForm(extractedText);
      } catch (error) {
        console.error('Error extracting PDF data:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const autoFillForm = (text) => {
    const nameMatch = text.match(/Name: (\w+) (\w+)/i);
    const experienceMatch = text.match(/Experience: (\d+)/);

    setFormData((prev) => ({
      ...prev,
      first_name: nameMatch ? nameMatch[1] : prev.first_name,
      last_name: nameMatch ? nameMatch[2] : prev.last_name,
      experience: experienceMatch ? parseInt(experienceMatch[1], 10) : prev.experience,
    }));
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
    
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.salary_range.trim()) newErrors.salary_range = 'Salary range is required';

    // Validate experience is a number
    if (isNaN(Number(formData.experience))) {
      newErrors.experience = 'Experience must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Form validation
    if (!validateForm()) {
      console.error("Form validation failed:", errors);
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    
    // Append all form fields except resume (handled separately)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'resume' && value !== null && value !== '') {
        formDataToSend.append(key, value);
      }
    });
    
    // Append resume if it exists
    if (formData.resume) {
      formDataToSend.append('resume', formData.resume);
    }

    try {
      console.log("Sending data to server:", Object.fromEntries(formDataToSend));
      
      const response = await axios.post(
        "https://anaweza-backend.up.railway.app/job_seeker/create/", 
        formDataToSend, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/job_seeker'), 2000);
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      
      if (error.response?.data) {
        // Handle API error response
        if (typeof error.response.data === 'object') {
          setErrors(error.response.data);
        } else {
          setErrors({ form: error.response.data || 'An unexpected error occurred.' });
        }
      } else {
        setErrors({ form: 'Network error. Please check your connection.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to render field error message
  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <div className="text-red-500 text-sm mt-1">{errors[fieldName]}</div>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Job Seeker Profile
            </h2>
            <p className="mt-2 text-gray-600">
              Complete your profile to start applying for jobs
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {message}
            </div>
          )}
          
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {errors.form}
            </div>
          )}

          {errors.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {errors.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 text-gray-500 py-2 border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {renderError('first_name')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 text-gray-500 py-2 border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {renderError('last_name')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-3 text-gray-500 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {renderError('gender')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full text-gray-500 px-3 py-2 border ${errors.experience ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {renderError('experience')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <input
                type="text"
                name="education_sector"
                value={formData.education_sector}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Business Administration"
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., Python, Project Management, Digital Marketing"
                className={`w-full px-3 text-gray-500 py-2 border ${errors.skills ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
              {renderError('skills')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range (e.g., 1000 - 2000) *
              </label>
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className={`w-full px-3 text-gray-500 py-2 border ${errors.salary_range ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {renderError('salary_range')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.resume ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg`}>
                <div className="space-y-1 text-center">
                  <AiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, or DOCX up to 10MB</p>
                  {fileName && (
                    <p className="text-sm text-gray-500 mt-2">{fileName}</p>
                  )}
                  {renderError('resume')}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Creating Profile..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsJobSeeker;