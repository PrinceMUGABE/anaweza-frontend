/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    'All Categories',
    'Information Technology',
    'Construction',
    'Accounting',
    'Teaching',
    'Driving',
    'Healthcare',
    'Sales',
    'Administrative'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching:', { searchTerm, location, category });
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">Find Your Perfect Opportunity</h2>
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Job title or keywords"
                className="w-full px-4 py-3 rounded-lg text-gray-500 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Location"
                className="w-full px-4 py-3 rounded-lg text-gray-500 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <select
                className="w-full px-4 text-gray-500 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;