/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData")) || {}, []);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        // Fetch active job offers from the API
        const response = await axios.get('https://anaweza-backend.up.railway.app/job_offer/offers/', {
          // timeout: 50000 // Add timeout to prevent hanging requests
        });

        // Filter for active jobs and limit to 4 recent jobs
        const activeJobs = response.data
          .filter(job => job.status === 'active')
          .slice(0, 4);

        setFeaturedJobs(activeJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);

        // More detailed error message based on the type of error
        if (err.response) {
          // The server responded with a status code outside the 2xx range
          setError(`Server error: ${err.response.status} - ${err.response.data.error || 'No jobs available at the moment'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('Could not connect to the server. Please check your internet connection.');
        } else {
          // Something happened in setting up the request
          setError('Could not find jobs. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

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

  // Handle job application
  const handleApply = async (jobId) => {
    if (!token) {
      // Redirect to login page if user is not logged in
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      // Get user ID from token
      const userId = JSON.parse(atob(token.split('.')[1])).user_id;

      // Check if user is registered as job seeker
      const isRegistered = await checkJobSeekerRegistration(userId);

      if (!isRegistered) {
        setApplicationStatus({
          type: 'error',
          message: 'You must complete your profile before applying.'
        });
        setApplying(false);
        return;
      }

      // Submit application with the correct field name
      console.log(`Submitting application for job ID: ${jobId}`);
      const response = await axios.post(
        'https://anaweza-backend.up.railway.app/application/create/',
        { job_offer_id: jobId },  // Use 'job_offer' instead of 'job_offer_id'
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Application response:", response.data);
      setApplicationStatus({
        type: 'success',
        message: 'Your application has been submitted successfully!'
      });
    } catch (error) {
      // Error handling code remains the same
      console.error('Error applying for job:', error);

      let errorMessage = 'Failed to submit application. Please try again.';

      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);

        if (error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (typeof error.response.data === 'object') {
            const errorFields = Object.keys(error.response.data);
            if (errorFields.length > 0) {
              const firstErrorField = errorFields[0];
              const fieldError = error.response.data[firstErrorField];

              if (Array.isArray(fieldError) && fieldError.length > 0) {
                errorMessage = `${firstErrorField}: ${fieldError[0]}`;
              } else if (typeof fieldError === 'string') {
                errorMessage = `${firstErrorField}: ${fieldError}`;
              }
            }
          }
        }

        console.error(`HTTP Error ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = `Error setting up request: ${error.message}`;
      }

      setApplicationStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setApplying(false);
    }
  };

  // Format salary range for display
  const formatSalary = (salaryRange) => {
    return salaryRange || 'Salary not specified';
  };

  // Open modal with job details
  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle click outside modal to close it
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  // Handle view all jobs click
  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading featured jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (featuredJobs.length === 0) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">Featured Jobs</h2>
          <p className="text-gray-600">No job listings available at the moment. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white" id='jobs'>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Featured Jobs</h2>
          <button
            onClick={handleViewAllJobs}
            className="text-blue-600 hover:text-blue-700"
          >
            View All Jobs →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-700">{job.title}</h3>
                  <p className="text-gray-600">{job.company_name || job.offer_type}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{job.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{formatSalary(job.salary_range)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.job_type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {job.job_type.name}
                  </span>
                )}
                {job.job_category && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {job.job_category.name}
                  </span>
                )}
                <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">
                  {job.experience_level}
                </span>



                <div className="text-gray-500">
                  <p>Application Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => openJobDetails(job)}
                className="mt-4 block w-full bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition-colors"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4"
          onClick={handleOutsideClick}
        >
          <div className="bg-white rounded-lg w-full max-w-3xl overflow-auto mx-auto my-4 relative" style={{ maxHeight: '90vh' }}>
            {/* Close Button */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Job Details Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <p className="text-xl text-gray-600">{selectedJob.company_name || selectedJob.offer_type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{selectedJob.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-t">
                <div>
                  <h3 className="font-medium text-gray-500">Salary</h3>
                  <p className="text-gray-900 font-semibold">{formatSalary(selectedJob.salary_range)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Job Type</h3>
                  <p className="text-gray-900 font-semibold">{selectedJob.job_type?.name || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Experience</h3>
                  <p className="text-gray-900 font-semibold">{selectedJob.experience_level}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.responsibilities.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.requirements?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.requirements.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.benefits?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.benefits.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-gray-500">
                <p>Number of Employees: <span className='text-blue-700'>{(selectedJob.employees_needed)}</span></p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-500">
                    <p>Application Deadline: <span className='text-red-700'>{new Date(selectedJob.deadline).toLocaleDateString()}</span> </p>
                  </div>
                  <button
                    onClick={() => handleApply(selectedJob.id)}
                    className="px-6 py-3 bg-blue-700 text-white font-medium rounded hover:bg-gray-900 transition-colors w-full sm:w-auto"
                    disabled={applying}
                  >
                    {applying ? "Processing..." : "Apply Now"}
                  </button>
                </div>

                {applicationStatus && (
                  <div className={`mt-4 p-3 rounded ${applicationStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {applicationStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedJobs;