/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeaturedSeekers = () => {
  // State for job seekers data
  const [featuredSeekers, setFeaturedSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modal
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch job seekers from API
  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await axios.get('https://anaweza-backend.up.railway.app/job_seeker/all/');
        // Filter only active job seekers
        const activeJobSeekers = response.data.filter(seeker => seeker.status === true);
        setFeaturedSeekers(activeJobSeekers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job seekers');
        setLoading(false);
        console.error('Error fetching job seekers:', err);
      }
    };
    
    fetchJobSeekers();
  }, []);
  
  // Open modal with selected job seeker details
  const openModal = (seeker) => {
    setSelectedSeeker(seeker);
    setIsModalOpen(true);
    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeeker(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };
  
  // Helper function to parse skills from string to array
  const parseSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim());
  };
  
  // Format full name
  const formatFullName = (seeker) => {
    if (seeker.middle_name) {
      return `${seeker.first_name} ${seeker.middle_name} ${seeker.last_name}`;
    }
    return `${seeker.first_name} ${seeker.last_name}`;
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p>Loading job seekers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Featured Job Seekers</h2>
          <button className="text-blue-600 hover:text-blue-700">View All Candidates →</button>
        </div>
        
        {featuredSeekers.length === 0 ? (
          <p className="text-center text-gray-600">No active job seekers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSeekers.map((seeker) => {
              const skills = parseSkills(seeker.skills);
              return (
                <div key={seeker.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    {seeker.resume && (
                      <div className="w-24 h-24 rounded-full mb-4 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-3xl">{seeker.first_name.charAt(0)}{seeker.last_name.charAt(0)}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-lg text-gray-950">{formatFullName(seeker)}</h3>
                    <p className="text-blue-600">{seeker.education_sector || seeker.education_level}</p>
                    <p className="text-gray-600 mt-2">{seeker.experience} years experience</p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{seeker.user?.location || "Location not specified"}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Salary: {seeker.salary_range}
                      </span>
                      <button 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => openModal(seeker)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {isModalOpen && selectedSeeker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-auto">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-gray-500 text-5xl">
                      {selectedSeeker.first_name.charAt(0)}{selectedSeeker.last_name.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-center">{formatFullName(selectedSeeker)}</h2>
                  <p className="text-blue-600 text-center">{selectedSeeker.education_sector || selectedSeeker.education_level}</p>
                  
                  <div className="mt-4 w-full">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Contact Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{selectedSeeker.user?.phone_number || "Phone not provided"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{selectedSeeker.user?.email || "Email not provided"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">Experience</h3>
                      <p className="text-gray-800">{selectedSeeker.experience} years</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">Education</h3>
                      <p className="text-gray-800">{selectedSeeker.education_level}</p>
                      {selectedSeeker.education_sector && (
                        <p className="text-gray-600">{selectedSeeker.education_sector}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">Gender</h3>
                      <p className="text-gray-800">{selectedSeeker.gender}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">Salary Expectation</h3>
                      <p className="text-gray-800">{selectedSeeker.salary_range}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {parseSkills(selectedSeeker.skills).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedSeeker.resume && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg mb-2">Resume</h3>
                      <a 
                        href={selectedSeeker.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Resume
                      </a>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-500">
                      Profile created: {new Date(selectedSeeker.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <div className="flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedSeekers;