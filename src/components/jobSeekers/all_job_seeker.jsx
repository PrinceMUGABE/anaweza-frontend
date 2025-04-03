/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { useTranslation } from "react-i18next";

const All_Job_Seekers = () => {
  // State for job seekers data
  const [featuredSeekers, setFeaturedSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modal
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const {t} = useTranslation();
  
  // Fetch job seekers from API
  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await axios.get('https://anaweza-backend.up.railway.app/job_seeker/all/');
        // Filter only active job seekers
        const activeJobSeekers = response.data.filter(seeker => seeker.status === true);
        
        setFeaturedSeekers(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job seekers');
        setLoading(false);
        console.error('Error fetching job seekers:', err);
      }
    };
    
    fetchJobSeekers();
  }, [itemsPerPage]);
  
  // Update total pages when itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(featuredSeekers.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when items per page changes
  }, [featuredSeekers.length, itemsPerPage]);
  
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

  // Get initials for the avatar
  const getInitials = (seeker) => {
    return `${seeker.first_name.charAt(0)}${seeker.last_name.charAt(0)}`;
  };
  
  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = featuredSeekers.slice(indexOfFirstItem, indexOfLastItem);
  
  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const pages = [];
    
    // Add previous button
    pages.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
      >
        &laquo;
      </button>
    );
    
    // Logic for displaying page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          {totalPages}
        </button>
      );
    }
    
    // Add next button
    pages.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
      >
        &raquo;
      </button>
    );
    
    return pages;
  };

  return (
    <div className="py-16 bg-gray-50">
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl text-center font-bold text-blue-800">{t("Job Seekers")}</h2>

        {/* Display filters and counts */}
        <div className="flex flex-col md:flex-row justify-between items-center my-6">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              Showing {featuredSeekers.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, featuredSeekers.length)} of {featuredSeekers.length} job seekers
            </p>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="mr-2 text-gray-600">{t("Show:")}</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded text-gray-500 px-3 py-1 bg-white"
            >
              <option value={9}>9</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center">
            <p className='text-gray-700'>{t("Loading job seekers...")}</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : featuredSeekers.length === 0 ? (
          <p className="text-center text-gray-600">{t("No active job seekers found.")}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((seeker) => {
                const skills = parseSkills(seeker.skills);
                return (
                  <div key={seeker.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      {/* Profile picture or initials */}
                      <div className="w-24 h-24 rounded-full mb-4 overflow-hidden">
                        {seeker.custom_user?.profile_picture ? (
                          <img 
                            src={seeker.custom_user.profile_picture} 
                            alt={formatFullName(seeker)}
                            className="w-full text-gray-900 h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-3xl">{getInitials(seeker)}</span>
                          </div>
                        )}
                      </div>
                      
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
                          {t("Salary")}: {seeker.salary_range}
                        </span>
                        <button 
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => openModal(seeker)}
                        >
                          {t("View Profile")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex flex-wrap">{renderPaginationButtons()}</div>
              </div>
            )}
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
                  <p className="text-gray-900 text-center">{t("Education")}: <span className='text-blue-700'>{selectedSeeker.education_sector || selectedSeeker.education_level}</span></p>
                  
                  <div className="mt-4 w-full">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg text-blue-700 font-semibold mb-2">{t("Contact Info")}</h3>
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

                        <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">{t("Location")}</h3>
                      <p className="text-gray-800">{selectedSeeker.district || "N/A"} - {selectedSeeker.sector || "N/A"}</p>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">{t("Experience")}</h3>
                      <p className="text-gray-800">{selectedSeeker.experience} years</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">{t("Education")}</h3>
                      <p className="text-gray-800">{selectedSeeker.education_level}</p>
                      {selectedSeeker.education_sector && (
                        <p className="text-gray-600">{selectedSeeker.education_sector}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">{t("Gender")}</h3>
                      <p className="text-gray-800">{selectedSeeker.gender}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700">{t("Salary Expectation")}</h3>
                      <p className="text-gray-800">{selectedSeeker.salary_range}</p>
                    </div>
                    
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2 text-gray-700">{t("Skills")}</h3>
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
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default All_Job_Seekers;