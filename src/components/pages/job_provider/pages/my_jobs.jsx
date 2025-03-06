/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

const Employer_Manage_Jobs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', type: '', search: '' });
  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData")) || {}, []);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const token = localStorage.getItem("token");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const itemsPerPageOptions = [6, 10, 30, 50, 100];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, categoriesRes, typesRes] = await Promise.all([
          axios.get('https://anaweza-backend.up.railway.app/job_offer/offers/'),
          axios.get('https://anaweza-backend.up.railway.app/category/categories/'),
          axios.get('https://anaweza-backend.up.railway.app/category/types/')
        ]);
        setJobs(jobsRes.data);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setError(null);
      } catch (err) {
        setError(t('Failed to fetch data. Please try again.'));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

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
  const handleApply = async (jobId, status) => {
    // Prevent application if job is closed
    if (status === 'closed') {
      setApplicationStatus({
        type: 'error',
        message: 'This job is no longer accepting applications.'
      });
      return;
    }

    if (!token) {
      // Redirect to login page if user is not logged in
      navigate('/employer/register_as_job_seeker');
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
        { job_offer_id: jobId },
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
    setApplicationStatus(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle click outside modal to close it
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || job.status === filters.status;
    const matchesCategory = !filters.category || String(job.job_category?.id) === String(filters.category);
    const matchesType = !filters.type || String(job.job_type?.id) === String(filters.type);

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to first page
  const goToFirstPage = () => setCurrentPage(1);
  
  // Go to last page
  const goToLastPage = () => setCurrentPage(totalPages);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
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

  if (jobs.length === 0) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-center font-bold text-blue-800 mb-4">All Jobs</h2>
          <p className="text-gray-600">No job listings available at the moment. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white" id='jobs'>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">All Jobs</h2>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('Search jobs...')}
                className="pl-10 w-full text-gray-700 rounded-lg border border-gray-300 p-2"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-lg text-gray-700 border border-gray-300 p-2"
            >
              <option value="">{t('All Statuses')}</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-lg text-gray-700 border border-gray-300 p-2"
            >
              <option value="">{t('All Categories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-lg text-gray-700 border border-gray-300 p-2"
            >
              <option value="">{t('All Types')}</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            {/* Items Per Page Filter */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded-lg text-gray-700 border border-gray-300 p-2"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option} {t('per page')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((job) => (
            <div key={job.id} className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${job.status === 'closed' ? 'border-gray-300 bg-gray-50' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-700">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {job.status}
                </span>
              </div>
              
              <p className="text-gray-600">{job.company_name || job.offer_type}</p>

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
              </div>

              <div className="mt-3 text-gray-500">
                <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => openJobDetails(job)}
                className={`mt-4 block w-full py-2 rounded text-center transition-colors ${
                  job.status === 'closed' 
                    ? 'bg-gray-400 text-white cursor-pointer hover:bg-gray-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Explore
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-between items-center mt-8 border-t pt-6">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredJobs.length)} of {filteredJobs.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronsLeft size={20} />
              </button>
              
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                  {currentPage}
                </span>
                <span className="mx-2 text-gray-500">
                  of {totalPages}
                </span>
              </div>
              
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronRight size={20} />
              </button>
              
              <button 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        )}
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
              <div className="flex items-start justify-between gap-4 pb-4">
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
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedJob.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedJob.status}
                </span>
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

              <div className="text-gray-500 mt-4">
                <p>Number of Employees: <span className='text-blue-700'>{(selectedJob.employees_needed)}</span></p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-500">
                    <p>Application Deadline: <span className='text-red-700'>{new Date(selectedJob.deadline).toLocaleDateString()}</span> </p>
                  </div>
                  <button
                    onClick={() => handleApply(selectedJob.id, selectedJob.status)}
                    className={`px-6 py-3 font-medium rounded transition-colors w-full sm:w-auto ${
                      selectedJob.status === 'closed'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-700 text-white hover:bg-blue-800'
                    }`}
                    disabled={applying || selectedJob.status === 'closed'}
                  >
                    {applying ? "Processing..." : selectedJob.status === 'closed' ? "Applications Closed" : "Apply Now"}
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

export default Employer_Manage_Jobs;