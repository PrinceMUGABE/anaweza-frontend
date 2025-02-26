/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import loginImage from "../../assets/pictures/system/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (input) => /^[a-zA-Z0-9._-]+@gmail\.com$/i.test(input);
  const validatePhone = (input) => /^[0-9]{10}$/.test(input);

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar && password.length >= 8;
  };

  const checkJobSeekerRegistration = async (userId) => {
    try {
      console.log("Making request to:", `https://anaweza-backend.up.railway.app/job_seeker/by-user/${userId}/`);
      const response = await axios.get(
        `https://anaweza-backend.up.railway.app/job_seeker/by-user/${userId}/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log("Response:", response);
      return response.status === 200;
    } catch (error) {
      console.error("Error checking registration:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const isEmail = validateEmail(identifier);
    const isPhone = validatePhone(identifier);

    if (!isEmail && !isPhone) {
      setError("Please enter a valid email ending with @gmail.com or a valid phone number.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "https://anaweza-backend.up.railway.app/login/",
        { identifier, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setIsLoading(false);

      if (res.data) {
        console.log("Found User Data: ", res.data);
        const user = {
          id: res.data.id,
          role: res.data.role,
          email: res.data.email,
          phone_number: res.data.phone_number,
          created_at: res.data.created_at,
          refresh_token: res.data.token.refresh,
          access_token: res.data.token.access,
          profile_picture: res.data.profile_picture
        };

        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("token", res.data.token.access);

        const role = user.role.trim().toLowerCase();

        if (role === "admin") navigate("/admin");
        else if (role === "job_seeker") {
          const isRegistered = await checkJobSeekerRegistration(user.id);
          navigate(isRegistered ? "/job_seeker" : "/registerAsJobSeeker");
        } else if (role === "job_offer") navigate("/employer");
        
        else {
          console.log("Unknown user role. Please contact support.");
        }
      } else {
        console.log("No data received from the API.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      
      // More detailed error handling
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
        
        if (error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError(`Server error (${error.response.status}): Please try again later.`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection.");
      } else {
        // Something else caused the error
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${loginImage})` }}></div>

      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-90 rounded-lg shadow-lg p-8 z-10">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Login to Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access the system.</p>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Email (ending with @gmail.com) or Phone Number
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              required
            />
          </div>

          <Link to="/passwordreset" className="text-sm text-blue-700 hover:text-black text-end">
            Forgot your password?
          </Link>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block text-gray-700 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="text-start">
          <Link to="/" className="text-sm text-blue-700 hover:text-black">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;