/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { useTranslation } from "react-i18next";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);
  const {t} = useTranslation();

  // Fetch categories and job types on component mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesRes, typesRes] = await Promise.all([
          axios.get('https://anaweza-backend.up.railway.app/category/categories/'),
          axios.get('https://anaweza-backend.up.railway.app/category/types/')
        ]);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Failed to load filters. Please try again later.');
      }
    };

    fetchFiltersData();
  }, []);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (location) params.append('location', location);
      if (category) params.append('category', category);
      if (jobType) params.append('type', jobType);
      
      // Only search for active jobs
      params.append('status', 'active');

      const response = await axios.get(`https://anaweza-backend.up.railway.app/job_offer/offers/?${params.toString()}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLocation('');
    setCategory('');
    setJobType('');
    setSearchResults([]);
    setShowResults(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gray-50 py-6 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">{t("Find Your Perfect Opportunity")}</h2>
        <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Job title or keywords"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <select
                className="w-full px-4 py-3 rounded-lg text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{t("All Categories")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                className="w-full px-4 py-3 rounded-lg text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">{t("All Job Types")}</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {showResults && (
          <div 
            ref={resultsRef}
            className="max-w-6xl mx-auto mt-4 bg-white rounded-lg shadow-lg overflow-hidden z-20 relative"
          >
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {searchResults.length} {searchResults.length === 1 ? 'Job' : 'Jobs'} Found
              </h3>
              <button 
                onClick={clearSearch} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="p-4 text-red-600 bg-red-50 text-center">
                {error}
              </div>
            )}
            
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t("No job matches your search criteria. Try different keywords or filters.")}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((job) => (
                    <li key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <a 
                        href={`/jobs/${job.id}`}
                        className="block"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-blue-600 mb-1">{job.title}</h4>
                            <div className="text-sm text-gray-600 mb-2">
                              {job.company_name && (
                                <span className="mr-3">{job.company_name}</span>
                              )}
                              {job.location && (
                                <span className="flex items-center text-gray-500 text-sm mt-1">
                                  <MapPin size={14} className="mr-1" />
                                  {job.location}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {job.job_type && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Briefcase size={12} className="mr-1" />
                                  {job.job_type.name}
                                </span>
                              )}
                              {job.job_category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {job.job_category.name}
                                </span>
                              )}
                              {job.experience_level && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} Level
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {job.salary_range && (
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {job.salary_range}
                              </div>
                            )}
                            {job.deadline && (
                              <div className="text-xs text-gray-500">
                                Deadline: {formatDate(job.deadline)}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="p-4 bg-gray-50 border-t text-center">
                <a 
                  href="/jobs" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t("View All Jobs")}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;