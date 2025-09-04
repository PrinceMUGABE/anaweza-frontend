/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLoading3Quarters, AiOutlineArrowLeft } from 'react-icons/ai';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Choose Role',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    // Phone validation (10 digits starting with specific prefixes)
    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    // Email validation (ONLY required if role is "admin")
    if (formData.role === 'admin' && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is required for Admin and must be valid.';
    }

    // Role validation
    if (formData.role === 'Choose Role') {
      newErrors.role = 'You must select a role.';
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
      role: formData.role,
      is_admin_creating: true,
    };

    // Include email only if it's provided (optional for non-admin roles)
    if (formData.email) {
      dataToSubmit.email = formData.email;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://anaweza-backend.up.railway.app/register/',
        dataToSubmit,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => navigate('/admin/users'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};

        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
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

    if (name === "role" && value !== "admin") {
      setFormData((prev) => ({ ...prev, email: "" })); // Clear email if role is not admin
      setErrors((prev) => ({ ...prev, email: "" })); // Clear email error if role changes
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <AiOutlineArrowLeft className="mr-2" />
            Back to Users
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Create New User</h2>
            <p className="text-gray-600 mt-1">Fill in the details to register a new user</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <p className="text-red-600">{errors.form}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <p className="text-green-600">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
                <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 text-gray-700 block w-full rounded-md border ${errors.phone ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g. 0781234567"
                required
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email {formData.role === 'admin' && <span className="text-red-500">*</span>}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g. user@example.com"
                required={formData.role === "admin"}
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              {formData.role !== 'admin' && (
                <p className="mt-1 text-sm text-gray-500">Optional for non-admin roles</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
                <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full rounded-md border ${errors.role ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                required
                disabled={loading}
              >
                <option value="Choose Role" disabled>Select a role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="job_offer">Job Provider</option>
                <option value="job_seeker">Job Seeker</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;