/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineCloudUpload, AiOutlineInfoCircle } from 'react-icons/ai';
import { FiCheck } from 'react-icons/fi';
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
  const [registrationFee, setRegistrationFee] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const token = localStorage.getItem("token");

  // Pricing tiers from the Policy component
  const pricingTiers = [
    {
      range: "Below 100,000 RWF",
      min: 0,
      max: 99999,
      registrationFee: "2,000 RWF",
      renewalFee: "1,000 RWF/year",
    },
    {
      range: "100,000 - 199,000 RWF",
      min: 100000,
      max: 199000,
      registrationFee: "5,000 RWF",
      renewalFee: "2,500 RWF/year",
    },
    {
      range: "2000,000 - 499,000 RWF",
      min: 199000,
      max: 499000,
      registrationFee: "10,000 RWF",
      renewalFee: "5,000 RWF/year",
    },
    {
      range: "500,000 RWF and Above",
      min: 500000,
      max: Number.MAX_SAFE_INTEGER,
      registrationFee: "20,000 RWF",
      renewalFee: "10,000 RWF/year",
    }
  ];


  // Add a new function to handle logout
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Show a logout message
    setMessage('Logging out...');

    // Redirect to login page after a short delay
    setTimeout(() => navigate('/login'), 1000);
  };

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

  // Modify calculateRegistrationFee to handle the new format
  const calculateRegistrationFee = (salaryRange) => {
    if (!salaryRange) return null;

    try {
      // Parse the salary range string with more robust parsing
      const cleanRange = salaryRange.replace(/[^\d-]/g, '');
      const parts = cleanRange.split('-');

      let lowerValue;
      if (parts.length > 1) {
        lowerValue = parseInt(parts[0]);
      } else {
        lowerValue = parseInt(cleanRange);
      }

      if (isNaN(lowerValue)) return null;

      // Find the appropriate pricing tier
      for (const tier of pricingTiers) {
        if (lowerValue >= tier.min && lowerValue <= tier.max) {
          return tier;
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing salary range:", error);
      return null;
    }
  };

  useEffect(() => {
    const fee = calculateRegistrationFee(formData.salary_range);
    setRegistrationFee(fee);
  }, [formData.salary_range]);

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

    // Salary range validation
    if (!formData.salary_range.trim()) {
      newErrors.salary_range = 'Salary range is required';
    } else {
      // Additional validation for salary range format
      const salaryRangeRegex = /^\d+(\s*-\s*\d+)?$/;
      if (!salaryRangeRegex.test(formData.salary_range)) {
        newErrors.salary_range = 'Salary range must be in format "1000" or "1000 - 2000"';
      }
    }

    // Validate experience is a number
    if (isNaN(Number(formData.experience))) {
      newErrors.experience = 'Experience must be a valid number';
    }

    // Check if terms and conditions are accepted
    if (!acceptTerms) {
      setTermsError('You must accept the terms and conditions to proceed');
    } else {
      setTermsError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && acceptTerms;
  };


// Modified handleSubmit function with enhanced console logging
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
      console.log(`Added form field: ${key} = ${value}`);
    }
  });

  // Append resume if it exists
  if (formData.resume) {
    formDataToSend.append('resume', formData.resume);
    console.log(`Added resume: ${formData.resume.name} (${formData.resume.size} bytes)`);
  }

  // Add registration fee and renewal fee to form data with proper formatting
  if (registrationFee) {
    // Extract the numeric value from strings like "2,000 RWF" or "10,000 RWF/year"
    const extractNumericValue = (feeString) => {
      // Remove all non-numeric characters except decimals, then remove commas
      return feeString.replace(/[^\d,.]/g, '').replace(/,/g, '');
    };
    
    const registrationFeeValue = extractNumericValue(registrationFee.registrationFee);
    const renewalFeeValue = extractNumericValue(registrationFee.renewalFee);
    
    console.log(`Original registration fee: ${registrationFee.registrationFee}`);
    console.log(`Extracted registration fee value: ${registrationFeeValue}`);
    
    console.log(`Original renewal fee: ${registrationFee.renewalFee}`);
    console.log(`Extracted renewal fee value: ${renewalFeeValue}`);
    
    formDataToSend.append('registration_fee', registrationFeeValue);
    formDataToSend.append('renewal_fee', renewalFeeValue);
  } else {
    console.warn("No registration fee information available");
  }

  // Display complete form data object being sent
  console.log("========== FORM DATA BEING SUBMITTED ==========");
  for (let [key, value] of formDataToSend.entries()) {
    console.log(`${key}: ${value instanceof File ? `File (${value.name}, ${value.size} bytes)` : value}`);
  }
  console.log("==============================================");

  try {
    console.log("Sending data to server...");

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

    console.log("Response received:", response);
    
    if (response.status === 201) {
      console.log("Registration successful");
      setMessage('Registration successful! Your account will be activated after payment confirmation.');
      setTimeout(() => navigate('/job_seeker'), 2000);
    }
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error details:", error.response?.data || error.message);

    if (error.response?.data) {
      // Handle API error response
      if (typeof error.response.data === 'object') {
        console.error("Error object:", error.response.data);
        setErrors(error.response.data);
      } else {
        console.error("Error string:", error.response.data);
        setErrors({ form: error.response.data || 'An unexpected error occurred.' });
      }
    } else {
      console.error("Network error");
      setErrors({ form: 'Network error. Please check your connection.' });
    }
  } finally {
    setLoading(false);
    console.log("Form submission process completed");
  }
};

  // Function to render field error message
  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <div className="text-red-500 text-sm mt-1">{errors[fieldName]}</div>
    ) : null;
  };

  // Terms and Conditions Modal
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-gray-700 space-y-4">
            <p>
              <strong>Introduction:</strong> Welcome to Anaweza. These Terms and Conditions govern your use of our platform and services.
              By accessing or using Anaweza, you agree to be bound by these Terms.
            </p>

            <p>
              <strong>User Accounts:</strong> When you create an account with us, you must provide accurate,
              complete, and up-to-date information. You are responsible for safeguarding your password
              and for all activities that occur under your account.
            </p>

            <p>
              <strong>User Conduct:</strong> You agree not to provide false information, use the service for illegal purposes,
              harass others, post discriminatory job listings, or create multiple accounts for deceptive purposes.
            </p>

            <p>
              <strong>Job Seeker Specific Terms:</strong> You must provide accurate information about your qualifications,
              experience, and desired salary range. Your salary range determines your registration fee.
            </p>

            <p>
              <strong>Payment Terms:</strong> You agree to pay all fees associated with your selected tier.
              All payments are due in advance and are non-refundable except as specified in our Refund Policy.
            </p>

            <p>
              <strong>Intellectual Property:</strong> The service and its content remain the exclusive property of Anaweza.
              You retain rights to content you post, but grant us a license to use it in connection with the service.
            </p>

            <p>
              <strong>Termination:</strong> We may terminate your account without prior notice if you breach the Terms.
            </p>

            <p>
              For the complete Terms and Conditions, please visit our full Terms and Conditions page.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Policy Modal
  const PolicyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Pricing Policy</h2>
            <button
              onClick={() => setShowPolicyModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-gray-700 space-y-4">
            <p>
              <strong>Overview:</strong> At Anaweza, we provide fair and transparent pricing that aligns with our users' career levels.
              Our pricing structure is designed to be accessible to job seekers at all income levels.
            </p>

            <p>
              <strong>Job Seeker Registration Pricing:</strong> Our registration fees are scaled according to your target salary range:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Below 100,000 RWF:</strong> 2,000 RWF registration fee, 1,000 RWF annual renewal</li>
              <li><strong>100,000 - 199,000 RWF:</strong> 5,000 RWF registration fee, 2,500 RWF annual renewal</li>
              <li><strong>199,000 - 499,000 RWF:</strong> 10,000 RWF registration fee, 5,000 RWF annual renewal</li>
              <li><strong>500,000 RWF and Above:</strong> 20,000 RWF registration fee, 10,000 RWF annual renewal</li>
            </ul>

            <p>
              <strong>Payment Methods:</strong> We accept various payment methods including:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Mobile Money: 0795570541</li>
              <li>MOMO: 1592374</li>
            </ul>

            <p>
              For any questions regarding our pricing, please contact our support team at support@anaweza.com.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowPolicyModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {showTermsModal && <TermsModal />}
      {showPolicyModal && <PolicyModal />}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800">
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
                  <option value="ordinary_level">Ordinary Level</option>
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
                Salary Range (e.g., 1000 - 100000) *
              </label>
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="Enter your expected salary range in RWF (e.g., 1000 or 1000 - 2000)"
                className={`w-full px-3 text-gray-500 py-2 border ${errors.salary_range ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {renderError('salary_range')}

              {/* Registration Fee Information */}
              {registrationFee && (
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <AiOutlineInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-700">Registration Fee: {registrationFee.registrationFee}</p>
                      <p className="text-sm text-blue-600">Annual Renewal: {registrationFee.renewalFee}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your account will be activated after payment confirmation. Please pay using Mobile Money: 0795570541 or MOMO: 1592374
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

            {/* Terms and Conditions Checkbox */}
            <div className="mt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={() => setAcceptTerms(!acceptTerms)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Terms and Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Pricing Policy
                    </button>
                  </label>
                  {termsError && <p className="text-red-500 mt-1">{termsError}</p>}
                </div>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Profile...
                  </span>
                ) : (
                  "Create Profile"
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="sm:w-1/2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Exit
              </button>

            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsJobSeeker;