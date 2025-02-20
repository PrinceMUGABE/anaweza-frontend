/* eslint-disable no-unused-vars */
import React from 'react';

const FeaturedJobs = () => {
  // Dummy data for featured jobs
  const featuredJobs = [
    {
      id: 1,
      title: "Senior Software Developer",
      company: "Tech Solutions Ltd",
      location: "Nairobi, Kenya",
      salary: "KSH 150,000 - 200,000",
      type: "Full-time",
      category: "Information Technology",
      logo: "/api/placeholder/50/50"
    },
    {
      id: 2,
      title: "Construction Site Manager",
      company: "BuildWell Construction",
      location: "Mombasa, Kenya",
      salary: "KSH 100,000 - 130,000",
      type: "Full-time",
      category: "Construction",
      logo: "/api/placeholder/50/50"
    },
    {
      id: 3,
      title: "Senior Accountant",
      company: "Financial Solutions",
      location: "Nairobi, Kenya",
      salary: "KSH 80,000 - 120,000",
      type: "Full-time",
      category: "Accounting",
      logo: "/api/placeholder/50/50"
    },
    {
      id: 4,
      title: "Professional Driver",
      company: "Logistics Pro",
      location: "Kisumu, Kenya",
      salary: "KSH 45,000 - 60,000",
      type: "Full-time",
      category: "Driving",
      logo: "/api/placeholder/50/50"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Featured Jobs</h2>
          <button className="text-blue-600 hover:text-blue-700">View All Jobs →</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
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
                  <span className="text-gray-600">{job.salary}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  {job.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {job.category}
                </span>
              </div>
              
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedJobs;