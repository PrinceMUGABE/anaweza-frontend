/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { UserIcon, ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import loginImage from "../../assets/pictures/system/anaweza.jpg";

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
          status: res.data.status,
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
          <h1 className="text-5xl font-bold text-white leading-tight">Welcome <span className="text-blue-300">Back</span></h1>
          <p className="text-blue-100 text-xl max-w-md leading-relaxed">
            Access your account to discover job opportunities tailored just for you.
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
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Sign in to your account</h2>
            <p className="mt-3 text-gray-600">Enter your credentials to access the system</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700">
                  Email or Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700"
                    placeholder="name@gmail.com or 0781234567"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">We only accept emails ending with @gmail.com</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link to="/passwordreset" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
                disabled={isLoading}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                </span>
                {isLoading ? (
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
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
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
            
            {/* <div className="text-sm">
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                Don't have an account?
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;