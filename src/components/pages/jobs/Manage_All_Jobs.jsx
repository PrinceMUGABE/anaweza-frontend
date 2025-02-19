/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";


// Constants
const JOBS_PER_PAGE = 2;
const SLIDE_INTERVAL = 5000;
const API_URL = "http://localhost:8000/job_offer/offers/";

// Animation variants
const containerVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
  }),
  animate: {
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    }
  },
  exit: (direction) => ({
    x: direction > 0 ? -1000 : 1000,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    }
  })
};


// Remove the problematic import and add a custom Alert component
const CustomAlert = ({ children, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-start">
    <div className="flex items-center text-red-700">
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      {children}
    </div>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);



// Utility functions
const convertToList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return data.split('\n').filter(item => item.trim());
  return [];
};

// Sub-components
const JobCard = ({ job, onSelect }) => {
  const { t } = useTranslation();
  const statusColorMap = {
    active: 'text-green-500',
    closed: 'text-red-500',
    expired: 'text-gray-500',
    draft: 'text-yellow-500'
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
      <p className="text-gray-600 mb-2">{job.company_name || t("Individual Offer")}</p>
      <p className="text-gray-500 mb-2">📍 {job.location}</p>
      <p className="text-gray-500 mb-4">👨‍💼 {job.experience_level}</p>
      <p className={`${statusColorMap[job.status]} mb-4 font-medium`}>● {job.status}</p>
      <button
        onClick={() => onSelect(job)}
        className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {t("Explore")}
      </button>
    </motion.div>
  );
};

const ListSection = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
    <ul className="list-disc pl-6 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-gray-500">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const JobModal = ({ job, onClose }) => {
  const { t } = useTranslation();
  
  const statusColorMap = {
    active: 'text-green-700',
    closed: 'text-red-700',
    expired: 'text-gray-700',
    draft: 'text-yellow-700'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label={t("Company")} value={job.company_name || t("Individual Offer")} />
            <InfoItem label={t("Location")} value={job.location} />
            <InfoItem label={t("Experience Level")} value={job.experience_level} />
            <InfoItem label={t("Salary Range")} value={job.salary_range || t("Not specified")} />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">{t("Description")}</h3>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </div>
          
          <ListSection title={t("Requirements")} items={convertToList(job.requirements)} />
          <ListSection title={t("Responsibilities")} items={convertToList(job.responsibilities)} />
          
          {job.benefits && job.benefits.length > 0 && (
            <ListSection title={t("Benefits")} items={convertToList(job.benefits)} />
          )}
          
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-700">{t("Deadline")}</h3>
              <p className="text-gray-600">{new Date(job.deadline).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">{t("Status")}</h3>
              <p className={`${statusColorMap[job.status]} font-medium`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <p className="text-gray-700 font-semibold">{label}</p>
    <p className="text-gray-600">{value}</p>
  </div>
);

// Main component
const Manage_Jobs = () => {
  const { t } = useTranslation();
  const [jobOffers, setJobOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setJobOffers(response.data);
      setError(null);
    } catch (error) {
      setError(t("Failed to fetch job offers. Please try again later."));
      console.error("Error fetching job offers:", error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (jobOffers.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentPage((prev) => 
        (prev + 1) % Math.ceil(jobOffers.length / JOBS_PER_PAGE)
      );
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [jobOffers.length]);

  const currentJobs = useMemo(() => {
    const startIndex = currentPage * JOBS_PER_PAGE;
    return jobOffers.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [jobOffers, currentPage]);

  const pageCount = useMemo(() => 
    Math.ceil(jobOffers.length / JOBS_PER_PAGE),
    [jobOffers.length]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Replace the error section in the Hero component with:
if (error) {
  return (
    <div className="container mx-auto px-4 py-8">
      <CustomAlert onRetry={fetchJobs}>
        {error}
      </CustomAlert>
    </div>
  );
}

  return (
    <div className="container mx-auto px-4 py-8">


      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSelect={setSelectedJob}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentPage ? 1 : -1);
              setCurrentPage(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentPage === index ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedJob && (
          <JobModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Manage_Jobs;