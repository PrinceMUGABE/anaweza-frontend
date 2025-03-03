/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { UserPlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import loginImage from '../../assets/pictures/system/anaweza.jpg';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract role from location state
  useEffect(() => {
    if (location.state?.role) {
      setFormData(prev => ({ ...prev, role: location.state.role }));
    }
  }, [location]);

  const validateFields = () => {
    const newErrors = {};

    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    // Email validation only if provided
    if (formData.email && !/^\S+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address ending with @gmail.com.';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role
    };

    // Add email to payload only if it's provided
    if (formData.email) {
      dataToSubmit.email = formData.email;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://anaweza-backend.up.railway.app/register/', dataToSubmit);

      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};

        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
        }
        if (backendErrors.password) {
          errorMessages.password = backendErrors.password;
        }
        if (backendErrors.email) {
          errorMessages.email = backendErrors.email;
        }

        setErrors((prev) => ({
          ...prev,
          ...errorMessages,
          form: backendErrors.error || 'An error occurred. Please try again.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.',
        }));
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-800 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full bg-blue-400"></div>
          <div className="absolute top-1/3 right-10 w-20 h-20 rounded-full bg-indigo-300"></div>
        </div>
        
        <div className="relative z-10">
          <img src={loginImage} alt="Logo" className="h-14 w-auto" />
        </div>
        
        <div className="space-y-8 relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight">Create Your <span className="text-blue-300">Account</span></h1>
          <p className="text-blue-100 text-xl max-w-md leading-relaxed">
            Join our platform and discover job opportunities tailored just for you.
          </p>
          
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl">
            <p className="text-white text-lg italic mb-4">
              "This platform helped me find my dream job within weeks. The personalized matching system is revolutionary!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-300 flex items-center justify-center text-blue-900 font-bold text-lg shadow-md">
                PM
              </div>
              <div className="ml-4">
                <p className="text-white font-medium">Prince Mugabe</p>
                <p className="text-blue-200 text-sm">Software Developer</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm relative z-10">
          © 2025 Anaweza. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                <UserPlusIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create a new account</h2>
            <p className="mt-3 text-gray-600">Fill in your details to join Anaweza</p>
          </div>
          
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{errors.form}</p>
                </div>
              </div>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Hidden Role Field */}
              <input type="hidden" name="role" value={formData.role} />
              
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="0781234567"
                    required
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
                <p className="mt-1 text-xs text-gray-500">Must be 10 digits starting with 078, 079, 072, or 073</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email <span className="text-gray-400 text-xs font-normal">(Optional but recommended)</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="name@gmail.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                <p className="mt-1 text-xs text-gray-500">We only accept emails ending with @gmail.com</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="Confirm your password"
                    required
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm">
              <Link to="/" className="flex items-center font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back to home
              </Link>
            </div>
            
            <div className="text-sm">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;