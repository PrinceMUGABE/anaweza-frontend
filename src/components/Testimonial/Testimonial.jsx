/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuoteLeft,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

function Testimonials() {
  // State management
  const [testimonials, setTestimonials] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {t} = useTranslation();
  
  const sliderRef = useRef(null);
  const modalRef = useRef(null);
  const BASE_URL = "https://anaweza-backend.up.railway.app/testimony";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Set up the infinite slider animation
  useEffect(() => {
    if (!testimonials.length) return;
    
    const slider = sliderRef.current;
    const items = slider.querySelectorAll('.testimonial-card');
    
    if (items.length > 0) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        slider.appendChild(clone);
      });
    }
  
    const duration = items.length * 10; // 10 seconds per card
    slider.style.animation = `slideLeft ${duration}s linear infinite`;
  
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
  
    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);
  
    return () => {
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [testimonials]);
  
  // New useEffect to handle animation state
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.animationPlayState = isPaused ? 'paused' : 'running';
    }
  }, [isPaused]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Close modal with escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showModal]);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/testimonials/`, {
  
      });
      setTestimonials(response.data);
    } catch (error) {
      showMessage("Error fetching testimonials", "error");
      console.error("Error fetching testimonials:", error);
    }
    setIsLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openTestimonialModal = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowModal(true);
    setIsPaused(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
    setIsPaused(false);
  };

  // Testimonial Card Component
  const TestimonialCard = ({ testimonial }) => (
    <div 
      className="testimonial-card flex-shrink-0 w-72 bg-white rounded-xl shadow-lg p-6 mx-4 transform transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
      onClick={() => openTestimonialModal(testimonial)}
    >
      <div className="flex items-center mb-4">
        {testimonial.created_by_details?.profile_picture ? (
          <img
            src={testimonial.created_by_details.profile_picture}
            alt={`${testimonial.first_name} ${testimonial.last_name}`}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-xl" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900">
            {testimonial.first_name} {testimonial.last_name}
          </h3>
          <p className="text-sm text-gray-500">{testimonial.job || 'No Job Title'}</p>
        </div>
      </div>
      <div className="mb-4 relative">
        <div className="absolute -top-2 -left-2 text-indigo-500">
          <FontAwesomeIcon icon={faQuoteLeft} className="text-2xl" />
        </div>
        <p className="text-gray-600 pl-6 pt-2 italic">
          {truncateText(testimonial.description)}
        </p>
      </div>
      <p className="text-xs text-right text-gray-400">
        {new Date(testimonial.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  // Modal Component
  const TestimonialModal = () => {
    if (!selectedTestimonial || !showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
        >
          <div className="p-6 flex justify-between items-start border-b">
            <div className="flex items-center">
              {selectedTestimonial.created_by_details?.profile_picture ? (
                <img
                  src={selectedTestimonial.created_by_details.profile_picture}
                  alt={`${selectedTestimonial.first_name} ${selectedTestimonial.last_name}`}
                  className="w-14 h-14 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-2xl" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedTestimonial.first_name} {selectedTestimonial.last_name}
                </h3>
                <p className="text-gray-500">{selectedTestimonial.job || 'No Job Title'}</p>
              </div>
            </div>
            <button 
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-800 transition-colors p-1"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="mb-4 relative">
              <div className="absolute -top-2 -left-2 text-indigo-500">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl" />
              </div>
              <p className="text-gray-700 pl-8 pt-2 italic leading-relaxed">
                {selectedTestimonial.description}
              </p>
            </div>
          </div>
          
          <div className="p-4 border-t text-right">
            <p className="text-sm text-gray-400">
              {new Date(selectedTestimonial.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t("Success Stories")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("Hear from our community members who have found success through our platform. Real stories from real people.")}
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`mb-6 md:mb-8 p-4 rounded-lg flex items-center ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}>
            <FontAwesomeIcon
              icon={messageType === "success" ? faCheckCircle : faExclamationTriangle}
              className="mr-3"
            />
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">{t("Loading testimonials")}...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>{t("No testimonials available yet.")}</p>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            {/* Gradient overlay on the left */}
            <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            
            {/* Gradient overlay on the right */}
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
            
            {/* Slider container */}
            <div className="overflow-hidden py-4">
              <div 
                ref={sliderRef}
                className="flex testimonial-slider"
                style={{
                  width: "fit-content"
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={`testimonial-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal */}
      <TestimonialModal />
      
      {/* Add the required CSS animation */}
      <style jsx="true">{`
        @keyframes slideLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .testimonial-slider {
          display: flex;
          width: fit-content;
          will-change: transform;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Testimonials;