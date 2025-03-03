/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted !== 'true') {
      // If not accepted, show the consent banner
      setShowConsent(true);
    }
  }, []);
  
  const acceptCookies = () => {
    // Save user preference in localStorage
    localStorage.setItem('cookiesAccepted', 'true');
    setShowConsent(false);
  };
  
  if (!showConsent) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-800 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 pr-4">
          <p className="text-sm md:text-base">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/privacy-policy', '_blank')}
            className="px-4 py-2 bg-transparent hover:bg-blue-700 text-white text-sm font-medium rounded border border-white"
          >
            Learn More
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-white text-blue-800 hover:bg-gray-100 text-sm font-medium rounded"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;