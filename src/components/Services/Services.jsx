/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Stethoscope, HeartPulse, Crosshair, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const servicesData = [
  {
    name: "Disease Mapping",
    icon: <Crosshair className="w-8 h-8 text-black" />,
    link: "#",
    description: "Track and visualize disease patterns to enhance healthcare response and resource allocation.",
    aosDelay: "0",
  },
  {
    name: "Health Analytics",
    icon: <HeartPulse className="w-8 h-8 text-black" />,
    link: "#",
    description: "Gain valuable insights through advanced analytics to improve healthcare decision-making.",
    aosDelay: "300",
  },
  {
    name: "Resource Optimization",
    icon: <Stethoscope className="w-8 h-8 text-black" />,
    link: "#",
    description: "Optimize the allocation of healthcare resources for better patient care and service delivery.",
    aosDelay: "500",
  },
];

const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const servicesPerPage = 3;

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(servicesData.length / servicesPerPage);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const drag = startX - e.pageX;
    if (Math.abs(drag) > 50) {
      if (drag > 0 && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      } else if (drag < 0 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  return (
    <section id="service">
      <div className="bg-gray-100 dark:text-white py-12 sm:grid sm:place-items-center">
        <div className="container">
          <div className="pb-12 text-center space-y-3">
            <div className="bg-gray-300 py-2 mt-2">
              <h1 data-aos="fade-up" className="text-3xl font-semibold sm:text-3xl text-black dark:text-black">
                Explore Our Healthcare Services
              </h1>
            </div>
          </div>

          <div
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-all duration-300">
              {currentServices.map((service) => (
                <div
                  key={service.name}
                  data-aos="fade-up"
                  data-aos-delay={service.aosDelay}
                  className="card space-y-3 sm:space-y-4 p-4 bg-white rounded-lg shadow-lg hover:shadow-xl"
                >
                  <div>{service.icon}</div>
                  <h1 className="text-lg font-semibold text-black">{service.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center space-x-4 mt-8">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-300" : "text-blue-700 hover:bg-gray-200"}`}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-300" : "text-blue-700 hover:bg-gray-200"}`}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="900"
            data-aos-offset="0"
            className="text-center mt-8"
          >
            <button
              onClick={handleGetStarted}
              className="primary-btn bg-sky-900 hover:bg-gray-700 hover:text-white py-2 px-4 rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;