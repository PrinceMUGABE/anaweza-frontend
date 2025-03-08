/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Employer_Job_Seekers = () => {
  // State for job seekers data
  const [jobSeekers, setJobSeekers] = useState([]);
  const [filteredSeekers, setFilteredSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalSeekers: 0,
    maleSeekers: 0,
    femaleSeekers: 0,
    avgExperience: 0,
    higherEducation: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    educationLevel: '',
    gender: '',
    experienceYears: '',
    searchQuery: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [seekersPerPage] = useState(8);
  
  // Modal state
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch job seekers from API
  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await axios.get('https://anaweza-backend.up.railway.app/job_seeker/all/');
        // Filter only active job seekers
        const activeJobSeekers = response.data.filter(seeker => seeker.status === true);
        setJobSeekers(activeJobSeekers);
        setFilteredSeekers(activeJobSeekers);
        calculateStats(activeJobSeekers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job seekers');
        setLoading(false);
        console.error('Error fetching job seekers:', err);
      }
    };
    
    fetchJobSeekers();
  }, []);
  
  // Calculate statistics from job seekers data
  const calculateStats = (seekers) => {
    const maleCount = seekers.filter(seeker => seeker.gender?.toLowerCase() === 'male').length;
    const femaleCount = seekers.filter(seeker => seeker.gender?.toLowerCase() === 'female').length;
    const totalExperience = seekers.reduce((sum, seeker) => sum + (parseFloat(seeker.experience) || 0), 0);
    const avgExp = seekers.length > 0 ? (totalExperience / seekers.length).toFixed(1) : 0;
    const higherEduCount = seekers.filter(seeker => 
      seeker.education_level?.toLowerCase().includes('bachelor') || 
      seeker.education_level?.toLowerCase().includes('master') || 
      seeker.education_level?.toLowerCase().includes('phd')
    ).length;
    
    setStats({
      totalSeekers: seekers.length,
      maleSeekers: maleCount,
      femaleSeekers: femaleCount,
      avgExperience: avgExp,
      higherEducation: higherEduCount
    });
  };
  
  // Apply filters
  useEffect(() => {
    let result = jobSeekers;
    
    // Apply education level filter
    if (filters.educationLevel) {
      result = result.filter(seeker => 
        seeker.education_level?.toLowerCase().includes(filters.educationLevel.toLowerCase())
      );
    }
    
    // Apply gender filter
    if (filters.gender) {
      result = result.filter(seeker => 
        seeker.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    // Apply experience filter
    if (filters.experienceYears) {
      const expYears = parseInt(filters.experienceYears);
      result = result.filter(seeker => {
        const seekerExp = parseInt(seeker.experience) || 0;
        return seekerExp >= expYears;
      });
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(seeker => 
        `${seeker.first_name} ${seeker.middle_name || ''} ${seeker.last_name}`.toLowerCase().includes(query) ||
        seeker.skills?.toLowerCase().includes(query) ||
        seeker.education_level?.toLowerCase().includes(query) ||
        seeker.education_sector?.toLowerCase().includes(query)
      );
    }
    
    setFilteredSeekers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, jobSeekers]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search
  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      educationLevel: '',
      gender: '',
      experienceYears: '',
      searchQuery: ''
    });
  };
  
  // Modal functions
  const openModal = (seeker) => {
    setSelectedSeeker(seeker);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeeker(null);
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

  // Get initials for the avatar
  const getInitials = (seeker) => {
    return `${seeker.first_name.charAt(0)}${seeker.last_name.charAt(0)}`;
  };
  
  // Pagination logic
  const indexOfLastSeeker = currentPage * seekersPerPage;
  const indexOfFirstSeeker = indexOfLastSeeker - seekersPerPage;
  const currentSeekers = filteredSeekers.slice(indexOfFirstSeeker, indexOfLastSeeker);
  const totalPages = Math.ceil(filteredSeekers.length / seekersPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev);
  const prevPage = () => setCurrentPage(prev => prev > 1 ? prev - 1 : prev);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className='text-gray-700'>Loading job seekers...</p>
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
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Job Seekers</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalSeekers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Male</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.maleSeekers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Female</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.femaleSeekers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Experience</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.avgExperience} yrs</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Higher Education</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.higherEducation}</p>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-blue-800">Job Seekers</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  name="searchQuery"
                  value={filters.searchQuery}
                  onChange={handleSearch}
                  placeholder="Search job seekers..."
                  className="px-4 py-2 text-gray-500 border rounded-lg w-full"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <select
                name="educationLevel"
                value={filters.educationLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-gray-500 border rounded-lg"
              >
                <option value="">All Education Levels</option>
                <option value="high school">High School</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full px-3 text-gray-500 py-2 border rounded-lg"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Experience</label>
              <select
                name="experienceYears"
                value={filters.experienceYears}
                onChange={handleFilterChange}
                className="w-full px-3 text-gray-500 py-2 border rounded-lg"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="2">2+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        {filteredSeekers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600">No job seekers match your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {currentSeekers.map((seeker) => {
                const skills = parseSkills(seeker.skills);
                return (
                  <div key={seeker.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        {/* Profile picture or initials */}
                        <div className="w-20 h-20 rounded-full mb-3 overflow-hidden">
                          {seeker.custom_user?.profile_picture ? (
                            <img 
                              src={seeker.custom_user.profile_picture} 
                              alt={formatFullName(seeker)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-2xl">{getInitials(seeker)}</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg text-gray-900">{formatFullName(seeker)}</h3>
                        <p className="text-blue-600">{seeker.education_sector || seeker.education_level}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">{seeker.experience} years experience</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600">{seeker.user?.location || "Location not specified"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">
                            Salary: {seeker.salary_range}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
                      <button 
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => openModal(seeker)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstSeeker + 1} to {Math.min(indexOfLastSeeker, filteredSeekers.length)} of {filteredSeekers.length} job seekers
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
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
                  {/* Profile picture or initials in modal */}
                  <div className="w-32 h-32 rounded-full mb-4 overflow-hidden">
                    {selectedSeeker.custom_user?.profile_picture ? (
                      <img 
                        src={selectedSeeker.custom_user.profile_picture} 
                        alt={formatFullName(selectedSeeker)}
                        className="w-full h-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-5xl">{getInitials(selectedSeeker)}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-center">{formatFullName(selectedSeeker)}</h2>
                  <p className="text-blue-600 text-center">{selectedSeeker.education_sector || selectedSeeker.education_level}</p>
                  
                  <div className="mt-4 w-full">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg text-blue-700 font-semibold mb-2">Contact Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className='text-gray-700'>{selectedSeeker.custom_user?.phone_number || "Phone not provided"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className='text-gray-700'>{selectedSeeker.custom_user?.email || "Email not provided"}</span>
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
                    <h3 className="font-semibold text-lg mb-2 text-gray-700">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {parseSkills(selectedSeeker.skills).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* {selectedSeeker.resume && (
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
                  )} */}
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

export default Employer_Job_Seekers;