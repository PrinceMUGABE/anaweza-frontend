/* eslint-disable no-unused-vars */
import React from "react";
import hero from "../../assets/pictures/system/anaweza.jpg";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const handleGetStarted = () => {
    // Navigate to the registration route for job seekers
    window.location.href = "/register";
  };

  const { t } = useTranslation();

  return (
    <div
      className="bg-gradient-to-b from-gray-100 to-gray-200 pt-36 relative"
      id="home"

    >
      <div className="absolute inset-0 bg-black/40 px-4"></div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center px-16 ml-8 mt-16">
        <h1
          data-aos="fade-up"
          className="text-4xl sm:text-5xl font-bold text-white leading-tight"
        >
          Connecting Talent with{" "}
          <span className="text-black extrabold">Opportunities</span>
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="text-white text-lg leading-relaxed py-4"
        >
          Anaweza is a dynamic job-matching platform that connects skilled job seekers with top job opportunities.
          Showcase your experience, education, and skills, or find the perfect candidate instantly.
        </p>

        <div data-aos="fade-up" data-aos-delay="400" className="pt-4 mb-8">
          <div
            data-aos="fade-up"
            data-aos-delay="900"
            data-aos-offset="0"
            className="text-center mt-8"
          >
            <button
              onClick={handleGetStarted}
              className="primary-btn bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </div> */}

    <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("connectingTalentWith")} {t("opportunities")}
            </h1>
            <p className="text-xl text-gray-600">
              {t("heroDescription")}
            </p>
          </div>
    </div>
  );
};

export default Hero;
