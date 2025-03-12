/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import loginImage from '../../assets/pictures/system/anaweza.jpg';
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^\S+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const getCsrfToken = () => {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith('csrftoken=')) {
        csrfToken = cookie.trim().split('=')[1];
        break;
      }
    }
    return csrfToken;
  };

  const validateFields = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address ending with @gmail.com.';
    }

    if (!validatePassword(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
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
      email: formData.email,
      new_password: formData.new_password
    };

    setLoading(true);
    const csrfToken = getCsrfToken();

    try {
      const response = await axios.post('https://anaweza-backend.up.railway.app/forget_password/', dataToSubmit, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.data.message === "Password reset successfully. A confirmation has been sent to your email.") {
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrors((prev) => ({
            ...prev,
            form: 'Email address not found.'
          }));
        } else if (error.response.data && error.response.data.error) {
          setErrors((prev) => ({
            ...prev,
            form: error.response.data.error
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            form: 'An error occurred. Please try again.'
          }));
        }
      } else if (error.request) {
        setErrors((prev) => ({
          ...prev,
          form: 'No response from server. Please check your connection.'
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'Error setting up the request. Please try again.'
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

    if (name === 'confirm_password') {
      if (value !== formData.new_password) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: 'Passwords do not match.',
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
          <h1 className="text-5xl font-bold text-white leading-tight">Reset Your <span className="text-blue-300">Password</span></h1>
          <p className="text-blue-100 text-xl max-w-md leading-relaxed">
            Secure your account with a new password and get back to exploring job opportunities tailored just for you.
          </p>
          
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl">
            <p className="text-white text-lg italic mb-4">
              "The security features on this platform give me peace of mind. I can focus on my job search knowing my information is safe."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-300 flex items-center justify-center text-blue-900 font-bold text-lg shadow-md">
                JN
              </div>
              <div className="ml-4">
                <p className="text-white font-medium">Jean Nyiraneza</p>
                <p className="text-blue-200 text-sm">Marketing Specialist</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm relative z-10">
          © 2025 Anaweza. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Reset password form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                <KeyIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Reset your password</h2>
            <p className="mt-3 text-gray-600">Enter your email and a new secure password</p>
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
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
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
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                <p className="mt-1 text-xs text-gray-500">We only accept emails ending with @gmail.com</p>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="Enter your new password"
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
                {errors.new_password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.new_password}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="Confirm your new password"
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
                {errors.confirm_password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirm_password}</p>}
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
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
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
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;