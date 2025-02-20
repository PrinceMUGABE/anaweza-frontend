/* eslint-disable no-unused-vars */
import React from 'react';

const CTASection = () => {
  return (
    <div className="py-16 bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-white mb-8 lg:mb-0">
            <h2 className="text-3xl font-bold mb-4">Ready to Take the Next Step?</h2>
            <p className="text-xl opacity-90">
              Join thousands of professionals finding their perfect career match every day
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Find Jobs
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Post a Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;