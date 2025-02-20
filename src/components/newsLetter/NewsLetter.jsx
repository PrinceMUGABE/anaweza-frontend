/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-800">Stay Updated</h2>
          <p className="text-xl text-gray-600 mb-8">
            Get the latest job opportunities and career tips delivered to your inbox
          </p>

          <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-500 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Subscribe
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;