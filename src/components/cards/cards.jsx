/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import itImage from "../../assets/pictures/system/it1.jpg";
import constImage from "../../assets/pictures/system/workers2.jpg";
import constImage2 from "../../assets/pictures/system/workers1.jpg";
import accImage from "../../assets/pictures/system/accountant1.jpg";
import drivImage from "../../assets/pictures/system/driving1.jpg";
import teachImage from "../../assets/pictures/system/teaching1.jpg";

const Cards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const images = [constImage2, itImage, constImage, accImage, drivImage, teachImage];

  const handleJobSeekerRegistration = () => {
    navigate("/signup", { state: { role: "job_seeker" } });
  };

  const handleEmployerRegistration = () => {
    navigate("/signup", { state: { role: "job_offer" } });
  };

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 pt-8 pb-12" id="home">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-10">
          {/* Left Side - Infinite Scrolling Image Slider */}
          <div className="lg:w-1/2 relative overflow-hidden rounded-lg shadow-xl">
            <div className="relative w-full h-96 overflow-hidden">
              <div className="flex w-[200%] animate-infinite-scroll">
                {[...images, ...images].map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Career View ${index + 1}`}
                    className="w-1/6 h-96 object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-1/2 space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
              {t("Connect with Your Next Opportunity")}
            </h1>
            <p className="text-xl text-gray-600">
              {t("Bridging the gap between talented job seekers and promising opportunities across all sectors")}
            </p>

            <div className="space-y-4 my-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">For Job Seekers</h3>
                  <p className="text-gray-600">Create your professional profile and get discovered by employers</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">For Employers</h3>
                  <p className="text-gray-600">Post opportunities and find the perfect candidates for your positions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Get Started Options */}
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Job Seeker Option */}
          <div className="md:w-1/2 bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{t("I'm a Job Seeker")}</h2>
            <p className="text-gray-600 text-center mb-6">
              {t("Create your professional profile, upload your resume, and connect with employers looking for your skills and experience.")}
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Create your professional profile")}</span>
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Showcase your skills and experience")}</span>
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Get discovered by top employers")}</span>
              </li>
            </ul>
            <button
              onClick={handleJobSeekerRegistration}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {t("Register as Job Seeker")}
            </button>
          </div>
          
          {/* Employer Option */}
          <div className="md:w-1/2 bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{t("I'm an Employer")}</h2>
            <p className="text-gray-600 text-center mb-6">
              {t("Post job opportunities, search for qualified candidates, and build your dream team with our powerful hiring tools.")}
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Post job openings")}</span>
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Search for qualified candidates")}</span>
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("Manage your hiring process")}</span>
              </li>
            </ul>
            <button
              onClick={handleEmployerRegistration}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              {t("Register as Employer")}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for infinite scrolling effect */}
      <style jsx>{`
        @keyframes infiniteScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .animate-infinite-scroll {
          animation: infiniteScroll 50s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Cards;