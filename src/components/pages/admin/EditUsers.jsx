/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";

const EditUser = () => {
  const { id } = useParams();
  const [data, setData] = useState({
    phone_number: "",
    email: "",
    role: "",
    status: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    axios
      .get(`https://anaweza-backend.up.railway.app/user/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          const userData = {
            ...res.data,
            status: Boolean(res.data.status),
          };
          setData(userData);
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setErrorMessage(err.response?.data?.message || "Error fetching user data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return;
    }
    
    const updatedData = {
      ...data,
      status: Boolean(data.status)
    };
  
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    axios
      .put(`https://anaweza-backend.up.railway.app/update/${id}/`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setSuccessMessage("User updated successfully! Redirecting...");
          setTimeout(() => navigate("/admin/users"), 2000);
        }
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        const backendMessage = err.response?.data?.message || 
                              err.response?.data?.detail || 
                              "Error updating user. Please try again.";
        setErrorMessage(backendMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Users
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Edit User</h2>
            <p className="text-gray-600 mt-1">Update the user details below</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <p className="text-red-600">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
                <span className="text-red-500">*</span>
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                value={data.phone_number || ""}
                onChange={handleChange}
                required
                className={`mt-1 block w-full text-gray-700 rounded-md border ${errorMessage?.includes('phone') ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g. 0781234567"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={data.email || ""}
                onChange={handleChange}
                className={`mt-1 block text-gray-700 w-full rounded-md border ${errorMessage?.includes('email') ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g. user@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
                <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={data.role || ""}
                onChange={handleChange}
                required
                className={`mt-1 block text-gray-700 w-full rounded-md border ${errorMessage?.includes('role') ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                disabled={loading}
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="job_offer">Job Provider</option>
                <option value="job_seeker">Job Seeker</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
                <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={data.status.toString()}
                onChange={(e) => {
                  const boolValue = e.target.value === "true";
                  setData({ ...data, status: boolValue });
                }}
                className={`mt-1 block text-gray-700 w-full rounded-md border ${errorMessage?.includes('status') ? 'border-red-300' : 'border-gray-300'} p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                disabled={loading}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;