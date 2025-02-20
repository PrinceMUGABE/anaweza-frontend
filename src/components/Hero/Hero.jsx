/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React from "react";
import { useTranslation } from "react-i18next";
import itImage from "../../assets/pictures/system/it1.jpg";
import constImage from "../../assets/pictures/system/workers2.jpg";
import constImage2 from "../../assets/pictures/system/workers1.jpg";
import accImage from "../../assets/pictures/system/accountant1.jpg";
import drivImage from "../../assets/pictures/system/driving1.jpg";
import teachImage from "../../assets/pictures/system/teaching1.jpg";

const Hero = () => {
  const { t } = useTranslation();
  const images = [constImage2, itImage, constImage, accImage, drivImage, teachImage];



  // Dummy data examples
  const featuredJobs = [
    { id: 1, title: "Software Engineer", company: "Tech Corp", location: "New York, USA" },
    { id: 2, title: "Marketing Specialist", company: "Brand Ltd", location: "London, UK" },
    { id: 3, title: "Data Analyst", company: "Data Insights", location: "Berlin, Germany" }
  ];

  const featuredSeekers = [
    { id: 1, name: "Alice Johnson", profession: "Web Developer", experience: "5 years" },
    { id: 2, name: "Bob Smith", profession: "Graphic Designer", experience: "3 years" },
    { id: 3, name: "Charlie Brown", profession: "Project Manager", experience: "7 years" }
  ];

  const testimonials = [
    { id: 1, name: "John Doe", feedback: "Anaweza helped me find my dream job!" },
    { id: 2, name: "Jane Smith", feedback: "Great platform for connecting with employers." }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 pt-16 min-h-screen" id="home">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
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
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
              {t("Connect with Your Next Opportunity")}
            </h1>
            <p className="text-xl text-gray-600">
              {t("Bridging the gap between talented job seekers and promising opportunities across all sectors")}
            </p>

            <div className="space-y-4">
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

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => (window.location.href = "/register")}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {t("Get Started")}
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                {t("Learn More")}
              </button>
            </div>
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

export default Hero;
