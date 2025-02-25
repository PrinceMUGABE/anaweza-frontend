/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeaturedJobs = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        // Fetch active job offers from the API
        const response = await axios.get('https://anaweza-backend.up.railway.app/job_offer/offers/');
        
        // Filter for active jobs and limit to 4 recent jobs
        const activeJobs = response.data
          .filter(job => job.status === 'active')
          .slice(0, 4);
          
        setFeaturedJobs(activeJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

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
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Featured Jobs</h2>
          <a href="/jobs" className="text-blue-600 hover:text-blue-700">View All Jobs →</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* <img
                  src="/api/placeholder/50/50"
                  alt={`${job.company_name || 'Company'} logo`}
                  className="w-12 h-12 rounded"
                /> */}
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
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
                {/* <img
                  src="/api/placeholder/80/80"
                  alt={`${selectedJob.company_name || 'Company'} logo`}
                  className="w-16 h-16 rounded"
                /> */}
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

              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-500">
                    <p>Application Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors w-full sm:w-auto"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedJobs;