/* eslint-disable no-unused-vars */
import React from 'react';

const FeaturedSeekers = () => {
  // Dummy data for featured job seekers
  const featuredSeekers = [
    {
      id: 1,
      name: "John Kamau",
      title: "Software Engineer",
      experience: "5 years",
      skills: ["React", "Node.js", "Python", "AWS"],
      location: "Nairobi",
      avatar: "/api/placeholder/100/100",
      availability: "Immediate"
    },
    {
      id: 2,
      name: "Alice Wanjiku",
      title: "Civil Engineer",
      experience: "8 years",
      skills: ["Project Management", "AutoCAD", "Construction Planning"],
      location: "Mombasa",
      avatar: "/api/placeholder/100/100",
      availability: "2 weeks notice"
    },
    {
      id: 3,
      name: "David Omondi",
      title: "Accountant",
      experience: "4 years",
      skills: ["Financial Analysis", "Tax Planning", "QuickBooks"],
      location: "Kisumu",
      avatar: "/api/placeholder/100/100",
      availability: "Immediate"
    },
    {
      id: 4,
      name: "Sarah Njeri",
      title: "Professional Driver",
      experience: "10 years",
      skills: ["Commercial Driving", "Fleet Management", "Safety Protocols"],
      location: "Nakuru",
      avatar: "/api/placeholder/100/100",
      availability: "1 month notice"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">Featured Job Seekers</h2>
          <button className="text-blue-600 hover:text-blue-700">View All Candidates →</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSeekers.map((seeker) => (
            <div key={seeker.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                {/* <img
                  src={seeker.avatar}
                  alt={seeker.name}
                  className="w-24 h-24 rounded-full mb-4"
                /> */}
                <h3 className="font-semibold text-lg text-gray-950">{seeker.name}</h3>
                <p className="text-blue-600 ">{seeker.title}</p>
                <p className="text-gray-600 mt-2">{seeker.experience} experience</p>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{seeker.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {seeker.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Available: {seeker.availability}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSeekers;